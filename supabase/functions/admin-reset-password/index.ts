import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: isSuper } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'super_admin' });
    if (!isSuper) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const TARGET_EMAIL = 'hello@tikt.ai';
    const NEW_PASSWORD = 'testen!!';

    // Find user id by email (paginate if needed)
    let targetId: string | null = null;
    let page = 1;
    while (page <= 20) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const found = data.users.find((u) => (u.email ?? '').toLowerCase() === TARGET_EMAIL);
      if (found) { targetId = found.id; break; }
      if (data.users.length < 200) break;
      page++;
    }

    if (!targetId) {
      return new Response(JSON.stringify({ error: `User ${TARGET_EMAIL} not found` }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { error: updErr } = await supabase.auth.admin.updateUserById(targetId, { password: NEW_PASSWORD });
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, email: TARGET_EMAIL }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
