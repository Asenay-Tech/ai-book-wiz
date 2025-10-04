-- Universal Import migration: documents, transactions, rules
-- safe to re-run

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_kind') THEN
    CREATE TYPE document_kind AS ENUM ('unknown','bank','receipt');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parse_status') THEN
    CREATE TYPE parse_status AS ENUM ('pending','parsed','error');
  END IF;
END $$;

-- documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  kind document_kind NOT NULL DEFAULT 'unknown',
  parse_status parse_status NOT NULL DEFAULT 'pending',
  parse_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- transactions alterations to support universal import
DO $$ BEGIN
  -- base columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='account_id') THEN
    ALTER TABLE public.transactions ADD COLUMN account_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='posted_at') THEN
    ALTER TABLE public.transactions ADD COLUMN posted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='vendor') THEN
    ALTER TABLE public.transactions ADD COLUMN vendor TEXT;
  END IF;
  -- category_id nullable FK placeholder (can map to categories table if exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='category_id') THEN
    ALTER TABLE public.transactions ADD COLUMN category_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='source') THEN
    ALTER TABLE public.transactions ADD COLUMN source TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='currency') THEN
    ALTER TABLE public.transactions ADD COLUMN currency TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='confidence') THEN
    ALTER TABLE public.transactions ADD COLUMN confidence NUMERIC(4,3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='raw') THEN
    ALTER TABLE public.transactions ADD COLUMN raw JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='document_id') THEN
    ALTER TABLE public.transactions ADD COLUMN document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='hash') THEN
    ALTER TABLE public.transactions ADD COLUMN hash TEXT;
  END IF;
END $$;

-- rules table for categorization if not exists
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  category_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pattern)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON public.documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_posted ON public.transactions(user_id, posted_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_hash_unique ON public.transactions(hash) WHERE hash IS NOT NULL;

-- RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  -- documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can select own documents'
  ) THEN
    CREATE POLICY "Users can select own documents" ON public.documents
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can insert own documents'
  ) THEN
    CREATE POLICY "Users can insert own documents" ON public.documents
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  -- transactions minimal policies (insert/select own)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='Users can select own transactions'
  ) THEN
    CREATE POLICY "Users can select own transactions" ON public.transactions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='Users can insert own transactions'
  ) THEN
    CREATE POLICY "Users can insert own transactions" ON public.transactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  -- rules
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rules' AND policyname='Users can manage own rules'
  ) THEN
    CREATE POLICY "Users can manage own rules" ON public.rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can upload own documents'
  ) THEN
    CREATE POLICY "Users can upload own documents" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can view own documents'
  ) THEN
    CREATE POLICY "Users can view own documents" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can delete own documents'
  ) THEN
    CREATE POLICY "Users can delete own documents" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
