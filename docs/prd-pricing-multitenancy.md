---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - docs/requirements-docs/PRD-RealFact-Platform.md
  - docs/planning-artifacts/prd.md
  - docs/planning-artifacts/architecture.md
  - docs/planning-artifacts/module-responsibility-mapping.md
  - docs/project-context.md
  - docs/brainstorming/brainstorming-session-2026-02-19.md
  - docs/brainstorming/brainstorming-session-2026-02-24.md
  - docs/brainstorming/brainstorming-avatar-subplatform-2026-02-24.md
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 3
  projectDocs: 5
  projectContext: 1
classification:
  projectType: 'saas_b2b (Platform Expansion PRD)'
  domain: 'Platform Economy / SaaS Billing & Multi-Tenancy'
  complexity: 'High'
  projectContext: 'Brownfield (extension of existing core platform)'
partyModeInsights:
  - 'PRD ครอบคลุมทั้ง Admin-facing + Tenant-facing — target users 4 กลุ่ม (Platform Admin, Finance, Tenant Admin, Developer)'
  - 'เพิ่ม M-BE-04 Customer เป็นขอบเขตที่ 7 — Admin จัดการ Tenant'
  - 'Tenant Service เป็น P0 prerequisite, dependency chain ยาว'
  - 'Business Model Transformation — Dual billing (Subscription + Post-paid Credit Line)'
  - 'แยก Admin Journey vs Tenant Journey — 3 UI surfaces (Backoffice, Portal/Landing, Hub Page)'
  - 'Subscription Plan อยู่ใน M-BE-06, Universal Token Wallet อยู่ใน M-BE-07'
  - 'M-BE-04 (Admin จัดการ Tenant) vs Tenant Service (Identity/SSO) vs X-MT-01 (Cross-cutting architecture) เป็น 3 ชิ้นที่ทำงานร่วมกัน'
scope:
  modules:
    - 'M-BE-04: Customer (Tenant management Admin-facing)'
    - 'M-BE-05: Cost Engine (ต้นทุน, Currency, Token Exchange Rate per Sub-Platform)'
    - 'M-BE-06: Price Engine (Margin, Subscription Plans per Sub-Platform, Snapshot, Price Lock)'
    - 'M-BE-07: Billing (Universal Token Wallet, Subscription Billing, Token Top-up, Credit Line, Invoice, Payment)'
    - 'M-BE-12: Sub-Platform Management (CRUD, Branding, Lifecycle, Health Monitoring)'
    - 'X-MT-01: Multi-Tenancy Platform (3-Layer Architecture, Tenant Model, SSO, White-Label)'
    - 'Tenant Service (NEW — User Identity, SSO, Membership N:N, Hub Page, RBAC)'
---

# Product Requirements Document — Pricing, Billing & Multi-Tenancy

**Author:** realfact-team
**Date:** 2026-02-25

## Executive Summary

RealFact Platform ปัจจุบันให้บริการ AI API Platform สำหรับ Developer ผ่าน Portal, Gateway และ Agentic Builder — แต่ยังไม่มีระบบคิดเงิน, จัดการ Tenant และ Multi-Tenancy PRD ฉบับนี้กำหนดขอบเขตการสร้าง **Central Billing & Multi-Tenancy Foundation** ครอบคลุม 7 modules (M-BE-04, M-BE-05, M-BE-06, M-BE-07, M-BE-12, X-MT-01, Tenant Service) เพื่อเปลี่ยน RealFact จาก Single-tenant Developer Platform ไปเป็น **Multi-Tenant Platform Economy** ที่ทำเงินได้จริง

วิสัยทัศน์หลักคือ **"Build once, plug many"** — สร้าง Revenue Infrastructure กลาง (Cost → Price → Token → Billing → Invoice) ให้ทุก Sub-Platform (Avatar, Booking, และอนาคต) Plug-in เข้ามาใช้ได้ทันทีโดยไม่ต้องสร้างระบบคิดเงินเอง ทำให้ Go-to-Market เร็วขึ้น

Target Users 4 กลุ่ม: **Platform Admin** (จัดการ Cost/Price/Sub-Platform), **Finance** (Invoice/Payment/Credit Line), **Tenant Admin** (จัดการทีม, Token Wallet, Subscription), **Developer** (ใช้ API ผ่าน Portal) — ผ่าน 3 UI surfaces: Backoffice (Admin), Developer Portal/Landing (Developer/Tenant), Hub Page (SSO entry point)

รองรับ **Dual Billing Model** ตั้งแต่แรก: Subscription + Token Top-up (Prepaid สำหรับ Tenant) และ Post-paid Credit Line (B2B สำหรับ Developer) โดยใช้ Universal Token Wallet เป็นหน่วยกลางข้าม Sub-Platform ทั้งหมด

### What Makes This Special

สิ่งที่ทำให้ PRD นี้ต่างจากการ "เพิ่ม Billing module" ทั่วไป คือเป็นการสร้าง **Shared Revenue Infrastructure** ระดับ Platform — ออกแบบมาให้เป็น Foundation ที่ทุก Sub-Platform ใช้ร่วมกันได้ตั้งแต่วันแรก ไม่ใช่แค่แก้ปัญหาของ Sub-Platform ใดตัวเดียว

Core Insight: Foundation ต้องมาก่อน Product — การสร้าง Avatar หรือ Booking โดยไม่มี Central Billing + Multi-Tenancy จะทำให้ทุก Sub-Platform ต้องสร้างระบบคิดเงินซ้ำซ้อน และ migration ทีหลังมีต้นทุนสูง วิสัยทัศน์ของ CTO กำหนดให้ Pricing + Multi-Tenancy เป็น **P0 prerequisite** ก่อน Sub-Platform ใดจะ launch ได้ โดย Multi-Tenancy ประกอบด้วย 3 ชิ้นที่ทำงานร่วมกัน: **M-BE-04** (Admin-facing Tenant management), **Tenant Service** (Tenant-facing Identity/SSO/Membership), **X-MT-01** (3-Layer Architecture: Central Platform → Sub-Platform → Tenant)

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Project Type** | SaaS B2B — Platform Expansion PRD |
| **Domain** | Platform Economy / SaaS Billing & Multi-Tenancy |
| **Complexity** | High — 7 modules, cross-cutting architecture, dual billing model, 4 user groups |
| **Project Context** | Brownfield — ต่อยอดจาก Platform ที่มี Portal + Gateway + Builder พร้อมใช้งาน |

## Success Criteria

### User Success

**Platform Admin / Central Admin:**
- ตั้ง Cost → Margin → Sell Price ผ่าน Triple Bidirectional Editing ได้ทันทีจาก Backoffice
- Margin Resolution ถูกต้องตาม Priority (Service Code > Provider > Global > Default 10%) ทุกครั้ง
- จัดการ Sub-Platform Lifecycle (Registered → Configured → Active → Suspended → Retired) ผ่าน UI — ไม่ต้องพึ่ง DevOps
- เห็น Health Dashboard รวมทุก Sub-Platform: active tenants, token usage, revenue, uptime, error rate ในที่เดียว
- Margin Health Monitoring — alert เมื่อ Margin < threshold หลัง Cost เปลี่ยน

**Finance:**
- Invoice ถูกต้อง 100% ตามกฎหมายบัญชีไทย (VAT 7%, format `INV-{YYYYMM}-{NNNNN}`)
- Verify Payment ภายใน 2 วันทำการ — Approve → Receipt auto-generated, Reject → แจ้งเหตุผล
- Credit Line management ครบ lifecycle: Approve → Active → Suspend พร้อม Audit Log
- Refund ผ่าน Dual Approval (Super Admin + Finance Admin) — พร้อมใช้ตั้งแต่ launch
- Chargeback notification จาก 2C2P ถึง Finance Admin ภายใน < 5 นาที

**Tenant Admin:**
- เข้า Hub Page → เห็น Sub-Platforms ที่ subscribe → เติม Token ครั้งเดียวใช้ได้ทุก platform (Universal Token Wallet)
- SSO account ใช้ข้าม Sub-Platform ได้ทันที (Account Linking)
- ชำระผ่าน 3 ช่องทาง: 2C2P, Direct Bank Transfer, Company QR

**Developer:**
- ใช้ API ผ่าน Portal — Token หักแบบ real-time ไม่รู้สึกถึง delay
- Over Credit → Hard Block ทันที ไม่มีค่าใช้จ่ายเกินโดยไม่รู้ตัว

### Business Success

| Metric | Target | Timeline |
|--------|--------|----------|
| Payment collection rate | > 85% paid on time | Launch + 3 เดือน |
| Tenant acquisition (Avatar) | 10-20 → 30-50 → 100+ Tenants | 3 / 6 / 12 เดือน |
| MRR | Baseline tracking → Break-even infra cost | 3 เดือน / 12 เดือน |
| Time-to-onboard Sub-Platform ใหม่ | < 3 วันทำการ (config ผ่าน UI ครบ) | ตั้งแต่ launch |
| Invoice accuracy | 100% — ไม่มี Invoice ที่ต้องแก้ไขหลังออก | ตั้งแต่ launch |
| Double charging prevention | 0 cases (Idempotency + Trace ID) | ตั้งแต่ launch |
| Dual Billing Model | Subscription + Credit Line ทำงานร่วมกันถูกต้อง | ตั้งแต่ launch |
| Sub-Platform capacity | รองรับ 5+ Sub-Platforms | Architecture design |

