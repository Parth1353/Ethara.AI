# Ethara.AI

Ethara.AI is a production-ready Inventory and Order Management System built for a full-stack software engineering assessment. It helps businesses manage products, customers, orders, and inventory from a responsive React interface backed by a FastAPI API and PostgreSQL.

## Highlights

- Product management with create, list, detail, update, and delete flows
- Customer management with create, list, detail, and delete flows
- Order creation, order history, order details, and order cancellation
- Inventory tracking with automatic stock reduction and restoration
- Dashboard metrics for total products, customers, orders, and low-stock items
- Backend-calculated order totals
- Validation for unique SKUs, unique customer emails, non-negative stock, and insufficient inventory
- Clear success/error states and responsive desktop/mobile UI
- Mock API mode for frontend-only testing
- Dockerized frontend, backend, and PostgreSQL services

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, TanStack Query, lucide-react |
| Backend | Python, FastAPI, SQLAlchemy 2, Pydantic v2, Alembic |
| Database | PostgreSQL |
| Testing | pytest, ESLint, npm audit, production builds |
| Runtime | Docker, Docker Compose, nginx, Uvicorn |
| Deployment | Render, Neon, Vercel, Netlify fallback |

## Project Structure

```text
.
├── backend
│   ├── app
│   ├── alembic
│   ├── tests
│   └── Dockerfile
├── docs
│   ├── ASSESSMENT-CHECKLIST.md
│   ├── DEPLOYMENT.md
│   └── SUBMISSION.md
├── frontend
│   ├── src
│   ├── public
│   ├── Dockerfile
│   ├── vercel.json
│   └── netlify.toml
├── docker-compose.yml
├── render.yaml
└── scripts
```

## API Overview

| Resource | Endpoints |
| --- | --- |
| Products | `POST /products`, `GET /products`, `GET /products/{id}`, `PUT /products/{id}`, `DELETE /products/{id}` |
| Customers | `POST /customers`, `GET /customers`, `GET /customers/{id}`, `DELETE /customers/{id}` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `DELETE /orders/{id}` |
| Health | `GET /health` |

## Local Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Use mock mode for frontend-only testing:

```bash
VITE_USE_MOCK_API=true
```

Use real API mode when the backend is running:

```bash
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
```

## Local Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

Open:

- API health: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

The backend defaults to SQLite for simple local development when `DATABASE_URL` is not set. Docker Compose and deployment use PostgreSQL.

## Docker Compose

```bash
cp .env.example .env
docker compose --env-file .env up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`
- Backend health: `http://localhost:8000/health`

Stop the stack:

```bash
docker compose --env-file .env down
```

## Verification

Run everything:

```bash
./scripts/verify.sh
```

Manual checks:

```bash
cd backend
.venv/bin/pytest
.venv/bin/python -m compileall -q app tests
```

```bash
cd frontend
npm run lint
npm audit --audit-level=moderate
npm run build
```

```bash
docker build -t inventory-backend:local ./backend
docker build -t inventory-frontend:local ./frontend
docker compose --env-file .env.example up --build -d
curl -fsS http://127.0.0.1:8000/health
docker compose --env-file .env.example down
```
