// Used by web/Dockerfile's HEALTHCHECK instruction (T065) and docker-compose.yml's
// web service health check (T066). Outside next-intl's middleware matcher (`api` is
// excluded), so it never goes through locale negotiation.
export function GET() {
  return Response.json({ status: 'ok' });
}
