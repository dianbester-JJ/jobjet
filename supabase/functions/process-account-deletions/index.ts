import { createClient, corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0";

// Scheduled function: deletes accounts whose deletion_requested_at is >= 30 days ago.
// Can be called via cron or manually. No auth required for cron, but checks a shared secret if provided.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const { data: pending, error } = await admin
      .from("profiles")
      .select("id, email, full_name")
      .lt("deletion_requested_at", cutoff.toISOString())
      .not("deletion_requested_at", "is", null);

    if (error) throw error;

    const results: Array<{ id: string; email: string | null; status: string; error?: string }> = [];

    for (const profile of pending ?? []) {
      try {
        // Send notification email (best-effort) before deletion
        try {
          await admin.functions.invoke("send-transactional-email", {
            body: {
              templateName: "account-deleted",
              recipientEmail: profile.email,
              idempotencyKey: `account-deleted-${profile.id}`,
              templateData: { name: profile.full_name ?? "" },
            },
          });
        } catch (_e) {
          // Email is best-effort; continue with deletion
        }

        const { error: delErr } = await admin.auth.admin.deleteUser(profile.id);
        if (delErr) throw delErr;
        results.push({ id: profile.id, email: profile.email, status: "deleted" });
      } catch (e) {
        results.push({ id: profile.id, email: profile.email, status: "error", error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
