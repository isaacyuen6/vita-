# Vita AI

Vita AI is a mobile-first health decision assistant that will combine training, nutrition, sleep, recovery, and nearby food choices into one coherent daily plan. This repository currently implements **Phase 0 only**: the runnable product foundation.

## Architecture

- Expo Router React Native mobile shell
- NestJS modular-monolith API under `/v1`
- Separate Python 3.12 FastAPI AI-service boundary
- PostgreSQL, Redis, and MinIO local infrastructure
- Shared Zod contracts and typed API client in a pnpm/Turborepo monorepo

The architecture decision and tradeoffs are recorded in [docs/decisions/0001-architecture.md](docs/decisions/0001-architecture.md). The implementation checklist is in [docs/implementation/phase-0.md](docs/implementation/phase-0.md).

## Prerequisites

- Node.js 22 LTS (Node 24 is also supported by the workspace range)
- pnpm 11.15.1 (`corepack enable`, then `corepack prepare pnpm@11.15.1 --activate`)
- Docker Desktop with Compose v2
- Python 3.12 only when running the AI service outside Docker

## One-command local stack

```bash
pnpm install
pnpm start:local
```

This builds and starts PostgreSQL, Redis, MinIO, the API, and the AI service. The Compose file supplies safe local-only credentials, so copying an environment file is not required for this path.

Verify:

- API liveness: http://localhost:3000/v1/health
- API readiness: http://localhost:3000/v1/ready
- API OpenAPI UI: http://localhost:3000/docs
- AI service: http://localhost:8000/health
- AI service OpenAPI UI: http://localhost:8000/docs
- MinIO console: http://localhost:9001 (`vita-local` / `change-me-local-only`)

Start the mobile shell in a second terminal:

```bash
pnpm --filter @vita/mobile start
```

For an Android emulator, change `EXPO_PUBLIC_API_URL` to `http://10.0.2.2:3000`. For a physical device, use the development computer's LAN address.

Stop the stack without deleting data:

```bash
pnpm infra:down
```

## Run services directly

Copy `.env.example` to `.env`, replace Docker hostnames with `localhost`, start PostgreSQL and Redis, then:

```bash
pnpm --filter @vita/api dev
```

For Python:

```bash
cd apps/ai-service
python -m venv .venv
.venv/Scripts/activate
python -m pip install ".[dev]"
uvicorn vita_ai_service.main:app --app-dir src --reload
```

On macOS/Linux, activate with `source .venv/bin/activate`.

## Quality commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

Python checks run from `apps/ai-service`:

```bash
ruff check .
ruff format --check .
pytest
```

## Current limitations

- Phase 0 intentionally contains no authentication, health records, Prisma models, workout logic, nutrition logic, or real AI inference.
- The mobile shell checks API liveness but is not included in Compose because Expo is an interactive development process.
- MinIO bucket creation and access policies will be added alongside the first file-storage feature.
- OpenAPI client generation is deferred until product endpoints exist; the current client is typed and runtime-validated.