### Technical Success

| Aspect | Requirement |
|--------|-------------|
| **Billing Uptime** | 99.9% (Critical — Production รับเงินจริง) |
| **Token Deduction Latency** | p99 < 200ms |
| **Cost Data Availability** | 24/7 (Price Engine dependency) |
| **Price Engine Availability** | 24/7 Critical Service — ถ้าล่ม → queue & retry |
| **Payment Callback** | ประมวลผลภายใน 5 นาที |
| **Idempotency** | Trace ID (UUID v4), Cache TTL 24h — ยิงซ้ำต้องได้ผลเดิม |
| **Data Retention** | 7 ปี (Transaction, Invoice, Receipt, Snapshot) — กฎหมายบัญชีไทย |
| **Data Isolation** | Tenant data แยก 100% ที่ database level — กำหนด strategy ตั้งแต่ design |
| **Immutable Ledger** | Cost History, Snapshots, Transaction, Audit Log — ห้ามแก้/ลบ |
| **Currency** | V1.0 THB only |

### Measurable Outcomes

| Outcome | Measurement | Definition of Done |
|---------|-------------|-------------------|
| Revenue pipeline ครบ | E2E: Cost → Margin → Subscribe → Use Token → Invoice → Payment → Receipt | ครบทุก step ไม่มี manual intervention |
| Sub-Platform plug-in | Avatar ใช้ Central Billing โดยไม่สร้างระบบเอง | Config + go-live < 3 วัน |
| Tenant lifecycle ครบ | Register → Subscribe → Use → Pay → Renew ครบ cycle | Automated ทั้ง flow |
| Approval workflow | Cost Change + Margin Change + Refund ผ่าน Dual Approval | ทุก approval มี audit trail |
| Cross-platform dashboard | Central Admin เห็น metrics รวมทุก Sub-Platform | Data delay < 5 นาที |
| Idempotency | Trace ID ซ้ำ → return cached result ไม่หัก Token ซ้ำ | 0 duplicate deductions |

## Product Scope

### Production V1.0 — Full Production Release

**ทุกอย่างที่ต้องมีเพื่อ "ทำเงินได้จริงอย่างมั่นใจ":**

- **Tenant Service**: User Identity, SSO, Membership N:N, Hub Page, RBAC, JWT issuer
- **M-BE-04**: Tenant CRUD (Edit/Suspend/Restore), Audit Log
- **M-BE-05**: Cost Config per Service Code, Billing Types (Per Token/Minute/Request/Byte), Cost History (Immutable), Exchange Rate (THB), Cost Change Request + Approval
- **M-BE-06**: Margin 3 levels + Triple Bidirectional Editing, Default Snapshot + Custom Snapshot, Margin Approval Workflow, Price Lock (max 365 วัน + auto-revert + notification 30/7/1), Subscription Plans per Sub-Platform, Margin Health Monitoring
- **M-BE-07**: Universal Token Wallet, Token Deduction (real-time + idempotent), Invoice/Receipt (Thai law), Payment via 2C2P + Direct Bank Transfer + Company QR, Credit Line (full lifecycle), Collection workflow, Refund + Dual Approval
- **M-BE-12**: Sub-Platform CRUD, Branding (logo/colors/favicon), Lifecycle Management (preconditions enforced), Health Dashboard
- **X-MT-01**: 3-Layer Architecture, Data Isolation (strategy กำหนดตั้งแต่ design), SSO cross-platform, Tenant Registration flow, Tenant Branding override (White-Label V1)

### V2.0 (Future Enhancement)

- **Multi-currency support**: รองรับสกุลเงินนอกเหนือ THB
- **White-Label V2**: Custom domain, Custom CSS per Tenant
- **Auto Credit Scoring**: ประเมิน Credit Limit อัตโนมัติจาก usage pattern
- **AI-powered Revenue Analytics**: Revenue trend, churn prediction, pricing optimization

## User Journeys

### Journey 1: Platform Admin — "ตั้ง Sub-Platform ใหม่ให้พร้อมทำเงิน"

**Persona:** สมชาย — Central Admin ของ RealFact Platform ดูแล Backoffice ทั้งระบบ ต้องเตรียม Sub-Platform ใหม่ให้ launch ได้โดยไม่ต้องพึ่งทีม DevOps

**Opening Scene:** สมชายได้รับมอบหมายให้เปิด Avatar เป็น Sub-Platform แรกบน RealFact Platform ก่อนหน้านี้การเปิด service ใหม่ต้องผ่าน DevOps ตั้ง config เอง ใช้เวลาเป็นสัปดาห์ วันนี้ทุกอย่างต้องทำผ่าน Backoffice ได้เอง

**Rising Action:**
1. สมชายเข้า **Sub-Platform Management** → กด "Create Sub-Platform" → ตั้งชื่อ "Avatar", code `avatar`, domain `avatar.realfact.ai` → สถานะ: Registered
2. เข้า **Branding Tab** → อัปโหลด logo, ตั้งสี primary/secondary, เลือก landing page template → ดู live preview ก่อน save
3. เข้า **Cost Engine** → เลือก Service Codes ของ Avatar → กำหนด Billing Type (Per Minute) → ใส่ต้นทุน cost per unit → ตั้ง Effective Date → สร้าง Cost Change Request → รอ Super Admin approve
4. Super Admin approve → สมชายเข้า **Price Engine** → ตั้ง Global Margin 30% → ใช้ Triple Bidirectional Editing ดู Sell Price ที่คำนวณออกมา → ปรับจนพอใจ → สร้าง Margin Change Request → รอ approve
5. เข้า **Subscription Plans** → สร้าง 3 plans (Free/Starter/Pro) พร้อม Token quota แต่ละ tier → กำหนด Exchange Rate (1 Token = 1 minute สำหรับ Avatar)
6. ลูกค้า B2B รายใหญ่ต้องการใช้ Embedding → สมชาย **toggle Embedding Billing** per customer จาก Price Engine → เปิด/ปิดการคิดเงิน embedding ให้ลูกค้าเฉพาะราย
7. กลับ **Sub-Platform Lifecycle** → ระบบ check preconditions: Plans ✅, Exchange Rate ✅, Branding ✅ → กด "Activate" → สถานะ: Active

**Climax:** สมชายเปิด **Health Dashboard** เห็น Avatar ขึ้นสถานะ Active พร้อม metrics dashboard ว่างรอ Tenant แรก — ทั้งหมดทำเสร็จภายใน < 3 วันทำการ โดยไม่ต้องเขียน code หรือขอ DevOps สักบรรทัด

**Resolution:** เมื่อ Sub-Platform ที่ 2 (Booking) มาถึง สมชายทำซ้ำ flow เดิมได้ทันที — "Build once, plug many" กลายเป็นจริง

**Requirements Revealed:**
- M-BE-12: Sub-Platform CRUD + Branding + Lifecycle + Health Dashboard
- M-BE-05: Cost Config + Billing Type + Cost Change Request + Approval
- M-BE-06: Margin 3 levels + Triple Bidirectional Editing + Subscription Plans + Exchange Rate + Embedding Billing toggle per customer
- Approval Workflow: Cost Change + Margin Change ผ่าน Super Admin

---

### Journey 2: Finance Admin — "ดูแล Billing และติดตามรายรับจากทุก Sub-Platform"

**Persona:** วรรณา — Finance Admin รับผิดชอบ Credit Line, Invoice, Payment ของลูกค้า B2B ต้องดูแลให้ทุกบาทถูกต้องตามกฎหมายบัญชีไทย

**Opening Scene:** วรรณาเปิด Backoffice ตอนเช้า เห็น Credit Line request ใหม่จากบริษัท TechCorp และมี payment รอ verify หลายรายการ

**Rising Action:**
1. วรรณาเปิด **Credit Approval Queue** → เห็น TechCorp → ตรวจข้อมูลบริษัท (ชื่อ, เลขทะเบียน, ที่อยู่, เอกสารแนบ) → กำหนด Credit Limit 50,000 THB, Billing Cycle 30 วัน, Payment Terms Net 30 → กด Approve → ระบบแจ้ง TechCorp ทาง email
2. TechCorp เริ่มใช้ API → Token ถูกหักแบบ real-time จาก Credit Line → วรรณาเห็น Available Credit ลดลงใน dashboard
3. ครบ 30 วัน → ระบบ **auto-generate Invoice** (`INV-202603-00001`) → VAT 7% คำนวณอัตโนมัติ → สถานะ: Issued
4. TechCorp โอนเงินผ่านธนาคาร → อัปโหลด slip → Invoice สถานะ: Pending Verification
5. วรรณาเปิด **Verification Queue** → เห็น slip + จำนวนเงิน → ตรวจสอบ → กด Approve → Invoice = Paid → **Receipt auto-generated** ตามกฎหมายบัญชีไทย

**Purchase Log — Consolidated View:**
6. วรรณาเปิด **Purchase Log** ใน Backoffice → เห็นรายการซื้อทั้งหมดจากทุก Tenant ทุก Sub-Platform ในตารางเดียว:

