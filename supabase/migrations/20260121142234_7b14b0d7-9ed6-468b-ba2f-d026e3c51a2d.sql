-- Create blog_categories table for dynamic categories per company
CREATE TABLE blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Admins can manage blog categories
CREATE POLICY "Admins can manage blog categories"
  ON blog_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can view blog categories
CREATE POLICY "Authenticated users can view blog categories"
  ON blog_categories FOR SELECT
  USING (true);