# Shared data (online)

Store: the artifact's `db` capability. Rules: `cfg/*` read by viewers, written by editors/owner; `bak/*` editors/owner only.

| Kind | Where | Written by |
|---|---|---|
| Per item (`map`): status, trench state, parts, pipe runs/routes, added items, reviews, sections, 3D models, decisions… | one document per item: `<col>/<encoded id>` | Contributors and up |
| Whole (`whole`): positions, pipe sizes, comments, plan, NGL, MoM, settings… | one document `cfg/<name>` | Editors / owner |
| Status sheet | `cfg/sheet`, `cfg/sheetprev`, `cfg/sheetmeta` | Editors / owner |
| Updates log | `log/<day>_<user>` (last 40 days read) | everyone who writes |

## Writes (since Nov-2026)
1. Every item / settings write goes into a local **outbox** (`localStorage scope.outbox`) first and stays there until
   the store confirms it: retried on reconnect, on return to the tab, every minute, and after a reload.
2. Before writing, the store copy is read. If someone else changed it since this edit was made:
   - whole documents merge field by field (comments by id) – both changes kept;
   - the same field / item changed by both: nothing is overwritten; the item goes to **⚠ not saved**
     (bottom left) where the user picks *Use mine* or *Keep now*.
3. Unsaved edits stay on screen while store updates arrive.
The store itself is last-writer-wins without transactions; these rules make the program never overwrite a change it has not seen.
