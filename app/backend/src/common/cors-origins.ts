// Which websites may call this API from a browser.
//
// The live web app and local development are always allowed. Add more (a custom domain, a
// Vercel preview) with the CORS_ORIGINS environment variable: a comma-separated list of full
// origins, e.g. "https://app.example.com,https://other.example.com".
export const DEFAULT_ORIGINS = [
  'https://carbon-xi-sepia.vercel.app',
  'http://localhost:7001',
  'http://127.0.0.1:7001',
  'http://localhost:5173',
];

export function allowedOrigins(env: string | undefined): string[] {
  const extra = (env ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

// `origin` is undefined for anything that is not a browser page (health pings, curl, servers).
export function isOriginAllowed(origin: string | undefined, allowed: string[]): boolean {
  if (!origin) return true;
  return allowed.includes(origin.replace(/\/$/, ''));
}
