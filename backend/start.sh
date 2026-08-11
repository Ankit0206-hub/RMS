#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Create log file and run tail in background to preserve docker logs
touch app.log
tail -f app.log &

echo "Starting backend initialization..." >> app.log 2>&1

# Run database migrations
echo "Running alembic upgrade head..." >> app.log 2>&1
alembic upgrade head >> app.log 2>&1

# Seed initial admin and roles (if not exists)
echo "Running seed.py..." >> app.log 2>&1
python scripts/seed.py >> app.log 2>&1

# Start the application
if [ -f "add_real_menu.py" ]; then
    echo "Running add_real_menu.py..." >> app.log 2>&1
    python add_real_menu.py >> app.log 2>&1
fi

echo "Starting uvicorn server..." >> app.log 2>&1
exec uvicorn main:app --host 0.0.0.0 --port 8000 >> app.log 2>&1
