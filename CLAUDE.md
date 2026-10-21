# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm start                 # expo start; npm run android / npm run ios for a device or emulator
npm test                  # Jest (ts-jest, node env)
npx tsc --noEmit          # typecheck
```

`app.json` only lists `ios` and `android` as platforms, so `expo start --web` fails until `web` is added there (plus `react-dom` and web-compat fixes). There is no lint script.

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm test` (required) and `tsc --noEmit` (advisory until the last known error, `app/_layout.tsx` `<StatusBar>` props, is fixed).

## Environment Variables

Create a `.env.local` file at the root (see `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Only public values belong in `EXPO_PUBLIC_*` variables (they ship inside the app). Never put the service-role key or AWS keys there; Edge Functions read their own secrets from Supabase.

## Architecture

**Stack:** Expo (SDK 56) + React Native 0.85 + TypeScript (strict) + expo-router (file-based routing) + Supabase (auth/DB/Edge Functions) + Zustand (client state). Styling is almost entirely `StyleSheet`; NativeWind is configured but only one file uses `className`.

### Routing (`app/`)

- `(auth)/` — `splash`, `login`, `register`, `verify-email`, `age-select`.
- `(app)/` — main tabs: `index` (Home), `explore` (community feed), `workspace`, `profile/` (index, trips, posts, edit).
- Other screens: `create-trip`, `search`, `trip/[id]`, `trip/add-location`, `location/[id]`, `post/[id]`, `post/create`, `experience/[id]`.
- `index.tsx` redirects to `/(auth)/login`; the root `_layout.tsx` auth guard then sends signed-in users to `/(app)`.

### Code layout

- `src/hooks/` — Supabase queries (`useLocations`, `useUpcomingTrip`, `useTodaySchedule`, ...).
- `src/lib/` — `supabase.ts`, `i18n.ts` (vi/en strings, `useT()`), `trip-utils.ts` (pure helpers, the only code with tests).
- `src/components/home/`, `src/components/ui/`, `src/store/langStore.ts`, `src/theme/`, `src/types/`.
- Legacy code at the repo root: `lib/supabase.ts`, `store/authStore.ts`, `hooks/useMascot.ts`, `components/Mascot/`. There are **two Supabase clients** (`lib/supabase.ts` and `src/lib/supabase.ts`); most code imports the one in `src/`.
- The `@/*` alias maps to the repo root, so use `@/src/...` for files under `src/`.

### Backend (`supabase/`)

- `migrations/` — schema and RLS. Several files share a timestamp, and `locations` access is governed by the RLS policies in `20260627000002_enable_public_read_locations.sql` (still open to everyone) and `20260921000002_update_locations_rls_freemium.sql`. Read both before touching location access.
- `functions/` — `plan-trip` (AWS Bedrock, JWT check, AI credits), `get-distances`, `generate-location-hint`, `batch-generate-hints`.
- Freemium model: free users should only see the free-tier fields exposed by the `locations_preview` view; pro users read `locations` directly. Do not assume this is enforced server-side yet.

### Team conventions

Avoid editing boot/startup files (`app/_layout.tsx`, root `index.tsx`, `babel.config.js`, `tailwind.config.js`, `app.json`) unless explicitly asked; they are the most conflict-prone files.
