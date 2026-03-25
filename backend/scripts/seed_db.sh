#!/usr/bin/env bash
set -euo pipefail

# Run from repo root
SEED_FILE="backend/dbDummy/seed.sql"

if [[ ! -f "$SEED_FILE" ]]; then
  echo "Seed file not found: $SEED_FILE"
  exit 1
fi

# Pull defaults from compose env if present; fallback matches your compose
DB_NAME="${POSTGRES_DB:-knowted}"
DB_USER="${POSTGRES_USER:-knowted}"

echo "Seeding database '$DB_NAME' as user '$DB_USER'..."
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$SEED_FILE"
echo "✅ Seed complete."