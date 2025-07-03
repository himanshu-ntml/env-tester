#!/bin/sh
set -e

TARGET="$1"

update_status() {
  echo "{\"state\": \"$1\", \"updatedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > /app/status.json
  echo "🟡 $1"
}

if [ "$TARGET" = "dump" ]; then
  update_status "Dumping production DB..."
  pg_dump "$PROD_DB_URL" > /tmp/prod.sql
  update_status "✅ Dump complete. Ready to restore."
  exit 0
fi

# --- Dynamic restore ---
if [ "$TARGET" = "dev" ]; then
  HOST="$DEV_DB_HOST"
  PORT="$DEV_DB_PORT"
  NAME="$DEV_DB_NAME"
  USER="$DEV_DB_USER"
  PASS="$DEV_DB_PASS"
elif [ "$TARGET" = "staging" ]; then
  HOST="$STAGING_DB_HOST"
  PORT="$STAGING_DB_PORT"
  NAME="$STAGING_DB_NAME"
  USER="$STAGING_DB_USER"
  PASS="$STAGING_DB_PASS"
else
  update_status "❌ Unknown restore target: $TARGET"
  exit 1
fi

update_status "Restoring to $TARGET..."

PGPASSWORD=$PASS psql -h "$HOST" -p "$PORT" -U "$USER" -d "$NAME" \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

PGPASSWORD=$PASS psql -h "$HOST" -p "$PORT" -U "$USER" -d "$NAME" < /tmp/prod.sql

update_status "✅ Restore to $TARGET complete"
