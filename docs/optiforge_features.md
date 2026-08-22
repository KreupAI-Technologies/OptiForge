# OptiForge — Platform Features

> **Purpose of this document:** Source-of-truth feature assessment for preparing marketing pages, landing pages, pitch decks, demo scripts, and sales collateral. Content is grounded in the shipped codebase (not aspirational roadmap), so claims made in marketing material derived from this document are defensible in demos and evaluations.

---

## 1. Positioning

**One-liner:**
> OptiForge is a full-stack Manufacturing ERP that runs your business from first enquiry to installed product — sales, engineering, production, procurement, quality, finance, HR, and after-sales service in one system, purpose-built for engineer-to-order and make-to-order manufacturers.

**Elevator pitch (30 seconds):**
Most ERPs were built for repetitive manufacturing and bolt project features on later. OptiForge is built the other way around: every order can be a project, every product can be configured and engineered to spec, and every stage — estimation, BOM, shop floor, dispatch, installation, warranty — is tracked in one place. A layered architecture (platform → core → manufacturing modes → compliance → industry packs) means the same product adapts to different industries without forking the codebase.

**Tagline options:**
- *From enquiry to installation. One system.*
- *The ERP that thinks in projects, not just parts.*
- *Manufacturing operations, forged into one platform.*

---

## 2. Platform at a Glance (marketing stats)

| Stat | Value | Notes for marketing use |
|---|---|---|
| Functional modules | **30+** | Across sales, engineering, production, supply chain, finance, HR, service |
| Application screens | **1,700+** | Next.js frontend pages — demo-able breadth |
| Platform services | **13** | Tenancy, identity, audit, workflow, notifications, reporting, documents, integration, events, extensions, API gateway, observability, localisation |
| Architecture layers | **5** | Platform → Core → Modes → Compliance → Industry Packs |
| Manufacturing modes | **ETO shipped**; Discrete, Process, Job-Shop, Repetitive on roadmap | Lead with ETO strength |
| Industry packs | **Kitchen & food-service equipment** (first pack, live customer) | Reference story: B3 MACBIS |
| Deployment | Docker-compose / cloud (PostgreSQL, Redis, RabbitMQ) | Self-host or hosted |
| Auth | Keycloak OIDC / JWT, SSO-ready | Enterprise identity story |

---

## 3. The Architecture Story (differentiator, use on "Platform" page)

OptiForge is built in five layers, each independently extensible:

1. **Platform layer** — multi-tenancy, identity & SSO, audit trail, workflow engine, notifications, reporting, document management, integrations, event bus, extension framework, API gateway, observability, localisation. Every module above inherits these for free.
2. **Core layer** — 20+ manufacturing business modules (CRM through Field Service) that work for any manufacturer.
3. **Modes layer** — manufacturing-style overlays that reshape core behaviour: **Engineer-to-Order (ETO)** is shipped; Discrete, Process, Job-Shop, Repetitive and Mixed-mode are on the roadmap.
4. **Compliance layer** — pluggable regulatory/compliance packs.
5. **Industry packs** — vertical presets (masters, templates, workflows, terminology) per industry. First pack: **Kitchen & Food-Service Equipment**.

**Marketing message:** *"Configured for your industry on day one — not customised for eighteen months."*

---

## 4. Feature Catalogue by Value Stream

Organised the way a manufacturing buyer thinks: **Sell → Engineer → Plan → Source → Make → Deliver → Serve → Run the business.** Each subsection is a candidate marketing-page section or feature card.

### 4.1 SELL — CRM, Sales, CPQ, Estimation & Proposals

**CRM & Lead Management**
- Multi-source lead capture, scoring and qualification
- One-click lead-to-customer conversion with full interaction history
- Pipeline and activity dashboards

**Quotations & Sales Orders**
- Professional multi-line quotations with revision/version control
- Multi-level discount approval workflows
- Quote → sales order conversion; attach customer POs, drawings, specifications
- Real-time order status tracking and acknowledgements

**Configure-Price-Quote (CPQ)**
- Interactive product configurator with guided selling
- Dynamic pricing driven by configuration rules
- Automated quote generation for complex, engineered products

**Estimation & Costing** *(ETO differentiator — most competitor ERPs lack this)*
- Detailed job estimation: materials, labour, overheads, margins
- BOQ (bill of quantities) upload and processing
- Estimate → quotation → order flow with cost traceability

**RFQ & Proposals**
- Structured RFQ intake and response management
- Proposal document generation and tracking

### 4.2 ENGINEER — PLM & Design Handoff

- Multi-level Bill of Materials with parent-child relationships, versioning and revision history
- Automatic material requirement calculation and cost rollup from component to finished good
- Drawing and specification attachment on orders, BOMs and work orders
- Engineering change tracking through BOM revisions

### 4.3 PLAN — S&OP, Production Planning & Projects

