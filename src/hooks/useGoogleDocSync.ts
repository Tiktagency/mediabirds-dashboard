import { supabase } from '@/integrations/supabase/client';

type SyncSource = 'seo_settings' | 'blog_settings';

/**
 * Synchronizes Google Document IDs between seo_settings and blog_settings.
 * When a Spreadsheet ID or Grid ID changes in one table, the other is updated.
 *
 * Field mapping:
 * - Spreadsheet ID: seo_settings.hoofd_google_sheet_id + nieuw_google_sheet_id <-> blog_settings.google_sheet_id
 * - Grid ID: seo_settings.hoofd_google_slides_id <-> blog_settings.google_slides_id
 */
export const syncGoogleDocIds = async (
  companyId: string,
  source: SyncSource,
  field: 'sheet_id' | 'slides_id',
  value: string | null
) => {
  try {
    if (source === 'seo_settings') {
      // Sync to blog_settings
      const blogUpdate = field === 'sheet_id'
        ? { google_sheet_id: value }
        : { google_slides_id: value };

      await supabase
        .from('blog_settings')
        .upsert(
          { company_id: companyId, ...blogUpdate, updated_at: new Date().toISOString() },
          { onConflict: 'company_id' }
        );
    } else if (source === 'blog_settings') {
      // Sync to seo_settings
      const seoUpdate = field === 'sheet_id'
        ? { hoofd_google_sheet_id: value, nieuw_google_sheet_id: value }
        : { hoofd_google_slides_id: value };

      await supabase
        .from('seo_settings')
        .upsert(
          { company_id: companyId, ...seoUpdate, updated_at: new Date().toISOString() },
          { onConflict: 'company_id' }
        );
    }
  } catch (err) {
    console.error('Google Doc ID sync error:', err);
  }
};
