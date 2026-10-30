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

The RWE source selector distinguishes **reference collection** matching from **DeepSeek + web search**. The AI option stays unavailable until a valid public endpoint is configured in `rwe-config.js`. `ai-genie.js` sends only the request and course level, displays source citations, handles errors and keeps archive search available. No API key belongs in frontend configuration.

A deployable Cloudflare backend, its secure configuration instructions and validation details are in [backend/README.md](backend/README.md). The backend is prepared and tested locally; live AI activation requires Cloudflare deployment plus DeepSeek and Tavily keys entered through secure hosting settings. The default quota is 30 total searches per UTC day and 3 per IP per UTC hour. These are request limits, not a financial guarantee. Public live search has not yet been tested with a real key.

The static site still runs with `python3 -m http.server 3000 --bind 0.0.0.0`. Deploy all frontend scripts listed in `index.html`, including `archive-data.js`, `rwe-config.js` and `ai-genie.js`. Backend deployment is separate from GitHub Pages.

## AI provider

RWE Genie now uses DeepSeek for explanation and Tavily for web retrieval. No OpenAI key is used. Both `DEEPSEEK_API_KEY` and `TAVILY_API_KEY` must be set as backend secrets; get them from https://platform.deepseek.com/ and https://app.tavily.com/. See [backend setup](backend/README.md) for deployment. Live requests are limited to 400 characters so the entire request, including location/date constraints, reaches the search service. Search results are treated as evidence excerpts, not independently verified full articles. The interface names both services before a live request. The archive remains available while setup is pending.

## Adaptive flashcards and tablet drawing

Open **Flashcards** in the navigation or use `#flashcards`. Three modes are available:

- **Vocabulary:** type a definition in your own words, reveal the model definition, examples and common pitfalls, then self-rate. Typed drafts stay visible for comparison and save separately for each term.
- **Identify the diagram:** inspect an original schematic diagram, type its name, reveal the model and checklist, then self-rate.
- **Draw the diagram:** draw on screen or import a photo of paper work, reveal the reference diagram without replacing your own work, then self-rate.

Ratings are independent across vocabulary, identification and drawing. Ratings now schedule reviews rather than merely changing random weights. Red becomes due after one other card or 30 seconds; yellow after four other cards or five minutes; green after fourteen other cards or 24 hours, whichever comes first. Due red cards have priority over yellow, new and green cards; another due card is preferred to an immediate repeat. If a small deck has no due cards, it shows a resting state instead of immediately repeating a green card. Students can wait, change units or explicitly review early. Due status is eligibility, not a promise of an exact next-card position. Review counters are per mode across unit/course filters, and schedules persist across reloads. Old ratings without scheduling metadata use their last-review time. Reveal an answer before rating. Resetting selected ratings keeps drawings and typed definitions.

Decks follow the global SL/HL selector and unit filter. Current vocabulary coverage is 28 shared concepts plus 3 HL concepts. Original diagram decks contain 8 shared models plus the HL monopoly model. These are starter decks, not exhaustive syllabus coverage. Self-assessment does not automatically mark a typed identification or an uploaded diagram.

The same improved sketch pad is available in Diagram Lab. It supports finger, pressure-sensitive stylus and mouse input, freehand/straight lines/eraser/labels, optional axes/grid, undo/redo, written notes and PNG export. Existing Diagram Lab strokes are copied into the new pad on first use; original storage is retained.

Photo import and the device photo-picker/camera input accept JPG/PNG/WebP up to 10 MB and reject unsupported/corrupt images. HEIC needs conversion first. Images are resized to a maximum dimension of 1600 pixels and stored with strokes in this browser's IndexedDB. Photos do **not** go to a server, AI service or other device. Wait for the saved indicator; download important work. Browser clearing, private browsing or device changes can remove local work. Storage failures show a warning and PNG export remains available. Physical stylus pressure and camera behaviour depend on the device/browser; synthetic pointer input and desktop Chromium's touch-enabled browser context were tested, not every tablet model.

No API keys or AI backend are needed for flashcards or drawing. New frontend files are `flashcard-engine.js`, `diagram-flashcards.js`, `sketch-pad.js` and `flashcards.js`.

Validation:

```sh
node tests/flashcard-engine.test.mjs
# Optional browser verification, with Playwright and Chromium installed:
node tests/flashcards-browser.cjs
```

Browser tests use an isolated browser context and cover confidence persistence, reveal gating, SL/HL/unit filtering, diagram modes, strokes/undo/redo, imported photo reload, PNG export, invalid images, image-decoding fallback, synthetic stylus/touch input, legacy drawing migration and mobile overflow. The browser test uses `CHROMIUM_PATH` (default `/usr/bin/chromium`) and `ECON_TEST_URL` (default `http://127.0.0.1:3000`).

