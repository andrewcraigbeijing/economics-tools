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
