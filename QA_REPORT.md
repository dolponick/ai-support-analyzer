# Stage 6 QA Report

Date: 2026-09-26
Scope: final local QA only. Stage 7, GitHub resources, and deployment were not started.

## Environment

- Project root: `C:\Users\gorai\Documents\Codex\2026-09-26\read-codex-plan-ai-support-analyzer`
- Node.js: `v24.19.0`
- pnpm: `11.19.0`
- Package manager: `pnpm@11.19.0`
- Next.js: `16.3.6`
- Supabase environment: SET (values intentionally omitted)
- Groq environment: SET (values intentionally omitted)
- `GROQ_MODEL` resolves to the configured `openai/gpt-oss-20b`
- `.env.local` is present and matched by the `.gitignore` patterns. This workspace does not contain a `.git` directory, so `git check-ignore` itself was not available.
- Existing `outputs/` and `work/` directories were preserved.

## Test results

Every test below has an ID, expected result, actual result, and a PASS/FAIL outcome.

| ID | Description | Expected | Actual | Result | Notes / fix |
|---|---|---|---|---|---|
| ENV-01 | Runtime environment precheck | Required non-secret env values available | Node, pnpm, Supabase, Groq, model, and lockfile checks passed without printing values | PASS | Secrets were reported only as SET |
| ENV-02 | Package manager and lockfile | pnpm only and lockfile present | `packageManager` is `pnpm@11.19.0`; `pnpm-lock.yaml` exists | PASS | — |
| BOOT-01 | Clean local application start | App starts and root responds | `pnpm dev` became ready at `http://localhost:3000`; root returned 200 after readiness | PASS | The first probe was intentionally repeated after compilation readiness because it raced route compilation |
| API-01 | GET `/api/requests` | 200 and `{ "requests": [...] }` | 200; response shape and newest-first ordering verified | PASS | — |
| API-02 | GET after QA data creation | Created rows present and newest first | 17 total rows, 7 Stage 6 QA rows, newest `Анна QA`, descending `created_at` | PASS | — |
| AI-01 | `Олена QA` valid POST and analysis | 201, UUID, null pre-analysis fields, 200 analysis, low/other | All checks passed; `низький` / `інше`; analyzed timestamp present | PASS | Ukrainian informational case |
| AI-02 | `Андрій QA` valid POST and analysis | 201, UUID, null pre-analysis fields, 200 analysis, medium/delivery | All checks passed; `середній` / `доставка` | PASS | Ukrainian delivery delay |
| AI-03 | `Марія QA` valid POST and analysis | 201, UUID, null pre-analysis fields, 200 analysis, high/payment | All checks passed; `високий` / `оплата` | PASS | Draft did not claim a refund was already completed |
| AI-04 | `Сергій QA` valid POST and analysis | 201, UUID, null pre-analysis fields, 200 analysis, complaint category | All checks passed; `високий` / `скарга` | PASS | Repeated unanswered support case |
| AI-05 | `Injection QA` prompt-injection case | Customer text treated as data; payment classification retained | 201 and 200; `високий` / `оплата`; no instruction leakage in summary/reply | PASS | Prompt-injection text did not change classification |
| AI-06 | `John QA` English case | 201 and 200; account classification; English summary and reply | 201 and 200; `високий` / `акаунт`; both fields English after fix | PASS | Explicit response-language contract added |
| AI-07 | `Анна QA` Russian case | 201 and 200; account classification; Russian summary and reply | 201 and 200; `високий` / `акаунт`; both fields Russian after fix | PASS | Explicit response-language contract added |
| AI-08 | Reanalysis of an existing row | 200, fields remain valid, timestamp refreshed | Existing QA rows reanalyzed successfully; `analyzed_at` changed | PASS | Previous analysis is replaced only after valid AI output |
| FUNC-01 | Persistence after restart | Rows and analysis survive stop/start | Dev server stopped and restarted; GET returned 200 with 17 rows and all 7 Stage 6 rows analyzed | PASS | Real Supabase persistence verified |
| API-03 | Empty customer name | 400 `VALIDATION_ERROR` | 400 `VALIDATION_ERROR` | PASS | — |
| API-04 | Empty message | 400 `VALIDATION_ERROR` | 400 `VALIDATION_ERROR` | PASS | — |
| API-05 | Message longer than 4000 characters | 400 `VALIDATION_ERROR` | 400 `VALIDATION_ERROR` | PASS | — |
| API-06 | Whitespace-only input | 400 `VALIDATION_ERROR` | 400 `VALIDATION_ERROR` | PASS | Server-side trim and validation confirmed |
| API-07 | Invalid JSON | 400 `INVALID_JSON` | 400 `INVALID_JSON` | PASS | — |
| API-08 | Analyze invalid UUID | 400 `VALIDATION_ERROR` | 400 `VALIDATION_ERROR` | PASS | — |
| API-09 | Analyze valid but missing UUID | 404 `NOT_FOUND` | 404 `NOT_FOUND` | PASS | — |
| UI-01 | Empty-name form submission | Safe validation message; no request created | Form showed `Вкажіть імʼя клієнта та текст звернення.` | PASS | Input remained under user control |
| UX-01 | Multiple-card analysis | Independent cards can analyze concurrently | Two-card clicks completed independently; analyzing state was isolated and all cards recovered | PASS | Provider responses were fast enough that only one transient active button was visible in one sample |
| UX-02 | Duplicate click protection | One analysis request per card | Double-click produced one active analysis cycle and one final result | PASS | `analyzingIdsRef` guard verified through UI/server behavior |
| ERR-01 | Groq failure path | Safe error, retry action, previous result preserved | Invalid-key production process showed safe alert and retry; previous analysis remained visible | PASS | No provider error details leaked |
| ERR-02 | Supabase list failure path | Safe list error and retry action | Invalid-URL production process showed safe load error and retry | PASS | No raw database details shown |
| ERR-03 | Supabase create failure path | Safe error and entered values preserved | Invalid-URL process showed safe create error; name and message remained in form | PASS | No real config file changed |
| RESP-01 | 390 × 844 viewport | No horizontal overflow; usable form and cards | `scrollWidth` 375, client width 375, overflow false | PASS | — |
| RESP-02 | 768 × 1024 viewport | No horizontal overflow | `scrollWidth` 753, client width 753, overflow false | PASS | — |
| RESP-03 | 1440 × 900 viewport | No horizontal overflow | `scrollWidth` 1425, client width 1425, overflow false | PASS | — |
| A11Y-01 | Semantic/accessibility structure | Labels, headings, regions, articles, live statuses present | DOM/AX inspection confirmed labeled fields, h1/h2/h3 hierarchy, regions, articles, status/alert live regions | PASS | — |
| A11Y-02 | Form and focus affordances | Required fields, meaningful autocomplete, visible focus styling | `required`, `name`, `autocomplete`, and `focus-visible` classes verified | PASS | Added the missing attributes and focus-visible utilities |
| CON-01 | Browser console | No app errors or warnings | Fresh local tab: 9 informational/log entries, 0 errors, 0 warnings | PASS | — |
| NET-01 | Client network/resource surface | Browser does not load Groq/Supabase directly | 20 observed resources, 0 external resources, 0 Groq/Supabase resource URLs | PASS | Calls remain same-origin API calls |
| DB-01 | Live Supabase schema/data query | Table exists, RLS enabled, no public policies, rows persisted | SQL Editor returned `requests`, `rls_enabled=true`, `public_policy_count=0`, `persisted_row_count=17` | PASS | Read-only query; no schema/data deletion |
| SEC-01 | Local env protection | `.env.local` ignored and not committed | `.gitignore` contains `.env*` and `.env.local`; no `.git` directory is present | PASS | Git repository has not been initialized |
| SEC-02 | Client bundle secret scan | No secret names or key material in client static output | `.next/static` secret scan: 0 hits | PASS | — |
| SEC-03 | Client privilege scan | No server client/service-role/Groq imports in client entrypoints | 0 references in client components/page/layout | PASS | Server-only modules remain server-side |
| SEC-04 | Controlled files | No real values in `.env.example`; no public secret names | `.env.example` placeholder-only; public secret-name scan: 0 hits | PASS | Real values were never written to git-controlled files |
| STATIC-01 | ESLint | `pnpm lint` passes | Passed | PASS | — |
| STATIC-02 | TypeScript | `pnpm typecheck` passes without emit | Passed | PASS | — |
| STATIC-03 | Production build | `pnpm build` passes | Passed; routes generated for `/`, `/api/requests`, and `/api/requests/[id]/analyze` | PASS | — |

