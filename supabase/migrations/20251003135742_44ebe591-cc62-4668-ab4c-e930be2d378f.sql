-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT,
  currency TEXT DEFAULT 'USD',
  last4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bank accounts"
ON public.bank_accounts
FOR ALL
USING (auth.uid() = user_id);

-- Create import_batches table
CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  file_path TEXT,
  rows_total INTEGER DEFAULT 0,
  rows_imported INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  meta_json JSONB
);

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own import batches"
ON public.import_batches
FOR ALL
USING (auth.uid() = user_id);

CREATE INDEX idx_import_batches_user_created ON public.import_batches(user_id, started_at DESC);

-- Create statements table
CREATE TABLE IF NOT EXISTS public.statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
  statement_period DATERANGE,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own statements"
ON public.statements
FOR ALL
USING (auth.uid() = user_id);

-- Add new columns to transactions table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='external_id') THEN
    ALTER TABLE public.transactions ADD COLUMN external_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='source') THEN
    ALTER TABLE public.transactions ADD COLUMN source TEXT DEFAULT 'manual';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='memo') THEN
    ALTER TABLE public.transactions ADD COLUMN memo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='needs_review') THEN
    ALTER TABLE public.transactions ADD COLUMN needs_review BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='confidence') THEN
    ALTER TABLE public.transactions ADD COLUMN confidence FLOAT DEFAULT 0.0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='vendor_id') THEN
    ALTER TABLE public.transactions ADD COLUMN vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='import_batch_id') THEN
    ALTER TABLE public.transactions ADD COLUMN import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='meta_json') THEN
    ALTER TABLE public.transactions ADD COLUMN meta_json JSONB;
  END IF;
END $$;

-- Create indexes on transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_user_external_id ON public.transactions(user_id, external_id) WHERE external_id IS NOT NULL;

-- Create storage bucket for statements
INSERT INTO storage.buckets (id, name, public)
VALUES ('statements', 'statements', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for statements bucket
CREATE POLICY "Users can upload own statements"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'statements' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own statements"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'statements' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own statements"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'statements' AND
  auth.uid()::text = (storage.foldername(name))[1]
);