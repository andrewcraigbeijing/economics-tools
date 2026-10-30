# RWE Genie live-search backend

This Cloudflare Worker keeps the OpenAI API key off the GitHub Pages website. It calls the Responses API with live `web_search`, requires structured output and checks that each returned example has at least one HTTPS citation present in the search response. This validates link provenance, not the truth of every claim. It returns fewer than three examples when evidence is insufficient.

The frontend and expanded archive work without this backend. Live search is **not active** until the Worker is deployed, its secret is configured and the frontend endpoint is saved.

## Deploy (Cloudflare account required)

The prepared default is Cloudflare Workers. No account or deployment credential was available during implementation. Use a supported Node version (Node 22 or 24 is suitable) and the pinned Wrangler CLI below. These steps use Cloudflare's own authentication and secret entry. Never put a real API key in a tracked file, browser code, GitHub issue or chat.

From the repository root:

```sh
npx wrangler@4.156.0 login
npx wrangler@4.156.0 deploy --config backend/wrangler.jsonc
npx wrangler@4.156.0 secret put RWE_AI_API_KEY --config backend/wrangler.jsonc
```

The last command prompts for the key securely. Use a key for a dedicated OpenAI API project with billing enabled and access to a model supporting live web search and Structured Outputs. A ChatGPT subscription does not supply API credits. Set project budgets/alerts in OpenAI and monitor actual usage; request-count caps are not a guaranteed monetary spending cap. Alternatively add `RWE_AI_API_KEY` using the Cloudflare Worker's secret settings after deployment. Environment secrets in this Codex environment do **not** automatically transfer into Cloudflare.

`backend/wrangler.jsonc` defines the Durable Object and its migration, allowed frontend origin, `gpt-5-mini` model, 30 requests per UTC day across the entire site and 3 per client IP per UTC hour. These conservative defaults are adjustable up to enforced code caps of 200/day and 20/IP/hour. Failed provider calls also consume a reservation. Shared school IP addresses share an allowance. Origin checks are a browser access control, not user authentication; a non-browser client can forge Origin. Global durable quota enforcement limits request-count abuse across Worker instances. Do not remove it to make a public demo work.

Verify the deployed URL, replacing `<worker-host>` with the actual host printed by deployment:

```sh
curl --fail https://<worker-host>/health
```

The response should be `{"ready":true}`. This only checks configuration presence. Then edit the public `rwe-config.js` file:

```js
window.RWE_CONFIG = { apiUrl: 'https://<worker-host>/api/rwe' };
```

Commit and push that URL so GitHub Pages rebuilds. The live-source option then becomes selectable. Test a real request through the deployed site and inspect the actual source links; a working health endpoint is not proof of AI access, model support, billing or factual accuracy. Model availability can change: `RWE_MODEL` is configurable, but the chosen model must support Responses web search, reasoning effort `low` and strict JSON schema output.

The configured origin is `https://andrewcraigbeijing.github.io`, without a path or trailing slash. Update `ALLOWED_ORIGINS` if hosting changes. For local testing add the exact local origin to a local config; do not add wildcard CORS to production.

## Privacy and reliability

Only the student's request and SL/HL choice go to OpenAI. Uploaded PDFs, drafts and browser storage are not sent. The frontend tells students before live searches and asks them to omit personal information. The Worker uses `store:false` and does not log prompts or API keys. Provider retention and processing policies still apply. Quota storage retains a daily-rotating hash of the client IP, hourly counters and a daily total; an alarm clears expired quota state. Cloudflare itself processes connection metadata.

Search results and student requests are untrusted inputs. Only the fixed OpenAI endpoint is called by backend code. Citation URLs are not fetched by the Worker. Citations are shown as escaped links with `noopener noreferrer`; never treat model output as HTML. Read the sources before using facts in an essay. Web content may be inaccurate, outdated or misleading even when it appears in search.

## Validation

Run the backend tests directly to see all named cases in this environment:

```sh
node tests/rwe-backend.test.mjs
npx wrangler@4.156.0 deploy --config backend/wrangler.jsonc --dry-run
```

Twelve tests cover actual search-request fields, URL provenance checks, partial results, invalid requests, CORS, provider failures, concurrent shared quotas, per-IP limits and midnight alarm behaviour. The real local Cloudflare runtime was also tested with synthetic provider responses and enforced the configured per-IP limit. Browser tests covered archive fallback, escaped citations, mocked AI responses and quota errors, course level transmission and cancellation protection.

No live OpenAI request or public Cloudflare deployment has been validated yet: the API key and hosting access were absent. Mocked responses are test fixtures, not real examples or evidence that live search works.