## Marked exemplars and examiner commentary

The reference shelf now includes 20 additional PDFs: five HL Paper 3 student responses and five paired commentaries, plus five SL Paper 2 responses and five paired commentaries (100 pages total). Together with the other uploads and past-paper compilations, there are now 38 registered reference documents.

Open `#exemplars` or **Marked work** for ten source-referenced study summaries. The cases show the assessed question total, the extended-response/recommendation mark, strengths, limitations and a concrete improvement. The global SL/HL selector limits availability; SL-labelled Paper 2 insights are also available to HL students. Filters cover component and topic/skill keywords. Writing, evaluation and practice-paper screens link to these insights. The study note is excluded from printed practice papers.

Marks and summaries were checked against the typed examiner commentary. HL Paper 3 marks are for **one 30-mark question**, not an entire 60-mark paper. Comments about units, working, rounding, diagrams, positive marking and best fit apply to their particular questions and must not be turned into universal marking rules. The study summaries do not automatically grade a new response or predict its mark.

All ten student responses contain scanned handwriting. PDF text extraction retrieves only their printed headers/footers, not a reliable transcription of the answers. The original scans are retained privately alongside searchable commentary text and a paired manifest/index in `/workspace/knowledge-base/exemplars`; selected pages were visually sampled, not every handwritten page transcribed. Uploaded originals, extraction text, private file paths and upload identifiers are not published in this repository. `exemplar-data.js` contains only source metadata, factual scores and original study summaries. These documents are not automatically sent to DeepSeek or used to train a model.

Validation:

```sh
node tests/exemplars.test.mjs
# With the local site running and Playwright/Chromium installed:
node tests/exemplars-browser.cjs
```

Validation checked all ten question numbers/totals/extended-response marks against source text, all document pairings, source IDs, SL/HL filtering, topic search, page references, writing/paper links, print isolation and mobile layout. Browser tests use `CHROMIUM_PATH` and `ECON_TEST_URL` with the same defaults as the flashcard tests.

## Uploaded past-paper corpus

Five compilations (1,242 PDF pages) are indexed privately for future topic drills, diagram/calculation practice, response planning, paper selection and source-specific marking review. There are **196 distinct reference codes**: Paper 1 has 127, Paper 2 has 46 and Paper 3 has 23. Specimen questions are undated; other sessions are read from reference codes, spanning 2020–November 2025. Do not infer completeness from the compilation filenames.

The private corpus at `/workspace/knowledge-base/past-papers` contains original PDF locations, file hashes, full extracted compilation text, a question-level index, separate extracted question blocks, subpart prompts/marks, marking material and examiner reports where present. Every compilation question header was indexed once and source page ranges were checked. Figures, data tables and some subquestions/marking material are image-based and may not appear in extracted text. The PDFs remain necessary for complete practice; this is not a fully OCR-verified transcription.

Open `#past-papers` or **Past-paper index** for a public **reference catalogue**. It provides source codes and PDF page ranges, suggested unit/topic/command tags, paper/session/level filters and a downloadable filtered practice-reference list. Full exam questions, source stimuli and markschemes are not published. Topic tags are automatic suggestions, not official classifications. The practice-paper generator still creates original unofficial questions and links to the reference catalogue; it does not silently incorporate these sources as complete official mocks.

Fourteen SL/HL pairs have matching **extracted prompt text**, yielding 182 matching-prompt groups across all 196 original references. This is not proof that the full stimulus, figures and marking are identical. Grouping can be disabled; every original reference is retained. There are 39 pre-2022 references, excluded by default. Current-format Paper 2 is shared across SL/HL, while printed source levels are preserved.

Compilation header totals are preserved rather than silently corrected. For example, `23N.1.SL.TZ1.2` lists 35 marks while extracted parts sum to 25. Other records have incomplete extracted part totals or atypical headers. Flags distinguish source-total anomalies, incomplete extraction, image-based material and legacy-format checks. Do not use unchecked records to set a current mock's mark total. No automatic grading or model training on these papers has been added.

The reusable importer is `scripts/index_past_papers.py` (Python standard library plus `pdftotext`):

```sh
python3 scripts/index_past_papers.py /path/to/compilation.pdf \
  --output /workspace/knowledge-base/past-papers \
  --public-data past-paper-data.js
```

Supply **all retained compilations** together when rebuilding: the index and public catalogue are replaced by the supplied set. Public output excludes full question/marking text, upload IDs and private source paths.

Validation:

```sh
node tests/past-papers.test.mjs
node tests/past-papers-browser.cjs
```

Checks cover reference counts and pair grouping, page ranges, source registration, suggested tags, original mark totals and anomaly flags, SL/HL and legacy eligibility, combined filters, reference downloads, preservation of the original practice generator, and mobile layout. Browser dependencies and environment overrides are the same as the other browser tests.
