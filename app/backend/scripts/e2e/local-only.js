// Shared by the end-to-end scripts: they create and change real rows through the real API, so they
// refuse to run unless both the API and the database are on this machine.
//
//   1. docker compose up -d postgres            (in app/)
//   2. npx prisma migrate deploy && npx prisma db seed    (with DATABASE_URL pointing at it)
//   3. start the backend with that DATABASE_URL on port 7000
//   4. DATABASE_URL=postgresql://agriai:agriai_dev_password@localhost:7002/agriai?schema=public node scripts/e2e/<script>
const api = process.env.API || 'http://localhost:7000/api/v1';
const db = process.env.DATABASE_URL || '';
const local = (value, pattern) => pattern.test(value);

if (!local(api, /^https?:\/\/(localhost|127\.0\.0\.1)[:/]/) || !local(db, /@(localhost|127\.0\.0\.1)[:/]/)) {
  console.error(`Refusing to run: both API (${api}) and DATABASE_URL must point at this machine.`);
  process.exit(3);
}
