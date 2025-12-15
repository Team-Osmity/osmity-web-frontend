# Osmity-web-frontend
This repository contains the frontend web application for **Osmity** and **Shizuku86**.  
The frontend is built with Next.js and runs as a Docker container, with separate
configurations for development and production environments.

## Overview
- Framework: Next.js (React)
- Styling: Tailwind CSS
- Purpose:
  - Render the user-facing web UI
  - Consume backend APIs via `/api/*`
- The frontend communicates with the Go backend through an API gateway
  (Nginx / Cloudflare) and is environment-aware.

## Environments
### Development (dev)
- Domains  
  - https://dev.osmity.com  
  - https://dev.shizuku86.com  

- API Base: https://dev.osmity.com/api/*

- Notes  
- Uses `next dev`
- Hot reload enabled
- Intended for local and development use only

### Production (prod)

- Domains  
- https://osmity.com  
- https://shizuku86.com  

- API Base: https://osmity.com/api/*

- Notes  
- Built using `next build`
- Runs as an optimized standalone Node.js server
- No development tooling enabled

## Running Locally / Development
### Using Docker
The project is expected to be structured as follows:
Osmity/
├── docker-compose.yml
├── osmity-web-backend/
└── osmity-web-frontend/


Run Docker Compose **from the project root directory**:

```bash
cd Osmity
docker compose up -d --build
```

After startup, the services are available at:
 - Frontend: http://localhost:3000
 - Backend: http://localhost:8080/api/*

## Environment Variables
The frontend relies on the following environment variables:
| Variable     | Description |
|-------------|-------------|
| `APP_ENV`   | Runtime environment (`dev` or `prod`). Used to control behavior such as logging level and Swagger availability. |
| `VERSION`   | Application version (e.g. semantic version or release tag). |
| `BUILD_TIME`| Build timestamp in UTC (ISO 8601 format recommended). |
| `GIT_COMMIT`| Git commit SHA used for the build (short or full). |
> In development, these values are typically provided via .env and Docker Compose.

## Styling
 - Tailwind CSS is used for styling
 - Global styles are defined in globals.css
 - Global CSS is imported in app/layout.tsx

## Deployment
 - Docker images are built via GitHub Actions
 - Production images are built using next build
 - Images are pushed to Docker Hub
 - Containers are started using Docker Compose on the server

## Notes
 - Dockerfile.dev is intended only for local developmen
 - Production builds must use the default Dockerfil
 - Do not run development containers on production servers