| Date | Tenant | Sub-Platform | Type | Description | Method | Amount | Status | Reference |
|------|--------|-------------|------|-------------|--------|--------|--------|-----------|
| 2026-02-15 | JKL Corp | AI Booking | Subscription | AI Booking Starter - Pending Slip Verification | Bank Transfer | 590 THB | Pending | RF-2602-0008 |
| 2026-02-14 | ABC Corp | Live Interact | Token Top-up | Token Top-up (5,000 tokens) | Card (2C2P) | 20,000 THB | Completed | RF-2602-0006 |
| 2026-02-01 | ABC Corp | Live Interact | Subscription | Avatar Pro - Monthly Subscription | Card (2C2P) | 4,990 THB | Completed | RF-2602-0001 |

7. **Drill-down**: click Tenant name → ไปหน้า Tenant Detail (M-BE-04), click Reference → ไปหน้า Transaction Detail
8. Filter: Sub-Platform, Tenant, Type (Subscription / Token Top-up), Status (Pending / Completed) + Search + Export

**Edge Case — Overdue:**
9. TechCorp ไม่จ่ายภายใน due date → Invoice สถานะ: Overdue → ขึ้นใน **Aging Report**
10. วรรณากด **Send Collection Notice** → ระบบส่ง email + Telegram → รอ 7 วัน (ส่งซ้ำไม่ได้ภายใน 7 วัน)
11. ยังไม่จ่าย → วรรณา **Suspend Credit Line** → TechCorp ถูก block ใช้ API ทันที แต่หนี้เก่ายังอยู่

**Edge Case — Chargeback:**
12. Tenant หนึ่งจ่ายผ่าน 2C2P แล้วทำ chargeback → ระบบแจ้ง Finance Admin ภายใน < 5 นาที → วรรณาเปิด Dispute → เลือก Accept (reverse credit + ledger entry) หรือ Contest (ส่งหลักฐานกลับ 2C2P)
13. ถ้าต้อง Refund → วรรณา + Super Admin **Dual Approve** → ระบบ reverse ผ่าน 2C2P → สร้าง Credit Note → แจ้ง Tenant

**Climax:** สิ้นเดือน วรรณาเปิด Purchase Log filter ตาม Sub-Platform → เห็นรายรับรวมของ Avatar vs Booking → เปิด Transaction Ledger ทุก record immutable → ส่งให้ผู้สอบบัญชีได้ทันที

**Resolution:** วรรณามั่นใจว่าระบบ Billing รองรับทั้ง Subscription และ Credit Line — Purchase Log ให้ภาพรวมรายรับจากทุก Sub-Platform ในที่เดียว ข้อมูลครบ 7 ปีตามกฎหมาย

**Requirements Revealed:**
- M-BE-07: Credit Line lifecycle, Invoice auto-generation, Payment Verification, Collection workflow, Chargeback/Refund + Dual Approval, Transaction Ledger (Immutable)
- **Purchase Log (NEW — M-BE-07)**: Centralized ledger ข้าม Tenant + Sub-Platform — columns: Date, Tenant, Sub-Platform, Type, Description, Method, Amount, Status, Reference — Drill-down links (Tenant → M-BE-04, Reference → Transaction Detail) — Filter + Search + Export
- Idempotency: Token Deduction + Payment callback ป้องกัน double charging
- Compliance: Thai accounting law (VAT 7%, Invoice/Receipt format, 7-year retention)

---

### Journey 3: Tenant Admin — "สมัคร Subscribe แล้วใช้ AI ข้าม Sub-Platform"

**Persona:** ปิยะ — เจ้าของบริษัท startup อยากใช้ Avatar AI สำหรับ customer service และจะใช้ Booking AI ในอนาคต ต้องการระบบจัดการทีมและงบ AI ในที่เดียว

**Opening Scene:** ปิยะเห็นโฆษณา Avatar AI ของ RealFact เข้า `avatar.realfact.ai` เห็น Landing Page พร้อม plans 3 ระดับ ตัดสินใจลองใช้

**Rising Action:**
1. ปิยะกด **"Sign Up"** → ระบบ check SSO (ไม่มี account) → กรอกข้อมูล: ชื่อ, email, password → verify email → ระบบสร้าง **User (SSO) + Tenant + Membership (role: owner)** เป็น atomic transaction → **เข้าใช้งานได้ทันที** ไม่ต้องรอ approve
2. เลือก **Free Plan** → ได้ 100 bonus tokens/เดือน → ทดลองใช้ Avatar AI ก่อน
3. ใช้ Avatar AI → token ถูกหักตาม Exchange Rate (1 token = 1 minute) → ดู balance real-time → Token deduction ใช้ subscription tokens ก่อน จนหมดค่อยใช้ purchased tokens
4. ปิยะพอใจ ต้องการ features เพิ่ม → กด **"Upgrade Plan"** → เลือก Starter Plan (990 THB/เดือน, 1,000 tokens) → ระบบแสดง **Pro-rata calculation**: เหลือ 15 วัน → จ่าย 495 THB สำหรับเดือนนี้ + bonus tokens เพิ่มตามส่วน → Confirm → ชำระผ่าน 2C2P → Upgrade ทันที
5. ปิยะเข้า **Hub Page** (`auth.realfact.tech`) → เห็น Avatar เป็น Sub-Platform ที่ subscribe อยู่
6. Token ใกล้หมด (< 20%) → ระบบแจ้งผ่าน **Telegram + Email** → ปิยะกด **"Top-up"** → ซื้อ 5,000 tokens (purchased tokens ไม่หมดอายุ, stack ได้) → จ่ายผ่าน Company QR
7. ปิยะ **Invite ทีม** → เพิ่ม 3 คน: admin 1 คน, member 2 คน → แต่ละคนได้ email invitation → login ผ่าน SSO → เข้า Avatar ได้ตาม role

**Purchase Log — Tenant View:**
8. ปิยะเปิด **Hub Page → Purchase Log** → เห็นรายการซื้อของ Tenant ตัวเองจากทุก Sub-Platform:

| Date | Sub-Platform | Type | Description | Method | Amount | Status | Reference |
|------|-------------|------|-------------|--------|--------|--------|-----------|
| 2026-03-15 | Avatar | Subscription | Upgrade: Free → Starter (Pro-rata 15 days) | Card (2C2P) | 495 THB | Completed | RF-2603-0015 |
| 2026-03-18 | Avatar | Token Top-up | Token Top-up (5,000 tokens) | Company QR | 2,500 THB | Completed | RF-2603-0018 |

**Account Linking:**
9. 3 เดือนถัดมา → Booking Sub-Platform เปิดตัว → ปิยะเข้า `booking.realfact.ai` → ระบบตรวจเจอว่ามี SSO account แล้ว → ถามว่า **"คุณมี Realfact account อยู่แล้ว ต้องการ link กับ Booking ไหม?"** → ปิยะ confirm + consent
10. เลือก Booking Plan → จ่ายเงิน → กลับ Hub Page → เห็นทั้ง **Avatar + Booking** → Token Wallet เดียวกัน → Purchase Log แสดงรายการจากทั้ง 2 platforms

**Plan Downgrade:**
11. ปิยะทีมลดขนาด → Downgrade จาก Starter → Free → ระบบแสดง: เหลือ 20 วัน จะได้ extended 40 วัน (ไม่ refund แต่ขยายเวลาตามอัตราส่วน) → ปิยะ Confirm → Downgrade ทันที

**Auto-Payment Failure:**
12. เดือนถัดมา → auto-charge ผ่าน 2C2P fail → เข้า **Grace Period 3 วัน** → Day 0: แจ้ง Telegram + Email → Day 1: retry → Day 3: retry ครั้งสุดท้าย → ถ้า fail: Suspend subscription → ปิยะต้อง reactivate + จ่ายเงินเอง

**Tenant Decommissioning (PDPA):**
13. ปิยะตัดสินใจเลิกใช้ → เข้า **Account Settings → Delete Account** → ระบบแสดงข้อมูลที่จะถูกลบ + outstanding balance (ต้องจ่ายก่อน) → ปิยะ confirm → ระบบส่ง **OTP ทาง email** → ใส่ OTP → Account decommissioned ตาม PDPA

**Climax:** ปิยะเปิด Hub Page เห็น 2 Sub-Platforms, Token Wallet balance รวม, Purchase Log ครบทุกรายการ, ทีม 4 คนทำงานอยู่ — ทั้งหมดจัดการจากที่เดียว

**Resolution:** เมื่อ Sub-Platform ที่ 3, 4 เปิดตัว ปิยะแค่ link account + subscribe — Token Wallet เดิมใช้ได้ทันที Purchase Log แสดงรวมทุก platform ทำให้ track ค่าใช้จ่ายได้ง่าย

**Requirements Revealed:**
- Tenant Service: SSO, Registration (atomic: User + Tenant + Membership, ไม่ต้อง approve), Hub Page, Account Linking, Team Management (Membership N:N + RBAC), Decommissioning (PDPA + OTP)
- X-MT-01: 3-Layer Architecture, Cross-platform SSO, Universal Token Wallet
- M-BE-07: Subscription Billing, Token Top-up (purchased ไม่หมดอายุ, stack ได้), Multi-channel Payment, Auto-payment + Grace Period, Token Deduction (subscription tokens first → purchased tokens)
- M-BE-06: Subscription Plans (Free/Starter/Pro), Plan Upgrade (pro-rata) + Downgrade (extended days), Exchange Rate per Sub-Platform
- Purchase Log (Tenant View): รายการซื้อของ Tenant ตัวเอง ข้าม Sub-Platform
- Notifications: Telegram + Email สำหรับ low balance, payment failure, subscription events

---

