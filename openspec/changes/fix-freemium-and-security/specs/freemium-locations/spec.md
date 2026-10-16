## ADDED Requirements

### Requirement: Free users can only read location preview fields
The system SHALL enforce via Postgres RLS that free users (plan = 'free') can only read location fields available in the `locations_preview` view: `id`, `hint`, `cover_image`, `images`, `category`, `vibes`, `price_per_person`, `duration_minutes`, `rating`. Premium fields (`name`, `address`, `coordinates`) SHALL NOT be readable by free users directly from the `locations` table.

#### Scenario: Free user queries locations table directly
- **WHEN** a free user's request queries the `locations` table directly
- **THEN** RLS SHALL block the read (0 rows returned or policy error)

#### Scenario: Free user queries locations_preview view
- **WHEN** a free user's request queries the `locations_preview` view
- **THEN** the system SHALL return rows with only free-tier fields (hint, cover_image, images, category, vibes, price_per_person, duration_minutes, rating)

#### Scenario: Pro user queries locations table
- **WHEN** a pro user (plan = 'pro') queries the `locations` table
- **THEN** the system SHALL return full rows including name, address, coordinates

### Requirement: Location TypeScript type matches DB schema
The `Location` interface in `src/types/index.ts` SHALL match the actual `locations` table columns. Fields that do not exist in the DB (`city`, `district`, `google_maps_url`, `price_level`, `opening_hours`, `closing_hours`, `off_days`, `phone`, `short_description`, `long_description`, `photos`, `verified`) SHALL be removed. Fields in the DB not yet in the type (`hint`, `vibes`, `cover_image`, `images`, `price_per_person`, `duration_minutes`, `rating`, `coordinates`, `is_active`, `hint_generated_at`) SHALL be added.

#### Scenario: TypeScript compilation after type sync
- **WHEN** `Location` interface is updated to match DB schema
- **THEN** `tsc --noEmit` SHALL complete without type errors related to Location fields

#### Scenario: location/[id].tsx import path
- **WHEN** `app/location/[id].tsx` is opened
- **THEN** the supabase import SHALL use `@/src/lib/supabase` (not `@/lib/supabase`)
