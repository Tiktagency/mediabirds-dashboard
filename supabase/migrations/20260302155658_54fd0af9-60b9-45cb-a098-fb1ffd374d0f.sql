
create table public.newsletter_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bedrijfsnaam text,
  tagline text,
  bedrijfsomschrijving text,
  doelgroep text,
  toon text,
  cta_tekst text,
  cta_url text,
  website text,
  rss_feeds text[] default '{}',
  primaire_kleur text default '#FF6B2C',
  secundaire_kleur text default '#1A2B5E',
  achtergrond_kleur text default '#F5F3EF',
  kaart_achtergrond text default '#FFFFFF',
  tekst_kleur text default '#1A1A2E',
  subtekst_kleur text default '#6B7280',
  accent_kleur text default '#FFF0E8',
  cta_tekst_kleur text default '#FFFFFF',
  footer_achtergrond text default '#1A2B5E',
  footer_tekst_kleur text default '#E8EDF7',
  generated_html text,
  created_at timestamptz default now()
);

alter table public.newsletter_companies enable row level security;

create policy "Admins can view newsletter companies"
  on public.newsletter_companies for select
  using (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'super_admin'::app_role));

create policy "Admins can insert newsletter companies"
  on public.newsletter_companies for insert
  with check (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'super_admin'::app_role));

create policy "Admins can update newsletter companies"
  on public.newsletter_companies for update
  using (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'super_admin'::app_role));

create policy "Super admins can delete newsletter companies"
  on public.newsletter_companies for delete
  using (has_role(auth.uid(), 'super_admin'::app_role));
