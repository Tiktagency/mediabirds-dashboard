import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { companyName, companyId, companyDomain } = await req.json();
    if (!companyName || !companyId) {
      throw new Error('companyName en companyId zijn verplicht');
    }

    const authToken = Deno.env.get('BLOG_WEBHOOK_AUTH_TOKEN');
    if (!authToken) {
      throw new Error('Auth token niet geconfigureerd');
    }

    // Call webhook and await response
    const response = await fetch(
      'https://tikt.app.n8n.cloud/webhook/add1509b-90d0-4e56-87ea-1492614e3b62',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({ bedrijfsnaam: companyName, domeinnaam: companyDomain || '' }),
      }
    );

    console.log(`Webhook response status: ${response.status}`);
    const webhookData = await response.json();
    console.log('Webhook response data:', JSON.stringify(webhookData));

    // Save the returned IDs to the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const hoofd = webhookData['Hoofd zoekwoorden'] || {};
    const nieuw = webhookData['Nieuwe zoekwoorden'] || {};
    const pagina = webhookData['Pagina URL'] || {};
    const folder = webhookData['Folder bedrijf'] || {};

    const toNull = (val: string | undefined) => (val && val.trim() !== '' ? val : null);

    // Upsert seo_settings
    const { error: seoError } = await supabase
      .from('seo_settings')
      .upsert({
        company_id: companyId,
        hoofd_google_sheet_id: toNull(hoofd['Spreadsheet ID']),
        hoofd_google_slides_id: toNull(hoofd['Grid ID']),
        nieuw_google_sheet_id: toNull(nieuw['Spreadsheet ID']),
        nieuw_google_slides_id: toNull(nieuw['Grid ID']),
      }, { onConflict: 'company_id' });

    if (seoError) console.error('Error upserting seo_settings:', seoError);

    // Upsert blog_settings
    const folderPhotos = webhookData["Folder Foto's"] || {};
    const folderUsedPhotos = webhookData["Folder gebruikte foto's"] || {};

    const blogUpsertData: Record<string, unknown> = {
      company_id: companyId,
      google_sheet_id: toNull(hoofd['Spreadsheet ID']),
      google_slides_id: toNull(hoofd['Grid ID']),
      bedrijfsnaam: companyName,
      folder_id: toNull(folderPhotos['Folder ID']),
      used_folder_id: toNull(folderUsedPhotos['Folder ID']),
    };
    if (companyDomain && companyDomain.trim() !== '') {
      blogUpsertData.get_afbeelding_url = `https://${companyDomain}/wp-json/wp/v2/media`;
      blogUpsertData.post_blog_url = `https://${companyDomain}/wp-json/wp/v2/posts`;
    }
    const { error: blogError } = await supabase
      .from('blog_settings')
      .upsert(blogUpsertData, { onConflict: 'company_id' });

    if (blogError) console.error('Error upserting blog_settings:', blogError);

    // Upsert page_url_settings
    const { error: pageError } = await supabase
      .from('page_url_settings')
      .upsert({
        company_id: companyId,
        google_sheet_id: toNull(pagina['Spreadsheet ID']),
        google_file_id: toNull(pagina['Grid ID']),
      }, { onConflict: 'company_id' });

    if (pageError) console.error('Error upserting page_url_settings:', pageError);

    // Save folder_id to company
    const folderIdValue = toNull(folder['Folder ID']);
    let folderError = null;
    if (folderIdValue) {
      const { error } = await supabase
        .from('companies')
        .update({ folder_id: folderIdValue })
        .eq('id', companyId);
      folderError = error;
      if (folderError) console.error('Error updating company folder_id:', folderError);
    }

    const hasErrors = seoError || blogError || pageError || folderError;

    return new Response(JSON.stringify({
      success: !hasErrors,
      data: webhookData,
      errors: hasErrors ? { seoError, blogError, pageError, folderError } : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in trigger-add-company-webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
