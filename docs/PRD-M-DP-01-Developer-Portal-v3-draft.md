> **⛔ DEPRECATED (2026-03-13)** — เอกสารนี้ถูกแทนที่โดย **PRD-M-DP-01-Developer-Portal-v4.md (v4.0.0)**
> v3 มี architecture ที่ถูกต้อง (Simple API Key, Embedded Gateway) แต่ขาด detail (business rules, edge cases, user stories)
> Detail ทั้งหมดถูก merge จาก v2 เข้า v4 แล้ว — **กรุณาใช้ v4 เป็น Source of Truth**

# PRD: Developer Portal (M-DP-01)

## Document Information

| Field | Value |
|-------|-------|
| Module | M-DP-01: Developer Portal |
| Version | 3.0.0 |
| Status | ~~Finalized~~ **DEPRECATED — See v4.0.0** |
| Author | Product Owner |
| Created Date | 2026-02-18 |
| Last Updated | 2026-02-19 |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-16 | BA-Agent | Initial baseline — Standalone Developer Portal with HMAC Signature, Scalar API Docs, Next.js tech stack |
| 2.0.0 | 2026-02-17 | BA-Agent | Added App Approval Flow feature — Sandbox/Production two-tier system, approval workflow |
| 3.0.0 | 2026-02-18 | Product Owner | Full rewrite — Simple API Key architecture (industry standard), updated auth flow, API Gateway boundary clarified |
| 3.1.0 | 2026-02-19 | BA-Agent | Updated architecture for MVP Embedded Gateway model — Portal owns its own DB, data ownership principle, logging strategy, and migration path documented |

---

## 1. Vision & Problem Statement

### 1.1 ปัญหาหลัก

- External developers ไม่มีช่องทาง self-service ในการเข้าถึง API ของ platform
- การขอ API access ต้องผ่านกระบวนการ manual (email, ticket) ซึ่งช้าและไม่ scale
- Admin ไม่มีระบบ centralized ในการ approve/reject app requests และ track การใช้งาน
- ไม่มี single source of truth สำหรับ API documentation

### 1.2 Current Alternatives

- Developers ติดต่อทีม internal ผ่าน email/chat เพื่อขอ credentials
- API docs กระจัดกระจายหรือไม่มี
- Admin ต้อง manually generate API keys ให้ developers
- ไม่มีระบบ tracking ว่าใครใช้ API อะไร เมื่อไร

### 1.3 Product Vision

> "A self-service Developer Portal that empowers external developers to discover, integrate, and manage APIs — while giving platform admins full visibility and control over API access."

### 1.4 Business Alignment

- เปิด platform เป็น ecosystem — ดึง 3rd-party developers สร้าง value
- ลด operational cost จากการ manual onboard developers
- เพิ่ม revenue stream ผ่าน API monetization (อนาคต)
- สร้าง competitive advantage ด้วย developer experience ที่ดี

### 1.5 Benchmarks

| Portal | จุดเด่นที่อ้างอิง |
|--------|-------------------|
| Stripe Developer Portal | Interactive API docs, test mode, key management UX |
| Twilio Console | Onboarding wizard, quick-start guides per language |
| AWS API Gateway + Portal | App registration → approval flow, usage plans |
| Postman Public API Network | Try-it-now experience |

---

## 2. Target Users & Personas

### Persona 1: External Developer (Primary)

- สมัครเข้ามาใช้งาน platform APIs
- สร้าง App → ได้รับ API Key (`rf-sk-xxxx`)
- ใช้ API Key เป็น Bearer token เพื่อเรียกใช้ Open APIs ผ่าน API Gateway
- ดู API documentation, test endpoints
- **Skill level:** Intermediate to Expert (REST APIs, OAuth, JSON)

### Persona 2: Platform Admin (Primary)

- Review และ Approve/Reject app registration requests
- จัดการ developer accounts
- ดู audit logs ของ actions ทั้งหมด
- (อนาคต) ดู request logs / API usage analytics
- **Skill level:** Non-technical to Intermediate — ต้องการ UI ที่เข้าใจง่าย

