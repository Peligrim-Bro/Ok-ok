import queue from "./queue.json";

const API = "https://graph.threads.net/v1.0";

async function threads(env, path, method = "GET") {
  const response = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${env.THREADS_ACCESS_TOKEN}` },
    signal: AbortSignal.timeout(12000),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(`Threads HTTP ${response.status}, code ${data.error?.code ?? "unknown"}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export class ThreadsQueue {
  constructor(state, env) {
    this.storage = state.storage;
    this.env = env;
  }

  async fetch(request) {
    const { post } = await request.json();
    const key = `post:${post.id}`;
    const previous = await this.storage.get(key);
    if (previous?.id) return Response.json(previous);

    const recent = await threads(this.env, "/me/threads?fields=id,text,permalink&limit=50");
    const existing = recent.data.find((item) => item.text === post.text);
    if (existing) {
      const receipt = { id: existing.id, permalink: existing.permalink };
      await this.storage.put(key, receipt);
      return Response.json(receipt);
    }

    const claimed = await this.storage.transaction(async (txn) => {
      if (await txn.get(key)) return false;
      await txn.put(key, { attemptedAt: new Date().toISOString() });
      return true;
    });
    if (!claimed) {
      return Response.json({ error: "Previous attempt awaits reconciliation" }, { status: 409 });
    }

    const query = new URLSearchParams({ media_type: "TEXT", text: post.text, auto_publish_text: "true" });
    let published;
    try {
      published = await threads(this.env, `/me/threads?${query}`, "POST");
    } catch (error) {
      if (error.status >= 400 && error.status < 500) await this.storage.delete(key);
      throw error;
    }
    if (!published.id) throw new Error("Threads returned no post ID");

    const receipt = { id: published.id };
    await this.storage.put(key, receipt);
    try {
      const details = await threads(this.env, `/${encodeURIComponent(published.id)}?fields=permalink`);
      if (details.permalink) {
        receipt.permalink = details.permalink;
        await this.storage.put(key, receipt);
      }
    } catch (error) {
      console.warn("Threads permalink lookup failed", post.id, error.message);
    }
    return Response.json(receipt);
  }
}

export default {
  async scheduled(controller, env) {
    const due = queue.filter((post) => {
      const age = controller.scheduledTime - Date.parse(post.publishAt);
      return age >= 0 && age < 8 * 60 * 60 * 1000;
    });
    const ledger = env.THREADS_QUEUE.getByName("production");
    for (const post of due) {
      const response = await ledger.fetch("https://queue.internal/publish", {
        method: "POST",
        body: JSON.stringify({ post }),
      });
      const receipt = await response.json();
      if (!response.ok) throw new Error(`Threads slot ${post.id}: ${receipt.error}`);
      console.log("Threads receipt", post.id, receipt);
    }
  },

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
