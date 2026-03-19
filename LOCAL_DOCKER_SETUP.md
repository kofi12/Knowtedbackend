# Knowted Local Docker Setup

## Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin) installed
- Docker daemon running

## Local Testing Environment

1. Copy the env template:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with values for your machine (especially OAuth and JWT values).
   - For local OAuth login, keep:
     - `BASE_URL=http://localhost:8080`
     - `FRONTEND_REDIRECT_URL=http://localhost:3000`

3. Start everything:

   ```bash
   make local-up
   ```

   Equivalent raw Docker command:

   ```bash
   docker compose --env-file .env.local -f docker-compose.yml -f docker-compose.local.yml up --build -d
   ```

4. Open apps:
   - Frontend: <http://localhost:3000>
   - Backend: <http://localhost:8080>

## Notes

- `docker-compose.yml` uses `GCS_CREDENTIALS_FILE` so local and production can use different credential files.
- Local storage defaults to `STORAGE_PROVIDER=noop` so cloud credentials are not required.
- A committed `backend/gcs-credentials.local.json` placeholder is provided for local Docker startup.
- Do not commit `.env.local` or any real secret values.
- Useful commands: `make local-down`, `make local-reset`, `make local-logs`, `make local-ps`, `make local-rebuild`.
- If backend fails with PostgreSQL auth errors after changing env values, run `make local-reset` and start again.
- Production remains unchanged unless you explicitly set `BASE_URL` or `FRONTEND_REDIRECT_URL` there.
