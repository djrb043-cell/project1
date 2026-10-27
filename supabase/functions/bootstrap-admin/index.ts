import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    if (email !== "robsonjds1003@gmail.com" || typeof password !== "string" || password.length < 8) {
      return new Response(JSON.stringify({ error: "Use o e-mail autorizado e uma senha com pelo menos 8 caracteres." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: admins, error: adminCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("role", "admin")
      .limit(1);

    if (adminCheckError) throw adminCheckError;
    if (admins && admins.length > 0 && admins[0].email !== email) {
      return new Response(JSON.stringify({ error: "A configuração inicial já foi concluída." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    let userId: string;
    if (createError && /already registered|already exists|duplicate/i.test(createError.message)) {
      const { data: existing, error: existingError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (existingError || !existing.user) throw existingError ?? new Error("Usuário não encontrado.");
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.user.id, {
        password,
        email_confirm: true,
      });
      if (updateError) throw updateError;
      userId = existing.user.id;
    } else if (createError || !created.user) {
      throw createError ?? new Error("Não foi possível criar a conta.");
    } else {
      userId = created.user.id;
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email,
      role: "admin",
      store_name: null,
      active: true,
    }, { onConflict: "id" });

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