### Secondary Users

- **Technical Writer / API Product Manager** — อัพเดท API documentation
- **Support Team** — ช่วย developers แก้ปัญหา, ดู logs
- **Business / Management** — ดู dashboard, metrics

### Use Cases หลัก

| User | Use Case |
|------|----------|
| Developer | สมัครสมาชิก → สร้าง App → รอ Approve → ได้ API Key |
| Developer | อ่าน API docs → ทดลอง API → Integrate เข้า application |
| Developer | จัดการ Apps (regenerate API key, view status, delete) |
| Admin | ดู pending requests → Review app details → Approve/Reject |
| Admin | ดู audit logs (ใครทำอะไร เมื่อไร) |
| Admin | จัดการ developers (suspend, revoke access) |

### Estimated Users

- **Phase 1 (MVP):** 50–200 registered developers, 5–10 admins
- **Phase 2:** 500–2,000 developers
- **Scale target:** 10,000+ developers

---

## 3. Goals & Success Metrics

### Business Goals

1. เปิด API ให้ external developers เข้าถึงแบบ self-service
2. ลด onboarding time จาก manual process (days) เหลือ minutes-hours
3. เพิ่ม visibility ให้ admin มี control เต็มที่เรื่อง API access
4. สร้าง foundation สำหรับ API monetization ในอนาคต

### KPIs

| Metric | Target |
|--------|--------|
| Time to First API Call (หลัง approved) | < 15 นาที |
| App approval turnaround time | < 24 ชั่วโมง |
| Developer registration conversion rate | > 60% |
| Developer satisfaction (CSAT) | > 4.0/5.0 |
| Support ticket reduction for API access | ลด 50% |
| Monthly active developers | เพิ่มขึ้น 20% MoM |

---

## 4. Scope & Features

### 4.1 Core Features — MVP (Must-have)

**Developer Side:**

1. **Registration & Authentication** — Sign up, login, forgot password, email verification (Thai + English)
2. **App Management** — Create app, view app list, view app details, delete app
3. **API Key Management** — View API Key (show once at creation), regenerate key, revoke key
4. **API Documentation** — Browse available APIs, view endpoint details (OpenAPI/Swagger based)
5. **Profile Management** — Edit profile, change password

**Admin Side:**

6. **App Approval Workflow** — View pending apps, approve/reject with reason, notification to developer
7. **Developer Management** — View developer list, suspend/activate account
8. **Audit Log** — Log ทุก action (who, what, when) — app creation, approval, API key regeneration
9. **Dashboard** — Overview metrics (total developers, total apps, pending requests)

### 4.2 Nice-to-have Features

- Quick Start Guides per programming language
- Webhook Management
- Team Management (developer เชิญ team members)
- API Changelog
- Auto-generated code snippets per endpoint
- Notification Center (in-app + email)

### 4.3 Out of Scope

- ❌ **Separate API Gateway service** (runtime routing, rate limiting, analytics) → M-GW-01 (future phase)
- ✅ **Embedded API Key validation** — lightweight middleware in Backend API for MVP, designed for future extraction to M-GW-01
- ❌ **Billing / Payment** → M-BE-07
- ❌ **SDK generation**
- ❌ **Multi-tenant white-label portal**
- ❌ **GraphQL support** — เน้น REST/OpenAPI

### 4.4 API Documentation (Scalar)

- **OpenAPI 3.0+** Specification เป็น single source of truth
- **Scalar** เป็น API documentation UI — modern, interactive, built-in playground
  - Interactive "Try it out" — developer ทดลองเรียก API ได้จากหน้า docs โดยตรง เห็น request/response จริง
  - Auto-generated จาก OpenAPI spec — endpoint, method, parameters, request/response body, status codes
  - Authentication pre-configured (API Key / HMAC)
  - Dark mode, sidebar navigation, search (`⌘K`)
