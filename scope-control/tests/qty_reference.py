#!/usr/bin/env python3
"""Independent quantity check.

Recomputes quantities from the raw data (data/scope.json) with the rules exactly as written on the
program's "Method of measurement" page, then compares with what the program computed
(app_q.json / app_parts.json, dumped from the running page by tests/dump_quantities.js).

Usage: python3 -I tests/qty_reference.py data/scope.json app_q.json app_parts.json [report.md]
Exit code 1 when any item differs by more than the tolerance.
"""
import json, math, sys
from collections import defaultdict

TOL = 1e-6  # relative
scope, app, parts = (json.load(open(p)) for p in sys.argv[1:4])
report = sys.argv[4] if len(sys.argv) > 4 else None
NGL, MOM = app["NGL"], app["MOM"]
rows, bad = [], defaultdict(list)

def same(a, b):
    if a is None or b is None:
        return a is None and b is None
    if isinstance(a, str) or isinstance(b, str):
        return a == b
    return abs(a - b) <= TOL * max(1.0, abs(a), abs(b))

def check(group, key, field, ref, got):
    if not same(ref, got):
        bad[group].append((key, field, ref, got))

def KA3(dn):  # Annex 3
    return 350 if dn <= 350 else 400 if dn <= 600 else 450 if dn <= 1500 else 600

# ---------------- duct banks ----------------
# Size: L x W from CAD (sheet if not in CAD); H = TOC - BOC (else sheet H).
# Levels: CAD TOC/BOC; else BOC = connected cable trench level, else NGL - standard trench depth; TOC = BOC + H.
# Excavation (W + 2ws) L (NGL - BOC + bl); concrete L W H - ducts; backfill excavation - LWH - blinding.
ws, bl = MOM["db"]["ws"], MOM["db"]["bl"]
# inputs: the program's duct bank table after AQ-DA revisions are applied (qdbRun); only items that count in totals
base_qdb, QDB, DBIND = scope.get("qdb", {}), app["qdbRun"], app["dbindRun"]
revised = [k for k in app["dbCounted"] if base_qdb.get(k) != QDB.get(k)]
for k in app["dbCounted"]:
    got = app["db"].get(k) or {}
    q = QDB.get(k)
    if not q:
        check("Duct bank", k, "exists", None, got if got else None); continue
    Lc, Wc, toc, boc, Ls, Ws, Hs, Cs, phi, r, c = q
    cad = Lc is not None and Wc is not None
    L, W = (Lc, Wc) if cad else (Ls, Ws)
    if L is None or W is None:
        check("Duct bank", k, "src", "none", got.get("src")); continue
    H = toc - boc if (toc is not None and boc is not None) else Hs
    B = boc
    if B is None:
        ind = DBIND.get(k)
        sysn = ind["sys"] if ind else ("IY" if "-IY-" in k else "EY")
        dep = MOM["iy" if sysn == "IY" else "ey"]["dep"]
        B = ind["lv"] if ind and ind.get("lv") is not None else NGL - dep
    gross = L * W * H if H is not None else None
    duct = r * c * math.pi * (phi / 2000) ** 2 * L if (r and c and phi) else 0
    net = gross - duct if gross is not None else None
    exc = (W + 2 * ws) * L * (NGL - B + bl)
    bfv = max(0, exc - gross - (W + 2 * ws) * L * bl) if gross is not None else None
    for f, v in (("L", L), ("W", W), ("H", H), ("gross", gross), ("net", net), ("exc", exc), ("bf", bfv)):
        check("Duct bank", k, f, v, got.get(f))
    rows.append(("Duct bank", k))

