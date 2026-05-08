-- Add dashboard_colors column to user_dashboard_settings
ALTER TABLE user_dashboard_settings 
ADD COLUMN IF NOT EXISTS dashboard_colors JSONB DEFAULT '{
  "primary": "#9333ea",
  "background": "#121212",
  "foreground": "#ffffff",
  "inputBackground": "#333333",
  "border": "#737373",
  "muted": "#404040",
  "mutedForeground": "#b3b3b3"
}'::jsonb;