import { corsHeaders } from "../shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const payload = await request.json();

  return Response.json(
    {
      ok: true,
      message: "Stub: mark the original row as corrected, create the replacement row, and append audit history.",
      payload
    },
    {
      headers: corsHeaders,
      status: 200
    }
  );
});