# ---------------- pipe trenches ----------------
# W = DN + 2K (Annex 3); shared trenches use the program's effective width (overlap rule, checked separately).
# h = NGL - (BOP - bed) averaged over both ends; excavation W h L; sand W (bed + OD + top) L - pipe volume,
# never more than the trench depth; backfill = excavation - sand - pipe volume.
bed, top = MOM["pipe"]["bed"], MOM["pipe"]["top"]
for p in app["pipes"]:
    k = p["id"]; q = p["q"]
    Lg = sum(math.dist(a, b) for a, b in zip(p["pts"], p["pts"][1:]))
    check("Pipe", k, "L (geometry)", Lg, p["L"])
    sz = p.get("sz")
    if sz and app["PWR"] == "a3":
        check("Pipe", k, "W (Annex 3)", (sz["dn"] + 2 * KA3(sz["dn"])) / 1000, p["W"])
    if not q:
        continue
    v, W = p["inv"], p["Weff"] or p["W"]
    od = sz["od"] / 1000 if sz else 0
    h = max(0, ((NGL - (v["b0"] - bed)) + (NGL - (v["b1"] - bed))) / 2)
    exc = W * h * p["L"]; zone = bed + od + top
    pv = math.pi * od * od / 4 * p["L"]
    sand = max(0, W * min(h, zone) * p["L"] - pv)
    for f, val in (("exc", exc), ("sand", sand), ("bf", max(0, exc - sand - pv))):
        check("Pipe", k, f, val, q[f])
    rows.append(("Pipe", k))

# ---------------- cable trenches ----------------
# Depth from the MoM per system; width from the CAD; excavation W dep L; sand W (bed + top) L;
# tiles W L; backfill excavation - sand.  Length = the part's geometry.
for pr in parts["parts"]:
    k = pr["id"]; W = pr["tr"][2]; sysn = pr["tr"][1]
    pts = pr["pts"] or [[pr["x0"], pr["y0"]], [pr["x1"], pr["y1"]]]
    Lg = sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))
    check("Cable trench", k, "L (geometry)", Lg, pr["L"])
    rows.append(("Cable trench", k))
# coverage: parts of one trench should add up to the trench length in the data
cov = defaultdict(float)
for pr in parts["parts"]:
    cov[pr["tr"][0]] += pr["L"]
for t in scope.get("trn", []):
    tag, L = t[0], t[3]
    if tag in cov and L is not None and abs(L - cov[tag]) > 0.5:
        bad["Cable trench coverage"].append((tag, "parts length vs trench length", L, cov[tag]))

# ---------------- totals (program's qtyAll vs sums of the reference) ----------------
def tot_cable(field):
    s = 0
    for pr in parts["parts"]:
        m = MOM["iy" if pr["tr"][1] == "IY" else "ey"]; W, L = pr["tr"][2], pr["L"]
        exc, sand = W * m["dep"] * L, W * (m["bed"] + m["top"]) * L
        s += {"exc": exc, "sand": sand, "bf": max(0, exc - sand), "tile": W * L, "L": L}[field]
    return s
for f in ("L", "exc", "sand", "bf", "tile"):
    check("Totals", "cable", f, tot_cable(f), app["qtyAll"]["T"]["cable"][f])

# ---------------- report ----------------
n_items = defaultdict(int)
for g, _ in rows:
    n_items[g] += 1
lines = ["# Quantity check", "", f"Duct banks whose size/levels come from AQ-DA revisions (not the base table): {len(revised)}", "", "| Group | Items checked | Differences |", "|---|---|---|"]
for g in ("Duct bank", "Pipe", "Cable trench", "Cable trench coverage", "Totals"):
    lines.append(f"| {g} | {n_items.get(g, '–')} | {len(bad.get(g, []))} |")
for g, L in bad.items():
    lines += ["", f"## {g}", "", "| Item | Field | Rule | Program |", "|---|---|---|---|"]
    for k, f, a, b in L[:200]:
        fa = f"{a:.4f}" if isinstance(a, (int, float)) else str(a)
        fb = f"{b:.4f}" if isinstance(b, (int, float)) else str(b)
        lines.append(f"| {k} | {f} | {fa} | {fb} |")
out = "\n".join(lines) + "\n"
print(out)
if report:
    open(report, "w").write(out)
# "Cable trench coverage" is a data finding (drawn parts vs listed length), reported but not a failure
sys.exit(1 if any(v for g, v in bad.items() if g != "Cable trench coverage") else 0)
