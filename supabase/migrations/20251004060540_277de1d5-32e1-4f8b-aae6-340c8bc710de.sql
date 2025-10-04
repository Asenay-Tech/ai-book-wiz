-- Add missing columns and deduplication to transactions table
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS hash text,
  ADD COLUMN IF NOT EXISTS posted_at timestamptz;

-- Create deduplication index
CREATE UNIQUE INDEX IF NOT EXISTS transactions_dedup ON public.transactions(hash) WHERE hash IS NOT NULL;

-- Create performance index
CREATE INDEX IF NOT EXISTS transactions_user_date ON public.transactions(user_id, date DESC);

-- Create rules table for auto-categorization
CREATE TABLE IF NOT EXISTS public.rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, pattern)
);

ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rules" ON public.rules
  FOR ALL USING (auth.uid() = user_id);