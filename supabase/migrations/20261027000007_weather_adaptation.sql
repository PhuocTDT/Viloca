-- Weather advice and user-approved itinerary changes. Existing places stay unknown
-- until their shelter and regional metadata have been verified.
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS travel_region text CHECK (travel_region IN ('hue','hoi_an','mekong_delta','ha_giang')),
  ADD COLUMN IF NOT EXISTS shelter_type text NOT NULL DEFAULT 'unknown' CHECK (shelter_type IN ('indoor','outdoor','mixed','unknown')),
  ADD COLUMN IF NOT EXISTS shelter_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS weather_exposure text NOT NULL DEFAULT 'ordinary' CHECK (weather_exposure IN ('ordinary','water','cycling','mountain_road')),
  ADD COLUMN IF NOT EXISTS structured_opening_hours jsonb;

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS itinerary_revision bigint NOT NULL DEFAULT 0;

ALTER TABLE public.trip_items
  ADD COLUMN IF NOT EXISTS weather_duration_minutes integer CHECK (weather_duration_minutes > 0 AND weather_duration_minutes <= 1440);

CREATE OR REPLACE FUNCTION public.bump_trip_revision_on_item()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.trips SET itinerary_revision = itinerary_revision + 1
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trip_items_weather_revision ON public.trip_items;
CREATE TRIGGER trip_items_weather_revision
AFTER INSERT OR UPDATE OR DELETE ON public.trip_items
FOR EACH ROW EXECUTE FUNCTION public.bump_trip_revision_on_item();

CREATE OR REPLACE FUNCTION public.bump_trip_revision_on_dates()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.start_date IS DISTINCT FROM OLD.start_date OR NEW.end_date IS DISTINCT FROM OLD.end_date THEN
    NEW.itinerary_revision := OLD.itinerary_revision + 1;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trips_weather_revision ON public.trips;
CREATE TRIGGER trips_weather_revision
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.bump_trip_revision_on_dates();

CREATE TABLE IF NOT EXISTS public.trip_weather_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.trip_items(id) ON DELETE CASCADE,
  schedule_fingerprint text NOT NULL,
  episode_key text NOT NULL,
  risk_signature text NOT NULL,
  accepted_level integer NOT NULL DEFAULT 0,
  risk_level integer NOT NULL CHECK (risk_level BETWEEN 0 AND 2),
  risk_kinds text[] NOT NULL DEFAULT '{}',
  source_fetched_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','kept','resolved','changed')),
  clear_observations integer NOT NULL DEFAULT 0,
  last_clear_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, schedule_fingerprint, episode_key)
);

CREATE TABLE IF NOT EXISTS public.trip_weather_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.trip_weather_events(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.trip_items(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('later','other_day','indoor','keep')),
  target jsonb NOT NULL DEFAULT '{}',
  expected_revision bigint NOT NULL,
  schedule_fingerprint text NOT NULL,
  forecast_fetched_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_weather_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.trip_weather_events(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.trip_items(id) ON DELETE CASCADE,
  request_id uuid NOT NULL UNIQUE,
  action text NOT NULL CHECK (action IN ('later','other_day','indoor','keep','undo')),
  before_item jsonb,
  after_item jsonb,
  revision_after bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  undone_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_trip_weather_events_trip ON public.trip_weather_events (trip_id, status);
CREATE INDEX IF NOT EXISTS idx_trip_weather_proposals_event ON public.trip_weather_proposals (event_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_trip_weather_decisions_trip ON public.trip_weather_decisions (trip_id, created_at DESC);

ALTER TABLE public.trip_weather_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_weather_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_weather_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY trip_weather_events_owner_select ON public.trip_weather_events
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));
CREATE POLICY trip_weather_proposals_owner_select ON public.trip_weather_proposals
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));
CREATE POLICY trip_weather_decisions_owner_select ON public.trip_weather_decisions
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));

