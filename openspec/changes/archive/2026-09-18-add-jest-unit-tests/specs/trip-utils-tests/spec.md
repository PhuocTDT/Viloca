## ADDED Requirements

### Requirement: Pure functions are extracted and exported from trip-utils
The project SHALL have a `src/lib/trip-utils.ts` file that exports all pure functions currently defined inline in trip screens, so they can be imported and tested independently.

#### Scenario: Functions are importable without React Native
- **WHEN** a Jest test (node environment) imports from `@/src/lib/trip-utils`
- **THEN** all exported functions are available with no runtime errors

#### Scenario: Screen behavior is unchanged after extraction
- **WHEN** `app/trip/[id].tsx` and `app/create-trip.tsx` import from `trip-utils.ts`
- **THEN** app behavior is identical to before the refactor

### Requirement: suggestTime returns correct HH:MM string
The function SHALL return a time string based on the time slot and the item's index within that slot.

#### Scenario: Morning slot first item
- **WHEN** `suggestTime("morning", 0)` is called
- **THEN** returns `"07:00"`

#### Scenario: Morning slot second item (90-minute offset)
- **WHEN** `suggestTime("morning", 1)` is called
- **THEN** returns `"08:30"`

#### Scenario: Afternoon slot first item
- **WHEN** `suggestTime("afternoon", 0)` is called
- **THEN** returns `"13:00"`

#### Scenario: Evening slot first item
- **WHEN** `suggestTime("evening", 0)` is called
- **THEN** returns `"18:00"`

#### Scenario: Unknown slot falls back to morning base
- **WHEN** `suggestTime("unknown_slot", 0)` is called
- **THEN** returns `"07:00"` (defaults to 7*60)

### Requirement: tripDayCount returns correct number of days
The function SHALL return the number of days between start_date and end_date inclusive, clamped between 1 and 30.

#### Scenario: Same-day trip
- **WHEN** `start_date === end_date`
- **THEN** returns `1`

#### Scenario: Two-day trip
- **WHEN** `end_date` is one day after `start_date`
- **THEN** returns `2`

#### Scenario: No dates set
- **WHEN** both `start_date` and `end_date` are null/undefined
- **THEN** returns `0`

#### Scenario: Only start_date set
- **WHEN** `start_date` is set but `end_date` is null
- **THEN** returns `0`

#### Scenario: Clamp to 30 days maximum
- **WHEN** `end_date` is more than 30 days after `start_date`
- **THEN** returns `30`

### Requirement: formatDate converts ISO date to Vietnamese display format
The function SHALL convert "YYYY-MM-DD" to "DD/MM/YYYY".

#### Scenario: Standard date
- **WHEN** `formatDate("2026-09-18")` is called
- **THEN** returns `"18/09/2026"`

#### Scenario: Empty string
- **WHEN** `formatDate("")` is called
- **THEN** returns `"—"`

### Requirement: buildGoogleMapsUrl generates correct Google Maps URL
The function SHALL generate a valid Google Maps direction URL from an array of TripItems.

#### Scenario: Zero items
- **WHEN** items array is empty
- **THEN** returns `"https://maps.google.com"`

#### Scenario: Single item with coordinates
- **WHEN** one item has `coordinates.lat` and `coordinates.lng`
- **THEN** returns a Maps search URL containing those coordinates

#### Scenario: Multiple items with coordinates
- **WHEN** two or more items each have valid coordinates
- **THEN** returns a Maps direction URL with origin, destination, and optional waypoints

#### Scenario: Item with address fallback
- **WHEN** item has no coordinates but has `address`
- **THEN** URL contains the URL-encoded address string

### Requirement: stripDiacritics removes Vietnamese accents for search
The function SHALL normalize a Vietnamese string to ASCII-only, lowercaseable form.

#### Scenario: Vietnamese diacritics removed
- **WHEN** `stripDiacritics("Hội An")` is called
- **THEN** returns `"Hoi An"`

#### Scenario: Đ/đ converted to D/d
- **WHEN** `stripDiacritics("Đà Nẵng")` is called
- **THEN** returns `"Da Nang"`

#### Scenario: Plain ASCII unchanged
- **WHEN** `stripDiacritics("Hanoi")` is called
- **THEN** returns `"Hanoi"`