### Journey 4: Developer — "สมัคร API แล้วใช้งานจริงแบบ Post-paid"

**Persona:** ธนา — Developer ที่บริษัท FinTech อยากใช้ AI API ของ RealFact ผ่าน Portal เพื่อ integrate chatbot ให้ลูกค้า ต้องการ Credit Line เพราะใช้ volume สูง

**Opening Scene:** ธนาเปิด `portal.realfact.tech` อ่าน API Docs (public, ไม่ต้อง login) เห็นว่า RealFact มี chatbot API ที่ตรงความต้องการ ตัดสินใจสมัคร

**Rising Action:**
1. ธนากด **"Sign Up"** → กรอก email + password → verify email → **เข้าใช้งานได้ทันที** ไม่ต้องรอ approve Tenant → ระบบสร้าง User + Tenant + Membership อัตโนมัติ
2. เข้า Dashboard → กด **"Create App"** → ตั้งชื่อ "FinBot" → ระบบสร้าง Client ID (`rf_client_<uuid>`) + Client Secret (`rf_secret_<64_chars>`) → **Secret แสดงครั้งเดียว!** → ธนา copy เก็บ
3. App สถานะ: **Sandbox** (100 calls/day) → ธนาทดสอบ API ด้วย HMAC Signature → ได้ response → ทุกอย่างทำงาน
4. พร้อม production → กด **"Submit for Production"** → กรอก 3 steps: ข้อมูลบริษัท → อัปโหลดเอกสาร (1-5 files, max 10MB) → Review & Confirm → สถานะ: Pending Approval (ยังใช้ sandbox 100 calls/day ได้)
5. Platform Admin ตรวจสอบ → **Approve** → rate limit ขยับเป็น 10,000 calls/day → ธนาได้ email แจ้ง

**Credit Line Journey:**
6. ธนาต้องการ post-paid → สมัคร **Credit Line** → ระบบส่ง request ไป Finance Admin
7. วรรณา (Finance) approve Credit Limit 100,000 THB → ธนาใช้ API → Token หักจาก Credit Line แบบ real-time
8. ครบ 30 วัน → Invoice auto-generate → ธนาเห็นใน Portal → โอนเงิน + อัปโหลด slip → วรรณา verify → Invoice = Paid

**Edge Case — Over Credit:**
9. ธนาใช้หนักจน Available Credit เหลือ < 20% → ระบบแจ้ง alert
10. ใช้จนหมด → **Hard Block ทันที** → API return error → ธนาต้องรอ Invoice + จ่าย → หรือขอเพิ่ม Credit Limit

**Edge Case — Secret Compromised:**
11. ธนาสงสัยว่า Secret หลุด → กด **"Regenerate Secret"** → Secret เดิมถูก invalidate ทันที → ได้ Secret ใหม่ (แสดงครั้งเดียว) → update ใน app

**Climax:** ธนาเปิด Usage Dashboard เห็น API calls, token consumption, remaining credit — ทุกอย่าง real-time ไม่มี surprise billing

**Resolution:** ธนามั่นใจว่า RealFact API ให้ทั้งความยืดหยุ่น (Sandbox → Production → Credit Line) และความโปร่งใส (real-time usage tracking, idempotent deduction, immutable ledger)

**Requirements Revealed:**
- Tenant Service: Registration (atomic, ไม่ต้อง approve Tenant)
- M-BE-07 (Developer App — FR81-85): App CRUD, Client ID/Secret, App Production Approval (Tenant ไม่ต้อง approve แต่ App ที่ขึ้น Production ต้อง approve), HMAC API
- M-BE-07: Credit Line (B2B post-paid), Token Deduction (real-time + idempotent), Invoice, Payment Submission
- Security: HMAC Signature, Secret hashing (bcrypt), Regenerate Secret, Account lockout (5 failed → 30 min)

---

### Journey Requirements Summary

| Capability Area | J1 (Admin) | J2 (Finance) | J3 (Tenant) | J4 (Developer) |
|----------------|:-:|:-:|:-:|:-:|
| **Sub-Platform CRUD + Lifecycle** | ✅ | | | |
| **Branding (Logo/Colors/Template)** | ✅ | | | |
| **Cost Config + Approval** | ✅ | | | |
| **Margin + Triple Bidirectional** | ✅ | | | |
| **Embedding Billing toggle** | ✅ | | | |
| **Subscription Plans** | ✅ | | ✅ | |
| **Plan Upgrade (Pro-rata) + Downgrade** | | | ✅ | |
| **Exchange Rate per Sub-Platform** | ✅ | | ✅ | |
| **Health Dashboard** | ✅ | | | |
| **Credit Line Lifecycle** | | ✅ | | ✅ |
| **Invoice/Receipt (Thai Law)** | | ✅ | | ✅ |
| **Payment Verification** | | ✅ | | |
| **Collection + Aging** | | ✅ | | |
| **Chargeback/Refund + Dual Approval** | | ✅ | | |
| **Purchase Log (All Tenants — Centralized Ledger)** | | ✅ | | |
| **Purchase Log (Own Tenant)** | | | ✅ | |
| **Purchase Log Drill-down** | | ✅ | | |
| **Transaction Ledger (Immutable)** | | ✅ | | |
| **SSO + Hub Page** | | | ✅ | |
| **Registration (Atomic, No Approval)** | | | ✅ | ✅ |
| **Account Linking** | | | ✅ | |
| **Universal Token Wallet** | | | ✅ | |
| **Token Top-up (No Expiry, Stack)** | | | ✅ | |
| **Token Deduction Order (Sub first → Purchased)** | | | ✅ | |
| **Team Management (RBAC)** | | | ✅ | |
| **Auto-payment + Grace Period** | | | ✅ | |
| **Tenant Decommissioning (PDPA + OTP)** | | | ✅ | |
| **App CRUD + Credentials** | | | | ✅ |
| **App Production Approval** | | | | ✅ |
| **HMAC API + Rate Limiting** | | | | ✅ |
| **Token Deduction (Real-time + Idempotent)** | | ✅ | ✅ | ✅ |
| **Notifications (Telegram + Email)** | | ✅ | ✅ | ✅ |

## Domain-Specific Requirements

### Compliance & Regulatory

**กฎหมายบัญชีไทย (พ.ร.บ. การบัญชี + ประมวลรัษฎากร):**
- Invoice format ตามที่กฎหมายกำหนด: ชื่อผู้ออก, เลขประจำตัวผู้เสียภาษี, รายการ, จำนวนเงิน, VAT 7%
- Receipt auto-generated เมื่อ payment verified — เก็บรักษา **7 ปี** ตามกฎหมายบัญชี
- Invoice Number format: `INV-{YYYYMM}-{NNNNN}` — auto-increment, ห้ามข้ามเลข
- Credit Note สำหรับ Refund — ต้องอ้างอิง Invoice ต้นทาง

**PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล):**
- Tenant Decommissioning ต้องลบข้อมูลส่วนบุคคลตาม PDPA — ยกเว้นข้อมูลทางบัญชีที่ต้องเก็บ 7 ปี
- Consent management สำหรับ Account Linking ข้าม Sub-Platform — ต้องมี explicit consent
- Data processing agreement ระหว่าง Platform กับ Tenant
- OTP verification สำหรับ account deletion — ป้องกันการลบโดยไม่ตั้งใจ

### Technical Constraints

**Financial Data Integrity:**
- **Immutable Ledger** — Transaction, Invoice, Receipt, Cost History, Snapshots ห้ามแก้ไข/ลบ (append-only)
- **Idempotency** — Token Deduction ใช้ Trace ID (UUID v4, Cache TTL 24h) ป้องกัน double charging
- **Payment Callback Dedup** — 2C2P callback ซ้ำ → return 200 OK ไม่ process ซ้ำ (DB unique constraint + Cache TTL 48h)
- **Audit Trail** — ทุก financial action ต้อง log: who, what, when, before/after values
- **Data Retention** — 7 ปีสำหรับ financial records ตามกฎหมาย

**Payment Security:**
- 2C2P HMAC Signature validation — ตรวจ signature ก่อน process ทุก callback
- Payment credentials (API keys, secrets) เก็บเป็น encrypted at rest
- PCI-DSS: ไม่เก็บ card data ในระบบ — delegate ให้ 2C2P เป็น payment processor
- Refund ต้อง Dual Approval (Super Admin + Finance Admin) — ป้องกัน unauthorized refund

**Multi-Tenancy Data Isolation:**
- Tenant data แยก 100% — กำหนด isolation strategy ตั้งแต่ architecture design
- Cross-tenant data access ต้อง enforce ที่ทุก layer (API, service, database)
- Purchase Log aggregation (Finance view) ต้องผ่าน centralized ledger ไม่ใช่ cross-tenant query
- JWT ต้องมี `active_tenant` claim — ทุก API call ต้อง validate tenant context

### Integration Requirements

**Payment Gateway (2C2P):**
- Payment state machine: INITIATED → PROCESSING → SUCCESS → SETTLED
- Auto-retry policy: fail 3 ครั้ง (1h, 4h, 12h exponential backoff) → ABANDONED
- Chargeback notification → Finance Admin alert < 5 นาที
- Supported methods: Credit/Debit Card, PromptPay, Bank Transfer

**Direct Bank Transfer + Company QR:**
- แสดง bank account info ใน Invoice (ชื่อบัญชี, เลขบัญชี, สาขา, QR Code)
- Tenant อัปโหลด transfer slip → Admin manual verification
- ไม่มี auto-reconciliation ใน V1.0

