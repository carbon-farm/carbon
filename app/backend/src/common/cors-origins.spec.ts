import { allowedOrigins, isOriginAllowed } from './cors-origins';

describe('CORS origins', () => {
  const allowed = allowedOrigins(undefined);

  it('allows the live web app and local development', () => {
    expect(isOriginAllowed('https://carbon-xi-sepia.vercel.app', allowed)).toBe(true);
    expect(isOriginAllowed('http://localhost:7001', allowed)).toBe(true);
  });

  it('refuses other websites', () => {
    expect(isOriginAllowed('https://evil.example.com', allowed)).toBe(false);
    expect(isOriginAllowed('https://carbon-xi-sepia.vercel.app.evil.com', allowed)).toBe(false);
    expect(isOriginAllowed('http://carbon-xi-sepia.vercel.app', allowed)).toBe(false);
  });

  it('lets non-browser callers through (no Origin header)', () => {
    expect(isOriginAllowed(undefined, allowed)).toBe(true);
  });

  it('adds origins from the environment, ignoring spaces and trailing slashes', () => {
    const more = allowedOrigins(' https://app.example.com/ , https://b.example.com ');
    expect(isOriginAllowed('https://app.example.com', more)).toBe(true);
    expect(isOriginAllowed('https://b.example.com/', more)).toBe(true);
    expect(isOriginAllowed('https://c.example.com', more)).toBe(false);
  });
});
