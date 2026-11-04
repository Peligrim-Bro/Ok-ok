export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

    if (url.pathname === "/callback") {
      if (url.searchParams.has("error")) {
        return new Response("Threads authorization failed.", { status: 400, headers });
      }
      if (!url.searchParams.get("code")) {
        return new Response("Missing authorization code.", { status: 400, headers });
      }
      return new Response("Threads authorization received. Return to ChatGPT.", { headers });
    }

    if (request.method === "GET" && url.pathname === "/threads-check") {
      if (!env.THREADS_ACCESS_TOKEN) {
        return Response.json({ ok: false, reason: "missing_secret" }, { status: 503, headers });
      }
      try {
        const profile = await fetch("https://graph.threads.net/v1.0/me?fields=id", {
          headers: { Authorization: `Bearer ${env.THREADS_ACCESS_TOKEN}` },
          signal: AbortSignal.timeout(8000),
        });
        const data = await profile.json();
        if (!profile.ok || !data.id) {
          return Response.json({ ok: false, metaStatus: profile.status, metaCode: data.error?.code }, {
            status: 502, headers,
          });
        }
        return Response.json({ ok: true }, { headers });
      } catch {
        return Response.json({ ok: false, reason: "request_failed" }, { status: 502, headers });
      }
    }

    return new Response("OKOK Threads OAuth endpoint ready.", { headers });
  },
};