**Notification Service (M-BE-11):**
- Telegram + Email สำหรับ: subscription renewal, payment due, low balance, payment failure, chargeback
- Notification preference configurable per Tenant

### Risk Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Double Token Deduction** | ลูกค้าเสียเงินซ้ำ, สูญเสียความเชื่อมั่น | Idempotency (Trace ID + Cache TTL 24h), E2E test ทุก release |
| **Invoice ผิด** | ผิดกฎหมาย, ต้องออก Credit Note แก้ | VAT calculation unit test, Invoice format validation, 100% accuracy target |
| **Credit Line Abuse** | ลูกค้าใช้เกิน limit | Hard Block ทันทีเมื่อ over credit, real-time balance check ก่อนทุก deduction |
| **Unauthorized Refund** | สูญเสียรายได้ | Dual Approval (Super Admin + Finance Admin), Audit trail ทุก refund |
| **Cross-Tenant Data Leak** | ละเมิด PDPA, สูญเสียความเชื่อมั่น | Row-Level Security, JWT tenant validation ทุก request, penetration test |
| **Payment Callback Spoofing** | ปลอม payment success | HMAC Signature validation จาก 2C2P ก่อน process |
| **Billing Service Downtime** | ใช้ AI ไม่ได้, revenue loss | 99.9% SLA, queue & retry mechanism, graceful degradation |
| **Data Loss (Financial Records)** | ผิดกฎหมาย 7 ปี retention | Immutable ledger, automated backup, disaster recovery plan |
| **Auto-payment Failure Storm** | Tenant ถูก suspend เยอะ | Grace Period 3 วัน, retry 3 ครั้ง (exponential backoff), แจ้ง Tenant ทุก step |

## SaaS B2B Specific Requirements

### Tenant Model

**3-Layer Multi-Tenancy Architecture:**

```
Central Platform (RealFact)
├── Sub-Platform: Avatar (avatar.realfact.ai)
│   ├── Tenant: ABC Corp (owner + 3 members)
│   ├── Tenant: XYZ Ltd (owner + 1 member)
│   └── Tenant: ปิยะ startup (owner + 3 members)
├── Sub-Platform: Booking (booking.realfact.ai)
│   ├── Tenant: ABC Corp (same SSO, linked account)
│   └── Tenant: GHI Co (new tenant)
└── Sub-Platform: [Future] (*.realfact.ai)
```

**Tenant Identity:**
- User ↔ Tenant = **N:N relationship** ผ่าน Membership table
- 1 User อยู่ได้หลาย Tenants, 1 Tenant มีหลาย Users
- SSO account ใช้ข้าม Sub-Platform (Account Linking with explicit consent)
- Registration = atomic transaction: User + Tenant + Membership (role: owner)
- ไม่ต้อง Admin approve Tenant — เข้าใช้ได้ทันทีหลัง verify email

**JWT Structure:**
```json
{
  "sub": "user-123",
  "email": "piya@startup.com",
  "active_tenant": "tenant-abc",
  "role": "owner",
  "platforms": ["avatar", "booking"]
}
```

**Data Isolation:**
- Tenant data แยก 100% — enforce ที่ทุก layer (API → Service → Database)
- ทุก API call ต้อง validate `active_tenant` จาก JWT
- Strategy กำหนดตั้งแต่ architecture design (RLS / Schema-per-Tenant / DB-per-Tenant)

### RBAC Matrix

**Membership Roles (Tenant-level):**

| Permission | Owner | Admin | Member |
|------------|:-----:|:-----:|:------:|
| View Dashboard | ✅ | ✅ | ✅ |
| Use AI Services (consume tokens) | ✅ | ✅ | ✅ |
| View Purchase Log | ✅ | ✅ | ✅ |
| Manage Subscription (upgrade/downgrade) | ✅ | ✅ | ❌ |
| Top-up Tokens | ✅ | ✅ | ❌ |
| Invite/Remove Members | ✅ | ✅ | ❌ |
| Link Account (new Sub-Platform) | ✅ | ✅ | ❌ |
| Change Member Roles | ✅ | ❌ | ❌ |
| Delete Account (PDPA) | ✅ | ❌ | ❌ |

**Backoffice Roles (Platform-level):**

| Permission | Super Admin | Platform Admin | Finance Admin |
|------------|:-----------:|:--------------:|:-------------:|
| ทุก permission ด้านล่าง | ✅ | — | — |
| Create Cost/Margin Change Request | ✅ | ✅ | ❌ |
| Approve Cost/Margin Changes | ✅ | ❌ | ❌ |
| Manage Sub-Platform Lifecycle | ✅ | ✅ | ❌ |
| Configure Branding | ✅ | ✅ | ❌ |
| Suspend/Activate Tenant | ✅ | ✅ | ❌ |
| Approve App Production | ✅ | ✅ | ❌ |
| Toggle Embedding Billing | ✅ | ✅ | ❌ |
| Create Custom Snapshot | ✅ | ❌ | ❌ |
| Delete/Restore Tenant (M-BE-04) | ✅ | ❌ | ❌ |
| Approve Credit Line | ✅ | ❌ | ✅ |
| Verify Payment | ✅ | ❌ | ✅ |
| Approve Refund (Dual: Super + Finance) | ✅ | ❌ | ✅ |
| View Purchase Log (All Tenants) | ✅ | ✅ | ✅ |
| Export Purchase Log (CSV/PDF) | ✅ | ✅ | ✅ |
| View Health Dashboard | ✅ | ✅ | ✅ |

**UI Behavior:**
- Backoffice menu **ซ่อน** items ที่ role ไม่มีสิทธิ์ (ไม่ใช่แค่ disable) — ลด cognitive load
- Hub Page **adaptive** ตาม role — Owner เห็น Settings ทั้งหมด, Member เห็นแค่ Dashboard + Use services

### Subscription Tiers

**Per Sub-Platform Plans** (แต่ละ Sub-Platform กำหนด plans เอง):

| Attribute | Free | Starter | Pro |
|-----------|------|---------|-----|
| Monthly Price | 0 THB | กำหนดโดย Sub-Platform | กำหนดโดย Sub-Platform |
| Bonus Tokens/เดือน | น้อย (ทดลอง) | ปานกลาง | มาก |
| Token Expiry (Bonus) | Reset ทุก billing cycle | Reset ทุก billing cycle | Reset ทุก billing cycle |
| Purchased Token Expiry | ไม่หมดอายุ | ไม่หมดอายุ | ไม่หมดอายุ |
| Features | Basic | Standard | Full |

> **Note:** Feature matrix กำหนดโดยแต่ละ Sub-Platform ตอน configure plans — PRD ไม่ lock feature list เพราะแต่ละ Sub-Platform ต่างกัน

**Plan Lifecycle:** Draft → Active → Deprecated → Retired

**Plan Operations:**
- Upgrade: ทันที + Pro-rata calculation (จ่ายส่วนต่างตามวันที่เหลือ)
- Downgrade: ทันที + Extended days (ไม่ refund แต่ขยายเวลา)
- Token Deduction Order: Subscription bonus tokens ก่อน → Purchased tokens ทีหลัง
- Auto-renewal: ทุก billing cycle → auto-charge → ถ้า fail → Grace Period 3 วัน

### Integration Points

| System | Direction | Protocol | Purpose |
|--------|-----------|----------|---------|
| **2C2P Payment Gateway** | Outbound + Callback | REST API + HMAC | Card/PromptPay payment, Refund, Chargeback |
| **Bank Transfer** | Manual (slip upload) | N/A | Direct bank transfer verification |
| **Gateway (existing)** | Internal | gRPC | API Key validation, rate limiting, token deduction trigger |
| **Portal (existing)** | Internal | gRPC | App management, Developer registration → Tenant creation |
| **Builder (existing)** | Internal | gRPC | Service Code source for Cost Engine |
| **Notification (M-BE-11)** | Internal | gRPC / Event | Telegram + Email delivery |
| **Redis (existing)** | Internal | Redis Protocol | Idempotency cache (Trace ID TTL 24h), Payment callback dedup (TTL 48h) |
| **OTEL Pipeline (existing)** | Internal | OTLP | Metrics, traces, logs for Health Dashboard |

**Proto Contracts ที่ต้องสร้างใหม่:**

| Proto Package | ครอบคลุม |
|---------------|---------|
| `proto/realfact/tenant/v1/` | User, Tenant, Membership, SSO, RBAC, Hub Page |
| `proto/realfact/billing/v1/` | Token Wallet, Deduction, Invoice, Payment, Credit Line, Purchase Log |
| `proto/realfact/cost/v1/` | Cost Config, Billing Type, Exchange Rate, Cost Change Request |
| `proto/realfact/price/v1/` | Margin, Snapshot, Price Lock, Subscription Plan |
| `proto/realfact/platform/v1/` | Sub-Platform CRUD, Branding, Lifecycle, Health |

### Implementation Considerations

**Dependency Chain (Build Order):**
```
Phase 0: Tenant Service + X-MT-01 (SSO, Identity, Multi-Tenancy)
Phase 1: M-BE-04 + M-BE-12 + M-BE-05  ← parallel ได้ทั้ง 3
         (Tenant Mgmt) (Sub-Platform) (Cost Engine)
Phase 2: M-BE-06 (Price Engine — needs Cost + Sub-Platform)
Phase 3: M-BE-07 (Billing — needs Price + Tenant + Sub-Platform)
```