**Sales & Operations Planning (S&OP)**
- Demand and supply alignment across the order book

**Production Planning & Work Orders**
- Work orders generated from sales orders
- Scheduling with target dates and Gantt visualisation
- Work-center capacity definition, standard times and costs, utilisation monitoring

**Project Management** *(core to the ETO story)*
- Every customer order can run as a project: milestones, deliverables, timeline vs. actuals
- Task breakdown, assignment, priorities, skills-based allocation
- Resource allocation across people and equipment with workload balancing
- Project budgets, actual-vs-budget tracking, per-project profitability
- Installation checklists linked to project close-out

### 4.4 SOURCE — Procurement & Vendor Management

- Purchase requisitions auto-generated from production requirements; value-based multi-level approvals
- Purchase orders with side-by-side vendor quote comparison
- Goods receipt with quality inspection at the gate and three-way matching (PO–GRN–Invoice)
- Vendor master with performance ratings, payment terms and compliance documents

### 4.5 STOCK — Inventory & Warehouse (WMS)

- Real-time, multi-warehouse inventory visibility
- Batch and serial tracking; FIFO / LIFO / weighted-average valuation
- Bin-level locations, receiving/putaway, picking/dispatch, cycle counting
- Reorder points with low-stock alerts and automatic requisition generation; ABC analysis
- Inter-warehouse transfers, reason-coded adjustments, full movement history

### 4.6 MAKE — Shop Floor (MES), Quality, Maintenance & Safety

**Manufacturing Execution / Shop Floor**
- Real-time production tracking through configurable multi-stage routing (e.g. Cutting → Bending → Welding → Painting → Assembly → QC → Packing)
- Machine/equipment logging and production quantity capture
- Work-order progress by stage, visible to planning and sales

**Quality Management (QMS)**
- Inspection plans with parameters and tolerances at every checkpoint (receipt, in-process, final)
- Non-Conformance Reports with defect classification, severity and root-cause analysis
- CAPA with ownership, deadlines, and effectiveness verification before closure
- Quality dashboard: first-pass yield, defect trends, supplier quality

**Maintenance (CMMS)**
- Asset/equipment registry and maintenance scheduling

**Environment, Health & Safety (EHS)**
- Incident logging and safety compliance tracking

### 4.7 DELIVER — Logistics, Dispatch & Packaging

- Shipments created from sales orders; delivery notes; status tracking to confirmation
- Packaging management for engineered goods
- Vehicle and driver masters, maintenance scheduling, fleet utilisation
- Route planning with sequence optimisation and estimated-vs-actual analysis
- Gate pass management: vehicle check-in/out, security authorisation, movement history

### 4.8 SERVE — Installation, Warranty, AMC & Support

*(A stage most manufacturing ERPs stop before — strong differentiator for equipment manufacturers.)*

- Service request intake, categorised (installation / repair / maintenance) with priority-based SLA tracking and technician assignment
- Installation scheduling, digital checklists, customer sign-off and documentation
- Warranty registration, expiry tracking, claims processing, coverage verification
- Annual Maintenance Contracts: coverage terms, preventive-maintenance scheduling, renewal tracking
- Field service and commissioning workflows
- Customer support ticketing and a customer portal

### 4.9 RUN — Finance, HR, Admin & Analytics

**Finance & Accounting**
- Full general ledger with chart of accounts, journal approval, cost/profit centers
- AP with three-way-match verification and payment approval; vendor aging
- AR with customer invoicing, receipt allocation, credit limits and aging analysis
- Bank reconciliation with statement import and auto-matching
- Employee expense claims with approval and reimbursement flow
- Statements: Balance Sheet, P&L, Cash Flow, Trial Balance

**Human Resources**
- Employee lifecycle: profiles, org hierarchy, documents and certifications
- Payroll with salary structures, statutory deductions (IT, PT, TDS), payslip generation
- Statutory compliance, loans, bonuses, and skills management
- Leave management (multiple types, balances, holiday calendars) and shift-based attendance with overtime
- Recruitment: openings, applicant tracking, interviews, offer letters
- Training management

**IT Administration**
- User, role and permission management; system configuration

**Dashboards, Reports & Analytics**
- Executive dashboard: sales, production, financial KPIs at a glance
- Operational dashboards per module (pipeline, production progress, stock, quality)
- Standard report library across sales, production, inventory, finance, HR
- Filters, date ranges, drill-down; export to Excel/PDF/CSV; scheduled delivery

### 4.10 FOUNDATION — Masters, Workflow & Collaboration

**Common Masters**
- Items/products with categories, UOM, pricing and costing
- Customer/vendor/contact masters and address book
- Company, departments, designations, warehouses, work centers
- Currency, tax, number series, preferences

