# AI Support Analyzer

AI Support Analyzer is a small internal support tool that stores customer requests and uses an LLM to classify each request and prepare a structured support analysis.

## Features

- create customer requests;
- persistent Supabase storage;
- newest-first requests list;
- real AI analysis;
- priority and category classification;
- one-sentence summary;
- customer reply draft;
- saved analysis after reload;
- re-analysis;
- safe error and retry states;
- multilingual responses.

## Tech Stack

- Next.js 16.3.6 with App Router
- TypeScript
- React 19.2.8
- Tailwind CSS 4
- Supabase PostgreSQL
- Groq API
- `openai/gpt-oss-20b`
- Zod
- pnpm
- Vercel production deployment

## Architecture

```text
Browser
  |
  v
Next.js UI
  |
  +--> /api/requests
  |       |
  |       v
  |    Supabase
  |
  +--> /api/requests/:id/analyze
          |
          +--> Groq / GPT-OSS 20B
          |
          v
       Zod validation
          |
          v
       Supabase
```

The browser communicates only with the same-origin Next.js API. It never calls Groq directly and never receives the Supabase service-role credential. Database and LLM calls are server-side.

## AI Analysis

Each analysis returns four structured fields:

- `priority`: `низький`, `середній`, or `високий`;
- `category`: `оплата`, `доставка`, `скарга`, `технічне`, `акаунт`, or `інше`;
- `summary`: one short sentence;
- `draftReply`: a useful draft response to the customer.

The server uses Groq Structured Outputs with JSON Schema `strict: true`, then validates the parsed response again with Zod before persistence. Customer ticket text is treated as untrusted data and is explicitly separated from the analysis instructions to reduce prompt-injection risk. This is a boundary and validation measure, not a guarantee that an LLM cannot make mistakes.

## Database

The application uses one table, `public.requests`, created by [`supabase/migrations/0001_create_requests.sql`](supabase/migrations/0001_create_requests.sql).

The schema stores a UUID, customer name, request message, nullable AI fields, creation time, and analysis time. Row Level Security is enabled and no public RLS policy is created. The application accesses the table server-side with the Supabase service-role key.

## Local Setup

Requirements:

- Node.js
- pnpm
- a Supabase project
- a Groq API key

Install dependencies:

```bash
pnpm install
```

Create `.env.local` with your local values:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
```

Then start the app:

```bash
pnpm dev
```

Never commit `.env.local`. Do not prefix `SUPABASE_SERVICE_ROLE_KEY` or `GROQ_API_KEY` with `NEXT_PUBLIC_`.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run [`supabase/migrations/0001_create_requests.sql`](supabase/migrations/0001_create_requests.sql).
4. Copy the Project URL and service-role key into `.env.local`.

The service-role key is secret and must never be exposed to client code or put in a `NEXT_PUBLIC_` variable. The Supabase CLI is not required for this setup.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

The final local QA pass completed with 42/42 tests passing. See [`QA_REPORT.md`](QA_REPORT.md) for the detailed test matrix, database verification, responsive checks, failure-path checks, and security audit.

## Deployment

Live demo: [https://ai-support-analyzer.vercel.app](https://ai-support-analyzer.vercel.app)

The production deployment is connected to the GitHub `main` branch. Vercel uses these server environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `GROQ_MODEL`

The Supabase service-role key and Groq API key are secret and must never be exposed through `NEXT_PUBLIC_` variables or client code. The public URL was verified after deployment; see [`QA_REPORT.md`](QA_REPORT.md) for the production QA record.

## Known Limitations

- There is no authentication because it was outside the test-task scope.
- LLM text generation is probabilistic.
- This is a small test/demo application, not a full CRM.
