#!/bin/bash
set -euo pipefail

# Runs once on first MongoDB initialization (empty data volume). Creates a
# least-privilege application user with readWrite on the app database, which the
# API connects as. Authenticates using the root credentials the official
# entrypoint created from MONGO_INITDB_ROOT_*.
mongosh --host 127.0.0.1 \
  -u "${MONGO_INITDB_ROOT_USERNAME}" \
  -p "${MONGO_INITDB_ROOT_PASSWORD}" \
  --authenticationDatabase admin <<EOF
const appDb = db.getSiblingDB("${MONGO_DB}");
appDb.createUser({
  user: "${MONGO_APP_USERNAME}",
  pwd: "${MONGO_APP_PASSWORD}",
  roles: [{ role: "readWrite", db: "${MONGO_DB}" }],
});
EOF
