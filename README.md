# Fractured_Blogs

Document-driven blog platform scaffold.

Write in Word/Google Docs/any editor, export `.docx` or `.pdf`, upload once, and render content in your site design without retyping into a CMS editor.

## Scaffold Included

- `web/`: Next.js 14 + TypeScript + Tailwind app (App Router)
- `api/`: .NET 8 layered solution with minimal API route groups
- `docker-compose.yml`: Postgres 16, MinIO, Redis, API, Web
- Endpoints scaffolded for:
  - `GET /api/blogs`
  - `GET /api/blogs/{slug}`
  - `POST /api/blogs/upload`
  - `PATCH /api/blogs/{id}/publish`
  - `DELETE /api/blogs/{id}`
  - `GET /api/blogs/search?q=`
  - `GET /api/tags`
  - `POST /api/auth/register|login|refresh`
- Parsing service wired for `.pdf` and `.docx`
- MinIO upload + pre-signed download URL abstraction
- EF Core data model for blogs/tags/join table/refresh tokens

## Monorepo Layout

- `web/` Next.js UI (post list, post detail, upload page)
- `api/src/FracturedBlogs.Api/` HTTP API + endpoint mappings
- `api/src/FracturedBlogs.Core/` Entities and enums
- `api/src/FracturedBlogs.Infrastructure/` DbContext + DB/service options
- `api/src/FracturedBlogs.Parsers/` DOCX/PDF text extraction
- `api/migrations/` reserved for EF migrations

## Getting Started

1. Copy environment defaults.

```bash
cp .env.example .env
```

2. Start infra + services with Docker Compose.

```bash
docker compose up --build
```

3. Open apps:
- Web: `http://localhost:3000`
- API Swagger: `http://localhost:5000/swagger`
- MinIO Console: `http://localhost:9001`

## Local Dev (without Docker)

### API

```bash
cd api
dotnet restore FracturedBlogs.sln
dotnet run --project src/FracturedBlogs.Api
```

### Web

```bash
cd web
npm install
npm run dev
```

## What To Build Next

1. Replace scaffolded auth responses with full ASP.NET Identity + JWT/refresh token issuance.
2. Add EF migrations and seed/admin bootstrap scripts.
3. Add background job pipeline for heavy file extraction and thumbnail generation.
4. Add rich rendering transform (`content_text` -> semantic HTML blocks).
5. Add publish dashboard, draft management, and protected upload route with real bearer token flow.
6. Add PostgreSQL full-text index (`tsvector`) and search ranking.

## Notes

- The scaffold is intentionally production-shaped but minimal.
- Some security/validation concerns are placeholders by design so you can tailor policies before launch.
- If NuGet/npm restore is blocked in your environment, run the same commands on a machine with package registry access.
