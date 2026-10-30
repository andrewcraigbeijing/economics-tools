# Diagram photo checker — mainland-China option

The checker uses **Alibaba Cloud Model Studio (百炼) / Qwen-VL** to inspect actual image bytes. It does not send the image to DeepSeek's text API, Gemini, OpenAI or Tavily. RWE Genie remains a separate DeepSeek/Tavily feature.

## What is ready, and what is not

The website has photo upload, mobile camera-picker input, JPEG preparation, rotation, an intended-diagram prompt, SL/HL selection, local reference checklists and a feedback display. Uploading or selecting a photo does not send it anywhere. A photo is submitted only when the student explicitly presses **Send photo for AI feedback** and a backend URL is configured.

The backend and server were tested locally with synthetic provider responses. A real Qwen API request has **not** been validated because no account key or hosting access was supplied. Live feedback stays disconnected until those are configured. Local tests are not evidence of mainland-China connectivity or the model's accuracy on handwritten diagrams.

## Get the appropriate key

Use [Alibaba Cloud Model Studio / 百炼](https://bailian.console.aliyun.com/) and follow its API-key setup for the mainland-China endpoint/Beijing region. Match the key's region and available models to that endpoint; international-region keys are not automatically interchangeable. Enable billing/model access as required by the account.

Set the resulting DashScope key as the backend secret **`DIAGRAM_VISION_API_KEY`**. Never put it in frontend JavaScript, browser storage, GitHub or chat. No Gemini key is needed.

The fixed provider endpoint is:

```text
https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

The default model is `qwen3-vl-235b-a22b-instruct`, as demonstrated in the official [Qwen multimodal API example](https://github.com/QwenLM/Qwen2.5-VL#try-qwen3-vl-235b-a22-with-api). `DIAGRAM_VISION_MODEL` can select another available Qwen image-capable model. Verify availability, pricing and actual image support in the chosen account. Compatibility with the Chat Completions wire format does not mean an OpenAI service or key is used.

## China-hostable website and backend

Qwen is a mainland-China service option; it does not make GitHub Pages or Cloudflare reliable in China. A portable, dependency-free Node server is included so the **whole site and API can be hosted together** on a suitable China-hosted server, for example Alibaba Cloud ECS. Google Fonts was removed; frontend assets now load locally with system-font fallbacks.

Requirements: Node 22/24 with native fetch (Node 24 was tested), a deployment account, a public domain/TLS setup, and persistent disk for the quota file. For a public mainland-hosted domain, follow the hosting provider's domain/ICP备案 requirements. Provisioning those resources and an inside-China connectivity test have not been performed.

Inject the API key securely using the host's secret manager or a protected process-manager environment file **outside the checkout**. Then, from the repository root, set non-secret configuration, for example:

```sh
PUBLIC_ORIGIN=https://study.example.cn \
DIAGRAM_VISION_PROVIDER=qwen \
DIAGRAM_VISION_MODEL=qwen3-vl-235b-a22b-instruct \
QUOTA_DATA_DIR=/var/lib/econ-studio \
TRUST_LOOPBACK_PROXY=1 \
node backend/china-server.mjs
```

Replace the example domain. The key must already be injected as `DIAGRAM_VISION_API_KEY`; do not paste it into shell history. The server binds to **127.0.0.1:3080** by default. Put it behind an HTTPS reverse proxy on the same machine. If enabling `TRUST_LOOPBACK_PROXY=1`, configure that proxy to **overwrite**, not append untrusted client values, using `X-Forwarded-For: $remote_addr`. Do not expose the loopback backend port directly. The server ignores incoming Cloudflare-IP headers and derives the quota identity from the socket or this explicitly trusted loopback proxy.

This server serves only the public assets referenced by `index.html`. It refuses backend files, `.git`, PDFs, knowledge-base files, tests and other checkout contents. It dynamically returns public endpoint URLs in `/rwe-config.js`, without secret values. With a configured key, the checker uses the same-origin `/api/diagram-check`; RWE remains inactive unless its separate keys are configured too.

The single-process quota adapter stores only rotating client-IP hashes and counters in the persistent directory, using serialized writes and atomic file replacement. Defaults are 30 shared AI requests per UTC day and 3 per client IP per UTC hour, also shared with RWE when both are enabled. Old counters are replaced on the next request after the day changes. The adapter is for **one Node process on one host**; do not scale it to multiple replicas without a shared atomic quota store. Request-count caps are not a guaranteed financial budget. Set provider limits/alerts and monitor usage.

For local preview without credentials:

```sh
node backend/china-server.mjs
```

Only local preview and self-check tools are active. The frontend requires HTTPS for an AI endpoint; local HTTP preview does not silently enable photo transmission.

## Optional existing Cloudflare backend

The same diagram endpoint is also included in `backend/worker.mjs`. Existing deployments can set `DIAGRAM_VISION_PROVIDER=qwen`, add `DIAGRAM_VISION_API_KEY` as a Worker secret and redeploy. Set `rwe-config.js`'s public `diagramApiUrl` to the actual HTTPS `/api/diagram-check` URL. This option remains available, but China accessibility of the website/Worker route must be tested; the portable same-origin server is the prepared alternative.

`GET /diagram-health` reports configuration presence only, not working billing, valid credentials, model accuracy or mainland connectivity.

## Feedback scope and privacy

- Require the intended task, not just an image. Nine original model checklists and a custom-task option are available. HL-only models are excluded at SL.
- Images are converted in the browser to JPEG, resized to at most 2,000 pixels per side and stripped of original metadata. Original uploads are limited to 10 MB; oversized/unsupported/corrupt browser images are rejected. The backend validates request size, base64, JPEG markers and dimensions; it does not fully decode every JPEG pixel itself.
- Only the submitted image, task, course level and original reference checklist are sent to Qwen. Uploaded study PDFs and other students' work are not sent automatically.
- Photos are held in browser-tab memory, not persisted by the checker or written by backend code. Provider processing/retention policies still apply. Do not claim zero retention by Alibaba Cloud. Photograph only the diagram and omit names/faces.
- Feedback separates visibly clear errors, possible issues and things that cannot be verified. Unreadable images suppress guessed economic errors. No numerical IB grade is generated. Correct layouts/abbreviations may differ from the reference. AI feedback can be wrong, especially with faint handwriting, unusual layouts, cropped axes or ambiguous tasks.
- Cancellation prevents stale feedback on screen but does not guarantee the provider stops processing or reverses a charge. Provider bodies and keys are never returned as error messages.
- Mainland availability of RWE Genie's separate Tavily search service is not established by this work. The diagram checker itself has no Tavily dependency.

## Checks

```sh
node tests/diagram-checker.test.mjs
node tests/diagram-checker-browser.cjs
```

Tests cover actual image payloads, task/level/rubric checks, image limits, uncertainty handling, unreadable-image suppression, safe rendering, deliberate submission only, quota/provider failures, rotation, cancellation, persistence of quota counters, public-file allowlisting, same-origin server forwarding and mobile layout. Browser tests use synthetic responses and Playwright/Chromium; camera capture and actual handwriting accuracy require real-device/provider testing.