- **Tech:** `@scalar/nextjs-api-reference` บน Next.js (route: `/docs/api`)

### 4.5 Authentication Architecture

**Decision: Simple API Key (external) + HMAC-SHA256 (internal, existing)**

ตาม AI API industry standard (OpenAI, Anthropic, Cohere, Mistral):

**Developer-facing (Simple API Key):**

- Developer สร้าง App → ได้ API Key (`rf-sk-xxxx`)
- ใช้ API Key เป็น Bearer token สำหรับเรียก Open APIs
- Key แสดงครั้งเดียวตอนสร้าง → หลังจากนั้นซ่อน, regenerate ได้
- Admin สามารถ revoke key ได้
- **Approval-gated:** API Key ใช้งานได้เฉพาะหลัง admin approve

**Auth Flow — MVP (Embedded Gateway):**

```
Developer                  Backend API               Shared Cache
   │                    (embedded middleware)              │
   │  Authorization:           │                           │
   │  Bearer rf-sk-xxxx        │                           │
   │──────────────────────────>│                           │
   │                           │ validate API Key          │
   │                           │──────────────────────────>│
   │                           │  key_hash, status         │
   │                           │<──────────────────────────│
   │                           │ (approved?) → business logic
   │                           │ Process (AI Agent)        │
   │         Response          │                           │
   │<──────────────────────────│                           │
```

**Auth Flow — Future (Separate Gateway):**

```
Developer                API Gateway               Backend API
   │                          │                         │
   │  Authorization:           │                         │
   │  Bearer rf-sk-xxxx        │                         │
   │─────────────────────────>│                         │
   │                           │ validate API Key        │
   │                           │ (shared cache)          │
   │                           │ → HMAC-SHA256 signed    │
   │                           │────────────────────────>│
   │                           │                         │ Validate HMAC
   │                           │                         │ Process (AI Agent)
   │                           │       Response          │
   │                           │<────────────────────────│
   │          Response         │                         │
   │<─────────────────────────│                         │
```

**Portal Login (แยกจาก API Key):**

- Developer/Admin login เข้า portal ด้วย Email + Password → JWT session
- JWT ใช้สำหรับ portal management เท่านั้น (สร้าง app, ดู docs, จัดการ profile)
- API Key ใช้สำหรับเรียก AI APIs — แยกชัดเจนจาก portal session

**API Key Ownership & Verification:**

- Portal เป็น sole owner ของ API Key data — writes only via Portal
- Portal DB เป็น source of truth — เก็บ key hash (ไม่เก็บ plaintext)
- Shared cache (Redis) เก็บ validation data สำหรับ runtime — auto-expires (TTL)
- Middleware เป็น read-only consumer ของ cache — ไม่เข้าถึง Portal DB โดยตรง
- Revoke/Regenerate → invalidate cache ทันที — มีผลทันทีสำหรับทุก request
- แสดง key เต็มครั้งเดียวตอนสร้าง → หลังจากนั้นแสดงแค่ prefix เท่านั้น

**Auth Methods (MVP):**

| Consumer | Auth Method | Validated By |
|----------|-------------|--------------|
| External developer (API calls) | Simple API Key (Bearer token) | Embedded middleware via shared cache |
| Developer (Portal login) | Email + Password → JWT session | Portal backend |
| Admin (Backoffice) | HMAC-SHA256 + JWT | Existing middleware (unchanged) |
| Customer app | HMAC-SHA256 + JWT | Existing middleware (unchanged) |

**Security Measures:**

**Portal Security (this module):**

1. HTTPS Only (reject HTTP, TLS 1.2+)
2. Key Hashing (SHA-256 at rest)
3. Show Once (แสดงเต็มครั้งเดียว)
4. Key Prefix (`rf-sk-`) สำหรับ leak detection
5. Approval-Gated (ใช้ได้หลัง admin approve เท่านั้น)
6. Instant Revoke (admin/developer revoke ได้ทันที, cache invalidated immediately)
7. Key Regeneration (สร้างใหม่ได้, key เก่า auto-revoke)

