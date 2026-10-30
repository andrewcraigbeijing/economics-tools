# Econ Studio

An independent IB Diploma Economics study website. A first version with a searchable concept library, a supply and demand drawing canvas, guided writing, and evaluation practice.

## Run locally

Requires Python 3. Run from this checkout:

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Open the server in a browser. No build, dependencies, credentials, or database are required. Fonts are optional external resources with system fallbacks. Drafts and diagrams are stored locally in the browser; they do not sync between devices. Writing reflection uses transparent keyword prompts, not AI grading. The concept library is a starter selection, not a complete syllabus.

## Check

```sh
node --check app.js
curl --fail http://127.0.0.1:3000/
```

For functional verification, open each study area, search a concept, draw and undo a line, add a label, export a PNG, and write a response. Refresh to verify local persistence. This project is not affiliated with the IB.

## Reference-based study content

`knowledge.js` contains original study summaries informed by the ten user-supplied reference documents. `study.js` adds unit filters, definition recall, command terms, a reference shelf and eight linked diagram/analysis/evaluation topics. Keep both files beside the original website files when deploying.

The collection currently contains 28 concepts and 12 command terms. It is not exhaustive SL/HL syllabus coverage. Source notes identify supporting documents; some definition references include PDF page positions, which may differ from printed numbering. Original PDFs and extracted textbook text are kept outside this repository and are not distributed by the website. The textbook text extraction has gaps; no damaged passages are presented as quotations. This is curated study content, not a full-document search or AI question-answering system.

Drafts and drawings are separate for each practice topic. Existing sugary-drinks writing drafts are available in the tax topic. Reflection uses self-review checklists; no answers are automatically graded.

Browser validation covered unit filtering, concept search and recall, command terms and sources, per-topic writing persistence and canvas storage, reflection, PNG export, reload and all seven routes at mobile width.

## RWE Genie, course levels and practice papers

- The header SL/HL selector persists in browser storage. HL adds asymmetric information, monopoly and multiplier concepts, monopoly/multiplier drawing and writing topics, and Paper 3. Paper 2 remains common to both levels.
- RWE Genie ranks 12 curated historical examples from the supplied textbooks by topic/location keywords. Each result includes the context, application, evaluation limitation and PDF source/page. It returns the closest three for supported queries and labels broader comparisons. Unsupported queries get a no-match message. It does not use a live LLM, browse news or guarantee exact country/date constraints. `genie-data.js` holds the collection.
- The practice generator in `features.js` creates original, unofficial questions. Paper 1: 75 minutes, three choices, answer one, 25 marks. Paper 2: 105 minutes, two choices, answer one, 40 marks. HL Paper 3: 105 minutes, two compulsory questions, 60 marks. Format references: uploaded Economics Syllabus 2024.pdf, PDF pages 66–68.
- Paper 1 supports every unit; data/policy scenarios currently cover units 2–4. Unit-focused papers are narrower than full mixed-unit mocks. Synthetic data and simplified calculation assumptions are explicit. Question/answer-guidance quality has not been IB validated. There is no automatic grading.
- Download questions as text or use Print / Save PDF. Print output excludes answer guidance and controls. Generated papers last until navigation/reload; download papers you want to keep.
- New site files `genie-data.js` and `features.js` must be deployed with the existing files. No new dependencies, API keys or backend are needed.

Browser checks passed for SL/HL persistence and content filtering, three RWE results and sources, empty/unsupported requests and HTML injection handling, all available paper formats and unit focuses, mark totals, multiplier answers, text download, print/PDF exclusion of answers, and mobile layouts.

## Expanded RWE archives and AI web search

Three additional RWE archives (Macro: 74 pages; Micro: 31; Global: 46) are registered in the reference shelf. `archive-data.js` adds 24 original summaries to the earlier 12 examples, for 36 curated cases. Each has a PDF-page reference and a limitation. Archive-derived cases are not independently web-verified; selected questionable statements and outdated status claims are deliberately excluded. For example, the macro archive's claim of New Zealand abolishing minimum-wage legislation in 2008 is not used. Numerical impact claims from these archives are not copied into the example bank. Original PDFs remain outside the public repository.

The RWE source selector distinguishes **reference collection** matching from **AI + live web search**. The AI option stays unavailable until a valid public endpoint is configured in `rwe-config.js`. `ai-genie.js` sends only the request and course level, displays source citations, handles errors and keeps archive search available. No API key belongs in frontend configuration.

A deployable Cloudflare backend, its secure configuration instructions and validation details are in [backend/README.md](backend/README.md). The backend is prepared and tested locally; live AI activation requires Cloudflare deployment and an OpenAI API key entered through secure hosting settings. The default quota is 30 total searches per UTC day and 3 per IP per UTC hour. These are request limits, not a financial guarantee. Public live search has not yet been tested with a real key.

The static site still runs with `python3 -m http.server 3000 --bind 0.0.0.0`. Deploy all frontend scripts listed in `index.html`, including `archive-data.js`, `rwe-config.js` and `ai-genie.js`. Backend deployment is separate from GitHub Pages.
