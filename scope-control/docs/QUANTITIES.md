# Quantities – method of measurement

As written on the program's *Method of measurement* page (inputs editable by the owner; defaults below).
`tests/qty_reference.py` recomputes every item with these rules from the raw data; all match (Nov-2026).

| Work | Rule |
|---|---|
| Pipe trench width | W = DN + 2K (Annex 3; K = 350 ≤ DN350, 400 ≤ 600, 450 ≤ 1500, 600 above). Parallel pipes share the trench (overlap removed), equal to W1 = K + DN + F + DN + K. |
| Pipe depth | h = NGL − (BOP − bed), mean of both ends; bed 150, sand above pipe 300 |
| Pipe excavation / sand / backfill | W·h·L / W·(bed + OD + top)·L − pipe volume (never deeper than h) / excavation − sand − pipe volume |
| Cable trench | depth 1150 (EY, EYL, IY); width from the CAD; excavation W·depth·L; sand W·(75 + 475)·L; tiles W·L (m²); backfill excavation − sand. **L = drawn parts.** |
| Duct bank | L×W from the CAD (sheet if missing); H = TOC − BOC; BOC from the CAD, else connected cable trench bottom, else NGL − 1150; excavation (W + 2·ws)·L·(NGL − BOC + bl); concrete L·W·H − ducts; backfill excavation − L·W·H − blinding (no sand) |
| Done quantities | Pipe / cable: excavation when excavated or backfilled; sand, tiles, backfill when backfilled. Duct bank by its own status. |

## Open question (for Omar)
Drawn cable trench parts are longer than the listed trench lengths on 188 trenches and never shorter:
+1,886 m (+6.4 %), about +2,300 m³ excavation (IY +12 %, EY +5 %, EYL +1.5 %). Most likely the drawn parts run into the
pits / duct banks at their ends. Which length should be measured?
