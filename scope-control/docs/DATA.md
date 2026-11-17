# Data (`data/scope.json` → `window.SCOPE`, `D` in the program)

Built-in data from the CAD, schedules and drawings. Live edits (statuses, trench states, positions, comments, settings)
are **not** here: they are in the shared store (see [SYNC](SYNC.md)) and in each browser's local copy.
The status sheet is loaded from Excel at run time (Home · Load sheet) and reviewed before it is applied.

| Key | Content |
|---|---|
| `asof` | Date of the built-in status sheet |
| `items` | `[tag, type, E, N, area]` – every pit / duct bank / soakaway / earthing / Etisalat item on the map |
| `status`, `sheet`, `summary`, `meta` | Built-in status sheet: status per tag, sheet name per tag, Summary sheet groups, per-tag AQ-DA / RFI / remarks / last update |
| `areas` | Site areas `{id, name, bbox:[E0,E1,N0,N1]}` |
| `foot` | Item footprints (polygons, E/N) |
| `qdb` | Duct banks `[L_cad, W_cad, TOC, BOC, L_sheet, W_sheet, H_sheet, concrete_sheet, Ø, rows, cols]` |
| `dbc` | Duct bank ducts `[rows, cols, size, TOC, BOC]` |
| `dbind` | Duct bank → connected cable trench `{t:[tags], lv: trench bottom level, sys}` (BOC when the CAD has none) |
| `trn` | Cable trenches `[tag, system, width, length, level, segments, label point]` |
| `pparts`, `psize`, `pinv`, `pinit` | Pipe trench parts (route, utility, end pit), sizes `[DN, OD, label, source]`, invert levels `[BOP start, BOP end, …]`, initial trench state |
| `pipes` | Utility networks as CAD line segments, by utility |
| `pdt`, `pdoc` | Pit schedule per pit (type, L1×L2, TOC, IL, walls, openings) and the schedule sheet it came from |
| `net`, `road`, `blds`, `bc` | Base map: networks, roads, buildings and their labels |
| `det` | CAD detail (walls `w`, foundations `f`, minor `m`, small structures `us`) – **built into its own file, loaded after the first paint** |
| `aq*` | AQ-DA drawing revisions: added (`aqadd`), deleted (`aqdel`), renamed (`aqren`), fixes, trench parts, audit |
| `docdata`, `aq`, `sthumb` | Library: documents per tag, AQ-DA pages and locations, thumbnails |
| `wdt0` | Work dates (cast / installed) per item |
| `spare`, `cband`, `trnx`, `pmix` | Spare footprints, cable band segments, trench extras, mixed pipe parts (see the code that reads them) |

## Known data issues (Data check report, Nov-2026)
- IY-IP-020, -033, -054: TOC / IL swapped or shifted; opening width holds a level (98.45 / 98.525) – schedule columns shifted (4422-AQ-DC-000000000041-08).
- IY-IP-045 TOC 100200 (100.200?); AOC-MH-039 pipe B BOP 5; IY-IP-017 and SWS-MH-022 have no size.
- 116 cable trenches have no length and no drawn parts (not measured).

## Updating the built-in data
Change `data/scope.json` (by script, never by hand-editing values in the page), then `bash tests/run_all.sh`.
If results change on purpose, review `tests/out/qty_report.md`, then `node tests/gate.js dist --update`.
