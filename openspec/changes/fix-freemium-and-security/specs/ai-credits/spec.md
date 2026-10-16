## ADDED Requirements

### Requirement: JWT must be verified before AI generation
The system SHALL verify the user's JWT via `supabase.auth.getUser()` in the `plan-trip` Edge Function before proceeding with any AI call. A missing, expired, or invalid JWT SHALL return HTTP 401.

#### Scenario: Missing authorization header
- **WHEN** a request is made to plan-trip without an Authorization header
- **THEN** the function SHALL return HTTP 401 with `{ "error": "Unauthorized" }`

#### Scenario: Invalid or expired JWT
- **WHEN** a request is made with a malformed or expired JWT
- **THEN** `supabase.auth.getUser()` SHALL return an error and the function SHALL return HTTP 401

#### Scenario: Valid JWT
- **WHEN** a request is made with a valid JWT and the user exists in auth.users
- **THEN** the function SHALL proceed to credits check

### Requirement: Free users have limited AI generation credits
The system SHALL track `ai_credits_remaining INTEGER DEFAULT 3` on the `profiles` table. Free users (plan = 'free') SHALL be blocked from AI trip generation when `ai_credits_remaining <= 0`. Pro users (plan = 'pro') SHALL have unlimited generations.

#### Scenario: Free user with credits remaining
- **WHEN** a free user calls plan-trip and `ai_credits_remaining > 0`
- **THEN** the function SHALL proceed with generation and decrement `ai_credits_remaining` by 1 upon success

#### Scenario: Free user with no credits
- **WHEN** a free user calls plan-trip and `ai_credits_remaining = 0`
- **THEN** the function SHALL return HTTP 402 with `{ "error": "No AI credits remaining", "credits_remaining": 0 }`

#### Scenario: Pro user ignores credits
- **WHEN** a pro user (plan = 'pro') calls plan-trip
- **THEN** the function SHALL proceed with generation regardless of `ai_credits_remaining`

#### Scenario: Credits decrement is atomic
- **WHEN** a free user's plan-trip request succeeds
- **THEN** `ai_credits_remaining` SHALL be decremented by exactly 1 using an atomic Postgres UPDATE (WHERE credits > 0 RETURNING)

#### Scenario: Failed generation does not consume credits
- **WHEN** a free user's plan-trip call fails after credits check (e.g., Bedrock error)
- **THEN** `ai_credits_remaining` SHALL NOT be decremented
