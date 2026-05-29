import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const PASSWORD = 'AfstuDeErProJect!';
  const LUC = 'luc.degraag@student.hu.nl';
  const HELLO_ID = '858fbdeb-e892-45ff-8d95-299063068e0c';

  const out: Record<string, unknown> = {};

  // 1) Reset hello@tikt.ai password
  {
    const { error } = await admin.auth.admin.updateUserById(HELLO_ID, {
      password: PASSWORD, email_confirm: true,
    });
    out.hello = error ? { error: error.message } : 'ok';
  }

  // 2) Find luc by email via listUsers (paged)
  let lucId: string | null = null;
  for (let page = 1; page <= 20 && !lucId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) { out.list_error = error.message; break; }
    for (const u of data.users) {
      if ((u.email || '').toLowerCase() === LUC) { lucId = u.id; break; }
    }
    if (data.users.length < 200) break;
  }

  if (lucId) {
    const { error } = await admin.auth.admin.updateUserById(lucId, {
      password: PASSWORD, email_confirm: true,
    });
    out.luc = error ? { error: error.message, id: lucId } : { action: 'updated', id: lucId };
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: LUC, password: PASSWORD, email_confirm: true,
    });
    if (error) {
      out.luc = { error: error.message };
    } else {
      lucId = data.user!.id;
      out.luc = { action: 'created', id: lucId };
    }
  }

  // 3) Ensure profile flags
  if (lucId) {
    await admin.from('profiles').upsert({ id: lucId, email: LUC, is_demo: true });
  }
  await admin.from('profiles').update({ is_demo: false }).eq('id', HELLO_ID);

  return new Response(JSON.stringify(out, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
  });
});
