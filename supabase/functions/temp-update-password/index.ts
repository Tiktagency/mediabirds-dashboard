import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const { email, password } = await req.json();

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), { status: 500 });
  }

  const searchEmail = email.toLowerCase();
  const user = users.find(u => u.email?.toLowerCase() === searchEmail);

  if (!user) {
    const allEmails = users.map(u => u.email).filter(Boolean);
    return new Response(JSON.stringify({ 
      error: 'User not found', 
      searchedFor: email,
      totalUsers: users.length,
      allEmails: allEmails
    }), { status: 404 });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password }
  );

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