-- Proposals are issued by the trusted Edge Function with a service role. Clients
-- can read only their own proposals and cannot create or alter them.
CREATE OR REPLACE FUNCTION public.apply_trip_weather_proposal(p_proposal_id uuid, p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p public.trip_weather_proposals%ROWTYPE;
  v_trip public.trips%ROWTYPE;
  v_item public.trip_items%ROWTYPE;
  v_after public.trip_items%ROWTYPE;
  v_previous public.trip_weather_decisions%ROWTYPE;
  v_target_day integer;
  v_target_time time;
  v_target_location uuid;
  v_duration integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_previous FROM public.trip_weather_decisions WHERE request_id = p_request_id;
  IF FOUND THEN
    IF v_previous.trip_id NOT IN (SELECT id FROM public.trips WHERE user_id = auth.uid()) THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
    RETURN to_jsonb(v_previous);
  END IF;

  SELECT * INTO p FROM public.trip_weather_proposals WHERE id = p_proposal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proposal not found'; END IF;
  SELECT * INTO v_trip FROM public.trips WHERE id = p.trip_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO v_item FROM public.trip_items WHERE id = p.item_id AND trip_id = p.trip_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Activity changed'; END IF;
  IF p.expected_revision <> v_trip.itinerary_revision THEN RAISE EXCEPTION 'Itinerary changed'; END IF;
  IF p.expires_at <= now() OR p.forecast_fetched_at < now() - interval '30 minutes' THEN
    RAISE EXCEPTION 'Forecast proposal expired';
  END IF;
  IF p.schedule_fingerprint IS DISTINCT FROM concat_ws('|', v_item.id::text, coalesce(v_trip.start_date::text,''),
    coalesce(v_item.location_id::text,''), v_item.day_number::text, v_item.time_slot,
    coalesce(to_char(v_item.visit_time, 'HH24:MI:SS'),'')) THEN
    RAISE EXCEPTION 'Activity changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.trip_weather_events e WHERE e.id = p.event_id
      AND e.trip_id = p.trip_id AND e.item_id = p.item_id AND e.status IN ('open','kept')) THEN
    RAISE EXCEPTION 'Weather alert changed';
  END IF;

  v_after := v_item;
  IF p.action IN ('later','other_day') THEN
    v_target_day := (p.target->>'day_number')::integer;
    v_target_time := (p.target->>'visit_time')::time;
    IF v_target_day IS NULL OR v_target_time IS NULL OR v_trip.start_date IS NULL OR v_trip.end_date IS NULL
       OR v_target_day < 1 OR v_target_day > (v_trip.end_date - v_trip.start_date + 1) THEN
      RAISE EXCEPTION 'Invalid destination day/time';
    END IF;
    IF p.action = 'later' AND (v_target_day <> v_item.day_number OR v_item.visit_time IS NULL OR v_target_time <= v_item.visit_time) THEN
      RAISE EXCEPTION 'Not a later time on the same day';
    END IF;
    v_duration := coalesce(v_item.weather_duration_minutes,
      (SELECT duration_minutes FROM public.locations WHERE id = v_item.location_id));
    IF v_duration IS NULL THEN RAISE EXCEPTION 'Activity duration required'; END IF;
    IF EXISTS (
      SELECT 1 FROM public.trip_items other_item
      LEFT JOIN public.locations other_location ON other_location.id = other_item.location_id
      WHERE other_item.trip_id = p.trip_id AND other_item.id <> p.item_id
        AND other_item.day_number = v_target_day
        AND (other_item.visit_time IS NULL OR coalesce(other_item.weather_duration_minutes, other_location.duration_minutes) IS NULL
          OR (v_target_time < other_item.visit_time +
              make_interval(mins => coalesce(other_item.weather_duration_minutes, other_location.duration_minutes, 60) + 30)
            AND other_item.visit_time < v_target_time + make_interval(mins => v_duration + 30)))
    ) THEN RAISE EXCEPTION 'Time conflicts with another activity'; END IF;
    UPDATE public.trip_items SET day_number = v_target_day,
      time_slot = CASE WHEN v_target_time < time '12:00' THEN 'morning'
        WHEN v_target_time < time '18:00' THEN 'afternoon' ELSE 'evening' END,
      visit_time = v_target_time
      WHERE id = v_item.id RETURNING * INTO v_after;
  ELSIF p.action = 'indoor' THEN
    v_target_location := (p.target->>'location_id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM public.locations l WHERE l.id = v_target_location
      AND l.is_active AND l.shelter_type = 'indoor' AND l.shelter_verified_at IS NOT NULL) THEN
      RAISE EXCEPTION 'Indoor place is no longer verified';
    END IF;
    UPDATE public.trip_items SET location_id = v_target_location,
      experience_id = NULL, experience_title = NULL, experience_location = NULL,
      experience_image = NULL, experience_category = NULL
      WHERE id = v_item.id RETURNING * INTO v_after;
  ELSIF p.action <> 'keep' THEN
    RAISE EXCEPTION 'Unsupported action';
  END IF;

  INSERT INTO public.trip_weather_decisions (
    trip_id, event_id, item_id, request_id, action, before_item, after_item, revision_after
  ) VALUES (
    p.trip_id, p.event_id, p.item_id, p_request_id, p.action,
    to_jsonb(v_item), to_jsonb(v_after),
    (SELECT itinerary_revision FROM public.trips WHERE id = p.trip_id)
  ) RETURNING * INTO v_previous;
  UPDATE public.trip_weather_events SET
    status = CASE WHEN p.action = 'keep' THEN 'kept' ELSE 'changed' END,
    accepted_level = CASE WHEN p.action = 'keep' THEN risk_level ELSE accepted_level END,
    updated_at = now()
  WHERE id = p.event_id;
  RETURN to_jsonb(v_previous);
END $$;

REVOKE ALL ON FUNCTION public.apply_trip_weather_proposal(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_trip_weather_proposal(uuid, uuid) TO authenticated;
