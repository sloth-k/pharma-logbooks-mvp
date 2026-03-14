import { corsHeaders } from "../shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const payload = await request.json();

  return Response.json(
    {
      ok: true,
      message: "Stub: validate log entry payload, persist values, and append audit event.",
      payload
    },
    {
      headers: corsHeaders,
      status: 200
    }
  );
});
