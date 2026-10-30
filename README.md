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
