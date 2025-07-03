#!/bin/sh
set -e

update_status() {
  echo "{\"state\": \"$1\", \"updatedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > /app/status.json
  echo "🟡 $1"
}

update_status "Starting sync..."

update_status "Dumping production DB..."
pg_dump "$PROD_DB_URL" > /tmp/prod.sql

# 🔴 SKIP RESTORE
update_status "✅ Dump complete. Restore skipped for now."
