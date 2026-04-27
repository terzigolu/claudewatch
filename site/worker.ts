/**
 * Worker entry — delegates every request to the static assets bundle.
 *
 * Cloudflare Workers Builds projects always need a Worker entry. Without
 * one, a default 'Hello world' placeholder intercepts everything. This
 * file forwards all requests to env.ASSETS so the Vite build is served.
 */
export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