**Workflow & Approvals** *(platform-wide)*
- Multi-level approval chains with amount-based routing and role-based assignment
- Centralised task inbox: one-click approve/reject, priority sorting, overdue alerts
- Pre-built approval templates, conditional logic, per-step SLA configuration
- In-app, email and push notifications; SLA breach warnings

**Collaboration & Documents**
- Attachments on any business record (drawings, specs, contracts, certificates)
- Central document management service
- In-context collaboration on orders and projects

---

## 5. Enterprise Platform Capabilities (use on "Platform" / "Security" pages)

| Capability | What to say |
|---|---|
| **Multi-tenancy** | One deployment, many companies/plants, isolated data |
| **Identity & SSO** | Keycloak-based OIDC; JWT across all services; plug into corporate identity |
| **Audit trail** | Platform-level audit service — who changed what, when |
| **Workflow engine** | Configurable state machines and approvals for any process |
| **Event-driven core** | RabbitMQ/Celery event backbone — modules react to business events |
| **Extension framework** | Add fields, logic and packs without forking core |
| **Integration & API gateway** | REST APIs across the platform; integration service for external systems |
| **Reporting service** | Central reporting engine feeding module dashboards |
| **Observability** | Built-in health checks and operational telemetry |
| **Localisation** | Multi-currency and localisation service |
| **Modern stack** | Django + NestJS services, Next.js/React UI, PostgreSQL — no legacy client installs |

---

## 6. Key Differentiators (messaging pillars)

1. **Enquiry-to-installation coverage** — CRM, estimation, CPQ, projects, shop floor, dispatch, installation, warranty and AMC in *one* system; competitors typically need 3–4 products stitched together.
2. **ETO-native** — estimation, BOQ handling, per-order projects, per-project profitability and drawing management are first-class, not add-ons.
3. **Industry packs** — vertical presets so the system speaks your industry's language on day one; first pack live for kitchen & food-service equipment.
4. **Workflow everywhere** — any document (PR, PO, quote, journal, leave, NCR) can carry a multi-level, amount-routed, SLA-tracked approval.
5. **Quality built into the flow** — inspection at goods receipt, in-process and final; NCR→CAPA loop closes with verified effectiveness.
6. **After-sales as a revenue engine** — warranty, AMC and field service turn delivery into recurring revenue, tracked in the same system that built the product.
7. **Real-time visibility** — live dashboards from shop floor to boardroom; 1,700+ screens of operational depth.
8. **Modern, open architecture** — API-first, event-driven, SSO-ready, containerised; extend without forking.

---

## 7. Target Industries & Reference

**Primary (lead with these):**
- Commercial kitchen & food-service equipment *(live customer: B3 MACBIS — kitchen equipment manufacturer)*
- Fabrication & sheet metal
- Industrial equipment & machine building
- Project-based / engineer-to-order manufacturing
- Make-to-order and job-shop operations

**Buyer personas for page targeting:**
| Persona | Pain to lead with | Modules to feature |
|---|---|---|
| Owner / MD | "I can't see margin per order" | Executive dashboard, project profitability, finance |
| Operations head | "Orders slip and nobody knows why" | Work orders, shop floor tracking, Gantt, capacity |
| Sales head | "Quoting engineered products takes weeks" | CPQ, estimation, quotation workflow |
| Finance controller | "Three-way match is manual" | AP/AR, three-way matching, bank reconciliation |
| Quality manager | "NCRs die in spreadsheets" | QMS, NCR/CAPA, quality dashboards |
| Service manager | "Warranty and AMC leak revenue" | After-sales, AMC, field service |

---

## 8. Suggested Marketing Page Map

How to slice this document into a website structure:

1. **Home** — positioning, stats bar (§2), differentiators (§6), industries strip (§7)
2. **Product → Modules overview** — value-stream layout of §4 (Sell / Engineer / Plan / Source / Make / Deliver / Serve / Run)
3. **Module detail pages** (one per §4 subsection) — features + persona pain + screenshot
4. **Platform page** — architecture story (§3) + enterprise capabilities (§5)
5. **Industries pages** — one per vertical in §7, opening with the pack story
6. **Why OptiForge** — differentiators (§6) framed against "generic ERP + point tools" alternative
7. **Customer story** — B3 MACBIS kitchen-equipment narrative (enquiry→installation walkthrough)

---

## 9. Claim Discipline (for whoever writes the copy)

- ✅ Safe to claim: everything in §4–§6 (backed by shipped modules and screens); "1,700+ screens"; "30+ modules"; ETO mode; Kitchen Equipment pack; Keycloak SSO.
- ⚠️ Say "roadmap" for: Discrete/Process/Job-Shop/Repetitive modes, additional compliance and industry packs, mobile apps.
- ❌ Do not claim: named certifications (ISO/SOC 2), specific customer counts beyond the B3 reference, or benchmark numbers without a source.

---

*OptiForge — from enquiry to installation, one system.*
