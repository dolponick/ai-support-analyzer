# AI Support Analyzer — Submission

## Live Demo

https://ai-support-analyzer.vercel.app

## GitHub

https://github.com/dolponick/ai-support-analyzer

## Stack

- Next.js 16 with App Router
- TypeScript
- React 19
- Tailwind CSS
- Supabase PostgreSQL
- Groq API
- `openai/gpt-oss-20b`
- Zod
- Vercel

## What was implemented

- customer support request creation and persistent storage;
- newest-first request list with four structured demo records;
- real LLM analysis with priority and category classification;
- concise summaries and draft customer replies saved to Supabase;
- re-analysis, loading/error/retry states, and responsive UI.

## AI implementation

The application uses the Groq-hosted `openai/gpt-oss-20b` model. The analyze API requests Structured Outputs with a strict JSON Schema, then validates the parsed response with Zod before writing it to Supabase. The customer request is treated as untrusted content and is separated from the analysis instructions. Groq is called only from the server-side Next.js route; the browser never receives the API key.

## Architecture

```text
Browser
  → Next.js UI
  → /api/requests → Supabase

Browser
  → Next.js Analyze API
  → Groq / GPT-OSS 20B
  → Zod validation
  → Supabase
```

## QA

- 42/42 local QA tests PASS;
- production Vercel QA PASS;
- responsive checks at 390 / 768 / 1440 PASS;
- browser console clean;
- no direct browser Groq/Supabase privileged calls;
- secrets remain server-side only.

See [`QA_REPORT.md`](QA_REPORT.md) for the detailed evidence.

## One problem I solved

During final QA, the model sometimes answered in Ukrainian even when the customer request was in English or Russian. I added explicit server-side language detection/context and strengthened the LLM instruction to answer in the same language as the request. Ukrainian, English, and Russian cases were then re-tested successfully.

## How AI coding tools were used

Codex was used to scaffold and implement the application in controlled stages. Each stage had acceptance criteria, and the generated implementation was checked with lint, typecheck, build, API tests, database verification, browser QA, and production QA. AI supported the development workflow; it did not replace validation.

## Known limitations

- no authentication because it was outside the test-task scope;
- LLM output remains probabilistic;
- this is a small internal demo, not a full CRM.
