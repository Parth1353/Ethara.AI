# Deployment Guide

This repository is ready for the required submission flow: GitHub source code, Docker Hub backend image, Render backend, Neon PostgreSQL, and Vercel frontend.

## 1. GitHub Repository

Create an empty GitHub repository, then connect and push this local repo:

```bash
git remote add origin <github-repo-url>
git push -u origin master
```

Use the GitHub repository URL in `SUBMISSION.md`.

## 2. Docker Hub Backend Image

Log in, tag the verified backend image, and push it:

```bash
docker login
docker tag inventory-backend:local <dockerhub-username>/inventory-backend:latest
docker push <dockerhub-username>/inventory-backend:latest
```

Use the pushed image URL in `SUBMISSION.md`.

## 3. Neon PostgreSQL

Create a Neon project and database, then copy the connection string.

Use this format for the backend environment variable:

```bash
DATABASE_URL=postgresql+psycopg://<user>:<password>@<host>/<database>?sslmode=require
```

If Neon provides a URL that starts with `postgresql://`, change it to `postgresql+psycopg://` before adding it to Render.

## 4. Render Backend

Deploy the backend from GitHub using `render.yaml`.

Required Render environment variables:

```bash
DATABASE_URL=<neon-postgresql+psycopg-url>
BACKEND_CORS_ORIGINS=<live-frontend-url>,http://localhost:5173,http://127.0.0.1:5173
```

After deployment, verify:

```bash
curl https://<render-service>.onrender.com/health
```

The response should be:

```json
{"status":"ok"}
```

The API docs should be available at:

```text
https://<render-service>.onrender.com/docs
```

## 5. Vercel Frontend

Import the GitHub repository into Vercel and set the project root directory to:

```text
frontend
```

Vercel should detect Vite automatically.

Required Vercel environment variables:

```bash
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://<render-service>.onrender.com
```

After deployment, open the live frontend and verify dashboard, products, customers, orders, and order details against the Render backend.

## 6. Netlify Fallback

If using Netlify instead of Vercel, deploy the frontend with:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Required Netlify environment variables:

```bash
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://<render-service>.onrender.com
```

## 7. Final Submission Checklist

Update `SUBMISSION.md` with:

- GitHub repository link
- Docker Hub backend image link
- Live frontend deployment URL
- Live backend API URL

Run the final verification script before sharing the submission:

```bash
./scripts/verify.sh
```
