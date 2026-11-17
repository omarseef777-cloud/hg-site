# Interconnecting Scope Control – source

This folder is the **source** of the Scope Control artifact
(`https://claude.ai/artifact/EwzFXwofvktHHz3DkcjnyR`). The artifact itself is a build of it.

| Path | What |
|---|---|
| `src/shell.html` | The page around the program: CSS, markup, small scripts. Two placeholders: `/*@@MAIN@@*/` (the program) and `/*@@DATA@@*/` (data file name). |
| `src/js/NN-*.js` | The program, one file per feature section, joined in name order into a single script. Shared variables live in that one script scope, so **order matters**. |
| `data/scope.json` | All site data (items, footprints, CAD detail, pit schedules, documents…). |
| `tools/build.js` | `node tools/build.js` → `dist/index.html` + `dist/d/scope-<hash>.js` (publish both). |
| `tools/patchmap.js` | Regenerates `docs/PATCHES.md`. |
| `docs/PATCHES.md` | Which file wraps which function, in order. Read it before changing a wrapped function. |
| `tools/split.js` | One-off: how the published page was split into these files. |

## Rules
- Add a new feature as a new numbered file, or in the file of its section.
- Do not declare the same top-level `function name` twice: the later one silently replaces the earlier one
  everywhere (this is how `msClear` lost half its job – fixed Nov-2026).
- After any change: `node tools/build.js && node tools/patchmap.js`, then run the checks (see `tests/` once added).