**Purchase Log — Centralized Ledger:**
- ต้องเป็น **dedicated table** ไม่ใช่ view/join
- ทุก payment event (Subscription, Token Top-up, Credit Line payment) ต้อง write เข้า table นี้
- Finance view = query จาก table เดียว → performance ดีเมื่อ data โต

**Existing Infrastructure ที่ใช้ได้เลย:**
- gRPC framework (libs/go/grpcmw + libs/node/grpc-client)
- HMAC auth (libs/go/hmac + libs/node/hmac)
- Tenant Context lib (libs/go/tenantctx + libs/node/tenant-context)
- OTEL pipeline (Collector + Prometheus + Grafana)
- Proto build pipeline (Buf CLI)
- Redis (Cache + Pub/Sub)
- Monorepo tooling (Nx + Bun)

**Tech Stack:**
- Backend: Go 1.24+ (ตาม existing Gateway + Builder)
- Tenant Service: Next.js (มี SSO pages + Hub Page เป็น UI heavy, share libs กับ Portal)
- Database: PostgreSQL
- Cache: Redis
- Inter-service: ConnectRPC/gRPC

## Project Scoping & Phased Development

### Scope Strategy & Philosophy

**Scope Approach:** Production V1.0 — Full Production Release ที่ทำเงินได้จริงตั้งแต่วันแรก

**เหตุผล:** นี่คือ Foundation ของทุก Sub-Platform ในอนาคต — ถ้า Foundation ไม่ครบจะต้อง patch ทีหลังเมื่อมีลูกค้าจ่ายเงินจริงแล้ว ซึ่งมีความเสี่ยงสูงกว่าการทำให้ครบตั้งแต่แรก

### Production V1.0 Feature Set — ตาม Development Phase

**Sprint 0: Proto Contract Design (ทำก่อนเริ่ม implement)**
- Design proto contracts ทั้ง 5 packages (tenant, billing, cost, price, platform)
- กำหนด API contract ระหว่าง modules — ให้ทุก Phase implement ต่อ contract เดียวกัน
- Definition of Done: proto compiled + mock services พร้อมใช้

**Phase 0a: Tenant Service Core (Prerequisite — ต้องเสร็จก่อน Phase 1)**

| Module | Key Features | DoD |
|--------|-------------|-----|
| Tenant Service Core | User Identity, SSO, Registration (atomic: User+Tenant+Membership), JWT issuer, RBAC | Register + Login + Get JWT + Validate tenant context ได้ |
| X-MT-01 Core | 3-Layer Architecture, Data Isolation strategy, Tenant Registration flow | Tenant data isolated, JWT enforced ทุก API |

**Phase 0b: Tenant Service Extended (Parallel กับ Phase 1 ได้)**

| Module | Key Features | DoD |
|--------|-------------|-----|
| Tenant Service Extended | Hub Page, Account Linking (with consent), Membership management (invite/remove/roles), PDPA Decommissioning (OTP) | Hub Page แสดง Sub-Platforms, link account ข้าม platform ได้, ลบ account ตาม PDPA |

**Phase 1: Core Modules (Parallel 3 modules — เริ่มเมื่อ Phase 0a เสร็จ ~80%)**

| Module | Key Features | DoD |
|--------|-------------|-----|
| M-BE-04 | Tenant CRUD (Edit/Suspend/Restore), Tenant Detail (Members/Usage), Soft Delete (Super Admin only), Audit Log | Admin จัดการ Tenant ครบ lifecycle จาก Backoffice |
| M-BE-12 | Sub-Platform CRUD, Branding (logo/colors/favicon/template), Lifecycle (preconditions enforced), Health Dashboard | สร้าง + configure + activate Sub-Platform ผ่าน UI ได้ |
| M-BE-05 | Cost Config per Service Code, Billing Types (4 types), Cost History (Immutable), Exchange Rate (THB), Cost Change Request + Super Admin Approval | ตั้งต้นทุน + approval workflow ทำงานครบ |
| 2C2P Spike | Sandbox integration, webhook testing, payment flow validation | Payment flow ทำงานใน sandbox, เข้าใจ settlement process |

**Phase 2: Pricing (ต้องรอ Phase 1 — Cost + Sub-Platform)**

| Module | Key Features | DoD |
|--------|-------------|-----|
| M-BE-06 | Margin 3 levels + Triple Bidirectional Editing, Default + Custom Snapshot, Margin Approval Workflow, Price Lock (max 365d + auto-revert + notification), Subscription Plans per Sub-Platform (Free/Starter/Pro), Margin Health Monitoring, Embedding Billing toggle, Exchange Rate per Sub-Platform | Cost → Price → Token Rate คำนวณถูกต้อง, Plans พร้อมให้ Tenant subscribe |

**Phase 3: Billing (ต้องรอ Phase 2 — Price + Tenant)**

| Module | Key Features | DoD |
|--------|-------------|-----|
| M-BE-07 | Universal Token Wallet, Token Deduction (real-time + idempotent, subscription first → purchased), Invoice/Receipt (Thai law, auto-generate 30d), Payment (2C2P + Bank Transfer + Company QR), Credit Line (full lifecycle), Collection + Aging, Refund + Dual Approval, Chargeback handling, Purchase Log (Centralized Ledger — Finance + Tenant views, drill-down, export) | E2E: Subscribe → Use → Invoice → Pay → Receipt ครบ cycle |

```
Timeline Overview:
Sprint 0:  [Proto Design ────────]
Phase 0a:  [Tenant Core ─────────]
Phase 0b:       [Tenant Extended ────────] ← parallel กับ Phase 1
Phase 1:        [M-BE-04 ─────]            ← parallel 3 modules + 2C2P spike
                [M-BE-12 ─────]
                [M-BE-05 ─────]
                [2C2P Spike ──]
Phase 2:                       [M-BE-06 ─────]
Phase 3:                                      [M-BE-07 ──────────]
```

### Fallback Scope (Contingency — ใช้เมื่อ timeline pressure เท่านั้น)

**ตัดได้ (ถ้าจำเป็นจริงๆ — ย้ายเป็น V1.1):**
- Margin Health Monitoring (ใช้ manual check แทนได้ช่วงแรก)
- Company QR payment (เหลือ 2C2P + Bank Transfer ก็เพียงพอ)
- Embedding Billing toggle (default = billing on ทุกคน)
- Plan Downgrade extended days calculation (block downgrade ช่วงแรก, ต้อง cancel + re-subscribe)

**ห้ามตัดเด็ดขาด (Core Revenue Pipeline):**
- Token Deduction (real-time + idempotent) — ไม่มี = คิดเงินไม่ได้
- Invoice/Receipt (Thai law) — ไม่มี = ผิดกฎหมาย
- Credit Line lifecycle — ไม่มี = B2B ใช้ไม่ได้
- SSO + Registration — ไม่มี = login ไม่ได้
- Universal Token Wallet — ไม่มี = cross-platform billing ไม่ได้
- Purchase Log — ไม่มี = Finance ดูรายรับไม่ได้
- Subscription Plans + Upgrade — ไม่มี = Tenant subscribe ไม่ได้
- Refund + Dual Approval — ไม่มี = billing error แก้ไม่ได้
- Price Lock + Custom Snapshot — ไม่มี = B2B ราคาพิเศษทำไม่ได้

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Severity | Mitigation |
|------|----------|------------|
| Phase 0a ล่าช้า → block ทุกอย่าง | Critical | Assign ทีมแข็งแกร่งที่สุด, Phase 1 เริ่มเมื่อ 0a เสร็จ 80%, ใช้ mock service |
| Billing 99.9% SLA | High | Design HA ตั้งแต่ architecture, queue & retry, circuit breaker |
| Data Isolation ไม่ครบ | High | กำหนด strategy ตั้งแต่ Phase 0a, enforce ทุก layer, penetration test |
| 2C2P integration complexity | Medium | 2C2P spike ตั้งแต่ Phase 1 (parallel), ไม่รอ Phase 3 |

**Market Risks:**

| Risk | Mitigation |
|------|------------|
| Avatar ไม่มี user | Foundation production-ready ก่อน Avatar launch |
| Pricing model ไม่ตรง | Plan config ผ่าน UI ปรับได้ทันที ไม่ต้อง deploy ใหม่ |
| B2B Credit Line default | Hard Block เมื่อ over credit, Collection workflow + Aging |

**Resource Risks:**

| Risk | Mitigation |
|------|------------|
| ทีม 5 คน ทำ 7 modules | Phase 1 parallel 3 modules + Phase 0b overlap, ใช้ existing infra |
| Scope creep | V1.0 scope lock ใน PRD นี้, Fallback scope defined, V2.0 ห้ามแอบเข้า |
| Key person dependency | Proto contracts + shared libs ทำให้ handoff ง่าย |

## Functional Requirements

### 1. Tenant & Identity Management

