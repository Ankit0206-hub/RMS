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
if [ -f "add_real_menu.py" ]; then
    echo "Running add_real_menu.py..."
    python add_real_menu.py
fi

echo "Starting uvicorn server..."
mkdir -p logs
uvicorn main:app --host 0.0.0.0 --port 8000 2>&1 | tee logs/backend.log
