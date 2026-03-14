import { corsHeaders } from "../shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const payload = await request.json();

  return Response.json(
    {
      ok: true,
      message: "Stub: re-authenticate signer, hash the frozen record snapshot, and create signature + audit rows.",
      payload
    },
    {
      headers: corsHeaders,
      status: 200
    }
  );
});
