# archive/

One-off developer tooling and audit **outputs** that used to clutter the repo
root. Kept for history/reference; **not** part of the build, app, or CI, and not
maintained. Safe to delete if you don't need the historical audit data.

| File | What it was |
|---|---|
| `404-audit-report.json`, `check-urls.js` | Dead-link / 404 sweep of the frontend routes and its output. |
| `BUTTON_IMPLEMENTATION_GUIDE.csv`, `check-buttons-content.js`, `fix-buttons-automated.js`, `parse_buttons_audit.py` | Button-wiring audit toolset + generated guide. |
| `all_pages.txt`, `routes_catalog.csv`, `routes_mapping.txt`, `complete_routes_structure.json` | Route inventories captured during the FE/BE wiring waves. |
| `process-routes-csv.js` | One-off generator that scaffolded pages from `routes_catalog.csv` (paths are relative to the old repo root — archival only). |
| `file_issues.sh`, `prepare_labels.sh`, `opens.txt`, `closes.txt` | Scripts that bulk-filed GitHub issues/labels during planning. |
| `frontend_build_output.txt` | A captured `next build` log. |

If you need a route/link audit again, prefer writing a fresh script under
`scripts/` rather than reviving these.
