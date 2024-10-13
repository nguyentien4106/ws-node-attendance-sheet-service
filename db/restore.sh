#!/bin/bash
# Wait for PostgreSQL to be ready

export PGPASSWORD="Ti100600@"

until pg_isready -h postgres -U postgres; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Restore the database from the backup file
psql -h postgres -U postgres -d attdb -f /docker-entrypoint-initdb.d/backup.sql