**Future Gateway Security (→ M-GW-01, reference only):**

8. Rate Limiting (per key per minute/hour)
9. IP Allowlisting enforcement (developer ตั้งใน Portal → Gateway enforces)
10. Usage Alerts (anomaly/spike detection)

**Why Simple API Key (Industry Justification):**

- ใช้โดย OpenAI, Anthropic, Google AI, Cohere, Mistral, Hugging Face
- Time to first API call: < 5 นาที (vs HMAC 1–2 ชม., OAuth2 15–30 นาที)
- ปลอดภัยกว่า competitors เพราะมี approval-gated + instant revoke
- Upgrade path: เพิ่ม OAuth2 เป็น optional สำหรับ enterprise ในอนาคตได้

### 4.6 Dashboard

- **Admin:** total developers, total apps, approval queue count, recent activity
- **Developer:** app status (pending/approved/rejected), created date
- **Future (API Gateway module):** API call counts, latency, error rates per app

---

## 5. User Experience

### 5.1 Developer Onboarding Flow

```
[Sign Up] → [Email Verification] → [Login]
    → [Create App] (app name, description, callback URL)
        → [Status: Pending Approval]
            → [Admin Approves]
                → [Email: "Your app is approved!"]
                    → [View API Key (rf-sk-xxxx) — แสดงครั้งเดียว]
                        → [Read API Docs]
                            → [First API Call: Authorization: Bearer rf-sk-xxxx ✅]
```

### 5.2 Self-service vs Manual Approval

| Action | Mode |
|--------|------|
| Developer registration | **Self-service** (email verify) |
| App creation | **Self-service** (submit) |
| App activation | **Manual approval** by admin |
| API Key regeneration | **Self-service** |
| Account suspension | **Admin only** |

### 5.3 Multi-language

- **MVP:** Thai + English (i18n from day one)

### 5.4 Responsive Design

