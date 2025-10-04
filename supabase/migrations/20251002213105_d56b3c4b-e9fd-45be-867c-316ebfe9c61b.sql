-- Create vendors table first (if not exists)
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  normalized_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vendors"
ON public.vendors
FOR ALL
USING (auth.uid() = user_id);

-- Create reconciliations table
CREATE TABLE IF NOT EXISTS public.reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE CASCADE,
  score NUMERIC(3,2) CHECK (score >= 0 AND score <= 1),
  status TEXT NOT NULL CHECK (status IN ('matched', 'review', 'rejected')),
  meta_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload_json JSONB,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vehicles table for logistics
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  license_plate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create routes table for logistics
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create drivers table for logistics
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pos_days table for restaurants
CREATE TABLE IF NOT EXISTS public.pos_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  net_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
  comps NUMERIC(12,2) NOT NULL DEFAULT 0,
  voids NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create menu_items table for restaurants
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create skus table for retail
CREATE TABLE IF NOT EXISTS public.skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sku_code)
);

-- Create channels table for retail
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reconciliations
CREATE POLICY "Users can manage own reconciliations"
ON public.reconciliations
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for alerts
CREATE POLICY "Users can view own alerts"
ON public.alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
ON public.alerts
FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for vehicles
CREATE POLICY "Users can manage own vehicles"
ON public.vehicles
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for routes
CREATE POLICY "Users can manage own routes"
ON public.routes
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for drivers
CREATE POLICY "Users can manage own drivers"
ON public.drivers
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for pos_days
CREATE POLICY "Users can manage own pos_days"
ON public.pos_days
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for menu_items
CREATE POLICY "Users can manage own menu_items"
ON public.menu_items
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for skus
CREATE POLICY "Users can manage own skus"
ON public.skus
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for channels
CREATE POLICY "Users can manage own channels"
ON public.channels
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reconciliations_user_transaction ON public.reconciliations(user_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_created ON public.alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_receipts_user_date ON public.receipts(user_id, uploaded_at);
CREATE INDEX IF NOT EXISTS idx_vendors_user_normalized ON public.vendors(user_id, normalized_name);