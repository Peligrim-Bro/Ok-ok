const teaser = "В 02:43 автобус остановился.\n\nДо остановки в салоне было двенадцать пассажиров. Теперь — одиннадцать. Двери не открывались. Место №17 пустое.\n\nКого бы ты расспросил первым — водителя или того, кто сидел рядом?\n\n«Последний пассажир» — первый детектив из «Попутчика».";

async function publishTeaser(env, headers) {
  const api = "https://graph.threads.net/v1.0";
  async function threads(path, method = "GET") {
    const response = await fetch(api + path, {
      method,
      headers: { Authorization: `Bearer ${env.THREADS_ACCESS_TOKEN}` },
      signal: AbortSignal.timeout(12000),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Threads HTTP ${response.status}, code ${data.error?.code ?? "unknown"}`);
    }
    return data;
  }

  try {
    const recent = await threads("/me/threads?fields=id,text,permalink&limit=25");
    const existing = recent.data.find((post) => post.text === teaser);
    if (existing) {
      return Response.json({ id: existing.id, permalink: existing.permalink }, { headers });
    }

    const query = new URLSearchParams({ media_type: "TEXT", text: teaser, auto_publish_text: "true" });
    const published = await threads(`/me/threads?${query}`, "POST");
    if (!published.id) {
      return Response.json({ error: "Threads returned no post ID" }, { status: 502, headers });
    }

    return Response.json({ id: published.id }, { headers });
  } catch (error) {
    const message = error.message.startsWith("Threads HTTP ") ? error.message : "Threads request failed";
    return Response.json({ error: message }, { status: 502, headers });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

    if (request.method === "POST" && url.pathname === "/publish-teaser") {
      const key = env.THREADS_PUBLISH_KEY;
      if (!key || request.headers.get("Authorization") !== `Bearer ${key}`) {
        return new Response("Not found", { status: 404, headers });
      }
      return publishTeaser(env, headers);
    }

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
