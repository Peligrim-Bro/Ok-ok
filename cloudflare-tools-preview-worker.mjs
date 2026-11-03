// Isolated read-only preview. Never forward production APIs or mutate live data.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return new Response('Preview: API unavailable', { status: 404, headers: { 'cache-control': 'no-store' } });
    }
    return env.ASSETS.fetch(request);
  }
};
