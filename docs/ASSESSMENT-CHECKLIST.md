# Assessment Checklist

This checklist maps the submitted project to the technical assessment requirements.

## Objective

| Requirement | Status |
| --- | --- |
| Manage products | Complete |
| Manage customers | Complete |
| Manage orders | Complete |
| Track inventory | Complete |
| React frontend | Complete |
| Python backend API | Complete |
| PostgreSQL database | Complete |
| Docker containerization | Complete |
| Docker Compose orchestration | Complete |
| Free-hosting deployment path documented | Complete |

## Functional Requirements

| Area | Requirement | Status |
| --- | --- | --- |
| Products | `POST /products` | Complete |
| Products | `GET /products` | Complete |
| Products | `GET /products/{id}` | Complete |
| Products | `PUT /products/{id}` | Complete |
| Products | `DELETE /products/{id}` | Complete |
| Products | Product name, SKU, price, stock quantity | Complete |
| Customers | `POST /customers` | Complete |
| Customers | `GET /customers` | Complete |
| Customers | `GET /customers/{id}` | Complete |
| Customers | `DELETE /customers/{id}` | Complete |
| Customers | Full name, email, phone | Complete |
| Orders | `POST /orders` | Complete |
| Orders | `GET /orders` | Complete |
| Orders | `GET /orders/{id}` | Complete |
| Orders | `DELETE /orders/{id}` | Complete |
| Orders | Customer reference, product references, quantities, total amount | Complete |

## Business Rules

| Rule | Status |
| --- | --- |
| Product SKU is unique | Complete |
| Customer email is unique | Complete |
| Product quantity cannot be negative | Complete |
| Orders reject insufficient inventory | Complete |
| Order creation reduces stock | Complete |
| Order deletion restores stock | Complete |
| Backend calculates order total | Complete |
| API error handling and status codes | Complete |
| Request validation before processing | Complete |

## Frontend Requirements

| Requirement | Status |
| --- | --- |
| Product add/list/update/delete | Complete |
| Customer add/list/delete | Complete |
| Order create/list/detail | Complete |
| Dashboard totals | Complete |
| Low-stock products | Complete |
| Responsive desktop/mobile design | Complete |
| Form validation | Complete |
| Clear error and success messages | Complete |
| Organized component structure | Complete |
| API state management | Complete |

## Docker And Deployment

| Requirement | Status |
| --- | --- |
| Backend Dockerfile | Complete |
| Frontend Dockerfile | Complete |
| `.dockerignore` files | Complete |
| Environment variable configuration | Complete |
| `docker-compose.yml` with frontend, backend, PostgreSQL | Complete |
| Slim/lightweight base images | Complete |
| No hardcoded credentials | Complete |
| Named PostgreSQL volume | Complete |
| Render backend deployment config | Complete |
| Vercel frontend config | Complete |
| Netlify fallback config | Complete |
| Docker Hub push steps documented | Complete |

## Submission Items

| Required item | Status |
| --- | --- |
| GitHub repository link | Ready |
| Docker Hub backend image link | Account-bound |
| Live frontend URL | Account-bound |
| Live backend API URL | Account-bound |
