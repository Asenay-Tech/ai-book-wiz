-- Create enum for user roles (CRITICAL: separate table for security)
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Create enum for alert types
CREATE TYPE public.alert_type AS ENUM ('budget_exceeded', 'duplicate_expense', 'unusual_expense', 'recurring_detected');

-- Create user_roles table (CRITICAL: must be separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'owner',
  workspace_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (CRITICAL for RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- Create budget_limits table
CREATE TABLE public.budget_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(10,2) NOT NULL,
  alert_threshold NUMERIC(3,2) DEFAULT 0.8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
  ON public.budget_limits FOR ALL
  USING (auth.uid() = user_id);

-- Create budget_alerts table
CREATE TABLE public.budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type alert_type NOT NULL,
  category TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON public.budget_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.budget_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Create recurring_expenses table
CREATE TABLE public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vendor TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL,
  next_expected_date DATE,
  last_detected_date DATE,
  confidence_score NUMERIC(3,2),
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring expenses"
  ON public.recurring_expenses FOR ALL
  USING (auth.uid() = user_id);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_owner_id UUID NOT NULL,
  member_email TEXT NOT NULL,
  member_user_id UUID,
  role app_role NOT NULL DEFAULT 'member',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  UNIQUE(workspace_owner_id, member_email)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage team members"
  ON public.team_members FOR ALL
  USING (auth.uid() = workspace_owner_id OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Members can view their workspace"
  ON public.team_members FOR SELECT
  USING (auth.uid() = member_user_id OR auth.uid() = workspace_owner_id);

-- Create expense_analysis table for AI insights
CREATE TABLE public.expense_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  is_duplicate BOOLEAN DEFAULT false,
  is_unusual BOOLEAN DEFAULT false,
  suggested_category TEXT,
  confidence_score NUMERIC(3,2),
  analysis_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis"
  ON public.expense_analysis FOR SELECT
  USING (auth.uid() = user_id);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  file_url TEXT,
  format TEXT,
  ai_insights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on budget_limits
CREATE TRIGGER update_budget_limits_updated_at
  BEFORE UPDATE ON public.budget_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add trigger for updated_at on recurring_expenses
CREATE TRIGGER update_recurring_expenses_updated_at
  BEFORE UPDATE ON public.recurring_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for performance
CREATE INDEX idx_budget_alerts_user_id ON public.budget_alerts(user_id);
CREATE INDEX idx_budget_alerts_is_read ON public.budget_alerts(is_read);
CREATE INDEX idx_recurring_expenses_user_id ON public.recurring_expenses(user_id);
CREATE INDEX idx_team_members_workspace_owner ON public.team_members(workspace_owner_id);
CREATE INDEX idx_expense_analysis_user_id ON public.expense_analysis(user_id);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);