# Citron backend

NestJS REST API for customer CRUD, backed by PostgreSQL and TypeORM.

## Run locally

1. Copy `.env.example` to `.env`.
2. From the repository root run `docker compose up -d`.
3. From `backend` run `npm install` and `npm run start:dev`.

API: `http://localhost:3000/api`

## pgAdmin

Open `http://localhost:5050`.

- Email: `admin@citron.local`
- Password: `admin_password`
- Host: `postgres` when connecting from pgAdmin
- Port: `5432`
- Database: `citron`
- Username: `citron`
- Password: `citron_password`

## Endpoints

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PATCH /api/customers/:id`
- `DELETE /api/customers/:id`
