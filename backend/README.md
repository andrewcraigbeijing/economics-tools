# RWE Genie: DeepSeek + web search

The Cloudflare Worker uses **Tavily to retrieve web sources** and **DeepSeek to select and explain relevant examples**. This integration does not rely on an OpenAI API key. DeepSeek receives the student request, SL/HL level and retrieved text excerpts; it does not browse through a built-in search tool.

The static website and archive collection work without this backend. Live search remains **inactive** until the Worker is deployed, both provider secrets are configured, and its public URL is saved in `rwe-config.js`.

## Get the two keys

1. Create an account at [DeepSeek Platform](https://platform.deepseek.com/), set up API billing as required, and create a key in its API Keys section. This becomes `DEEPSEEK_API_KEY`.
2. Create an account at [Tavily](https://app.tavily.com/) and obtain a search API key. This becomes `TAVILY_API_KEY`. Check current search allowances and pricing in that account.

Never put keys in frontend code, tracked files, GitHub issues or chat. Use separate project/service credentials and monitor both providers' billing. These keys are independent of a consumer chatbot subscription.

## Deploy to Cloudflare

Use Node 22 or 24 and the pinned Wrangler CLI below. From the repository root:

```sh
npx wrangler@4.156.0 login
npx wrangler@4.156.0 deploy --config backend/wrangler.jsonc
npx wrangler@4.156.0 secret put DEEPSEEK_API_KEY --config backend/wrangler.jsonc
npx wrangler@4.156.0 secret put TAVILY_API_KEY --config backend/wrangler.jsonc
```

The secret commands prompt securely. Alternatively enter the two values as **secrets** in the Cloudflare Worker's settings. Codex environment secrets do not transfer automatically to Cloudflare.

`backend/wrangler.jsonc` configures the Durable Object, allowed website origin and default model alias `deepseek-chat`. `RWE_MODEL` is adjustable; select a DeepSeek model supporting Chat Completions JSON-object output. Model availability and aliases can change; verify a real request after deployment.

Verify the actual host printed by deployment:

```sh
curl --fail https://<worker-host>/health
```

`{"ready":true}` means both key bindings, quota binding and allowed origin are present. It does not prove valid billing, authorised keys or working provider requests. Then change the **public URL only** in `rwe-config.js`:

```js
window.RWE_CONFIG = { apiUrl: 'https://<worker-host>/api/rwe' };
```

Commit and push the URL so GitHub Pages rebuilds, then test the live mode through the website. Read the returned sources to check factual support and relevance. No live deployment or real paid-provider request has been validated during this change: keys and hosting access were absent.

The allowed origin defaults to `https://andrewcraigbeijing.github.io`, without a path or trailing slash. Update `ALLOWED_ORIGINS` when changing hosting. Avoid wildcard CORS in production. The earlier `RWE_AI_API_KEY`/OpenAI binding is obsolete and not read by this backend. If it remains in environment settings, remove it there; draft requirement updates cannot delete bindings.

## Retrieval and citations

- Live requests accept 8–400 characters. The complete request is used for search, preserving country/date conditions rather than silently truncating them.
- One basic Tavily search returns up to ten usable HTTPS sources and excerpts. No generated search-provider answer or full-page scraping is requested. Empty search results skip the DeepSeek call and return no examples.
- DeepSeek is instructed to exclude cases that fail explicit topic, place or date constraints, and return fewer than three when evidence is insufficient. These are model instructions, not a guarantee of relevance.
- The backend validates JSON output, required fields, duplicate cases and citations against actual retrieved URLs. Citation titles come from search results rather than the model. Invented URLs are removed; uncited answers are rejected.
- Text excerpts are limited in length. A URL returned by search is not proof that the whole article supports every claim. The interface says DeepSeek uses excerpts, and students should read the source pages themselves.
- Provider failures are shown without exposing their response bodies or keys. There are no automatic paid retries, and a shared 90-second deadline bounds both calls.

## Usage limits and privacy

A shared Durable Object enforces 30 searches per UTC day across the site and 3 per client IP per UTC hour. Configurable values are bounded by code caps of 200/day and 20/IP/hour. A reservation covers the workflow containing both provider calls; failures also consume a reservation. These request-count limits are not a guaranteed financial cap. Monitor both provider accounts and set account-level budgets or alerts where available.

Shared school IP addresses share the hourly allowance. Origin checks control browser access, not user authentication; non-browser clients can forge Origin. The durable global cap remains important for a public demo.

Tavily receives the student's search request. DeepSeek receives that request, course level and retrieved excerpts. Uploaded PDFs, writing drafts and browser-storage contents are not sent. The browser explains this before a live search and asks students to omit personal information. The Worker does not log requests or keys; provider processing and retention policies still apply. No unsupported zero-retention claim is made. Quota storage holds a daily-rotating IP hash, hourly counters and a daily total; alarms remove expired state. Cloudflare processes connection metadata.

Student input and web excerpts are untrusted data. Backend requests go only to the fixed Tavily and DeepSeek endpoints. Citation pages are not fetched by backend code. Displayed content is escaped; citation links use `noopener noreferrer`.

## Validation and references

```sh
node tests/rwe-backend.test.mjs
npx wrangler@4.156.0 deploy --config backend/wrangler.jsonc --dry-run
```

Seventeen tests cover the two-provider order and key isolation, exact query preservation, retrieved-evidence handling, JSON parsing, invented citations, partial results, empty searches, provider failures, both required secrets, shared atomic quotas and alarm behaviour. Browser checks use synthetic provider responses and do not spend credits. Passing mocked tests and a deployment dry-run do not establish live provider access.

API references: [DeepSeek API](https://api-docs.deepseek.com/), [DeepSeek official repository](https://github.com/deepseek-ai/DeepSeek-V3#5-chat-website--api-platform), [Tavily official Python client](https://github.com/tavily-ai/tavily-python). The implementation uses native HTTP requests with no additional production dependencies.
