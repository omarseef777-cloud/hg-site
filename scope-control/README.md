# Interconnecting Scope Control – source

The published program is the Claude artifact `https://claude.ai/artifact/EwzFXwofvktHHz3DkcjnyR`.
It is the original; this folder is its source, split by section, so it can be changed, checked and rebuilt.
(`hg-scope-control` on GitHub is an older backup copy, not this source.)

## Change → check → publish
```
node tools/build.js          # dist/index.html + dist/d/scope-<hash>.js + dist/d/det-<hash>.js
bash tests/run_all.sh        # build + every check; exit 0 = safe to publish
```
Publish `dist/index.html` to the artifact and the files in `dist/d/` beside it (remove data files whose
hash is no longer used). After a deliberate change to results, refresh the baseline: `node tests/gate.js dist --update`.

## Folders
| Path | What |
|---|---|
| `src/shell.html` | Page around the program: CSS, markup, `window.CORE` (page / report names and groups), small scripts. Placeholders `/*@@MAIN@@*/` and `/*@@DATA@@*/`. |
| `src/js/NN-*.js` | The program, one file per section, joined in name order into one script scope. **Order matters**; `99-end.js` stays last. |
| `data/scope.json` | All built-in site data → [docs/DATA.md](docs/DATA.md) |
| `tools/build.js` | Builds `dist/`. CAD detail goes to its own file and loads after the first paint. |
| `tools/hooks.js` | Folds wrapper chains into ordered hook lists where provably the same (report: `node tools/hooks.js`). |
| `tools/patchmap.js` | Writes [docs/PATCHES.md](docs/PATCHES.md): which file wraps which function. Read it before changing a wrapped function. |
| `tests/` | Checks → [Tests](#tests) |
| `docs/` | [DATA](docs/DATA.md) · [QUANTITIES](docs/QUANTITIES.md) · [SYNC](docs/SYNC.md) · [PATCHES](docs/PATCHES.md) |

## Rules
- New feature: a new numbered file before `99-end.js`, or the file of its section.
- Extend a function with `hkBefore('name',fn)` / `hkAfter('name',fn)` where it has a hook list (see PATCHES.md), not with a new wrapper.
- Never declare the same top-level `function name` twice (the later one replaces the earlier everywhere; the gate fails).
- Names of pages / reports / groups live in `window.CORE` in `src/shell.html`; a report exists only if listed there.
- Map status colours and hatches are fixed. Live data edited online is never overwritten (see [SYNC](docs/SYNC.md)).
- Ignored for now: SWS-SW, SWS-DT, EY-TR, IY-BC, IY-MA, IY-SZ, EY-SZ. The sheet name "Sokaways" stays (loader/exporter).

## Tests
| File | Checks |
|---|---|
| `tests/gate.js` | Program parses · no function declared twice · every core report exists · every page and report opens with no error (live store) · every visible control clicked · results equal `tests/baseline.json` (trench links, pipe widths, network-check counts, quantities, data-check count) · phone: nothing wider than the screen, section menus a short strip, map fills the screen. |
| `tests/qty_reference.py` (+ `dump_quantities.js`) | Recomputes every duct bank, pipe run and cable trench part from the raw data with the written method of measurement and compares with the program. |
| `tests/sync_offline.js` | Offline edit → another user's change → reload → back online: nothing lost, nothing of theirs overwritten, conflict choice works. |
Each check was shown to fail on the bug it guards (old versions).
