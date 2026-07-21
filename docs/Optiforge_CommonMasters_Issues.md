# Common Masters — Detailed Issues Report

**Verified:** 2026-07-21
**Scope:** All 29 Common Masters pages previously flagged in `Optiforge_Whats_Left.md`
**Method:** Direct code inspection of each `page.tsx` and its underlying `components/common-masters/*Master.tsx` component

---

## Corrected Numbers

The previous report listed 29 remaining issues. After re-verifying each file:

| Status | Count | Notes |
|---|---:|---|
| **Actually FIXED** (mislabelled as broken) | 19 | All thin `page.tsx → components/common-masters/*Master.tsx` wrappers now have full CRUD wired |
| **PARTIAL** | 1 | `exchange-rate-master` — Create/Edit wired, Delete missing |
| **STILL BROKEN** | 9 | Standalone `app/(modules)/common-masters/<x>/page.tsx` files with toast / state-only handlers |
| **Total remaining real issues** | **10** | Down from the reported 29 |

---

## The 9 STILL-BROKEN pages

| # | Route | Fetch | Create | Edit | Delete | Root cause |
|---|---|---|---|---|---|---|
| 1 | [`/common-masters/bank-master`](b3-erp/frontend/src/app/(modules)/common-masters/bank-master/page.tsx) | MIXED (stats from seed) | TOAST (L111) | TOAST (L113) | MISSING (no button) | Handlers short-circuit to `showToast`; `getBankStats()` reads hardcoded seed array in `@/data/common-masters/banks.ts` |
| 2 | [`/common-masters/city-master`](b3-erp/frontend/src/app/(modules)/common-masters/city-master/page.tsx) | REAL | TOAST (L74) | TOAST (L78) | **STATE-ONLY** (L82-87 does `setCities(prev => filter)` — no API call) | Delete looks like it works but silently doesn't persist |
| 3 | [`/common-masters/designation-master`](b3-erp/frontend/src/app/(modules)/common-masters/designation-master/page.tsx) | REAL | TOAST (L75) | TOAST (L76) | STATE-ONLY (L77-82) | Same pattern as city-master |
| 4 | [`/common-masters/machine-master`](b3-erp/frontend/src/app/(modules)/common-masters/machine-master/page.tsx) | MIXED | TOAST (L135) | TOAST (L122) | MISSING | `getMachineStats()` from seed |
| 5 | [`/common-masters/number-series-master`](b3-erp/frontend/src/app/(modules)/common-masters/number-series-master/page.tsx) | REAL | STUB (L62-66 opens explanatory modal, no endpoint) | STUB (L53-55 sets view state) | MISSING | **Genuine backend gap** — code comment at L63 acknowledges no create endpoint exists |
| 6 | [`/common-masters/payment-terms-master`](b3-erp/frontend/src/app/(modules)/common-masters/payment-terms-master/page.tsx) | MIXED | TOAST (L98) | MISSING (L237-238 empty `onClick={e => e.stopPropagation()}`) | MISSING | View/Edit buttons swallow clicks with no-op handlers |
| 7 | [`/common-masters/price-list-master`](b3-erp/frontend/src/app/(modules)/common-masters/price-list-master/page.tsx) | MIXED | TOAST (L107) | TOAST (L98) | STATE-ONLY (L373-376) | |
| 8 | [`/common-masters/shift-master`](b3-erp/frontend/src/app/(modules)/common-masters/shift-master/page.tsx) | MIXED | TOAST (L90) | TOAST (L91) | STATE-ONLY (L92-97) | Imports `Shift` type + seed |
| 9 | [`/common-masters/territory-master`](b3-erp/frontend/src/app/(modules)/common-masters/territory-master/page.tsx) | MIXED | TOAST (L97) | TOAST (L99) | MISSING | `getTerritoryStats()` from seed |

---

## The 1 PARTIAL page

| Route | What works | What's missing |
|---|---|---|
| [`/common-masters/exchange-rate-master`](b3-erp/frontend/src/app/(modules)/common-masters/exchange-rate-master/page.tsx) | Real fetch (L22), Create via `commonMastersService.createExchangeRate` (L74), Update (L82) | No Delete button rendered at all — `handleAddRate` (L123) reuses the edit modal with a blank record, which works, but there is no way to remove rates |

---

## The 19 pages WRONGLY listed as broken (now verified FIXED)

All wire through `commonMastersService` / `manufacturingMastersService` / `hrMastersService` in their component files with real fetch + create + update + delete:

