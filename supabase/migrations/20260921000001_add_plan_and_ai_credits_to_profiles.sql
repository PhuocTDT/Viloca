-- Add freemium plan and AI credits tracking to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro')),
  ADD COLUMN IF NOT EXISTS ai_credits_remaining INTEGER NOT NULL DEFAULT 3;