- **FR1:** User สามารถสมัคร account ด้วย email + password โดยระบบสร้าง User, Tenant และ Membership (role: owner) เป็น atomic transaction — เข้าใช้งานได้ทันทีหลัง verify email ไม่ต้องรอ approve
- **FR2:** User สามารถ login ผ่าน SSO เข้าถึงทุก Sub-Platform ที่ subscribe ด้วย credentials ชุดเดียว
- **FR3:** User สามารถ link SSO account กับ Sub-Platform ใหม่ โดยระบบแสดง consent ก่อนดำเนินการ (Account Linking)
- **FR4:** User สามารถเข้า Hub Page หลัง login แล้วเห็นรายการ Sub-Platforms ที่ subscribe อยู่ โดย Hub Page แสดง content adaptive ตาม role ของ user (Owner เห็น Settings ทั้งหมด, Member เห็นแค่ Dashboard + Use services)
- **FR5:** User สามารถเลือกและสลับ Tenant/Workspace ที่ต้องการใช้งาน หลัง login
- **FR6:** Tenant Owner สามารถ invite member ใหม่เข้า Tenant พร้อมกำหนด role (Admin หรือ Member)
- **FR7:** Tenant Owner สามารถเปลี่ยน role ของ member ภายใน Tenant
- **FR8:** Tenant Admin สามารถลบ member ออกจาก Tenant
- **FR9:** ระบบ enforce RBAC ตาม role (Owner/Admin/Member) ทั้ง UI (ซ่อนเมนูที่ไม่มีสิทธิ์) และ API (reject ด้วย 403 Forbidden เมื่อไม่มีสิทธิ์)
- **FR10:** Super Admin สามารถเข้าถึงทุก permission ของทุก role ในระบบ
- **FR11:** Tenant Owner สามารถ decommission account ด้วย OTP verification — ลบข้อมูลตาม PDPA ยกเว้นข้อมูลบัญชีที่ต้องเก็บ 7 ปี
- **FR12:** ระบบ lock account ชั่วคราวเมื่อ login ผิดเกินจำนวนครั้งที่กำหนด
- **FR13:** User สามารถ reset password ผ่าน email verification
- **FR14:** User สามารถขอ resend verification email ได้
- **FR15:** ระบบ enforce Tenant data isolation — ไม่มี Tenant ใดเข้าถึงข้อมูลของ Tenant อื่นได้ ไม่ว่าจะผ่าน API, Service หรือ Database layer
- **FR16:** Platform Admin สามารถดู Tenant list + detail (members, usage, subscription status) จาก Backoffice
- **FR17:** Platform Admin สามารถแก้ไขข้อมูล Tenant (Company info, Contact info) จาก Backoffice
- **FR18:** Platform Admin สามารถ suspend และ restore Tenant
- **FR19:** Super Admin สามารถ soft-delete และ restore Tenant
- **FR20:** Platform Admin สามารถดู Pricing Info ของ Tenant (Pricing Type Default/Custom, Snapshot ที่ assign, Assigned Date) ใน Tenant Detail
- **FR21:** Tenant Admin สามารถ customize branding ของ Tenant ตัวเอง (Logo, Theme Color, Favicon) — White-Label V1

### 2. Sub-Platform Management

- **FR22:** Platform Admin สามารถสร้าง Sub-Platform ใหม่ (ชื่อ, code, domain)
- **FR23:** Platform Admin สามารถกำหนด Branding ของ Sub-Platform (logo, สี, favicon, landing template) พร้อม live preview
- **FR24:** Visitor สามารถดู Landing Page ของ Sub-Platform พร้อม plans และ pricing โดยไม่ต้อง login
- **FR25:** Platform Admin สามารถจัดการ Sub-Platform Lifecycle (Registered → Configured → Active → Suspended → Retired) โดยระบบ enforce preconditions ก่อนเปลี่ยนสถานะ
- **FR26:** Platform Admin สามารถดู Health Dashboard แสดง metrics รวม (active tenants, token usage, revenue, uptime, error rate) ของทุก Sub-Platform ในที่เดียว
- **FR27:** Gateway สามารถ validate JWT + active_tenant claim และ route API requests ไปยัง Sub-Platform ที่ถูกต้อง

### 3. Cost Management

- **FR28:** Platform Admin สามารถกำหนด cost per Service Code พร้อมระบุ Billing Type (Per Token / Per Minute / Per Request / Per Byte)
- **FR29:** Platform Admin สามารถตั้ง effective date สำหรับการเปลี่ยน cost
- **FR30:** Platform Admin สามารถสร้าง Cost Change Request เพื่อให้ Super Admin approve
- **FR31:** Super Admin สามารถ approve หรือ reject Cost Change Request
- **FR32:** Platform Admin สามารถ cancel Cost Change Request ที่ Pending ก่อน Super Admin approve
- **FR33:** ระบบเก็บ Cost History แบบ immutable — ทุก cost change ถูกบันทึกและห้ามแก้ไข/ลบ
- **FR34:** Platform Admin สามารถกำหนด Exchange Rate (THB ใน V1.0)

### 4. Pricing & Subscription

- **FR35:** Platform Admin สามารถตั้ง Margin 3 ระดับ (Service Code > Provider > Global) โดยระบบ resolve ตาม priority — Default 10%
- **FR36:** Platform Admin สามารถใช้ Triple Bidirectional Editing — แก้ Cost หรือ Margin% หรือ Sell Price แล้วอีก 2 ค่าคำนวณอัตโนมัติ
- **FR37:** Platform Admin สามารถสร้าง Margin Change Request เพื่อให้ Super Admin approve
- **FR38:** Platform Admin สามารถ cancel Margin Change Request ที่ Pending ก่อน Super Admin approve
- **FR39:** ระบบ auto-generate Default Snapshot บันทึกสถานะราคาปัจจุบัน
- **FR40:** Super Admin สามารถสร้าง Custom Snapshot สำหรับลูกค้า B2B (immutable, ห้ามแก้ไขหลังสร้าง)
- **FR41:** Platform Admin สามารถดูรายการ Active Snapshots ทั้งหมด (Default + Custom) พร้อมรายละเอียดและจำนวน Customers ที่ assign
- **FR42:** Platform Admin สามารถ assign/unassign Custom Snapshot ให้ Customer เฉพาะราย — Customer ที่ถูก assign ใช้ราคาจาก Snapshot, unassign กลับไปใช้ Default
- **FR43:** Platform Admin สามารถตั้ง Price Lock กำหนดราคาพิเศษสูงสุด 365 วัน — ระบบ auto-revert เมื่อหมดอายุ + แจ้งเตือน 30/7/1 วัน
- **FR44:** Platform Admin สามารถสร้าง Subscription Plans per Sub-Platform (Free/Starter/Pro) พร้อมกำหนด token quota และ features
- **FR45:** Platform Admin สามารถจัดการ Plan lifecycle (Draft → Active → Deprecated → Retired)
- **FR46:** Platform Admin สามารถกำหนด Exchange Rate per Sub-Platform (เช่น 1 token = 1 minute สำหรับ Avatar)
- **FR47:** Platform Admin สามารถ toggle Embedding Billing per customer
- **FR48:** ระบบ monitor Margin health และ alert เมื่อ Margin < threshold หลัง cost เปลี่ยน

### 5. Token & Wallet

- **FR49:** Tenant สามารถดู Universal Token Wallet balance แยกประเภท (subscription bonus tokens พร้อมวันหมดอายุ vs purchased tokens) — ใช้ได้ข้าม Sub-Platform ที่ subscribe
- **FR50:** Tenant Admin สามารถ top-up tokens — purchased tokens ไม่หมดอายุและ stack กับ balance เดิมได้
- **FR51:** ระบบ reset subscription bonus tokens ทุก billing cycle — bonus tokens ที่เหลือหายไป, purchased tokens ไม่ได้รับผลกระทบ
- **FR52:** ระบบหัก tokens ตามลำดับ: subscription bonus tokens ก่อน → purchased tokens ทีหลัง
- **FR53:** ระบบหัก tokens แบบ real-time พร้อม idempotency — เมื่อได้รับ Trace ID ซ้ำ ระบบ return cached result ไม่หัก token ซ้ำ
- **FR54:** ระบบรับประกัน token balance consistency เมื่อมี concurrent operations
- **FR55:** ระบบแจ้ง Tenant เมื่อ token balance < 20%

### 6. Billing & Payment

#### Subscription Management

- **FR56:** Tenant สามารถ subscribe plan ของ Sub-Platform ที่ต้องการ
- **FR57:** Tenant Admin สามารถ upgrade plan — ระบบคำนวณ pro-rata (จ่ายส่วนต่างตามวันที่เหลือ)
- **FR58:** Tenant Admin สามารถ downgrade plan — ระบบคำนวณ extended days (ไม่ refund แต่ขยายเวลา)
- **FR59:** ระบบ auto-renew subscription ทุก billing cycle พร้อม auto-charge
- **FR60:** ระบบเข้า Grace Period (3 วัน + retry) เมื่อ auto-payment fail ก่อน suspend subscription
- **FR61:** ระบบ enforce feature access ตาม plan tier ที่ Tenant subscribe — features ที่ไม่ได้รับสิทธิ์จะถูก block

#### Invoice & Receipt

- **FR62:** ระบบ auto-generate Invoice ตามกฎหมายบัญชีไทย (VAT 7%, format `INV-{YYYYMM}-{NNNNN}`, ห้ามข้ามเลข) รวมถึงข้อมูลบัญชีธนาคารสำหรับ Direct Bank Transfer
- **FR63:** ระบบ auto-generate Receipt เมื่อ payment ถูก verify
- **FR64:** Tenant Admin / Developer สามารถดูรายการ Invoice + Receipt ของ Tenant ตัวเอง พร้อม download PDF

#### Payment Processing

