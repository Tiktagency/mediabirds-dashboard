import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const TARGET_EMAIL = 'hello@tikt.ai';
    const NEW_PASSWORD = 'testen!!';
    const KNOWN_ID = '858fbdeb-e892-45ff-8d95-299063068e0c';

    let targetId: string | null = null;
    const { data: byId } = await supabase.auth.admin.getUserById(KNOWN_ID);
    if (byId?.user) targetId = byId.user.id;

    if (!targetId) {
      let page = 1;
      while (page <= 20) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw error;
        const found = data.users.find((u) => (u.email ?? '').toLowerCase() === TARGET_EMAIL);
        if (found) { targetId = found.id; break; }
        if (data.users.length < 200) break;
        page++;
      }
    }

    if (targetId) {
      const { error: updErr } = await supabase.auth.admin.updateUserById(targetId, { password: NEW_PASSWORD, email_confirm: true });
      if (updErr) {
        return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ success: true, email: TARGET_EMAIL, id: targetId, action: 'updated' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Auth-account ontbreekt: opnieuw aanmaken en super_admin koppelen
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: TARGET_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: `Create failed: ${createErr?.message}` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verwijder verweesde rijen op oude id en koppel rol/profile aan nieuwe id
    await supabase.from('user_roles').delete().eq('user_id', KNOWN_ID);
    await supabase.from('profiles').delete().eq('id', KNOWN_ID);
    await supabase.from('user_roles').insert({ user_id: created.user.id, role: 'super_admin' });

    return new Response(JSON.stringify({ success: true, email: TARGET_EMAIL, id: created.user.id, action: 'recreated' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
