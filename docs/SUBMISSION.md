# Submission Links

Fill these in after the account-bound deployment steps are complete.

| Requirement | Link |
| --- | --- |
| GitHub repository | https://github.com/Parth1353/Ethara.AI |
| Docker Hub backend image | TODO |
| Live frontend deployment | TODO |
| Live backend API | TODO |

## Verification Notes

- Local backend tests pass.
- Local frontend lint, audit, and build pass.
- Backend and frontend Docker images build locally.
- Docker Compose runs frontend, backend, and PostgreSQL together.
- Compose backend `/health` returns `{"status":"ok"}`.
- Compose frontend renders successfully at `http://127.0.0.1:5173/`.

## Useful Live URLs

| URL | Purpose |
| --- | --- |
| `<live-backend-url>/health` | Backend health check |
| `<live-backend-url>/docs` | FastAPI Swagger docs |
| `<live-frontend-url>` | React application |
