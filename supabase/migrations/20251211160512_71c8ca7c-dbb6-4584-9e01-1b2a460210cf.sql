-- Add saved-hours as an automation setting
INSERT INTO public.automation_settings (
  automation_name,
  display_name,
  description,
  status,
  impact_level,
  category
) VALUES (
  'saved-hours',
  'Bespaard deze maand',
  'Toont het aantal bespaarde uren door automatiseringen deze maand',
  'active',
  'high',
  'dashboard'
) ON CONFLICT (automation_name) DO NOTHING;