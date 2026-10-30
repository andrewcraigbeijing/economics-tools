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
