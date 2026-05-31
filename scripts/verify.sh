#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

cleanup() {
  docker compose --env-file .env.example down >/dev/null 2>&1 || true
}

trap cleanup EXIT

cd backend
.venv/bin/pytest
.venv/bin/python -m compileall -q app tests
cd ..

cd frontend
PATH=/opt/homebrew/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:$PATH npm audit --audit-level=moderate
PATH=/opt/homebrew/bin:$PATH npm run build
cd ..

docker build -t inventory-backend:local ./backend
docker build -t inventory-frontend:local ./frontend
docker compose --env-file .env.example config >/dev/null
docker compose --env-file .env.example up --build -d
for attempt in 1 2 3 4 5 6 7 8 9 10 11 12; do
  if curl -fsS http://127.0.0.1:8000/health; then
    exit 0
  fi
  sleep 2
done

curl -fsS http://127.0.0.1:8000/health
