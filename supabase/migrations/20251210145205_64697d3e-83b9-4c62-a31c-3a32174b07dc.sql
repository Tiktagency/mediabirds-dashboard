-- Extend app_role enum with new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operator';

-- Create impact_level enum
CREATE TYPE public.impact_level AS ENUM ('high', 'medium', 'low');

-- Create automation_status_type enum
CREATE TYPE public.automation_status_type AS ENUM ('active', 'inactive', 'testmode');

-- Create log_level enum
CREATE TYPE public.log_level AS ENUM ('basic', 'verbose', 'errors_only');

-- Create automation_settings table
CREATE TABLE public.automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  impact_level impact_level NOT NULL DEFAULT 'medium',
  category TEXT,
  status automation_status_type NOT NULL DEFAULT 'active',
  webhook_url TEXT,
  webhook_backup_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create log_settings table (singleton - one row)
CREATE TABLE public.log_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level log_level NOT NULL DEFAULT 'basic',
  retention_days INTEGER NOT NULL DEFAULT 30,
  email_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  slack_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  dashboard_badge_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_email TEXT,
  slack_webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_logs table
CREATE TABLE public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_name TEXT NOT NULL,
  log_level log_level NOT NULL DEFAULT 'basic',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'info',
  execution_time_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_dashboard_settings table
CREATE TABLE public.user_dashboard_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tile_order JSONB DEFAULT '[]'::jsonb,
  custom_labels JSONB DEFAULT '{}'::jsonb,
  theme TEXT NOT NULL DEFAULT 'dark',
  custom_tooltips JSONB DEFAULT '{}'::jsonb,
  impact_colors JSONB DEFAULT '{"high": "#ef4444", "medium": "#eab308", "low": "#6b7280"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_automation_permissions table
CREATE TABLE public.user_automation_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_name TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_execute BOOLEAN NOT NULL DEFAULT false,
  can_manage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, automation_name)
);

-- Enable RLS on all new tables
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_automation_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_settings
CREATE POLICY "Admins can manage automation settings"
ON public.automation_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view automation settings"
ON public.automation_settings
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for log_settings
CREATE POLICY "Admins can manage log settings"
ON public.log_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view log settings"
ON public.log_settings
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for automation_logs
CREATE POLICY "Admins can manage automation logs"
ON public.automation_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view automation logs"
ON public.automation_logs
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for user_dashboard_settings
CREATE POLICY "Users can manage their own dashboard settings"
ON public.user_dashboard_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all dashboard settings"
ON public.user_dashboard_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_automation_permissions
CREATE POLICY "Admins can manage all permissions"
ON public.user_automation_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own permissions"
ON public.user_automation_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_automation_settings_updated_at
BEFORE UPDATE ON public.automation_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_log_settings_updated_at
BEFORE UPDATE ON public.log_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_dashboard_settings_updated_at
BEFORE UPDATE ON public.user_dashboard_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default log settings
INSERT INTO public.log_settings (log_level, retention_days) VALUES ('basic', 30);

-- Insert default automation settings for existing automations
INSERT INTO public.automation_settings (automation_name, display_name, description, impact_level, category, status)
VALUES 
  ('monday-planning', 'Monday Planning', 'Automatische maandag planning generatie', 'high', 'Planning', 'active'),
  ('chatbot', 'Chatbot', 'AI klantenservice chatbot', 'high', 'Klantenservice', 'active'),
  ('wordpress-alt-text', 'Alt-tekst Wordpress', 'Automatische alt-tekst generatie voor WordPress afbeeldingen', 'medium', 'SEO', 'active'),
  ('zoekwoord-onderzoek', 'Zoekwoord Onderzoek', 'SEO zoekwoord onderzoek tool', 'medium', 'SEO', 'active'),
  ('blogs', 'Blogs', 'Automatische blog generatie', 'high', 'Content', 'active');

-- Create index for faster log queries
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs(created_at DESC);
CREATE INDEX idx_automation_logs_automation_name ON public.automation_logs(automation_name);