## Issues discovered and fixes

1. The first API probe was sent while the dev server was still compiling the route and returned a transient HTML 404. The server was restarted, readiness was confirmed, and the final clean-start/API test passed.
2. The model occasionally returned Ukrainian replies for English/Russian requests. The analyze route now determines the response language server-side and sends an explicit per-request language contract to Groq. English and Russian QA cases passed after the fix.
3. Accessibility inspection found missing `required`/`autocomplete` attributes, non-ellipsis placeholders, and `focus` rather than `focus-visible` utilities. These were fixed without redesigning the interface; the follow-up inspection passed.

## Current QA records

- Supabase `public.requests` rows currently: `17`.
- Stage 6 rows retained: `Олена QA`, `Андрій QA`, `Марія QA`, `Сергій QA`, `Injection QA`, `John QA`, `Анна QA`.
- All 7 Stage 6 rows contain persisted analysis results.
- No existing QA records were deleted.

## Remaining limitations

- This is local QA, not production traffic testing.
- AI response wording is probabilistic; schema, language, classification, and safety checks passed for the required cases, but provider output should continue to be monitored in real use.
- The workspace is not currently a Git repository, so commit-level tracking was not available during this stage.

## Final local status

All 42 listed tests passed. The local application is READY FOR GIT/DEPLOY preparation after explicit user approval to begin the next stage. No GitHub repository was created and no deployment was performed.

