
CREATE TABLE public.login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  display_name text,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view login logs"
  ON public.login_logs FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can insert own login log"
  ON public.login_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
