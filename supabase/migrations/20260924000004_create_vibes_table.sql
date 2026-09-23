-- Dedicated vibes table for structured vibe chips
CREATE TABLE IF NOT EXISTS vibes (
  id         SERIAL  PRIMARY KEY,
  name       TEXT    NOT NULL UNIQUE,
  icon       TEXT,                          -- emoji or icon URL
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true
);

-- Seed from vibes already stored in locations.vibes[]
-- Only include vibes that appear in at least one active+verified location
INSERT INTO vibes (name, sort_order)
SELECT DISTINCT v.name,
       (ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, v.name) * 10)::INTEGER
FROM   locations, unnest(vibes) AS v(name)
WHERE  is_active = true
  AND  verified  = true
  AND  v.name IS NOT NULL
  AND  v.name <> ''
GROUP BY v.name
ON CONFLICT (name) DO NOTHING;

-- RLS: any authenticated user can read active vibes
ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_vibes"
  ON vibes FOR SELECT
  TO authenticated
  USING (is_active = true);