- **Developer pages:** Desktop-first, responsive
- **Admin pages (/admin/*):** Desktop-first (backoffice-style)

### 5.5 Branding

- MVP: ใช้ branding ของ platform
- Future: White-label capability สำหรับ sub-platforms

---

## 6. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Portal page load time | < 2 seconds |
| API docs rendering | < 3 seconds |
| App creation API response | < 1 second |
| Search responsiveness | < 500ms |

### Availability

- Developer Portal (public): **99.9% uptime**
- Admin Portal (internal): **99.5% uptime**

### Security

- HTTPS everywhere (TLS 1.2+)
- API Key hashed at rest (SHA-256), shown only once at creation
- PDPA compliance สำหรับ developer personal data
- OWASP Top 10 protection
- Rate limiting on auth endpoints (brute-force protection)
- JWT with expiry for session management
- Audit trail สำหรับทุก sensitive actions

### Scalability

- MVP: 200 concurrent developers, 50 apps per developer
- Scale target: 10,000 developers, 100,000 apps
- Stateless architecture (horizontal scaling)

### Accessibility

- MVP: Basic (semantic HTML, keyboard navigation, color contrast)
- Future: WCAG 2.1 Level AA

---

## 7. Technical Architecture

### Architecture Layers

| Layer | Role | Owns |
|-------|------|------|
| Developer Portal (Management Plane) | Developer/Admin UI, API Key provisioning, docs, approval workflow | Portal DB: developers, apps, api_keys, audit_logs, request_logs |
| Backend API (Data Plane — embedded for MVP) | Business logic + embedded API Key validation middleware | Business DB: users, conversations, personas, messages |
| Shared Cache | Runtime API Key validation (read-only by middleware) | Key validation cache (Portal writes, middleware reads) |

### Data Ownership Principle

- **Portal owns ALL platform data** — developers, apps, API keys, logs — Portal is sole writer
- **Backend API owns ALL business data** — users, conversations, personas, messages — does NOT know about developers or API keys
- **Shared cache bridges the two** — Portal writes validation data, middleware reads it; Backend API knows only `app_id` from validated request context
- This separation ensures Backend API requires no changes when Gateway is extracted to a separate service in future

### Tech Stack (Confirmed)

| Layer | Technology |
|-------|------------|
| Developer Portal + Admin Portal | **Next.js** (realfact-oapi submodule) — single app, role-based routing |
| Portal DB | **PostgreSQL** — developers, apps, api_keys, audit_logs, request_logs |
| Backend API | **Go** (realfact-api) — business logic + embedded API Key middleware (MVP) |
| Business DB | **PostgreSQL** — users, conversations, personas, messages (existing) |
| Shared Cache | **Redis** — runtime key validation (Portal writes, middleware reads) |
| Portal Auth | Email + Password → JWT Session |
| API Auth (external developers) | Simple API Key (Bearer token) — validated via shared cache |
| API Auth (internal, existing) | HMAC-SHA256 (unchanged — Admin Portal, Customer app) |
| Open API protocol | **REST** — industry standard for external developers |
| Deployment | Docker, Kubernetes (AWS ECS), GitHub Actions |

### System Integration

| System | Integration |
|--------|-------------|
| Portal DB | Portal owns and manages all platform data (developers, apps, keys, logs) |
| Backend API (realfact-api) | Embedded API Key middleware (MVP) — validates via shared cache |
| Shared Cache (Redis) | Portal writes key data; middleware reads for runtime validation |
| Email Service | Notifications for approval/rejection, email verification |
| Audit Log | All portal actions logged with who/what/when |

### Integration Points

| Module | Direction | Purpose |
|--------|-----------|---------|
| realfact-api (embedded middleware) | Portal writes → middleware reads (via shared cache) | API Key validation at runtime |
| M-GW-01 API Gateway (future) | Portal writes → Gateway reads (via shared cache) | Extract validation to separate service — no Portal changes needed |
| Email Service | Portal triggers → Email sends | Verification, approval/rejection notifications |

### OpenAPI as Source of Truth

- OpenAPI 3.0+ spec file → auto-render docs on portal
- Documentation auto-updates when spec changes
- Open API protocol: **REST** (industry standard for external developers)

### Data Migration

- ไม่มี — เริ่มจาก zero (confirmed)

### Module Boundary

**MVP (Embedded Gateway):**

```
┌────────────────────────────────────────────────────────────┐
│           Developer Portal (Management Plane)               │
│  • Developer/Admin UI, App CRUD, Key provisioning           │
│  • API Documentation, Approval Workflow, Audit Log          │
│  • Owns: Portal DB                                          │
└───────────────────────┬────────────────────────────────────┘
                        │ writes key/config to shared cache
                        ▼
               ┌──────────────────┐
               │  Shared Cache    │
               │  (Redis)         │
               └────────┬─────────┘
                        │ reads (read-only)
                        ▼
┌────────────────────────────────────────────────────────────┐
│        Backend API (Data Plane — embedded gateway)          │
│  • API Key validation (embedded middleware)                 │
│  • Business logic (AI Chat, Personas, STT)                  │
│  • Owns: Business DB                                        │
└────────────────────────────────────────────────────────────┘
```

**Future (Separate Gateway):**

```
Developer Portal → Shared Cache ← API Gateway (separate service, M-GW-01)
                                        │
                                   Backend API (HMAC-SHA256 only)
```

---

## 7.5 Logging Strategy

Two separate log types serve different purposes:

| Log Type | Generated By | Stored In | Read By | Retention |
|----------|-------------|-----------|---------|-----------|
| API Request Logs (runtime) | Embedded middleware | Portal DB (MVP), dedicated log store (future) | Developer (usage), Admin (analytics) | 90 days |
| Portal Audit Logs (management) | Portal controllers | Portal DB | Admin only | 1 year+ |

**Key design principles:**

- Portal UI reads logs via API — never queries storage directly — enables switching log store without Portal changes
- Request logs written asynchronously (non-blocking to API response)
- Audit logs written synchronously — every portal action must be recorded
- MVP: both log types stored in Portal DB for simplicity
- Future: API Request Logs may migrate to dedicated log store (e.g., ClickHouse, BigQuery) as volume grows

---

## 8. Release Plan

### Phase 1 — MVP (4–6 weeks)

- Developer: Registration, Login, App CRUD, View API Key, API docs (OpenAPI rendered)
- Admin: App approval workflow, Developer list, Basic audit log, Dashboard
- Auth: API Key generation + JWT session for portal login
- i18n: Thai + English

### Phase 2 — Enhanced (4–6 weeks)

- Enhanced dashboard + metrics
- Notification system (email + in-app)
- Quick start guides, code snippets
- Improved search and UX

### Phase 3 — Scale (6–8 weeks)

- Team/Organization management
- Webhook management
- API versioning + changelog
- Integration with API Gateway module (request logs, rate limits display)
- SDK generation

---

## 9. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Scope creep (API Gateway features เข้ามาปน Portal) | High | High | ตั้ง boundary ชัด: Portal = management plane, Gateway = data plane |
| Developer adoption ต่ำ | High | Medium | UX research, quick start guides, responsive support |
| Security vulnerability ใน credential management | Critical | Medium | Security review, pen testing, industry-standard crypto |
| Admin approval bottleneck | Medium | Medium | Auto-approve rules (future), SLA notifications |
| Integration complexity กับ existing systems | Medium | Medium | API-first design, clear interface contracts |

---

## 10. Dependencies

| Dependency | Required Before |
|------------|-----------------|
| Auth system (JWT + HMAC) | Portal launch |
| Internal APIs + OpenAPI spec | Portal launch |
| Email/Notification service | Approval flow |
| Infrastructure (domain, SSL, hosting) | Deployment |

---

## Appendix A: Platform Data Contract

> Portal เป็น **Management Plane** (provision/manage), Backend API / Gateway เป็น **Data Plane** (enforce at runtime)
> Portal เป็น sole owner และ writer ของ platform data — middleware/gateway เป็น read-only consumer

### MVP (Embedded Middleware)

| Data | Source of Truth | Runtime Read From |
|------|----------------|-------------------|
| API Keys | Portal DB | Shared cache (Redis) |
| App config/plan | Portal DB | Shared cache (Redis) |
| Request logs | Portal DB | Portal API |

### Future (Separate Gateway — M-GW-01)

| Data | Source of Truth | Runtime Read From |
|------|----------------|-------------------|
| API Keys | Portal DB | Shared cache (Redis) |
| App config/plan | Portal DB | Shared cache (Redis) |
| IP allowlists | Portal DB | Shared cache (Redis) |
| Request logs | Dedicated log store | Log API |

### Shared Infrastructure

- **Portal DB (PostgreSQL)** — source of truth สำหรับ platform data (Portal writes only)
- **Business DB (PostgreSQL)** — source of truth สำหรับ business data (Backend API owns)
- **Shared Cache (Redis)** — runtime validation layer (Portal writes, middleware/gateway reads)

---

## Appendix B: Gateway Migration Path

| Phase | Architecture | Key Change |
|-------|-------------|------------|
| Phase 1 (MVP) | Embedded middleware in Backend API | Portal provisions keys, middleware validates via shared cache |
| Phase 2 | Extract to separate Gateway service (M-GW-01) | Move validation + rate limiting out; Backend API returns to HMAC-only |
| Phase 3 (Scale) | Full API management | Dedicated log store, advanced analytics, circuit breaking |

**Design principle:** Each phase requires **zero changes to Developer Portal** — Portal always writes to the same shared cache, regardless of which service reads from it.

- **Phase 1 → Phase 2:** Extract embedded middleware to standalone Gateway service; update shared cache consumers — Backend API unchanged
- **Phase 2 → Phase 3:** Add dedicated log store; Portal UI continues to read logs via log API (no Portal changes needed)
