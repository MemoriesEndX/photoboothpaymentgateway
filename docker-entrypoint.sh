#!/bin/sh
set -e

# Ensure storage directories exist
mkdir -p /app/public/uploads /app/public/gallery 2>/dev/null || true

# Run Prisma database migrations safely
echo "==> Running Prisma migration deploy..."
npx prisma migrate deploy

# Start the application
echo "==> Starting Photobooth application..."
exec "$@"