| # | Route | Component | Fetch | Create | Update | Delete |
|---|---|---|---|---|---|---|
| 1 | `/appliance-master` | `ApplianceMaster.tsx` | L82 | L171 | L169 | L184 |
| 2 | `/batch-lot-master` | `BatchLotMaster.tsx` | L68 | L177 | L175 | L192 |
| 3 | `/branch-master` | `BranchMaster.tsx` | L102 | L996 | L994 | L174 |
| 4 | `/brand-master` | `BrandMaster.tsx` | L63 | L140 | L135 | L123 |
| 5 | `/cabinet-type-master` | `CabinetTypeMaster.tsx` | L73 | L153 | L151 | L166 |
| 6 | `/cost-center-master` | `CostCenterMaster.tsx` | L96 | L135 | L133 | L114 |
| 7 | `/department-master` | `DepartmentMaster.tsx` | L70 | L243 | L233 | L219 |
| 8 | `/finish-master` | `FinishMaster.tsx` | L79 | L183 | L181 | L139 |
| 9 | `/hardware-master` | `HardwareMaster.tsx` | L73 | L156 | L154 | L169 |
| 10 | `/installation-type-master` | `InstallationTypeMaster.tsx` | L73 | L152 | L150 | L165 |
| 11 | `/kitchen-layout-master` | `KitchenLayoutMaster.tsx` | L82 | L165 | L163 | L178 |
| 12 | `/material-grade-master` | `MaterialGradeMaster.tsx` | L71 | L148 | L146 | L161 |
| 13 | `/plant-master` | `PlantMaster.tsx` | L255 | L304 | L297 | L275 |
| 14 | `/quality-parameter-master` | `QualityParameterMaster.tsx` | L54 | L143 | L141 | L158 |
| 15 | `/routing-master` | `RoutingMaster.tsx` | L63 | L169 | L167 | L184 |
| 16 | `/skill-master` | `SkillMaster.tsx` | L62 | L148 | L146 | L163 |
| 17 | `/uom-master` | `UOMMaster.tsx` | L80/L127 | L216/L261 | L210/L254 | L198/L243 |
| 18 | `/warehouse-master` | `WarehouseMaster.tsx` | L107 | L245 | L238 | L217 |
| 19 | `/work-center-master` | `WorkCenterMaster.tsx` | L83 | L202 | L200 | L217 |

> `Optiforge_Whats_Left.md` should be updated to drop these 19 rows.

---

## Defect pattern breakdown across the 9 broken pages

| Defect | Count | Routes |
|---|---:|---|
| Add handler → `showToast()` only | 8 | bank, city, designation, machine, payment-terms, price-list, shift, territory |
| Edit handler → `showToast()` or empty `onClick` | 8 | bank, city, designation, machine, payment-terms, price-list, shift, territory |
| Delete missing entirely (no button rendered) | 5 | bank, machine, number-series, payment-terms, territory |
| Delete removes from local `useState` only (no API) | 4 | city, designation, price-list, shift |
| Stats KPIs computed from hardcoded seed arrays in `@/data/common-masters/*.ts` | 6 | bank, machine, payment-terms, price-list, shift, territory |
| Genuinely missing backend endpoint | 1 | number-series (create endpoint doesn't exist per code comment) |

---

## Fix strategy

**8 of 9 are same-shape work** — replace the toast / state-only handlers with calls to the already-existing service methods (`create*`, `update*`, `delete*` on `commonMastersService` / `hrMastersService` / `manufacturingMastersService` / `systemMastersService`). The service layer is **not** the blocker.

**Number-series is different** — needs a backend endpoint added first (Django or NestJS depending on ownership), then the frontend wiring.

**Seed-data KPIs** — the 6 MIXED pages should compute stats from the fetched list instead of importing `getXxxStats()` from `@/data/common-masters/*.ts`. Once removed, those seed files can be deleted entirely.

### Estimated effort

| Group | Pages | Approx. work per page | Total |
|---|---:|---|---|
| Toast → service call rewrite | 8 | 30–45 min | ~4–6 h |
| Delete-button rendering + wiring | 5 | 15 min | ~1.25 h |
| Stats derived from fetched data | 6 | 20 min | ~2 h |
| Backend endpoint for number-series | 1 | 2–4 h (schema + endpoint + tests) | ~3 h |
| **Total** | **10 unique pages** | | **~10–12 h** |

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/(modules)/common-masters/**/page.tsx`
- Component files: `b3-erp/frontend/src/components/common-masters/*Master.tsx`
- Service files: `b3-erp/frontend/src/services/commonMastersService.ts`, `hrMastersService.ts`, `manufacturingMastersService.ts`, `systemMastersService.ts`
- Seed data (to be deprecated): `b3-erp/frontend/src/data/common-masters/*.ts`
