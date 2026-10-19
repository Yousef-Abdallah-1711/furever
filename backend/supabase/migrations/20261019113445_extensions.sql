-- pgcrypto provides UUID and hash generation for backend data.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- postgis enables geographic queries for nearby_clinics.
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- pg_trgm supports fuzzy clinic and doctor search.
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- btree_gist supports the booking exclusion constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

-- pg_cron schedules backend jobs such as reminders.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- pg_net enables database-triggered Edge Function webhooks.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- pg_stat_statements provides query performance monitoring.
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;