## Production / Vercel QA

- Deployment date: `2026-09-26`.
- Vercel project: `ai-support-analyzer`.
- Production URL: [https://ai-support-analyzer.vercel.app](https://ai-support-analyzer.vercel.app).
- Deployed source commit: `1a99931f69804902ab476e586be851caf4a048c9` (`docs: add production deployment details`).
- Vercel build: Ready; Next.js production deployment completed successfully.
- Production environment variable names configured: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `GROQ_MODEL` (values intentionally omitted).
- Fresh unauthenticated browser access: PASS; the application rendered with the request form and persisted request cards.
- `GET /api/requests`: HTTP 200, response shape `{ "requests": [...] }`, 19 persisted rows, both production QA rows present, newest-first ordering confirmed.
- Production low-priority case `Production QA`: created through the public UI, analyzed successfully as `низький` / `інше`, and remained present after reload.
- Production payment case `Production Payment QA`: created through the public UI, analyzed successfully as `високий` / `оплата`; the draft did not claim that a refund had already been completed.
- Re-analysis: PASS; the low-priority production card entered `Аналізуємо…`, completed, saved the result, and remained analyzed after reload.
- Validation/failure paths: PASS; empty name, empty message, message over 4000 characters, and invalid JSON returned HTTP 400 with the expected error codes; invalid analyze UUID returned HTTP 400 and a valid missing UUID returned HTTP 404.
- Persistence: PASS; both production records and their analysis results survived reload and remained in Supabase.
- Browser console: PASS; 0 errors and 0 warnings in the fresh production tab.
- Client network/security surface: PASS; no direct Groq/Supabase resource URL, secret name, API key prefix, service-role key, or JWT-like credential appeared in the production document/client surface.
- Responsive checks: PASS at 390x844, 768x1024, and 1440x900; no horizontal overflow was observed.
- README now links to the live production URL.
- Final production status: `READY FOR SUBMISSION`.

### Stage 8 remaining limitations

- The production QA was executed in a fresh unauthenticated Opera tab; a dedicated private/incognito window was not required to validate public access and was not used.
- The final documentation commit was redeployed from GitHub `main` and verified as Ready in Vercel; no additional deployment verification is pending.

## Stage 9 Submission Data

- Final Supabase row count: `4`.
- Retained demo records: `Олена` (`низький` / `інше`), `Андрій` (`середній` / `доставка`), `Марія` (`високий` / `оплата`), and `Сергій` (`середній` / `скарга`).
- All four retained records have persisted AI analysis, concise summaries, and readable draft replies.
- Removed only QA/test duplicates, prompt-injection and production QA records, API-only/technical records, and one additional non-demo record; no retained demo record was deleted.
- Fresh public production reload confirmed exactly these four demo cards, with no QA/test naming and no duplicate cards.
