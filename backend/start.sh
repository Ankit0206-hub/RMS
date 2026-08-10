#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting backend initialization..."

# Run database migrations
echo "Running alembic upgrade head..."
alembic upgrade head

# Seed initial admin and roles (if not exists)
echo "Running seed.py..."
python scripts/seed.py

# Start the application
echo "Starting uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
