#!/usr/bin/env bash
# Local MongoDB backup for the isolated-LAN deployment (there is no cloud).
# Writes a timestamped, gzip-compressed archive into ./backups and prunes old
# ones. Run from anywhere; paths are resolved relative to the repo root.
set -euo pipefail

cd "$(dirname "$0")/.."

# Load compose credentials.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
else
  echo "Missing .env — copy .env.example to .env first." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="backups"
mkdir -p "$OUT_DIR"
ARCHIVE="$OUT_DIR/cafe-$STAMP.archive.gz"

docker compose exec -T mongo mongodump \
  --username "$MONGO_ROOT_USERNAME" \
  --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --db "$MONGO_DB" \
  --archive --gzip >"$ARCHIVE"

echo "Backup written to $ARCHIVE"

# Retain only the 14 most recent backups.
ls -1t "$OUT_DIR"/cafe-*.archive.gz 2>/dev/null | tail -n +15 | xargs -r rm -f