- **FR65:** Tenant สามารถชำระเงินผ่าน 3 ช่องทาง: 2C2P (Card/PromptPay), Direct Bank Transfer (อัปโหลด slip), Company QR
- **FR66:** ระบบจัดการ payment state machine (INITIATED → PROCESSING → SUCCESS/FAILED → SETTLED) พร้อม auto-retry เมื่อ fail (exponential backoff)
- **FR67:** ระบบ validate HMAC signature จาก 2C2P ก่อน process ทุก payment callback
- **FR68:** ระบบ deduplicate payment callback — callback ซ้ำ return 200 OK ไม่ process ซ้ำ
- **FR69:** Finance Admin สามารถ verify payment (Approve → Receipt auto-generated, Reject → แจ้งเหตุผล)
- **FR70:** Finance Admin สามารถ configure ข้อมูลบัญชีธนาคารสำหรับรับชำระเงิน (ชื่อบัญชี, เลขบัญชี, สาขา, PromptPay QR)

#### Credit Line

- **FR71:** Tenant Admin / Developer สามารถสมัคร Credit Line พร้อมข้อมูลบริษัทและเอกสารประกอบ
- **FR72:** Finance Admin สามารถ approve Credit Line request พร้อมกำหนด credit limit, billing cycle, payment terms
- **FR73:** Finance Admin สามารถปรับ Credit Limit (เพิ่ม/ลด) พร้อมระบุเหตุผล — ไม่สามารถลดต่ำกว่า outstanding balance
- **FR74:** ระบบ auto-generate Invoice เมื่อครบ Credit Line billing cycle
- **FR75:** ระบบ enforce Hard Block ทันทีเมื่อ Credit Line ใช้หมด — API return error
- **FR76:** ระบบแจ้ง Developer เมื่อ Credit Line available balance < 20%
- **FR77:** Finance Admin สามารถ suspend Credit Line ของ account ที่ค้างชำระ

#### Dispute & Recovery

- **FR78:** Finance Admin สามารถส่ง Collection Notice พร้อม cooldown period (ส่งซ้ำไม่ได้ภายใน 7 วัน)
- **FR79:** Finance Admin สามารถจัดการ Chargeback (Accept + reverse ledger หรือ Contest + ส่งหลักฐาน)
- **FR80:** Refund ต้องผ่าน Dual Approval (Super Admin + Finance Admin) — ระบบสร้าง Credit Note อ้างอิง Invoice ต้นทาง

#### Developer App Management

- **FR81:** Developer สามารถสร้าง App และได้รับ Client ID + Client Secret (Secret แสดงครั้งเดียว)
- **FR82:** App มี lifecycle states (Sandbox → Pending Approval → Production) โดย Sandbox/Pending Approval มี rate limit จำกัด (100 calls/day) และ Production มี rate limit ตาม plan
- **FR83:** Developer สามารถ regenerate Client Secret — Secret เดิมถูก invalidate ทันที
- **FR84:** Developer สามารถ submit App for Production พร้อมข้อมูลบริษัทและเอกสาร
- **FR85:** Platform Admin สามารถ approve หรือ reject App Production request

#### Notifications

- **FR86:** ระบบส่ง notifications ผ่าน Telegram + Email สำหรับ events: subscription renewal, payment due, low balance, payment failure, chargeback, Price Lock expiry, Credit Line alert
- **FR87:** Tenant สามารถตั้งค่า notification preferences

### 7. Financial Operations & Compliance

- **FR88:** Finance Admin สามารถดู Purchase Log — centralized view ข้าม Tenant + Sub-Platform (columns: Date, Tenant, Sub-Platform, Type, Description, Method, Amount, Status, Reference)
- **FR89:** Tenant Admin สามารถดู Purchase Log ของ Tenant ตัวเองข้าม Sub-Platform ที่ subscribe
- **FR90:** User สามารถ drill-down จาก Purchase Log: Tenant name → Tenant Detail, Reference → Transaction Detail
- **FR91:** User สามารถ filter Purchase Log ตาม Sub-Platform, Tenant, Type (Subscription/Token Top-up), Status + Search + Export (CSV/PDF)
- **FR92:** ระบบเก็บ Transaction Ledger แบบ immutable (append-only) — ห้ามแก้ไข/ลบ
- **FR93:** ระบบบันทึก audit trail ทุก financial action (who, what, when, before/after values)
- **FR94:** ระบบเก็บ financial records 7 ปีตามกฎหมายบัญชีไทย
- **FR95:** Finance Admin สามารถดู Aging Report สำหรับ overdue invoices

## Non-Functional Requirements

### Performance

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| **NFR-P1** | Token Deduction API response time | p99 < 200ms |
| **NFR-P2** | General API response time (CRUD, query) | p95 < 500ms, p99 < 1s |
| **NFR-P3** | Triple Bidirectional Editing recalculation | < 100ms (UI instant feedback) |
| **NFR-P4** | Invoice PDF generation | < 10 seconds per invoice |
| **NFR-P5** | Purchase Log / Dashboard query | < 3 seconds สำหรับ 100K+ records with pagination |
| **NFR-P6** | Payment callback processing (2C2P → system) | < 5 minutes end-to-end |
| **NFR-P7** | Hub Page initial load | < 2 seconds |
| **NFR-P8** | Health Dashboard data freshness | < 5 minutes (near real-time) |
| **NFR-P9** | Concurrent users | 50+ admin users, 500+ tenant users simultaneously |

### Security

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| **NFR-S1** | Encryption at rest | AES-256 สำหรับ financial data + credentials |
| **NFR-S2** | Encryption in transit | TLS 1.2+ ทุก connection (internal + external) |
| **NFR-S3** | PCI-DSS compliance | Zero card data stored ในระบบ — delegate ให้ 2C2P |
| **NFR-S4** | Client Secret storage | bcrypt hashed, ห้ามเก็บ plaintext |
| **NFR-S5** | API Key storage | SHA-256 hashed, prefix-based lookup |
| **NFR-S6** | JWT signing | RS256, configurable expiry, refresh token rotation |
| **NFR-S7** | Account lockout | 5 failed login → lock 30 นาที |
| **NFR-S8** | Auth endpoint rate limiting | Prevent brute force attack |
| **NFR-S9** | Payment callback validation | HMAC signature verified ก่อน process ทุก callback |
| **NFR-S10** | Audit log integrity | Tamper-evident, append-only — ห้ามแก้ไข/ลบ |
| **NFR-S11** | PDPA compliance | Personal data deletion within 30 days เมื่อ decommission (ยกเว้น financial records 7 ปี) |
| **NFR-S12** | CORS policy | Strict origin policy per Sub-Platform domain |
| **NFR-S13** | Tenant data isolation | Zero cross-tenant data access — enforce ทุก layer (API → Service → DB) |

### Reliability & Availability

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| **NFR-R1** | Billing Service uptime | 99.9% (< 8.76 ชั่วโมง downtime/ปี) |
| **NFR-R2** | Price Engine availability | 99.9%, queue & retry เมื่อ downstream fail |
| **NFR-R3** | Cost Data availability | 24/7 — Price Engine dependency |
| **NFR-R4** | Payment processing guarantee | At-least-once delivery พร้อม idempotency dedup |
| **NFR-R5** | Idempotency | Trace ID (UUID v4), Cache TTL 24h — ยิงซ้ำได้ผลเดิม |
| **NFR-R6** | Payment callback dedup | DB unique constraint + Cache TTL 48h |
| **NFR-R7** | Data backup | Automated daily backup, point-in-time recovery |
| **NFR-R8** | Disaster recovery | RTO < 4 ชั่วโมง, RPO < 1 ชั่วโมง สำหรับ financial data |
| **NFR-R9** | Zero data loss | Financial transactions ต้องไม่สูญหาย — WAL + replication |
| **NFR-R10** | Immutable Ledger | Transaction, Invoice, Receipt, Cost History, Snapshots — append-only, zero delete |
| **NFR-R11** | Data retention | 7 ปี สำหรับ financial records ตามกฎหมายบัญชีไทย |
| **NFR-R12** | Grace Period retry | Auto-retry 3 ครั้ง (exponential backoff: 1h, 4h, 12h) ก่อน ABANDONED |

### Scalability

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| **NFR-SC1** | Initial capacity | 100+ tenants, 5+ Sub-Platforms |
| **NFR-SC2** | Growth target | 1,000+ tenants within 24 เดือน โดย performance degradation < 10% |
| **NFR-SC3** | Transaction volume | Database partition strategy สำหรับ > 10M transactions per Sub-Platform |
| **NFR-SC4** | Token Deduction scaling | Horizontally scalable (stateless service) — เพิ่ม instance ไม่ต้อง redesign |
| **NFR-SC5** | Purchase Log | Efficient query ที่ 1M+ records พร้อม pagination + filtering |

### Observability

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| **NFR-O1** | Distributed tracing | ทุก billing request มี trace ID ตั้งแต่ Gateway → Service → DB |
| **NFR-O2** | Business metrics | Token deduction rate, payment success rate, invoice generation rate, collection rate |
| **NFR-O3** | Alerting | แจ้งเตือนทันทีเมื่อ SLA breach (Billing uptime, Token latency, Payment failure rate) |
| **NFR-O4** | Log retention | 90 วัน hot storage, 1 ปี cold storage |
| **NFR-O5** | Health Dashboard data source | OTEL pipeline (existing) → Prometheus + Grafana |
