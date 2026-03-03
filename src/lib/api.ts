// In development, Vite proxies /api to http://localhost:8787 (wrangler dev).
// In production (GitLab Pages), set VITE_API_URL to your Cloudflare Worker URL:
// e.g. https://spygame-worker.YOUR_ACCOUNT.workers.dev
export const API_BASE = (import.meta.env.VITE_API_URL as string) ?? '';
