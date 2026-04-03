# Product Requirements Document (PRD)
# Cross-Cutting Concern X-MT-01: Multi-Tenancy Platform

## Document Information

| Field | Value |
|-------|-------|
| Document ID | PRD-X-MT-01 |
| Document Type | Cross-Cutting Concern PRD |
| Version | 1.0.0 |
| Status | Draft |
| Author | BA-Agent |
| Created Date | 2026-02-16 |
| Last Updated | 2026-02-16 |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-16 | BA-Agent | Initial version - Sections 1-7: Executive Summary, Problem Statement, Sub-Platform Model, Tenant Model, Tenant Lifecycle & Registration, Universal Token System, Subscription Plans |

---

## 1. Executive Summary

### 1.1 Purpose

PRD-X-MT-01 (Multi-Tenancy Platform) เป็น **Cross-Cutting Concern** ที่กำหนดสถาปัตยกรรมระดับ Business สำหรับการขยาย Realfact API Platform จาก **Single-Product Platform** ไปเป็น **Multi-Product SaaS Platform with Sub-Platforms**

เอกสารฉบับนี้ครอบคลุม Business Decisions และ Requirements สำหรับ:
- **Sub-Platform Model** -- นิยาม Sub-Platform, การจัดการ Registry, Configuration, และ Lifecycle
- **Tenant Model** -- กลยุทธ์การแยกข้อมูล (Data Isolation) ระดับ Business และการระบุตัวตน Tenant
- **Tenant Lifecycle & Registration** -- การลงทะเบียนผ่าน Sub-Platform Landing, SSO, GDPR/PDPA
- **Universal Token System** -- ระบบ Token กลาง 1 ประเภท พร้อม Exchange Rate ต่อ Sub-Platform
- **Subscription Plans** -- โครงสร้าง Plan แบบ Per Sub-Platform, Upgrade/Downgrade Rules

> **Note:** เอกสารฉบับนี้เป็น **Business Requirements** เท่านั้น -- Technical Architecture, API Specifications, Database Schema จะถูกออกแบบโดย Developer Team

### 1.2 Scope

| Aspect | Description |
|--------|-------------|
| **In Scope** | 3-Layer Architecture (Central Platform / Sub-Platforms / Tenants), Sub-Platform Registry & Configuration (M-BE-12 NEW), Tenant Registration per Sub-Platform Landing + SSO, Universal Token System (1 token type, per-Sub-Platform exchange rates), Token Wallet & Top-up, Subscription Plans per Sub-Platform, Plan Upgrade/Downgrade (pro-rata credit + extended service days), White-label V1 (Logo + Theme + Favicon), Notification (Telegram + Email), Payment Methods (Multi-channel: 2C2P Gateway, Direct Transfer, Company QR), Tenant Decommissioning & GDPR/PDPA, Integration with existing modules (M-BE-05/06/07 extend) |
| **Out of Scope** | Partner/Reseller management (Realfact-only management), B2C individual billing, Sub-Platform auto-provisioning (V2), Advanced white-label (custom domain, email templates -- V2), Multi-currency billing (V2), Partner Sub-Platform management (V2), Marketplace/App Store features, AI Framework changes (M-FW-01) |

### 1.3 Target Users

| User Type | Type | Description | Access Method |
|-----------|------|-------------|---------------|
| **Central Admin** | Internal | Realfact Platform Admin -- จัดการ Sub-Platform Registry, Global Config, Token Exchange Rates, Subscription Plans | Internal Portal (Backoffice) |
| **Tenant Admin** | External | ผู้ดูแลระบบฝั่งลูกค้า -- สมัคร Sub-Platform, จัดการ Subscription, เติม Token, ดู Usage | Sub-Platform Landing + Developer Portal |
| **Developer** | External | Developer ของ Tenant -- ใช้ API ของ Sub-Platform ที่ Tenant สมัครไว้ | Developer Portal + API |

### 1.4 Relationship to CTO SaaS Platform PRD

เอกสารฉบับนี้ **ขยาย** จาก CTO's SaaS Platform PRD โดยมีความสัมพันธ์ดังนี้:

| CTO PRD Concept | X-MT-01 Decision | Status |
|-----------------|-------------------|--------|
| Multi-Tenant (Separate DB per Tenant) | Separate DB Schema per **Sub-Platform** + Central Config DB | Extended |
| White-label | V1: Logo + Theme + Favicon only | Partial (V1) |
| Subscription | Per Sub-Platform Plans + Universal Token | Extended |
| Notifications | Telegram + Email | Compatible |
| Payment Methods | Multi-channel: 2C2P Gateway + Direct Bank Transfer + Company QR | Decided |
| Partner Management | Realfact-only (no partners V1) | Simplified |

**Compatibility Analysis Summary:**

| Category | Count | Details |
|----------|-------|---------|
| Compatible (ใช้ได้ทันที) | 2 | Notification, White-label V1 |
| Partial (ต้อง adapt) | 5 | Multi-Tenant model, Subscription, Registration, Billing, RBAC |
| Extended (ต้องขยาย) | 1 | Token System (Universal Token) |
| Gap (ต้องสร้างใหม่) | 1 | Sub-Platform Registry (M-BE-12 NEW) |

### 1.5 Sub-Platform Examples

| Sub-Platform | Domain | Description | Token Usage Example |
|-------------|--------|-------------|---------------------|
| **Avatar** (Live Interact Avatar) | avatar.realfact.ai | AI Avatar สำหรับ Live Interaction | 1 token = 1 นาที avatar session |
| **Booking** | booking.realfact.ai | ระบบจอง AI-powered | 1 token = 1 booking transaction |
| **Social Listening** | social.realfact.ai | วิเคราะห์ Social Media ด้วย AI | 1 token = 100 mentions analyzed |
| **AI Live Commerce** | commerce.realfact.ai | AI สำหรับ Live Commerce | 1 token = 1 นาที live session |
| **MRP** | mrp.realfact.ai | Manufacturing Resource Planning ด้วย AI | 1 token = 1 production plan |

> **Note:** Exchange rates ข้างต้นเป็นตัวอย่าง Mock Data -- อัตราจริงกำหนดโดย Business Team ผ่าน M-BE-05 (Cost Engine)

---

## 2. Problem Statement

### 2.1 Current State

- Realfact API Platform เป็น **Single-Product Platform** ที่รองรับ AI Agent Services เพียงรูปแบบเดียว
- ไม่มีกลไกรองรับ **หลาย Product Lines** (Sub-Platforms) ภายใต้ Platform เดียว
- Tenant สมัครได้เฉพาะ Developer Portal เดียว -- ไม่มี Per-Product Landing Page
- ระบบ Billing เป็นแบบ Single-product -- ไม่รองรับ Subscription Plans ต่อ Sub-Platform
- Token System ผูกกับ AI Agent Services โดยตรง -- ไม่มี Universal Token ที่ใช้ข้าม Sub-Platform
- ไม่มีระบบ SSO ข้าม Sub-Platform -- Tenant ต้องสมัครแยกทุก Product
- ไม่มี White-label capability สำหรับ Sub-Platform branding
- ไม่มี Central Config DB สำหรับจัดการ Sub-Platform Registry

### 2.2 Desired State

- Realfact เป็น **Multi-Product SaaS Platform** ที่รองรับหลาย Sub-Platform ภายใต้ Brand เดียว
- แต่ละ Sub-Platform มี **Landing Page, Subscription Plans, Exchange Rate, และ Business Data แยกกัน**
- Tenant สมัครผ่าน **Sub-Platform Landing** แต่ใช้ **SSO shared account** ข้าม Sub-Platforms
- มี **Universal Token** 1 ประเภท ที่แลกเปลี่ยนเป็นบริการต่างๆ ตาม Exchange Rate ของแต่ละ Sub-Platform
- มี **Subscription Plans per Sub-Platform** พร้อม Upgrade/Downgrade ที่ยุติธรรม
- มี **White-label V1** (Logo + Theme + Favicon) สำหรับ Sub-Platform branding
- มี **Central Config DB** จัดการ Tenant Registry, SSO, Token Wallet, Payment Records, Subscription Plans
- Payment ผ่าน **3 ช่องทาง** (2C2P Gateway / โอนตรง+สลิป / QR บริษัท) พร้อม Notification ผ่าน **Telegram + Email**

### 2.3 Business Impact

| Impact Area | Current | Expected | Improvement |
|-------------|---------|----------|-------------|
| Product Lines | 1 product (AI Agent) | 5+ Sub-Platforms | Multi-product revenue |
| Revenue per Tenant | Single subscription | Multiple subscriptions (per Sub-Platform) | Revenue expansion |
| Tenant Onboarding | Single portal, manual | Per Sub-Platform landing + SSO | Faster onboarding |
| Billing Flexibility | Fixed pricing | Subscription + Token top-up per Sub-Platform | Flexible pricing |
| Brand Customization | ไม่มี | Logo + Theme + Favicon per Sub-Platform | Brand differentiation |
| Operational Efficiency | แยกระบบ | Centralized management | Unified operations |

---

# ===================================================================
# PART A: PLATFORM ARCHITECTURE (Business Decisions)
# สถาปัตยกรรม Platform ระดับ Business
# ===================================================================

## 3. Sub-Platform Model

### 3.1 What is a Sub-Platform

**Sub-Platform** คือ Product Line แต่ละตัวที่ทำงานภายใต้ Realfact Central Platform โดยมีคุณสมบัติ:

| Attribute | Description |
|-----------|-------------|
| **Identity** | มี domain เฉพาะ (e.g., avatar.realfact.ai), Logo, Theme, Favicon |
| **Business Data** | มี DB Schema แยกจาก Sub-Platform อื่น |
| **Plans** | มี Subscription Plans เฉพาะตัว (จำนวน Tier, ราคา, Token allocation) |
| **Exchange Rate** | มี Token Exchange Rate เฉพาะ (กำหนดใน M-BE-05) |
| **Landing Page** | มี Registration/Landing Page เฉพาะสำหรับ Tenant สมัคร |
| **Invoice** | ออก Invoice แยกจาก Sub-Platform อื่น |

**Sub-Platform Lifecycle:**

```
[Created] --> [Configuration] --> [Active] --> [Maintenance] --> [Sunset]
     |              |                |               |               |
     v              v                v               v               v
  Admin สร้าง   ตั้งค่า Domain,   เปิดให้ Tenant  ปิดรับ Tenant    ปิด Sub-Platform
  Sub-Platform   Plans, Branding   สมัครและใช้งาน   ใหม่ (existing  (migrate/archive
  record         Exchange Rate                      ยังใช้ได้)      data)
```

**3-Layer Architecture Overview:**

```
+=====================================================================+
|  Level 1: CENTRAL PLATFORM (Realfact)                                |
|  +---------------------------------------------------------------+  |
|  | Identity & SSO | Token Wallet | Payment Methods (Multi-channel) |  |
|  | Central Config DB: tenant registry, SSO accounts,             |  |
|  | token wallet, payment records, subscription plans             |  |
|  +---------------------------------------------------------------+  |
+=====================================================================+
         |              |              |              |
         v              v              v              v
+==============+ +==============+ +==============+ +==============+
| Level 2:     | | Level 2:     | | Level 2:     | | Level 2:     |
| SUB-PLATFORM | | SUB-PLATFORM | | SUB-PLATFORM | | SUB-PLATFORM |
| Avatar       | | Booking      | | Social       | | Commerce     |
| ------------ | | ------------ | | ------------ | | ------------ |
| Own DB       | | Own DB       | | Own DB       | | Own DB       |
| Own Plans    | | Own Plans    | | Own Plans    | | Own Plans    |
| Own Rate     | | Own Rate     | | Own Rate     | | Own Rate     |
| Own Landing  | | Own Landing  | | Own Landing  | | Own Landing  |
+==============+ +==============+ +==============+ +==============+
         |              |              |              |
         v              v              v              v
+=====================================================================+
|  Level 3: TENANTS (shared identity across Sub-Platforms)             |
|  +---------------------------------------------------------------+  |
|  | Tenant A: Avatar + Booking subscriptions                      |  |
|  | Tenant B: Avatar only                                         |  |
|  | Tenant C: Social + Commerce + MRP subscriptions               |  |
|  +---------------------------------------------------------------+  |
+=====================================================================+
```

### 3.2 Sub-Platform Registry -- US-AMT.1

#### US-AMT.1: Manage Sub-Platform Registry

**As a** Central Admin
**I want** to create, view, edit, and manage Sub-Platform records in the registry
**So that** I can control which products are available on the Realfact platform and their configurations

**Acceptance Criteria:**
- [ ] ฉันสามารถดูรายการ Sub-Platform ทั้งหมดในระบบ (Registry List)
- [ ] ฉันเห็นข้อมูลของแต่ละ Sub-Platform:
  - [ ] Sub-Platform Name (e.g., "Avatar", "Booking")
  - [ ] Display Name (e.g., "Live Interact Avatar")
  - [ ] Domain (e.g., avatar.realfact.ai)
  - [ ] Status (Created / Active / Maintenance / Sunset)
  - [ ] Tenant Count (จำนวน Tenant ที่สมัครอยู่)
  - [ ] Created Date
- [ ] ฉันสามารถสร้าง Sub-Platform ใหม่ได้:
  - [ ] กรอก Name, Display Name, Domain
  - [ ] ระบบตรวจสอบ Domain ไม่ซ้ำ
  - [ ] Sub-Platform เริ่มต้นที่สถานะ Created
- [ ] ฉันสามารถแก้ไข Sub-Platform ที่มีสถานะ Created หรือ Active ได้:
  - [ ] แก้ไข Display Name, Description
  - [ ] ไม่สามารถเปลี่ยน Domain หลัง Active (ต้อง Sunset แล้วสร้างใหม่)
- [ ] ฉันสามารถเปลี่ยน Status ตาม Lifecycle ได้:
  - [ ] Created --> Active (เปิดให้ Tenant สมัคร)
  - [ ] Active --> Maintenance (ปิดรับ Tenant ใหม่)
  - [ ] Maintenance --> Active (เปิดรับ Tenant ใหม่อีกครั้ง)
  - [ ] Maintenance --> Sunset (เริ่มกระบวนการปิด Sub-Platform)
- [ ] ระบบบันทึก Audit Log ทุกการเปลี่ยนแปลง

**UI/UX Notes:**

```
+------------------------------------------------------------------------+
| Sub-Platform Registry                                                   |
+------------------------------------------------------------------------+
| [+ Create Sub-Platform]                                                 |
+------------------------------------------------------------------------+
| Name          | Display Name           | Domain              | Status  |
|---------------|------------------------|---------------------|---------|
| avatar        | Live Interact Avatar   | avatar.realfact.ai  | Active  |
| booking       | AI Booking             | booking.realfact.ai | Active  |
| social        | Social Listening       | social.realfact.ai  | Created |
| commerce      | AI Live Commerce       | commerce.realfact.ai| Created |
| mrp           | AI MRP                 | mrp.realfact.ai     | Created |
+------------------------------------------------------------------------+
| Showing 1-5 of 5                                                        |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-AMT.1: Sub-Platform Name และ Domain ต้องไม่ซ้ำในระบบ
- BR-AMT.2: Domain ไม่สามารถเปลี่ยนได้หลังจาก Sub-Platform เป็น Active (มี Tenant สมัครแล้ว)
- BR-AMT.3: ไม่สามารถ Sunset Sub-Platform ที่ยังมี Active Tenant ที่มี Subscription อยู่ -- ต้อง migrate หรือ cancel ก่อน

**Out of Scope:**
- Partner/Reseller สร้าง Sub-Platform (V2 -- Realfact only ใน V1)
- Auto-provisioning infrastructure สำหรับ Sub-Platform ใหม่ (Developer Team จัดการ)
- Custom domain mapping (V2)

---

### 3.3 Sub-Platform Configuration -- US-AMT.2

#### US-AMT.2: Configure Sub-Platform Settings

**As a** Central Admin
**I want** to configure branding, notification, and payment settings for each Sub-Platform
**So that** each Sub-Platform has its own identity and operational settings

**Acceptance Criteria:**
- [ ] ฉันสามารถตั้งค่า **Branding (White-label V1)** ของแต่ละ Sub-Platform:
  - [ ] Logo (Upload -- JPG/PNG, max 1MB)
  - [ ] Theme Color (Primary, Secondary, Accent)
  - [ ] Favicon (Upload -- ICO/PNG, max 256KB)
- [ ] ฉันสามารถตั้งค่า **Notification** ของแต่ละ Sub-Platform:
  - [ ] Email Sender Name (e.g., "Realfact Avatar")
  - [ ] Email Sender Address (e.g., noreply@avatar.realfact.ai)
  - [ ] Telegram Bot Token (สำหรับส่ง notification ผ่าน Telegram)
- [ ] ฉันสามารถดู Preview ของ Branding ก่อน Save ได้
- [ ] การเปลี่ยน Branding มีผลทันทีหลัง Save (Tenant เห็นการเปลี่ยนแปลง)
- [ ] ระบบบันทึก Audit Log ทุกการเปลี่ยนแปลง Configuration

**UI/UX Notes:**

```
+------------------------------------------------------------------------+
| Sub-Platform Configuration: Live Interact Avatar                        |
+------------------------------------------------------------------------+
| [Branding] [Notification] [Preview]                                     |
+------------------------------------------------------------------------+
|                                                                         |
| Branding Settings (White-label V1)                                      |
| +-----------------------------------------------------------------+    |
| | Logo:          [avatar-logo.png] [Upload] [Remove]               |    |
| | Primary Color: [#FF6B35] [Color Picker]                          |    |
| | Secondary:     [#1E3A5F] [Color Picker]                          |    |
| | Accent:        [#00D4AA] [Color Picker]                          |    |
| | Favicon:       [avatar-fav.ico] [Upload] [Remove]                |    |
| +-----------------------------------------------------------------+    |
|                                                                         |
| [Cancel]                                              [Save Changes]   |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-AMT.4: Logo ต้องเป็น JPG/PNG ขนาดไม่เกิน 1MB
- BR-AMT.5: Favicon ต้องเป็น ICO/PNG ขนาดไม่เกิน 256KB
- BR-AMT.6: Theme Color ต้องเป็น valid HEX color code
- BR-AMT.7: Notification settings ต้องผ่าน validation (valid email format, valid Telegram bot token)

**Out of Scope:**
- Custom email templates per Sub-Platform (V2)
- Custom domain SSL certificates (V2)
- Advanced white-label (custom CSS, layout changes -- V2)
- SMS notification channel (V2)

---

### 3.4 Sub-Platform Business Rules

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-AMT.1 | Sub-Platform Name และ Domain ต้องไม่ซ้ำในระบบ | US-AMT.1 |
| BR-AMT.2 | Domain ไม่สามารถเปลี่ยนได้หลังจาก Sub-Platform เป็น Active | US-AMT.1 |
| BR-AMT.3 | ไม่สามารถ Sunset Sub-Platform ที่ยังมี Active Tenant ที่มี Subscription อยู่ | US-AMT.1 |
| BR-AMT.4 | Logo ต้องเป็น JPG/PNG ขนาดไม่เกิน 1MB | US-AMT.2 |
| BR-AMT.5 | Favicon ต้องเป็น ICO/PNG ขนาดไม่เกิน 256KB | US-AMT.2 |
| BR-AMT.6 | Theme Color ต้องเป็น valid HEX color code | US-AMT.2 |
| BR-AMT.7 | Notification settings ต้อง valid (email format, Telegram bot token) | US-AMT.2 |
| BR-AMT.8 | Sub-Platform management เป็นหน้าที่ของ Realfact เท่านั้น (ไม่มี partner ใน V1) | US-AMT.1, US-AMT.2 |
| BR-AMT.9 | แต่ละ Sub-Platform มี DB Schema แยก + เชื่อมกับ Central Config DB | All |
| BR-AMT.10 | Invoice ออกแยกต่อ Sub-Platform (Tenant ที่สมัครหลาย Sub-Platform ได้รับหลาย Invoice) | All |

#### Edge Cases

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AMT.1 | State | Admin พยายามเปลี่ยน Domain ของ Active Sub-Platform | ไม่สามารถดำเนินการได้ | แสดงข้อความ: "ไม่สามารถเปลี่ยน Domain ได้หลังจาก Sub-Platform เปิดใช้งานแล้ว" |
| EC-AMT.2 | State | Admin พยายาม Sunset Sub-Platform ที่ยังมี Active Tenant | ไม่สามารถ Sunset ได้ | แสดงข้อความ: "มี Tenant [X] รายยังใช้งานอยู่ กรุณา migrate หรือ cancel ก่อน" พร้อมแสดงรายชื่อ Tenant |
| EC-AMT.3 | Data Boundary | สร้าง Sub-Platform ด้วย Domain ที่ซ้ำ | ไม่สามารถสร้างได้ | แสดง validation: "Domain นี้ถูกใช้แล้ว กรุณาใช้ Domain อื่น" |
| EC-AMT.4 | Integration | Telegram Bot Token ไม่ถูกต้อง | Notification ทาง Telegram ไม่ทำงาน | แสดง warning เมื่อ Test Connection ล้มเหลว: "Telegram Bot Token ไม่ถูกต้อง กรุณาตรวจสอบ" |
| EC-AMT.5 | State | Admin เปลี่ยน Theme Color ขณะที่ Tenant กำลังใช้งาน | Tenant อาจเห็น UI เปลี่ยนกะทันหัน | Branding change มีผลทันที -- แต่ browser cache อาจทำให้ Tenant เห็นการเปลี่ยนแปลงหลัง refresh |
| EC-AMT.6 | Data Boundary | ไม่มี Sub-Platform ใดในระบบ (first-time setup) | Registry ว่างเปล่า | แสดง empty state: "ยังไม่มี Sub-Platform กรุณาสร้าง Sub-Platform แรก" พร้อมปุ่ม [+ Create] |

### 3.5 Sub-Platform Error Scenarios

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Domain ซ้ำ | Validation | Medium | สร้าง Sub-Platform ด้วย Domain ที่มีอยู่แล้ว | "Domain นี้ถูกใช้แล้วในระบบ" | ใช้ Domain อื่น |
| Logo เกินขนาด | Validation | Low | Upload Logo > 1MB | "ขนาดไฟล์เกิน 1MB กรุณาเลือกไฟล์ที่เล็กกว่า" | เลือกไฟล์ใหม่ |
| Logo ผิดประเภท | Validation | Low | Upload Logo ที่ไม่ใช่ JPG/PNG | "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น" | เลือกไฟล์ JPG/PNG |
| HEX color ไม่ถูกต้อง | Validation | Low | กรอก color code ผิด format | "กรุณากรอก HEX color code ที่ถูกต้อง (e.g., #FF6B35)" | กรอก HEX code ที่ถูกต้อง |
| Sunset มี Active Tenant | Business Rule | High | พยายาม Sunset Sub-Platform ที่ยังมี Active Tenant | "ไม่สามารถปิด Sub-Platform ได้ มี [X] Tenant ยังใช้งานอยู่" | Migrate หรือ cancel Tenant ก่อน |
| เปลี่ยน Domain หลัง Active | Business Rule | High | พยายามเปลี่ยน Domain ของ Active Sub-Platform | "ไม่สามารถเปลี่ยน Domain ได้หลังจาก Sub-Platform เปิดใช้งานแล้ว" | ต้อง Sunset แล้วสร้างใหม่ |
| Telegram Test Connection ล้มเหลว | Integration | Medium | กด Test Connection แต่ Bot Token ไม่ถูกต้อง | "ไม่สามารถเชื่อมต่อ Telegram Bot ได้ กรุณาตรวจสอบ Token" | ตรวจสอบ Bot Token แล้วลองใหม่ |
| บันทึก Config ล้มเหลว | System | High | กด Save Changes แต่ระบบเกิดข้อผิดพลาด | "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง" | กด Retry หรือติดต่อ Admin |

---

## 4. Tenant Model

### 4.1 What is a Tenant

ใน Multi-Product SaaS Platform ของ Realfact, **Tenant** คือองค์กร/บริษัทที่สมัครใช้งาน โดยมีคุณสมบัติ:

| Attribute | Description |
|-----------|-------------|
| **Identity** | Tenant มี account เดียวที่ใช้ข้าม Sub-Platform ทั้งหมด (SSO) |
| **Subscriptions** | Tenant สามารถสมัคร **หลาย Sub-Platform** พร้อมกัน (e.g., Avatar + Booking) |
| **Token Wallet** | Tenant มี Token Wallet **กลาง** ที่ใช้ได้กับทุก Sub-Platform (Universal Token) |
| **Invoice** | Tenant ได้รับ Invoice **แยกต่อ Sub-Platform** |
| **Data Isolation** | ข้อมูลธุรกิจของ Tenant ถูกแยกตาม Sub-Platform (แต่ละ Sub-Platform มี DB Schema แยก) |
| **Lifecycle** | Tenant มี lifecycle แยกต่อ Sub-Platform (Active ใน Avatar แต่ Suspended ใน Booking ได้) |

**Tenant vs. M-BE-04 (Customer):**

| Aspect | M-BE-04 (Current) | X-MT-01 (Multi-Product) |
|--------|-------------------|-------------------------|
| Scope | Single-product Tenant | Multi-product Tenant |
| Registration | Developer Portal เดียว | Per Sub-Platform Landing + SSO |
| Subscription | ไม่มี Plan | Per Sub-Platform Plans |
| Token | ผูกกับ AI Agent | Universal Token + Exchange Rate |
| Invoice | Invoice เดียว | Invoice แยกต่อ Sub-Platform |
| Lifecycle | Global lifecycle | Per Sub-Platform lifecycle + Global lifecycle |

> **Note:** M-BE-04 ยังคงเป็น Module หลักในการจัดการ Tenant -- X-MT-01 ขยายความสามารถของ M-BE-04 ให้รองรับ Multi-Product

### 4.2 Data Isolation Strategy (Business Level)

> **Note:** Database architecture และ schema design จะถูกออกแบบโดย Developer Team ส่วนนี้อธิบายเฉพาะ Business Requirements ของ Data Isolation

**Isolation Requirements:**

| Layer | Isolation Strategy | Business Reason |
|-------|-------------------|-----------------|
| **Central Platform** | ข้อมูล shared ทุก Sub-Platform: Tenant Registry, SSO Accounts, Token Wallet, Payment Records, Subscription Plans | Tenant ต้องมี Single Sign-On และ Token Wallet กลาง |
| **Sub-Platform** | ข้อมูลแยกต่อ Sub-Platform: Business Data, Usage Data, Service Configuration | แต่ละ Sub-Platform มีข้อมูลธุรกิจที่ต่างกัน -- ไม่ควรปนกัน |
| **Tenant** | ข้อมูลแยกต่อ Tenant ภายใน Sub-Platform เดียวกัน | Tenant ต้องไม่เห็นข้อมูลของ Tenant อื่นในทุกกรณี |

**Isolation Diagram (Business View):**

```
+================================================================+
|  CENTRAL CONFIG (Shared across all Sub-Platforms)               |
|  +-----------------------------------------------------------+ |
|  | Tenant Registry: Tenant A, Tenant B, Tenant C             | |
|  | SSO Accounts: user1@a.com, user2@b.com, user3@c.com       | |
|  | Token Wallets: Wallet-A (5,000 tokens), Wallet-B (2,000)  | |
|  | Payment Records: Payment-001, Payment-002                  | |
|  | Subscription Plans: Avatar-Starter, Avatar-Pro, ...        | |
|  +-----------------------------------------------------------+ |
+================================================================+
         |                           |
         v                           v
+========================+  +========================+
|  Avatar DB Schema      |  |  Booking DB Schema     |
|  +------------------+  |  |  +------------------+  |
|  | Tenant A Data    |  |  |  | Tenant A Data    |  |
|  | - Avatar configs |  |  |  | - Booking records|  |
|  | - Session logs   |  |  |  | - Schedule data  |  |
|  +------------------+  |  |  +------------------+  |
|  +------------------+  |  |  +------------------+  |
|  | Tenant B Data    |  |  |  | Tenant C Data    |  |
|  | - Avatar configs |  |  |  | - Booking records|  |
|  +------------------+  |  |  +------------------+  |
+========================+  +========================+
```

**Business Rules สำหรับ Data Isolation:**

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-AMT.11 | Tenant ต้องไม่สามารถเข้าถึงข้อมูลของ Tenant อื่นได้ในทุกกรณี | All |
| BR-AMT.12 | ข้อมูลธุรกิจของ Sub-Platform ต้องแยกจากกัน -- Avatar data ต้องไม่ปนกับ Booking data | All |
| BR-AMT.13 | Central Config (SSO, Token Wallet, Payment) เป็นข้อมูล shared ที่ Tenant เข้าถึงได้เฉพาะของตนเอง | All |
| BR-AMT.14 | เมื่อ Tenant ถูก Decommission จาก Sub-Platform หนึ่ง ข้อมูลใน Sub-Platform อื่นต้องไม่ได้รับผลกระทบ | All |

### 4.3 Tenant Identification (Subdomain + SSO)

Tenant ถูกระบุตัวตนผ่าน 2 กลไก:

**1. Subdomain-based Identification:**
- Tenant เข้าถึง Sub-Platform ผ่าน subdomain ของ Sub-Platform นั้น (e.g., avatar.realfact.ai)
- ระบบระบุว่า Tenant กำลังใช้ Sub-Platform ไหนจาก Domain

**2. SSO Shared Account:**
- Tenant สร้าง Account ครั้งเดียว แล้วใช้ Login เข้าทุก Sub-Platform ที่สมัครไว้
- Account ผูกกับ Email ของ Tenant Admin (Central Identity)
- เมื่อ Login ที่ Sub-Platform หนึ่ง สามารถ Switch ไป Sub-Platform อื่นได้โดยไม่ต้อง Login ใหม่

**Identification Flow:**

```
Tenant Admin เปิด avatar.realfact.ai
         |
         v
[ระบบตรวจ Domain] --> avatar Sub-Platform
         |
         v
[SSO Login Page] --> กรอก Email + Password
         |
         v
[ระบบตรวจ Central Identity] --> Tenant A
         |
         v
[ตรวจ Subscription] --> Tenant A มี Avatar Subscription?
         |                           |
         v (Yes)                     v (No)
[เข้าสู่ Avatar Dashboard]    [แสดงหน้า Subscribe]
                                "คุณยังไม่ได้สมัคร Avatar
                                 กรุณาเลือก Plan"
```

#### Edge Cases

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AMT.7 | State | Tenant มี Active subscription ใน Avatar แต่ถูก Suspended ใน Booking | Tenant ใช้ Avatar ได้ปกติ แต่เข้า Booking ไม่ได้ | แสดงสถานะแยกต่อ Sub-Platform -- Booking แสดง "Account Suspended" พร้อมเหตุผล |
| EC-AMT.8 | Integration | SSO service ล่มชั่วคราว | Tenant ไม่สามารถ Login ได้ทุก Sub-Platform | แสดง error page: "ระบบ Login ขัดข้อง กรุณาลองอีกครั้งภายหลัง" |
| EC-AMT.9 | Data Boundary | Tenant สมัคร Sub-Platform เดียว แล้วพยายามเข้า Sub-Platform อื่น | ไม่มี subscription | แสดงหน้า "คุณยังไม่ได้สมัคร [Sub-Platform Name] กรุณาเลือก Plan" |
| EC-AMT.10 | State | Tenant Admin ลบ account (Central) ขณะมี Active subscriptions หลาย Sub-Platform | subscriptions ทั้งหมดต้องถูกจัดการ | ต้อง Cancel ทุก subscription ก่อนลบ account -- แสดง warning: "คุณมี Active Subscriptions [X] รายการ กรุณา Cancel ก่อนลบ Account" |

---

## 5. Tenant Lifecycle & Registration

### 5.1 Registration Flow -- US-CMT.1

#### US-CMT.1: Register for Sub-Platform

**As a** Tenant Admin
**I want** to register and create an account through a Sub-Platform's landing page
**So that** I can subscribe to that Sub-Platform's services

**Acceptance Criteria:**
- [ ] ฉันเข้าถึง Landing Page ของ Sub-Platform ผ่าน Domain เฉพาะ (e.g., avatar.realfact.ai)
- [ ] Landing Page แสดง Branding ของ Sub-Platform นั้น (Logo, Theme, Favicon)
- [ ] ฉันเห็น Subscription Plans ที่มีให้เลือก (e.g., Starter, Pro, Enterprise)
- [ ] ฉันสามารถ Register ด้วย:
  - [ ] Email Address (ใช้เป็น SSO identifier)
  - [ ] Password (ตาม password policy)
  - [ ] Company Name
  - [ ] Contact Person Name
  - [ ] Contact Phone
- [ ] ระบบตรวจสอบว่า Email นี้มี Account อยู่แล้วหรือไม่:
  - [ ] **ใหม่:** สร้าง Central Account (รอเลือก Plan + ชำระเงินในขั้นตอนถัดไป)
  - [ ] **มีอยู่แล้ว:** Prompt Login แล้ว Link Subscription ใหม่ (ดู US-CMT.2)
- [ ] หลัง Register สำเร็จ:
  - [ ] ฉันเลือก Subscription Plan
  - [ ] ฉันชำระเงินผ่านช่องทางที่เลือก: 2C2P / โอนตรง+สลิป / QR บริษัท (ถ้าเป็น Paid plan)
  - [ ] ระบบสร้าง Subscription record + Tenant record ในสถานะ Pending (รอ Admin Approve)
  - [ ] ฉันได้รับ Email ยืนยันการสมัคร + แจ้งว่ารอ Admin Approve
  - [ ] ฉันได้รับ Telegram notification (ถ้าเปิดใช้)

**UI/UX Notes:**

**Sub-Platform Landing Page:**
```
+------------------------------------------------------------------------+
| [Avatar Logo]  Live Interact Avatar              [Login] [Register]    |
+------------------------------------------------------------------------+
|                                                                         |
|   AI Avatar สำหรับ Live Interaction                                    |
|   สร้างประสบการณ์สนทนาแบบ Real-time กับ AI Avatar                    |
|                                                                         |
|   +------------------+ +------------------+ +------------------+       |
|   | Starter          | | Pro              | | Enterprise       |       |
|   | 990 THB/mo       | | 4,990 THB/mo     | | 14,990 THB/mo    |       |
|   |                  | |                  | |                  |       |
|   | 500 tokens/mo    | | 3,000 tokens/mo  | | 15,000 tokens/mo |       |
|   | 1 avatar         | | 5 avatars        | | Unlimited        |       |
|   | Email support    | | Priority support | | Dedicated support|       |
|   |                  | |                  | |                  |       |
|   | [Get Started]    | | [Get Started]    | | [Contact Sales]  |       |
|   +------------------+ +------------------+ +------------------+       |
+------------------------------------------------------------------------+
```

**Registration Form:**
```
+------------------------------------------------------------------------+
| [Avatar Logo]  Register for Live Interact Avatar                        |
+------------------------------------------------------------------------+
|                                                                         |
| Account Information                                                     |
| +-----------------------------------------------------------------+    |
| | Email: *            [__________________________]                 |    |
| | Password: *         [__________________________]                 |    |
| | Confirm Password: * [__________________________]                 |    |
| +-----------------------------------------------------------------+    |
|                                                                         |
| Company Information                                                     |
| +-----------------------------------------------------------------+    |
| | Company Name: *     [__________________________]                 |    |
| | Contact Person: *   [__________________________]                 |    |
| | Contact Phone: *    [__________________________]                 |    |
| +-----------------------------------------------------------------+    |
|                                                                         |
| Selected Plan: [Pro - 4,990 THB/mo]                                    |
|                                                                         |
| [ ] ยอมรับ Terms of Service และ Privacy Policy                        |
|                                                                         |
| [Cancel]                                    [Register & Pay]            |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-CMT.1: Email เป็น unique identifier สำหรับ Central Account (SSO)
- BR-CMT.2: ถ้า Email มีอยู่ในระบบแล้ว ระบบ prompt ให้ Login แล้ว Link Subscription ใหม่ (ไม่สร้าง Account ซ้ำ)
- BR-CMT.3: Tenant สมัครแล้วเริ่มที่สถานะ Pending จนกว่า Central Admin จะ Approve (สอดคล้องกับ M-BE-04)
- BR-CMT.4: Payment ต้องสำเร็จก่อนระบบจะสร้าง Subscription record (Free plan ระบบสร้างทันทีโดยไม่ต้องชำระ)
- BR-CMT.5: ระบบส่ง Email + Telegram notification หลัง Register สำเร็จ

**Out of Scope:**
- Social Login (Google, Facebook) -- V2
- Invitation-based registration -- V2
- Auto-approve (ยังต้อง Manual approve โดย Admin)

---

### 5.2 Tenant Lifecycle State Machine

Tenant มี **2 ระดับ** ของ Lifecycle:

**Level 1: Central Account Lifecycle (Global)**

```
[Register] --> [Active] --> [Deactivated]
                  |               |
                  v               v
            (ใช้งานปกติ)    (ปิด Account
             ข้ามทุก         ทุก Sub-Platform
             Sub-Platform)   ถูก cancel)
```

**Level 2: Per Sub-Platform Lifecycle (align with M-BE-04)**

```
[Register at Sub-Platform] --> [Pending] --> [Admin Approve] --> [Active]
                                  |                                |    ^
                                  v                                |    |
                            [Admin Reject]                  [Suspend]  [Activate]
                            (Email + Reason)                    |    |
                                  |                             v    |
                                  v                        [Suspended]-+
                            [Rejected]                          |
                            (Re-apply ได้)                      v
                                                          [Cancelled]
                                                          (Tenant ยกเลิก
                                                           subscription)
```

**Valid State Transitions (Per Sub-Platform):**

| From | To | Trigger | Actor | Notes |
|------|-----|---------|-------|-------|
| -- | Pending | Tenant สมัครผ่าน Landing Page | Tenant Admin | Payment ต้องสำเร็จก่อน (ถ้า Paid plan) |
| Pending | Active | Admin Approve | Central Admin | Tenant เริ่มใช้บริการได้ |
| Pending | Rejected | Admin Reject (พร้อมเหตุผล) | Central Admin | Tenant ได้รับ Email + สามารถ Re-apply |
| Active | Suspended | Admin Suspend (พร้อมเหตุผล) | Central Admin | บริการถูก Block |
| Suspended | Active | Admin Activate | Central Admin | บริการกลับมาปกติ |
| Active | Cancelled | Tenant ยกเลิก subscription | Tenant Admin | ใช้บริการได้จนสิ้นสุด billing cycle ปัจจุบัน |
| Suspended | Cancelled | Admin cancel subscription | Central Admin | ยกเลิกทันที |

**Invalid State Transitions:**

| From | To | Reason |
|------|----|--------|
| Pending | Suspended | ต้อง Approve ก่อน |
| Rejected | Active | ต้อง Re-apply ผ่าน Landing Page |
| Cancelled | Active | ต้องสมัครใหม่ |

### 5.3 Account Linking -- US-CMT.2

#### US-CMT.2: Link Existing Account to New Sub-Platform

**As a** Tenant Admin
**I want** to subscribe to additional Sub-Platforms using my existing account
**So that** I can use multiple Realfact products with a single login (SSO)

**Acceptance Criteria:**
- [ ] เมื่อฉันเข้า Landing Page ของ Sub-Platform ใหม่ (e.g., booking.realfact.ai) ฉันเห็นปุ่ม Login
- [ ] เมื่อ Login ด้วย Email ที่มีอยู่แล้ว ระบบรู้จัก Account ของฉัน
- [ ] ระบบตรวจว่าฉันยังไม่มี Subscription ของ Sub-Platform นี้
- [ ] ระบบแสดง Subscription Plans (ที่ Central Admin กำหนดไว้ใน M-BE-06) ให้เลือก
- [ ] หลังเลือก Plan + ชำระเงิน:
  - [ ] ระบบสร้าง Subscription record สำหรับ Sub-Platform ใหม่
  - [ ] ฉันสามารถ Switch ระหว่าง Sub-Platform ที่สมัครไว้ได้
  - [ ] Token Wallet กลางใช้ร่วมกันทุก Sub-Platform
- [ ] ฉันเห็น "My Sub-Platforms" dashboard แสดง Sub-Platform ทั้งหมดที่สมัครไว้

**UI/UX Notes:**

**Sub-Platform Switcher (หลัง Login):**
```
+------------------------------------------------------------------------+
| [Avatar Logo]  Welcome, John (ABC Corp)     [Switch Sub-Platform ▼]    |
+------------------------------------------------------------------------+
| Switch Sub-Platform:                                                    |
| +------------------------------------------------------------------+  |
| | [*] Avatar (Live Interact Avatar)     Active    [Go ->]          |  |
| | [ ] Booking (AI Booking)              Active    [Go ->]          |  |
| | [ ] Social Listening                  Not Subscribed [Subscribe] |  |
| +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-CMT.6: Tenant Admin ใช้ Email/Password เดียวกันเข้าทุก Sub-Platform (SSO)
- BR-CMT.7: Token Wallet เป็นของ Tenant กลาง -- ใช้ได้ทุก Sub-Platform (หัก Token ตาม Exchange Rate ของ Sub-Platform นั้น)
- BR-CMT.8: Subscription status เป็น per Sub-Platform -- Active ใน Avatar ไม่ได้หมายความว่า Active ใน Booking

**Out of Scope:**
- Invite team members ข้าม Sub-Platform (V2)
- Merge 2 accounts ที่สมัครแยก (V2)

---

### 5.4 Tenant Decommissioning & GDPR/PDPA -- US-CMT.3

#### US-CMT.3: Request Account Decommissioning

**As a** Tenant Admin
**I want** to cancel my subscription and request data deletion
**So that** my data is handled according to GDPR/PDPA when I stop using the service

**Acceptance Criteria:**
- [ ] ฉันสามารถ **Cancel Subscription** ของ Sub-Platform แต่ละตัวแยกกัน:
  - [ ] เลือก Sub-Platform ที่ต้องการ Cancel
  - [ ] ระบบแสดง Warning: "คุณจะใช้บริการได้ถึงสิ้นสุด billing cycle ปัจจุบัน ([date])"
  - [ ] ระบบแสดงผลกระทบ: จำนวน data records, usage history
  - [ ] หลัง Cancel: Subscription status เปลี่ยนเป็น Cancelled
  - [ ] ใช้บริการได้ถึงสิ้นสุด billing cycle ปัจจุบัน
- [ ] ฉันสามารถ **Request Data Deletion** (GDPR/PDPA Right to Erasure):
  - [ ] ระบบแสดง data categories ที่จะถูกลบ
  - [ ] ระบบแจ้งว่า data จะถูกลบภายใน 30 วัน (ตาม PDPA)
  - [ ] ฉันยืนยันด้วยการพิมพ์ Company Name
  - [ ] ระบบส่ง Confirmation Email
- [ ] ฉันสามารถ **Delete Central Account** ได้:
  - [ ] ต้อง Cancel ทุก Subscription ก่อน
  - [ ] ต้องไม่มี Outstanding Balance
  - [ ] ระบบลบ SSO Account + Token Wallet
  - [ ] ข้อมูล Payment History เก็บไว้ตามกฎหมาย (7 ปี)

**Business Rules:**
- BR-CMT.9: Cancel Subscription = ใช้บริการได้จนสิ้นสุด billing cycle ปัจจุบัน (ไม่คืนเงิน pro-rata สำหรับ cancel)
- BR-CMT.10: Data Deletion ต้องดำเนินการภายใน 30 วันตาม PDPA
- BR-CMT.11: Payment History และ Invoice ต้องเก็บไว้ตามกฎหมายบัญชี (7 ปี) แม้ Tenant จะลบ Account แล้ว
- BR-CMT.12: ต้อง Cancel ทุก Active Subscription ก่อนลบ Central Account
- BR-CMT.13: ต้องไม่มี Outstanding Balance ก่อนลบ Central Account

#### Edge Cases

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-CMT.1 | State | Tenant cancel Subscription กลางรอบ billing | ต้องใช้บริการได้จนสิ้นรอบ | ระบบเก็บ cancellation date และ effective date (สิ้นสุด billing cycle) แยกกัน |
| EC-CMT.2 | Data Boundary | Tenant request Data Deletion แต่ยังมี Active Subscription อื่น | ลบข้อมูลเฉพาะ Sub-Platform ที่ Cancel -- ไม่กระทบ Sub-Platform อื่น | แสดง warning: "จะลบข้อมูลเฉพาะ [Sub-Platform Name] เท่านั้น Subscription อื่นไม่ได้รับผลกระทบ" |
| EC-CMT.3 | Data Boundary | Tenant ลบ Account แต่มี Outstanding Balance | ไม่สามารถลบได้ | แสดงข้อความ: "คุณมียอดค้างชำระ [X] THB กรุณาชำระก่อนลบ Account" |
| EC-CMT.4 | State | Tenant cancel Subscription แล้วสมัครใหม่ก่อนสิ้นสุด billing cycle | ต้อง reactivate ได้ | แสดงตัวเลือก: "คุณมี Subscription ที่กำลังจะหมดอายุ ต้องการ Reactivate หรือสมัครใหม่?" |
| EC-CMT.5 | Integration | Data Deletion request แต่ Sub-Platform DB ไม่ตอบสนอง | Deletion อาจล่าช้า | ระบบ retry อัตโนมัติ + แจ้ง Admin -- Tenant เห็น status: "กำลังดำเนินการลบข้อมูล" |

### 5.5 Registration & Lifecycle Error Scenarios

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Email ซ้ำ (Registration) | Business Rule | Medium | สมัครด้วย Email ที่มีอยู่แล้ว | "Email นี้มี Account อยู่แล้ว กรุณา Login เพื่อเพิ่ม Subscription" พร้อมปุ่ม [Login] | Login แล้ว Link Subscription |
| Company Name ซ้ำในระบบ | Validation | Medium | สมัครด้วยชื่อบริษัทที่มีอยู่แล้ว | "ชื่อบริษัทนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่นหรือติดต่อ Support" | ใช้ชื่อบริษัทอื่นหรือติดต่อ Support |
| Password ไม่ตรงตาม Policy | Validation | Low | กรอก Password ที่ไม่ผ่าน policy | "Password ต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ" | กรอก Password ที่ผ่าน policy |
| Payment ล้มเหลว | Integration | High | ชำระเงินแต่ไม่สำเร็จ (2C2P reject หรือ admin reject สลิป) | "การชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง หรือเลือกช่องทางอื่น" | ลองชำระใหม่หรือใช้ช่องทางอื่น |
| Sub-Platform อยู่ใน Maintenance | Business Rule | High | พยายามสมัคร Sub-Platform ที่อยู่ใน Maintenance mode | "ระบบ [Sub-Platform Name] ปิดรับสมาชิกใหม่ชั่วคราว กรุณาลองอีกครั้งภายหลัง" | รอจนกว่า Sub-Platform จะกลับเป็น Active |
| Cancel มี Outstanding Balance | Business Rule | High | พยายามลบ Account แต่มียอดค้าง | "คุณมียอดค้างชำระ [X] THB กรุณาชำระก่อนลบ Account" | ชำระยอดค้างก่อน |
| SSO Login ล้มเหลว | System | Critical | Login ผ่าน SSO แต่ระบบขัดข้อง | "ระบบ Login ขัดข้อง กรุณาลองอีกครั้งภายหลัง" | รอแล้วลองใหม่ |
| Data Deletion timeout | Integration | Medium | Request Data Deletion แต่ใช้เวลานาน | "กำลังดำเนินการลบข้อมูล อาจใช้เวลาสูงสุด 30 วัน" | รอ -- ระบบจะส่ง Email ยืนยันเมื่อเสร็จ |
| Reactivate หลัง Cancel | Business Rule | Medium | สมัครใหม่หลัง Cancel แต่ยังอยู่ใน billing cycle เดิม | "คุณมี Subscription ที่กำลังจะหมดอายุ ต้องการ Reactivate หรือไม่?" พร้อมปุ่ม [Reactivate] | กด Reactivate เพื่อคืนสถานะ Active |

### 5.6 Registration User Flow

#### Flow 1: New Tenant Registration (Happy Path)

```
[Tenant เข้า avatar.realfact.ai] --> [เห็น Landing Page + Plans]
         |
         v
[กด "Get Started" บน Plan ที่เลือก]
         |
         v
[กรอก Registration Form: Email, Password, Company Name, Contact]
         |
         v
[ระบบตรวจ Email] --> ไม่มีในระบบ --> [สร้าง Central Account]
         |
         v
[ชำระเงินผ่านช่องทางที่เลือก] --> สำเร็จ
         |
         v
[ระบบสร้าง Subscription (Status: Pending)]
         |
         v
[ส่ง Email + Telegram: "สมัครสำเร็จ รอ Admin Approve"]
         |
         v
[Admin เห็น Pending Tenant ใน Backoffice]
         |
         v
[Admin Approve] --> [Status: Active] --> [Tenant ใช้บริการได้]
```

**Alternative Path(s):**
- At Step "ระบบตรวจ Email": ถ้า Email มีอยู่แล้ว --> Prompt Login --> ไป US-CMT.2 (Account Linking)
- At Step "ชำระเงิน": ถ้าเลือก Free plan --> ข้ามการชำระเงิน --> ระบบสร้าง Subscription record ทันที
- At Step "Admin Approve": ถ้า Admin Reject --> Tenant ได้รับ Email พร้อมเหตุผล --> สามารถ Re-apply ได้

**Exception Path(s):**
- At Step "ชำระเงิน": ถ้า Payment ล้มเหลว --> ดู Error Scenario "Payment ล้มเหลว"
- At Step "กรอก Registration Form": ถ้า Email ซ้ำ --> ดู Error Scenario "Email ซ้ำ"

---

## 6. Universal Token System

### 6.1 Token Model

Realfact ใช้ **Universal Token** -- Token 1 ประเภทที่ใช้ได้ข้าม Sub-Platform ทั้งหมด โดยแต่ละ Sub-Platform มี **Exchange Rate** ที่กำหนดว่า 1 Token แลกได้เท่าไหร่

**Token Model Concept:**

```
+================================================================+
|  UNIVERSAL TOKEN WALLET (Central -- per Tenant)                  |
|  +---------------------------------------------------------+    |
|  | Tenant: ABC Corp                                         |    |
|  | Total Balance: 10,000 tokens                             |    |
|  |   - Subscription tokens: 3,000 (Avatar) + 2,000 (Booking)|   |
|  |   - Purchased tokens: 5,000 (top-up)                     |    |
|  +---------------------------------------------------------+    |
+================================================================+
         |                    |                    |
         v                    v                    v
+================+  +================+  +================+
| Avatar         |  | Booking        |  | Social         |
| Exchange Rate: |  | Exchange Rate: |  | Exchange Rate: |
| 1 token =      |  | 1 token =      |  | 1 token =      |
| 1 min session  |  | 1 booking txn  |  | 100 mentions   |
| (50 THB/token) |  | (30 THB/token) |  | (20 THB/token) |
+================+  +================+  +================+
```

**Token Types:**

| Token Source | Behavior | Rollover | Example |
|-------------|----------|----------|---------|
| **Subscription Tokens** | รวมอยู่ใน Plan (included tokens per billing cycle) | ไม่สะสม -- Reset เมื่อสิ้นสุด billing cycle | Pro Plan: 3,000 tokens/month -- ใช้ไม่หมดก็หายไป |
| **Purchased Tokens** (Top-up) | ซื้อเพิ่มผ่าน Token Top-up | สะสมได้ -- ไม่หมดอายุจนกว่าจะใช้ | ซื้อ 5,000 tokens -- ใช้ได้จนกว่าจะหมด |

**Token Deduction Priority:**
```
เมื่อ Tenant ใช้บริการ ระบบหัก Token ตามลำดับ:
1. Subscription Tokens (หักก่อน -- เพราะจะ reset เมื่อสิ้นสุด billing cycle)
2. Purchased Tokens (หักทีหลัง -- เพราะสะสมได้ไม่หมดอายุ)
```

### 6.2 Token Exchange Rate Examples (Mock Data)

> **Note:** ข้อมูลด้านล่างเป็น **Mock Data** สำหรับอธิบาย concept -- อัตราจริงกำหนดโดย Business Team ผ่าน M-BE-05 (Cost Engine)

| Sub-Platform | Unit of Service | Token per Unit | THB per Token | Example Usage |
|-------------|----------------|----------------|---------------|---------------|
| **Avatar** | 1 นาที avatar session | 1 token | 50 THB | 60 tokens = 1 ชั่วโมง session |
| **Booking** | 1 booking transaction | 1 token | 30 THB | 100 tokens = 100 bookings |
| **Social Listening** | 100 mentions analyzed | 1 token | 20 THB | 10 tokens = 1,000 mentions |
| **AI Live Commerce** | 1 นาที live session | 2 tokens | 80 THB | 120 tokens = 1 ชั่วโมง live |
| **MRP** | 1 production plan generated | 5 tokens | 150 THB | 20 tokens = 4 plans |

**Exchange Rate Configuration (M-BE-05 Extend):**

Exchange Rate ถูกกำหนดและจัดการผ่าน M-BE-05 (Cost Engine) ที่ขยายเพิ่มเพื่อรองรับ:
- Per Sub-Platform Exchange Rate configuration
- Effective Date สำหรับการเปลี่ยน Rate (เพื่อไม่กระทบ Tenant ที่ใช้งานอยู่กลางทาง)
- History ของ Rate changes สำหรับ Audit

### 6.3 Token Wallet -- US-CMT.4

#### US-CMT.4: View and Manage Token Wallet

**As a** Tenant Admin
**I want** to view my Universal Token balance and usage across Sub-Platforms
**So that** I can monitor token consumption and plan for top-ups

**Acceptance Criteria:**
- [ ] ฉันเห็น **Token Wallet Dashboard** แสดง:
  - [ ] Total Balance (tokens ทั้งหมดที่มี)
  - [ ] Subscription Tokens (tokens จาก Plan -- แยกต่อ Sub-Platform)
  - [ ] Purchased Tokens (tokens จากการ Top-up -- สะสมได้)
  - [ ] Tokens Used This Month (แยกต่อ Sub-Platform)
- [ ] ฉันเห็น **Usage Breakdown per Sub-Platform:**
  - [ ] Sub-Platform Name
  - [ ] Tokens Used / Tokens Allocated (จาก Subscription)
  - [ ] Exchange Rate (แสดงเป็น "1 token = [unit of service]")
  - [ ] Estimated remaining usage (e.g., "เหลือ ~120 นาที avatar session")
- [ ] ฉันเห็น **Token History** (Transaction Log):
  - [ ] Date, Type (Subscription Allocation / Top-up / Usage Deduction / Expiry), Amount, Balance After
- [ ] ฉันเห็น **Alert** เมื่อ:
  - [ ] Subscription tokens ใกล้หมด (< 20% remaining)
  - [ ] Total balance ต่ำกว่า threshold ที่ตั้งไว้

**UI/UX Notes:**

```
+------------------------------------------------------------------------+
| Token Wallet                                          [Top-up Tokens]  |
+------------------------------------------------------------------------+
|                                                                         |
| Total Balance: 7,500 tokens                                            |
| +------------------------------------------------------------------+  |
| | Subscription Tokens     | 2,500 tokens (resets Feb 28)          |  |
| | Purchased Tokens        | 5,000 tokens (no expiry)              |  |
| +------------------------------------------------------------------+  |
|                                                                         |
| Usage This Month                                                        |
| +------------------------------------------------------------------+  |
| | Avatar    | 1,200 / 3,000 tokens | 1 token = 1 min | ~1,800 min |  |
| | Booking   | 800 / 2,000 tokens   | 1 token = 1 txn | ~1,200 txn |  |
| +------------------------------------------------------------------+  |
|                                                                         |
| ! Subscription tokens ใกล้หมด: Booking เหลือ 15%                      |
|                                                                         |
| Token History                                                           |
| +------------------------------------------------------------------+  |
| | Date       | Type                | Amount   | Balance After       |  |
| |------------|---------------------|----------|---------------------|  |
| | 2026-02-15 | Usage (Avatar)      | -50      | 7,500               |  |
| | 2026-02-14 | Top-up (Purchased)  | +5,000   | 7,550               |  |
| | 2026-02-01 | Subscription Alloc  | +5,000   | 2,550               |  |
| | 2026-01-31 | Subscription Expiry | -2,500   | -2,450              |  |
| +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-CMT.14: Token Wallet เป็นของ Tenant กลาง -- ใช้ได้ทุก Sub-Platform
- BR-CMT.15: Subscription Tokens ไม่สะสม -- Reset เมื่อสิ้นสุด billing cycle
- BR-CMT.16: Purchased Tokens สะสมได้ -- ไม่หมดอายุจนกว่าจะใช้
- BR-CMT.17: Token Deduction Priority: Subscription tokens หมดก่อน --> Purchased tokens
- BR-CMT.18: Subscription Tokens allocated แยกต่อ Sub-Platform (Avatar 3,000 + Booking 2,000 = Total subscription 5,000)

---

### 6.4 Token Top-up -- US-CMT.5

#### US-CMT.5: Purchase Additional Tokens (Top-up)

**As a** Tenant Admin
**I want** to purchase additional tokens when my allocation runs low
**So that** I can continue using Sub-Platform services without interruption

**Acceptance Criteria:**
- [ ] ฉันสามารถซื้อ Token เพิ่มผ่านหน้า Token Wallet:
  - [ ] เลือก Token Package หรือกรอกจำนวน Custom
  - [ ] ชำระเงินผ่านช่องทางที่เลือก (2C2P / โอนตรง+สลิป / QR บริษัท)
- [ ] Token Packages ที่มีให้เลือก (Mock Data):
  - [ ] 500 tokens -- 2,500 THB (5 THB/token)
  - [ ] 1,000 tokens -- 4,500 THB (4.5 THB/token) -- Save 10%
  - [ ] 5,000 tokens -- 20,000 THB (4 THB/token) -- Save 20%
  - [ ] 10,000 tokens -- 35,000 THB (3.5 THB/token) -- Save 30%
  - [ ] Custom: กรอกจำนวน tokens ที่ต้องการ (minimum 100 tokens)
- [ ] หลังชำระเงินสำเร็จ:
  - [ ] Purchased Tokens ถูกเพิ่มเข้า Wallet ทันที
  - [ ] ระบบแสดง Confirmation: "เติม [X] tokens สำเร็จ"
  - [ ] ระบบส่ง Receipt ทาง Email
  - [ ] Transaction ปรากฏใน Token History
- [ ] Purchased Tokens **สะสมได้** -- ไม่หมดอายุจนกว่าจะใช้

**UI/UX Notes:**

```
+------------------------------------------------------------------------+
| Top-up Tokens                                                           |
+------------------------------------------------------------------------+
|                                                                         |
| Current Balance: 7,500 tokens                                          |
|                                                                         |
| Select Package:                                                         |
| +------------------+ +------------------+ +------------------+         |
| | 500 tokens       | | 1,000 tokens     | | 5,000 tokens     |         |
| | 2,500 THB        | | 4,500 THB        | | 20,000 THB       |         |
| | (5 THB/token)    | | (4.5 THB/token)  | | (4 THB/token)    |         |
| |                  | | Save 10%         | | Save 20%         |         |
| | [Select]         | | [Select]         | | [Select]         |         |
| +------------------+ +------------------+ +------------------+         |
|                                                                         |
| +------------------+  +-----------------------------------------+      |
| | 10,000 tokens    |  | Custom Amount                           |      |
| | 35,000 THB       |  | Tokens: [________] (min 100)            |      |
| | (3.5 THB/token)  |  | Price: [auto-calculated] THB            |      |
| | Save 30%         |  |                                         |      |
| | [Select]         |  | [Calculate]                             |      |
| +------------------+  +-----------------------------------------+      |
|                                                                         |
| [Cancel]                                         [Proceed to Payment]  |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-CMT.19: Purchased tokens ไม่มีวันหมดอายุ -- สะสมได้จนกว่าจะใช้
- BR-CMT.20: Minimum top-up คือ 100 tokens
- BR-CMT.21: Token top-up ชำระผ่านช่องทางใดก็ได้ที่รองรับ (2C2P / โอนตรง+สลิป / QR บริษัท)
- BR-CMT.22: Token ถูกเพิ่มเข้า Wallet ทันทีหลังชำระเงินสำเร็จ
- BR-CMT.23: Token Packages pricing กำหนดโดย Business Team ผ่าน M-BE-06 (Price Engine extend)

### 6.5 Token System Business Rules (Summary)

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-CMT.14 | Token Wallet เป็นของ Tenant กลาง -- ใช้ได้ทุก Sub-Platform | US-CMT.4, US-CMT.5 |
| BR-CMT.15 | Subscription Tokens ไม่สะสม -- Reset เมื่อสิ้นสุด billing cycle | US-CMT.4 |
| BR-CMT.16 | Purchased Tokens สะสมได้ -- ไม่หมดอายุจนกว่าจะใช้ | US-CMT.4, US-CMT.5 |
| BR-CMT.17 | Token Deduction Priority: Subscription tokens หมดก่อน --> Purchased tokens | US-CMT.4 |
| BR-CMT.18 | Subscription Tokens allocated แยกต่อ Sub-Platform | US-CMT.4 |
| BR-CMT.19 | Purchased tokens ไม่มีวันหมดอายุ | US-CMT.5 |
| BR-CMT.20 | Minimum top-up คือ 100 tokens | US-CMT.5 |
| BR-CMT.21 | Token top-up ชำระผ่านช่องทางใดก็ได้ที่รองรับ (2C2P / โอนตรง+สลิป / QR บริษัท) | US-CMT.5 |
| BR-CMT.22 | Token ถูกเพิ่มเข้า Wallet ทันทีหลังชำระเงินสำเร็จ | US-CMT.5 |
| BR-CMT.23 | Token Packages pricing กำหนดโดย Business Team ผ่าน M-BE-06 | US-CMT.5 |

#### Edge Cases

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-CMT.6 | Data Boundary | Subscription tokens หมด แต่ยังมี Purchased tokens | ใช้บริการต่อได้จาก Purchased tokens | ระบบ auto-switch ไป Purchased tokens + แจ้ง: "Subscription tokens หมดแล้ว กำลังใช้ Purchased tokens" |
| EC-CMT.7 | Data Boundary | ทั้ง Subscription และ Purchased tokens หมด | ไม่สามารถใช้บริการได้ | แสดง: "Token หมด กรุณาเติม Token เพื่อใช้บริการต่อ" พร้อมปุ่ม [Top-up] |
| EC-CMT.8 | State | Subscription tokens reset ในขณะที่ Tenant กำลังใช้บริการ (billing cycle end) | Session ที่กำลังใช้อยู่ต้องไม่ถูกตัด | Session ที่กำลังดำเนินอยู่ใช้ tokens เดิมจนจบ -- billing cycle ใหม่เริ่มนับหลัง session จบ |
| EC-CMT.9 | Integration | Payment สำเร็จแต่ Token ยังไม่เข้า Wallet | Tenant อาจคิดว่า top-up ไม่สำเร็จ | ระบบ retry อัตโนมัติ + แสดง: "กำลังดำเนินการ Token จะเข้า Wallet ภายในไม่กี่นาที" |
| EC-CMT.10 | Data Boundary | Tenant มีหลาย Sub-Platform ใช้ Token พร้อมกัน (concurrent usage) | Token balance อาจถูกหักซ้อน | ระบบ lock balance ระหว่าง deduction เพื่อป้องกันการหักเกิน (Business requirement: ไม่อนุญาตให้ balance ติดลบ) |
| EC-CMT.11 | State | Tenant ถูก Suspend ใน Sub-Platform หนึ่งแต่ยังมี Active ใน Sub-Platform อื่น | Token wallet ยังใช้ได้กับ Sub-Platform ที่ Active | Suspension block เฉพาะ Sub-Platform ที่ถูก Suspend -- Token wallet ยังใช้กับ Sub-Platform อื่นได้ |

### 6.6 Token System Error Scenarios

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Token ไม่พอใช้บริการ | Business Rule | High | ใช้บริการแต่ Token ไม่พอ | "Token ไม่เพียงพอ ยอดคงเหลือ [X] tokens ต้องใช้ [Y] tokens กรุณาเติม Token" | เติม Token แล้วลองใหม่ |
| Top-up Payment ล้มเหลว | Integration | High | ชำระเงิน top-up ไม่สำเร็จ (2C2P reject หรือ admin reject สลิป) | "การชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง หรือเลือกช่องทางอื่น" | ลองชำระใหม่หรือใช้ช่องทางอื่น |
| Custom amount ต่ำกว่า minimum | Validation | Low | กรอก top-up amount < 100 tokens | "จำนวน Token ขั้นต่ำคือ 100 tokens" | กรอกจำนวนที่มากกว่า 100 |
| Token balance ติดลบ (ไม่ควรเกิด) | System | Critical | ระบบหัก Token จนติดลบ | แจ้ง Admin ทันที -- Tenant เห็น: "เกิดข้อผิดพลาดในระบบ Token กรุณาติดต่อ Support" | ติดต่อ Support -- Admin แก้ไข balance |
| Concurrent deduction conflict | System | High | 2 Sub-Platform หัก Token พร้อมกัน | ระบบ queue การหัก -- ไม่มี user message (transparent) | Automatic -- ระบบจัดการ concurrency เอง |
| Token Wallet service ล่ม | System | Critical | เข้าหน้า Token Wallet แต่ service ล่ม | "ไม่สามารถโหลดข้อมูล Token ได้ กรุณาลองอีกครั้งภายหลัง" | รอแล้วลองใหม่ |

---

## 7. Subscription Plans (Per Sub-Platform)

### 7.1 Plan Structure

แต่ละ Sub-Platform มี **Subscription Plans** เฉพาะตัว (สร้างและจัดการโดย Central Admin ผ่าน M-BE-06) โดย Tenant เลือกจาก Plans ที่มีอยู่เพื่อสมัครใช้งาน โครงสร้าง:

| Attribute | Description |
|-----------|-------------|
| **Plan Name** | ชื่อ Plan (e.g., Starter, Pro, Enterprise) |
| **Price** | ราคาต่อ billing cycle (THB/month) |
| **Included Tokens** | จำนวน Subscription Tokens ต่อ billing cycle |
| **Features** | Feature limits เฉพาะ Sub-Platform (e.g., จำนวน avatars, booking slots) |
| **Support Level** | ระดับ Support (Email / Priority / Dedicated) |
| **Billing Cycle** | Monthly (V1) -- Annual option ใน V2 |

**Plan Hierarchy:**

```
Sub-Platform
  |
  +-- Plan Tier 1 (e.g., Free/Starter) -- Entry level
  |     - Low token allocation
  |     - Basic features
  |     - Email support
  |
  +-- Plan Tier 2 (e.g., Pro) -- Growth level
  |     - Medium token allocation
  |     - Advanced features
  |     - Priority support
  |
  +-- Plan Tier 3 (e.g., Enterprise) -- Scale level
  |     - High token allocation
  |     - All features
  |     - Dedicated support
  |
  +-- Plan Tier 4 (e.g., Custom) -- Special deals (ถ้ามี)
        - Custom token allocation
        - Custom features
        - Custom support SLA
```

> **Note:** Plans/Pricing configuration กำหนดผ่าน M-BE-06 (Price Engine) extend -- ไม่ได้สร้าง Module ใหม่

### 7.2 Mock Data -- Avatar (Live Interact Avatar) Plans

> **Note:** ข้อมูลด้านล่างเป็น **Mock Data** สำหรับอธิบาย concept -- Plan จริงกำหนดโดย Business Team

| Attribute | Starter | Pro | Enterprise | Custom |
|-----------|---------|-----|------------|--------|
| **Price** | 990 THB/mo | 4,990 THB/mo | 14,990 THB/mo | Contact Sales |
| **Included Tokens** | 500 tokens/mo | 3,000 tokens/mo | 15,000 tokens/mo | Negotiable |
| **Avatar Slots** | 1 avatar | 5 avatars | Unlimited | Negotiable |
| **Max Session Duration** | 15 min/session | 60 min/session | Unlimited | Negotiable |
| **Concurrent Sessions** | 1 | 5 | 20 | Negotiable |
| **Recording** | No | Yes | Yes + Cloud Storage | Custom |
| **Support** | Email (48hr) | Priority (24hr) | Dedicated (4hr) | Custom SLA |
| **Analytics** | Basic | Advanced | Advanced + Export | Custom |
| **White-label** | No | Logo only | Full branding | Custom |
| **Token Rollover** | No | No | No | Negotiable |

### 7.3 Mock Data -- Booking Plans

> **Note:** ข้อมูลด้านล่างเป็น **Mock Data** สำหรับอธิบาย concept

| Attribute | Starter | Professional | Enterprise |
|-----------|---------|-------------|------------|
| **Price** | 590 THB/mo | 2,990 THB/mo | 9,990 THB/mo |
| **Included Tokens** | 200 tokens/mo | 1,500 tokens/mo | 8,000 tokens/mo |
| **Booking Slots** | 50 slots/mo | 500 slots/mo | Unlimited |
| **AI Recommendations** | Basic | Advanced | Advanced + Custom Model |
| **Calendar Integration** | Google Calendar | Google + Outlook | All + Custom |
| **Reminder Channels** | Email | Email + SMS | Email + SMS + LINE |
| **Support** | Email (48hr) | Priority (24hr) | Dedicated (4hr) |
| **Analytics** | Basic | Advanced | Advanced + Export |
| **Token Rollover** | No | No | No |

### 7.4 Plan Upgrade/Downgrade -- US-CMT.6

#### US-CMT.6: Upgrade or Downgrade Subscription Plan

**As a** Tenant Admin
**I want** to upgrade or downgrade my subscription plan for a Sub-Platform
**So that** I can scale my usage up or down based on business needs

**Acceptance Criteria:**

**Upgrade:**
- [ ] ฉันสามารถ Upgrade Plan ได้จากหน้า Subscription Management
- [ ] ระบบแสดง Plan Comparison: Current Plan vs. New Plan
- [ ] **Upgrade มีผลทันที:**
  - [ ] ฉันได้รับ Features ของ Plan ใหม่ทันที
  - [ ] ฉันได้รับ Token allocation ของ Plan ใหม่ทันที
- [ ] **Pro-rata Credit:**
  - [ ] ระบบคำนวณมูลค่าคงเหลือของ Plan เดิม (remaining value)
  - [ ] มูลค่าคงเหลือถูก Credit ไปหักกับราคา Plan ใหม่
  - [ ] ฉันชำระเฉพาะส่วนต่างผ่านช่องทางที่เลือก
- [ ] ระบบแสดง Summary ก่อนยืนยัน:
  - [ ] Current Plan: [name] -- [price]/mo
  - [ ] New Plan: [name] -- [price]/mo
  - [ ] Remaining value (credit): [amount] THB
  - [ ] Amount to pay: [amount] THB
- [ ] หลัง Upgrade สำเร็จ:
  - [ ] ระบบส่ง Email Confirmation + Receipt
  - [ ] Billing cycle ถูก Reset (เริ่มนับใหม่จากวัน Upgrade)

**Downgrade:**
- [ ] ฉันสามารถ Downgrade Plan ได้จากหน้า Subscription Management
- [ ] **Downgrade มีผลทันที:**
  - [ ] Features ลดลงตาม Plan ใหม่ทันที
  - [ ] Token allocation ลดลงตาม Plan ใหม่
- [ ] **Extended Service Days (ไม่คืนเงิน/ไม่แปลงเป็น Token):**
  - [ ] ระบบคำนวณมูลค่าคงเหลือของ Plan เดิม
  - [ ] มูลค่าคงเหลือถูกแปลงเป็น **จำนวนวันใช้งานฟรี** ของ Plan ใหม่
  - [ ] ฉันใช้บริการ Plan ใหม่ฟรีจนครบวันที่แปลงได้ จากนั้นเริ่มเก็บเงินตามปกติ
- [ ] ระบบแสดง Summary ก่อนยืนยัน:
  - [ ] Current Plan: [name] -- [price]/mo
  - [ ] New Plan: [name] -- [price]/mo
  - [ ] Remaining value: [amount] THB
  - [ ] Free days on new plan: [X] days
  - [ ] Next billing date: [date]
- [ ] หลัง Downgrade สำเร็จ:
  - [ ] ระบบส่ง Email Confirmation
  - [ ] Billing cycle เริ่มนับใหม่หลังครบ Free days

**Upgrade Example (Pro-rata Credit):**
```
Current Plan: Pro (4,990 THB/mo) -- วันที่ 15 ของรอบบิล
Remaining: 15 วัน = 4,990 x (15/30) = 2,495 THB credit

New Plan: Enterprise (14,990 THB/mo)
Amount to pay: 14,990 - 2,495 = 12,495 THB

Result:
- ชำระ 12,495 THB
- ได้รับ Enterprise features ทันที
- Billing cycle reset: เริ่มนับ 30 วันใหม่จากวัน Upgrade
```

**Downgrade Example (Extended Service Days):**
```
Current Plan: Pro (4,990 THB/mo) -- วันที่ 15 ของรอบบิล
Remaining: 15 วัน = 4,990 x (15/30) = 2,495 THB remaining value

New Plan: Starter (990 THB/mo)
Daily cost of Starter: 990 / 30 = 33 THB/day
Free days: 2,495 / 33 = ~75 วัน

Result:
- ไม่ต้องจ่ายเงินเพิ่ม
- ได้ Starter features ทันที
- ใช้ Starter ฟรี 75 วัน
- Next billing date: วัน Downgrade + 75 วัน
- หลังครบ 75 วัน เริ่มเก็บ 990 THB/mo ตามปกติ
```

**UI/UX Notes:**

**Upgrade Confirmation:**
```
+------------------------------------------------------------------------+
| Upgrade Plan: Avatar                                                    |
+------------------------------------------------------------------------+
|                                                                         |
| Current Plan           -->        New Plan                              |
| +--------------------+            +--------------------+               |
| | Pro                |    --->    | Enterprise         |               |
| | 4,990 THB/mo       |            | 14,990 THB/mo      |               |
| | 3,000 tokens       |            | 15,000 tokens      |               |
| | 5 avatars          |            | Unlimited avatars  |               |
| +--------------------+            +--------------------+               |
|                                                                         |
| Calculation:                                                            |
| +-----------------------------------------------------------------+    |
| | Days remaining in current cycle: 15 days                         |    |
| | Remaining value (credit):        2,495 THB                       |    |
| | New plan price:                  14,990 THB                       |    |
| | Amount to pay:                   12,495 THB                       |    |
| +-----------------------------------------------------------------+    |
|                                                                         |
| * Upgrade มีผลทันที                                                   |
| * Billing cycle จะ reset เริ่มนับใหม่                                 |
|                                                                         |
| [Cancel]                                  [Confirm & Pay 12,495 THB]   |
+------------------------------------------------------------------------+
```

**Downgrade Confirmation:**
```
+------------------------------------------------------------------------+
| Downgrade Plan: Avatar                                                  |
+------------------------------------------------------------------------+
|                                                                         |
| Current Plan           -->        New Plan                              |
| +--------------------+            +--------------------+               |
| | Pro                |    --->    | Starter            |               |
| | 4,990 THB/mo       |            | 990 THB/mo         |               |
| | 3,000 tokens       |            | 500 tokens         |               |
| | 5 avatars          |            | 1 avatar           |               |
| +--------------------+            +--------------------+               |
|                                                                         |
| Calculation:                                                            |
| +-----------------------------------------------------------------+    |
| | Days remaining in current cycle: 15 days                         |    |
| | Remaining value:                 2,495 THB                       |    |
| | Starter daily cost:              33 THB/day                      |    |
| | Free days on Starter:            75 days                         |    |
| | Next billing date:               2026-05-02                      |    |
| +-----------------------------------------------------------------+    |
|                                                                         |
| ! ข้อจำกัดของ Starter Plan:                                           |
| - Avatar slots ลดจาก 5 เหลือ 1 (avatars ที่เกินจะถูก deactivate)     |
| - Max session ลดจาก 60 นาที เหลือ 15 นาที                             |
| - ไม่มี Recording feature                                              |
|                                                                         |
| ! Downgrade มีผลทันที                                                  |
|                                                                         |
| [Cancel]                                        [Confirm Downgrade]    |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-CMT.24: Upgrade มีผลทันที -- Tenant ได้รับ Features ใหม่ทันทีหลังชำระเงินสำเร็จ
- BR-CMT.25: Upgrade ใช้ Pro-rata Credit -- มูลค่าคงเหลือของ Plan เดิมหักจากราคา Plan ใหม่
- BR-CMT.26: Downgrade มีผลทันที -- Features ลดลงตาม Plan ใหม่ทันที
- BR-CMT.27: Downgrade แปลงมูลค่าคงเหลือเป็น Extended Service Days (ไม่คืนเงิน ไม่แปลงเป็น Token)
- BR-CMT.28: Extended Service Days = Remaining Value / (New Plan Price / 30)
- BR-CMT.29: หลัง Upgrade Billing cycle reset (เริ่มนับ 30 วันใหม่)
- BR-CMT.30: หลัง Downgrade Next billing = วัน Downgrade + Free days
- BR-CMT.31: Downgrade ที่ทำให้เกิน Feature limit -- ระบบ deactivate resources ส่วนเกิน (e.g., avatars ที่เกิน limit จะถูก deactivate -- Tenant เลือกว่าจะ keep ตัวไหน)
- BR-CMT.32: ไม่สามารถ Upgrade/Downgrade ขณะมี Pending payment หรืออยู่ใน free days period ของ Downgrade ก่อนหน้า

### 7.5 Integration with Existing Modules

Plan management ไม่ได้สร้าง Module ใหม่ แต่ **ขยาย (extend)** Module ที่มีอยู่:

| Module | Extension | Description |
|--------|-----------|-------------|
| **M-BE-05 (Cost Engine)** | + Token Exchange Rate per Sub-Platform | เพิ่ม configuration สำหรับ Exchange Rate ต่อ Sub-Platform (1 token = X units of service) |
| **M-BE-06 (Price Engine)** | + Subscription Plan Configuration | เพิ่ม Plan management: Plan tiers, pricing, token allocation, feature limits ต่อ Sub-Platform |
| **M-BE-06 (Price Engine)** | + Token Package Pricing | เพิ่ม Top-up package management: package sizes, volume discount tiers |
| **M-BE-07 (Billing)** | + Subscription Billing per Sub-Platform | เพิ่ม recurring billing per Sub-Platform, pro-rata calculation, extended days tracking |
| **M-BE-07 (Billing)** | + Separate Invoice per Sub-Platform | เพิ่มการออก Invoice แยกต่อ Sub-Platform |
| **M-BE-07 (Billing)** | + Multi-channel Payment | เพิ่ม integration กับ 3 ช่องทาง (2C2P + โอนตรง+สลิป + QR บริษัท) สำหรับ subscription payment และ token top-up |
| **M-DP-01 (Developer Portal)** | + Tenant Upgrade/Downgrade UI | เพิ่มหน้า Subscription Management ให้ Tenant Admin เปลี่ยน Plan ได้เอง |

**Integration Flow:**

```
M-BE-06 (Price Engine)                    M-BE-05 (Cost Engine)
+------------------------+               +------------------------+
| Plan Configuration     |               | Token Exchange Rate    |
| - Plan tiers           |               | per Sub-Platform       |
| - Pricing              |               | - Avatar: 1 token =   |
| - Token allocation     |               |   1 min (50 THB)       |
| - Feature limits       |               | - Booking: 1 token =  |
| Token Package Pricing  |               |   1 txn (30 THB)       |
+------------------------+               +------------------------+
         |                                        |
         v                                        v
+================================================================+
| M-BE-07 (Billing) -- Extended                                   |
| +-----------------------------------------------------------+  |
| | Subscription Billing per Sub-Platform                      |  |
| | Pro-rata Calculation (Upgrade/Downgrade)                   |  |
| | Separate Invoice per Sub-Platform                          |  |
| | Multi-channel Payment (2C2P + Direct Transfer + QR)       |  |
| | Token Top-up Processing                                    |  |
| +-----------------------------------------------------------+  |
+================================================================+
         |
         v
+========================+
| M-DP-01 (Dev Portal)  |
| Extended               |
| +--------------------+ |
| | Subscription Mgmt  | |
| | Upgrade/Downgrade  | |
| | Token Wallet UI    | |
| | Top-up UI          | |
| +--------------------+ |
+========================+
```

### 7.6 Subscription Plan Business Rules (Summary)

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-CMT.24 | Upgrade มีผลทันที -- ได้รับ Features ใหม่ทันที | US-CMT.6 |
| BR-CMT.25 | Upgrade ใช้ Pro-rata Credit -- มูลค่าคงเหลือหักจากราคา Plan ใหม่ | US-CMT.6 |
| BR-CMT.26 | Downgrade มีผลทันที -- Features ลดลงตาม Plan ใหม่ | US-CMT.6 |
| BR-CMT.27 | Downgrade แปลงมูลค่าคงเหลือเป็น Extended Service Days | US-CMT.6 |
| BR-CMT.28 | Extended Service Days = Remaining Value / (New Plan Price / 30) | US-CMT.6 |
| BR-CMT.29 | หลัง Upgrade -- Billing cycle reset เริ่มนับ 30 วันใหม่ | US-CMT.6 |
| BR-CMT.30 | หลัง Downgrade -- Next billing = วัน Downgrade + Free days | US-CMT.6 |
| BR-CMT.31 | Downgrade เกิน feature limit -- ระบบ deactivate resources ส่วนเกิน | US-CMT.6 |
| BR-CMT.32 | ไม่สามารถ Upgrade/Downgrade ขณะมี Pending payment หรืออยู่ใน free days period | US-CMT.6 |
| BR-CMT.33 | แต่ละ Sub-Platform มี Plans แยกกัน -- Avatar Plans ไม่เกี่ยวกับ Booking Plans | All |
| BR-CMT.34 | Invoice ออกแยกต่อ Sub-Platform | All |
| BR-CMT.35 | Free Plan ไม่ต้องชำระเงิน -- สมัครได้ทันที (ยังต้อง Admin Approve) | US-CMT.1 |

#### Edge Cases

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-CMT.12 | State | Upgrade จาก Starter ไป Enterprise แต่ Payment ล้มเหลว | ยังคงอยู่ Plan เดิม | แสดงข้อความ: "การชำระเงินไม่สำเร็จ คุณยังอยู่ Plan [current] กรุณาลองอีกครั้ง" |
| EC-CMT.13 | Data Boundary | Downgrade แต่มี resources เกิน limit ของ Plan ใหม่ | ต้องเลือกว่า keep resource ไหน | แสดง dialog: "Plan ใหม่รองรับ [X] avatars แต่คุณมี [Y] กรุณาเลือก avatars ที่ต้องการ keep" |
| EC-CMT.14 | Data Boundary | Downgrade คำนวณ Free days ได้ 0 วัน (เพราะใช้เกือบหมดรอบแล้ว) | Downgrade แต่ไม่มี free days | แสดงข้อความ: "มูลค่าคงเหลือน้อย คุณจะเริ่มชำระ Plan ใหม่ทันที (Next billing: [tomorrow])" |
| EC-CMT.15 | State | Tenant พยายาม Upgrade ขณะอยู่ใน Free days ของ Downgrade ก่อนหน้า | ไม่สามารถ Upgrade ได้ | แสดงข้อความ: "คุณอยู่ในช่วง Free days จาก Downgrade ก่อนหน้า กรุณารอจนถึง [date] หรือติดต่อ Support" |
| EC-CMT.16 | Data Boundary | Pro-rata credit มากกว่าราคา Plan ใหม่ (Upgrade ไป Plan ที่ถูกกว่าแต่สูงกว่า current -- edge case ที่ไม่ควรเกิด) | ไม่ใช่ Upgrade ที่ valid | ระบบ validate ว่า Upgrade ต้องไปหา Plan ที่ราคาสูงกว่าเท่านั้น -- Downgrade ใช้ Extended Days |
| EC-CMT.17 | State | Billing cycle reset จาก Upgrade แต่ Subscription tokens ของ Plan เก่ายังเหลือ | Tokens เก่าถูก forfeit | แสดง warning ก่อน confirm: "Subscription tokens ที่เหลือ [X] tokens จะหายไป (ถูก reset) ต้องการดำเนินการต่อหรือไม่?" |
| EC-CMT.18 | Integration | ระบบชำระเงินออนไลน์ล่มขณะ Upgrade | ไม่สามารถชำระเงินผ่าน 2C2P ได้ | แสดงข้อความ: "ระบบชำระเงินออนไลน์ขัดข้อง กรุณาลองอีกครั้งภายหลัง หรือเลือกช่องทางอื่น (โอนตรง/QR บริษัท)" -- ยังคง Plan เดิม |

### 7.7 Subscription Error Scenarios

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Upgrade Payment ล้มเหลว | Integration | High | Confirm upgrade แต่ชำระเงินไม่สำเร็จ | "การชำระเงินไม่สำเร็จ คุณยังอยู่ Plan เดิม กรุณาลองช่องทางอื่น" | ลองชำระใหม่หรือใช้ช่องทางอื่น |
| Downgrade เกิน Feature limit | Business Rule | Medium | Downgrade แต่มี resources เกิน | "กรุณาเลือก [resources] ที่ต้องการ keep (limit: [X])" | เลือก resources ที่ keep |
| ไม่มีสิทธิ์เปลี่ยน Plan | Business Rule | Medium | Developer (ไม่ใช่ Tenant Admin) พยายาม change plan | "เฉพาะ Tenant Admin เท่านั้นที่สามารถเปลี่ยน Plan ได้" | ติดต่อ Tenant Admin |
| Pending payment มีอยู่ | Business Rule | Medium | พยายาม Upgrade ขณะมี pending payment | "คุณมีรายการชำระเงินที่ค้างอยู่ กรุณาดำเนินการให้เสร็จก่อน" | ชำระ pending payment ก่อน |
| Plan ที่เลือกถูก Discontinue | Business Rule | Low | พยายาม Upgrade ไป Plan ที่ไม่มีแล้ว | "Plan นี้ไม่เปิดให้สมัครแล้ว กรุณาเลือก Plan อื่น" | เลือก Plan อื่นที่ยังเปิดอยู่ |
| Subscription expired ขณะ Downgrade | State | High | Downgrade แต่ Subscription หมดอายุพอดี | ระบบจัดการ Downgrade ก่อน Expiry | ระบบ process Downgrade แล้ว extend ตาม Free days |
| ระบบคำนวณ Pro-rata ผิดพลาด | System | Critical | Upgrade แต่ยอดชำระไม่ตรง | แจ้ง Admin -- Tenant เห็น: "เกิดข้อผิดพลาดในการคำนวณ กรุณาติดต่อ Support" | ติดต่อ Support -- Admin ตรวจสอบและแก้ไข |

---

---

# ===============================================================
# PART B: TENANT EXPERIENCE
# ประสบการณ์ฝั่ง Tenant (Tenant Admin, Tenant Developer)
# ===============================================================

## 8. White-Label & Branding

> **Scope:** V1 -- Per-Tenant Branding เบื้องต้น สำหรับ Developer Portal view, Embedded Widgets, และ API Documentation Page

### 8.1 Feature Overview (Branding)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-CMT.7 | Per-Tenant Branding Configuration | Tenant Admin | P1 | Tenant Admin ตั้งค่า branding ของ Tenant เพื่อให้ Portal และ Widget แสดงผลตาม identity ของ Tenant |
| F-CMT.8 | Branding Preview | Tenant Admin | P2 | Preview branding ก่อน publish เพื่อตรวจสอบความถูกต้อง |
| F-CMT.9 | Reset Branding to Default | Tenant Admin | P2 | ย้อนกลับไปใช้ default branding ของ Sub-Platform ได้ตลอดเวลา |

### 8.2 User Stories (Branding)

#### US-CMT.7: Tenant Admin Configures Branding

**As a** Tenant Admin
**I want** to configure my organization's branding (logo, colors, favicon) for our portal view
**So that** our developers and end-users see a consistent brand identity when interacting with our services

**Acceptance Criteria:**
- [ ] ฉันสามารถอัปโหลด Logo ได้ (รองรับ PNG, JPG, SVG) -- ขนาดไม่เกิน 2 MB, แนะนำ 200x60px
- [ ] ฉันสามารถกำหนด Color Theme ได้ 3 ค่า: Primary Color, Secondary Color, Accent Color (รูปแบบ HEX เช่น #FF5733)
- [ ] ฉันสามารถอัปโหลด Favicon ได้ (รองรับ ICO, PNG) -- ขนาดไม่เกิน 512 KB, แนะนำ 32x32px หรือ 64x64px
- [ ] หลังบันทึก branding จะถูก apply ทันทีกับ: (a) Developer Portal view ของ Tenant, (b) Embedded Widgets ที่ Tenant deploy, (c) API Documentation Page ของ Tenant
- [ ] ฉันสามารถ preview branding ก่อน publish ได้
- [ ] ฉันสามารถ reset กลับไปใช้ default branding ของ Sub-Platform ได้ตลอดเวลา
- [ ] ถ้าอัปโหลดไฟล์ format ที่ไม่รองรับ ฉันเห็น error message ชัดเจน
- [ ] ถ้าไฟล์เกินขนาด ฉันเห็น error message แจ้งขนาดที่อนุญาต

**UI/UX Notes:**
- Branding Settings อยู่ใน Tenant Admin Panel > Settings > Branding
- แสดง Live Preview ทางขวาของ Form เพื่อให้เห็นผลลัพธ์ก่อน Save
- มีปุ่ม "Reset to Sub-Platform Default" แยกชัดเจน (ต้อง confirm ก่อน reset)

**Business Rules:**
- BR-CMT.7: Logo ต้องเป็น PNG, JPG, หรือ SVG ไม่เกิน 2 MB
- BR-CMT.8: Favicon ต้องเป็น ICO หรือ PNG ไม่เกิน 512 KB
- BR-CMT.9: Color ต้องเป็น valid HEX code (6 หรือ 3 digits, นำหน้าด้วย #)
- BR-CMT.10: ถ้า Tenant ไม่ได้ตั้ง branding ให้ใช้ default branding ของ Sub-Platform ที่ Tenant สังกัด (จาก M-BE-12)
- BR-CMT.11: Branding apply แยกตาม Tenant -- ไม่กระทบ Tenant อื่นหรือ Sub-Platform default

### 8.3 User Flows (Branding)

#### Flow 1: Configure Tenant Branding

```
[Tenant Admin Login] → [Admin Panel] → [Settings > Branding]
                                              │
                                    ┌─────────┴──────────┐
                                    ▼                    ▼
                           [Upload Logo/         [Set Color
                            Favicon]              Theme]
                                    │                    │
                                    └─────────┬──────────┘
                                              ▼
                                     [Preview Branding]
                                              │
                                    ┌─────────┴──────────┐
                                    ▼                    ▼
                             [Save/Publish]        [Cancel]
                                    │                    │
                                    ▼                    ▼
                          [Apply to Portal]    [Discard Changes]
```

**Happy Path:**
1. Tenant Admin เข้าสู่ระบบ → ไปที่ Settings > Branding
2. Tenant Admin อัปโหลด Logo (PNG, 150x60px, 500 KB) → System แสดง preview ของ Logo
3. Tenant Admin กำหนด Primary Color = #1A73E8, Secondary = #FFFFFF, Accent = #FF6B35 → System อัปเดต Live Preview ทันที
4. Tenant Admin อัปโหลด Favicon (ICO, 32x32px) → System แสดง preview ของ Favicon
5. Tenant Admin คลิก "Save & Publish" → System แสดง Confirmation Dialog
6. Tenant Admin คลิก "Confirm" → System บันทึกสำเร็จ + Apply branding ทันที + แสดงข้อความ "Branding updated successfully"

**Alternative Path(s):**
- At Step 2: Tenant Admin ไม่อัปโหลด Logo (ข้าม) → System ใช้ Logo เดิม (หรือ Sub-Platform default ถ้ายังไม่เคยตั้ง) → Continue Step 3
- At Step 5: Tenant Admin คลิก "Cancel" → System ยกเลิก ไม่บันทึก → กลับไป Form พร้อม unsaved changes warning
- At Step 5: Tenant Admin คลิก "Reset to Default" → System แสดง Confirmation "ต้องการ reset branding กลับเป็น default ของ Sub-Platform?" → Confirm → Reset + Apply default branding

**Exception Path(s):**
- At Step 2: If อัปโหลดไฟล์ format ที่ไม่รองรับ → See EC-CMT.2
- At Step 2: If ไฟล์เกินขนาด 2 MB → See Error Scenario table
- At Step 3: If HEX code ไม่ valid → See Error Scenario table
- At Step 6: If บันทึกล้มเหลว (system error) → See Error Scenario table

### 8.4 Edge Cases (Branding)

> **Reference:** ใช้ checklist จาก `requirements_analysis.md` > "Edge Case Identification" ในการวิเคราะห์

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-CMT.2 | Input Boundary | Tenant Admin อัปโหลดไฟล์ที่ไม่ใช่รูปภาพ (เช่น .pdf, .exe) | ไม่สามารถอัปโหลดได้ | แสดง validation: "รองรับเฉพาะไฟล์ PNG, JPG, SVG (สำหรับ Logo) หรือ ICO, PNG (สำหรับ Favicon)" |
| EC-CMT.3 | State/Timing | Branding ถูก save แต่ยังไม่ apply ครบทุก touchpoint (Portal, Widget, Docs) | ผู้ใช้เห็น branding ไม่สอดคล้องกันชั่วคราว | System ต้อง apply branding แบบ atomic -- ถ้า apply ไม่สำเร็จครบทุก touchpoint ให้ rollback + แจ้ง "กรุณาลองอีกครั้ง" |
| EC-CMT.4 | Data Boundary | Tenant ไม่เคยตั้ง branding เลย + Sub-Platform default ก็ยังไม่ตั้ง | Portal แสดง branding ว่างเปล่า | Fallback ไปใช้ Realfact Platform default branding (สุดท้าย) |
| EC-CMT.5 | Input Boundary | Logo มีขนาด resolution สูงมาก (เช่น 5000x5000px) แต่ไม่เกิน 2 MB | อัปโหลดได้แต่อาจแสดงผิดสัดส่วน | System resize/crop ให้พอดี display area + แสดง preview ให้ Tenant Admin ตรวจสอบก่อน Save |
| EC-CMT.6 | State/Timing | Tenant Admin 2 คนแก้ branding พร้อมกัน | Admin คนที่ 2 อาจ overwrite | แสดง warning: "Branding ถูกแก้ไขโดยผู้ใช้อื่นเมื่อ [timestamp] กรุณา refresh" |

### 8.5 Error Scenarios (Branding)

> **Reference:** ดู `scenario_analysis.md` > "Error Scenario Enhancement" สำหรับ Categories และ Severity definitions

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| ไฟล์ format ไม่รองรับ | Validation | Medium | อัปโหลดไฟล์ .pdf เป็น Logo | "รองรับเฉพาะไฟล์ PNG, JPG, SVG" | เลือกไฟล์ใหม่ที่ถูก format |
| ไฟล์เกินขนาด | Validation | Medium | อัปโหลด Logo 5 MB | "ไฟล์ต้องมีขนาดไม่เกิน 2 MB (ปัจจุบัน: 5 MB)" | ลดขนาดไฟล์แล้วอัปโหลดใหม่ |
| HEX code ไม่ valid | Validation | Low | กรอกสี "XYZ123" (ไม่มี #) | "กรุณากรอก HEX color code ที่ถูกต้อง เช่น #FF5733" | กรอก HEX code ที่ถูกต้อง |
| บันทึก branding ล้มเหลว | System | High | คลิก Save & Publish | "เกิดข้อผิดพลาดในการบันทึก กรุณาลองอีกครั้ง" | คลิก Retry หรือรอสักครู่ |
| Branding apply ไม่ครบ | System | High | Save สำเร็จแต่ Widget ยังแสดง branding เก่า | "การอัปเดตบางส่วนยังไม่เสร็จสมบูรณ์ กรุณารอ 1-2 นาที" | รอ auto-propagation หรือ refresh |

### 8.6 V2 Roadmap (Out of Scope for V1)

> **Note:** รายการด้านล่างเป็นแผนสำหรับ V2 เท่านั้น ไม่อยู่ใน scope ของ V1 -- ระบุไว้เพื่อให้ Developer Team และ Stakeholders ทราบทิศทาง

| V2 Feature | Description | เหตุผลที่ Defer |
|------------|-------------|-----------------|
| Custom Domain + SSL | Tenant ใช้ domain ของตัวเอง (เช่น api.tenantname.com) พร้อม SSL certificate | ต้องวางโครงสร้าง DNS management + certificate provisioning |
| Custom Email Templates | Tenant กำหนด email template, from address, footer | ต้องมี email template engine + sender verification |
| Full CSS Customization | Tenant เขียน custom CSS override สำหรับ Portal | ต้องมี CSS sandbox + security review เพื่อป้องกัน injection |
| Multi-language Branding | Branding content หลายภาษา (ชื่อ, คำอธิบาย) | ต้องวาง i18n framework ก่อน |

---

## 9. Per-Tenant RBAC (Extension of M-DP-01)

> **Context:** M-BE-08 จัดการ Internal Admin RBAC (Super Admin, Platform Admin, Finance) สำหรับ Internal Portal / Backoffice
> Section นี้กำหนด Tenant-level RBAC ซึ่งเป็น extension ของ M-DP-01 (Developer Portal) สำหรับผู้ใช้ฝั่ง Tenant

### 9.1 Feature Overview (Tenant RBAC)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-CMT.10 | Tenant Team Management | Tenant Admin | P0 | จัดการสมาชิกในทีม -- invite, set role, remove |
| F-CMT.11 | Tenant Billing & Usage View | Tenant Admin | P0 | ดู subscription plan, token balance, usage history, billing history |
| F-CMT.12 | Tenant Token Top-up | Tenant Admin | P0 | เติม token ผ่านช่องทางชำระเงินที่เลือก (2C2P / โอนตรง+สลิป / QR บริษัท) |
| F-CMT.13 | Developer Self-Service | Tenant Developer | P0 | ใช้ API keys, ดู docs, ดูสถิติการใช้งานของตัวเอง |

### 9.2 User Stories (Tenant RBAC)

#### US-CMT.8: Tenant Admin Manages Team Members

**As a** Tenant Admin
**I want** to invite, assign roles to, and remove team members in my organization
**So that** I can control who has access to our services and manage team composition

**Acceptance Criteria:**
- [ ] ฉันสามารถ invite สมาชิกใหม่ด้วย email address ได้
- [ ] ระบบส่ง invitation email ไปยัง email ที่ระบุ พร้อม link สำหรับ accept invitation
- [ ] ฉันสามารถกำหนด role ให้สมาชิกได้: Tenant Admin หรือ Tenant Developer
- [ ] ฉันสามารถเปลี่ยน role ของสมาชิกที่มีอยู่แล้วได้
- [ ] ฉันสามารถ remove สมาชิกออกจากทีมได้ (ต้อง confirm ก่อน remove)
- [ ] สมาชิกที่ถูก remove จะไม่สามารถเข้าถึง Tenant resources ได้ทันที
- [ ] ฉันเห็นรายชื่อสมาชิกทั้งหมดพร้อม: ชื่อ, email, role, วันที่เข้าร่วม, status (Active/Pending Invite)
- [ ] ถ้า invite email ที่มีอยู่ใน Tenant แล้ว ฉันเห็น error message
- [ ] ถ้า invite email ที่มี account อยู่แล้วใน platform (Tenant อื่น) -- สมาชิกสามารถ accept invite โดยใช้ SSO identity เดิม (cross-tenant membership)

**UI/UX Notes:**
- Team Management อยู่ใน Tenant Admin Panel > Team
- ปุ่ม "Invite Member" เปิด modal สำหรับกรอก email + เลือก role
- Pending invitations แสดงแยก tab หรือ section ชัดเจน

**Business Rules:**
- BR-CMT.12: Tenant ต้องมี Tenant Admin อย่างน้อย 1 คนเสมอ -- ไม่สามารถ remove หรือ downgrade Admin คนสุดท้ายได้
- BR-CMT.13: Invitation link มีอายุ 7 วัน -- หลังหมดอายุต้อง resend
- BR-CMT.14: สมาชิก 1 คน (1 SSO identity) สามารถเป็นสมาชิกของหลาย Tenant ได้ (cross-tenant)
- BR-CMT.15: จำนวนสมาชิกสูงสุดต่อ Tenant ขึ้นอยู่กับ Subscription Plan

---

#### US-CMT.9: Tenant Admin Views Billing & Usage

**As a** Tenant Admin
**I want** to view my organization's subscription plans, token balance, usage history, and billing history
**So that** I can monitor costs, track consumption, and manage budgets effectively

**Acceptance Criteria:**
- [ ] ฉันเห็น current subscription plan ของแต่ละ Sub-Platform ที่ Tenant subscribe อยู่ (ชื่อ Plan, ราคา, renewal date, status)
- [ ] ฉันเห็น token balance แยกชัดเจนระหว่าง Bonus Tokens (ได้ฟรีจาก plan) กับ Purchased Tokens (ซื้อเพิ่ม)
- [ ] ฉันเห็น usage history แยกตาม Sub-Platform: วันที่, จำนวน token ใช้, ประเภทการใช้งาน (เช่น Avatar chat, Booking query)
- [ ] ฉันเห็น billing history: invoices ทั้งหมด, วันที่ชำระ, จำนวนเงิน, status (Paid/Pending/Failed), ดาวน์โหลด receipt/invoice ได้
- [ ] ฉันสามารถ filter usage history ตาม: Sub-Platform, date range, usage type
- [ ] ฉันสามารถ filter billing history ตาม: date range, status, Sub-Platform
- [ ] ฉันสามารถ export usage report เป็น CSV ได้

**UI/UX Notes:**
- Billing & Usage อยู่ใน Tenant Admin Panel > Billing
- แสดง Overview Dashboard ด้านบน: total spend (เดือนนี้), token balance, active plans
- Tab แยกสำหรับ: Subscription Plans | Token Balance | Usage History | Billing History

---

#### US-CMT.10: Tenant Admin Top-ups Tokens

**As a** Tenant Admin
**I want** to purchase additional tokens via my preferred payment channel
**So that** my team can continue using services without interruption when token balance is low

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก token package สำเร็จรูปได้ (เช่น 1,000 tokens / 5,000 tokens / 10,000 tokens)
- [ ] ฉันสามารถกรอกจำนวน custom amount ได้ (ขั้นต่ำตาม Sub-Platform กำหนด)
- [ ] ฉันเห็นราคารวม (THB) ก่อนชำระเงิน -- ราคาคำนวณจาก Token Exchange Rate ของ Sub-Platform
- [ ] หลังคลิก "Purchase" → ระบบแสดงตัวเลือกช่องทางชำระเงิน
- [ ] หลังชำระเงินสำเร็จ → Tokens ถูกเพิ่มเข้า wallet ทันที + ฉันเห็นข้อความยืนยัน + ได้ receipt ทาง email
- [ ] หลังชำระเงินล้มเหลว → ฉันเห็น error message + Tokens ไม่ถูกเพิ่ม + ฉันสามารถลองชำระใหม่ได้
- [ ] Tokens ที่ซื้อเพิ่มแยกเป็น "Purchased Tokens" (ไม่มีวันหมดอายุ ต่างจาก Bonus Tokens)

**UI/UX Notes:**
- Top-up อยู่ใน Tenant Admin Panel > Billing > Token Balance > ปุ่ม "Top-up Tokens"
- แสดง token packages เป็น card layout พร้อม price/token
- แสดง current balance ด้านบนเพื่อให้ Admin ตัดสินใจจำนวนที่ต้องการ

**Business Rules:**
- BR-CMT.16: Token top-up มีขั้นต่ำตาม Sub-Platform (เช่น Avatar Sub-Platform ขั้นต่ำ 100 tokens)
- BR-CMT.17: ราคา token คำนวณจาก Token Exchange Rate ของ Sub-Platform นั้นๆ (จาก M-BE-05 Cost Engine)
- BR-CMT.18: Purchased Tokens ไม่มีวันหมดอายุ (ต่างจาก Bonus Tokens ที่อาจหมดอายุตาม plan cycle)
- BR-CMT.19: Purchased Tokens ถูกใช้หลังจาก Bonus Tokens หมดก่อน (Bonus First policy)

### 9.3 User Flows (Tenant RBAC)

#### Flow 1: Invite Team Member

```
[Tenant Admin] → [Team Page] → [Click "Invite Member"]
                                        │
                                        ▼
                              [Enter Email + Select Role]
                                        │
                                        ▼
                              [Click "Send Invitation"]
                                        │
                            ┌───────────┴───────────┐
                            ▼                       ▼
                   [Email Exists             [Email NOT in
                    in Tenant]                Platform]
                        │                       │
                        ▼                       ▼
                   [Error: Already          [Send Invite
                    a member]                Email]
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                             [New User:               [Existing User:
                              Register +               Accept Invite
                              Accept]                  via SSO]
                                    │                       │
                                    └───────────┬───────────┘
                                                ▼
                                     [Member Added to Tenant
                                      with Assigned Role]
```

**Happy Path:**
1. Tenant Admin ไปที่ Team Page → คลิก "Invite Member"
2. Tenant Admin กรอก email + เลือก role (Developer) → คลิก "Send Invitation"
3. System ตรวจสอบ email ไม่ซ้ำใน Tenant → ส่ง invitation email → แสดงข้อความ "Invitation sent to [email]"
4. ผู้รับ invitation คลิก link ใน email → Register (ถ้าไม่มี account) หรือ Accept (ถ้ามี SSO identity แล้ว)
5. System เพิ่มสมาชิกเข้า Tenant ด้วย role ที่กำหนด → Tenant Admin เห็น status เปลี่ยนจาก "Pending Invite" เป็น "Active"

**Alternative Path(s):**
- At Step 2: Tenant Admin เลือก role = Tenant Admin (แทน Developer) → Continue Step 3
- At Step 4: ผู้รับมี account อยู่แล้วใน platform (Tenant อื่น) → Accept invite ด้วย SSO identity เดิม → เป็นสมาชิกหลาย Tenant → Continue Step 5
- At Step 4: Invitation หมดอายุ (7 วัน) → ผู้รับเห็น "Invitation expired" → Tenant Admin ต้อง resend invitation

**Exception Path(s):**
- At Step 2: If email มีอยู่ใน Tenant แล้ว → See Error Scenario table
- At Step 2: If Tenant เต็ม member limit ตาม plan → See Error Scenario table
- At Step 3: If email ส่งไม่สำเร็จ → See Error Scenario table

#### Flow 2: Token Top-up

```
[Tenant Admin] → [Billing] → [Token Balance] → [Click "Top-up"]
                                                       │
                                        ┌──────────────┴──────────────┐
                                        ▼                             ▼
                                [Select Package]               [Enter Custom
                                (1K/5K/10K)                     Amount]
                                        │                             │
                                        └──────────────┬──────────────┘
                                                       ▼
                                              [Review Order]
                                              (amount + price in THB)
                                                       │
                                                       ▼
                                              [Click "Purchase"]
                                                       │
                                                       ▼
                                              [เลือกช่องทางชำระเงิน]
                                                       │
                                        ┌──────────────┴──────────────┐
                                        ▼                             ▼
                                 [Payment Success]             [Payment Failed]
                                        │                             │
                                        ▼                             ▼
                                 [Tokens Added               [Show Error +
                                  Immediately +                Retry Option]
                                  Confirmation +
                                  Receipt Email]
```

**Happy Path:**
1. Tenant Admin ไปที่ Billing > Token Balance → คลิก "Top-up Tokens"
2. Tenant Admin เลือก package 5,000 tokens → System แสดงราคา 2,500 THB (ตาม Exchange Rate)
3. Tenant Admin คลิก "Purchase" → เลือกช่องทางชำระเงิน → เลือก 2C2P Online → Redirect ไป 2C2P Checkout
4. Tenant Admin ชำระเงินผ่าน Credit Card → 2C2P process สำเร็จ → Redirect กลับ
5. System เพิ่ม 5,000 Purchased Tokens เข้า wallet ทันที → แสดง "Top-up successful! 5,000 tokens added." → ส่ง receipt ทาง email + Telegram

**Alternative Path(s):**
- At Step 2: Tenant Admin กรอก custom amount (เช่น 3,500 tokens) → System คำนวณราคาแสดง → Continue Step 3
- At Step 4: Tenant Admin เลือกชำระผ่าน PromptPay QR แทน Credit Card → Scan QR → ชำระสำเร็จ → Continue Step 5
- At Step 4: Tenant Admin คลิก "Cancel" บนหน้า 2C2P → Redirect กลับ → Token ไม่ถูกเพิ่ม → กลับไปหน้า Token Balance
- At Step 3: Tenant Admin เลือก "โอนตรง+แนบสลิป" → ระบบแสดงข้อมูลบัญชี → โอนเงิน → อัปโหลดสลิป → รอ Admin verify → Token เพิ่มหลัง approve

**Exception Path(s):**
- At Step 2: If กรอก custom amount ต่ำกว่า minimum → See Error Scenario table
- At Step 4: If ชำระเงินล้มเหลว (บัตรถูกปฏิเสธ) → See Error Scenario table
- At Step 5: If tokens ไม่ถูกเพิ่มหลังชำระสำเร็จ (system error) → See Error Scenario table

### 9.4 Tenant Role Capabilities Matrix

| Capability | Tenant Admin | Tenant Developer | Notes |
|------------|:------------:|:----------------:|-------|
| Invite / remove team members | Yes | No | |
| Change member roles | Yes | No | |
| View billing & invoices | Yes | No | |
| Top-up tokens | Yes | No | |
| Configure branding | Yes | No | |
| Manage subscription plans | Yes | No | Upgrade/downgrade/cancel |
| Configure notifications | Yes | No | |
| Use API keys / credentials | Yes | Yes | |
| Create / manage API apps | Yes | Yes | |
| View API documentation | Yes | Yes | |
| View usage stats | Own + Team | Own only | Admin เห็นสถิติรวมทั้ง Tenant |
| Access embedded widgets | Yes | Yes | |
| Manage own profile | Yes | Yes | |

### 9.5 Relationship to M-BE-08 & M-DP-01

| Concern | Module | Scope |
|---------|--------|-------|
| Internal Admin RBAC | M-BE-08 (User RBAC) | Super Admin, Platform Admin, Finance roles สำหรับ Internal Portal (Backoffice) |
| Tenant-level RBAC | M-DP-01 Extension | Tenant Admin, Tenant Developer roles สำหรับ Developer Portal |
| SSO Identity | M-BE-01 (Authentication) | Shared SSO identity ข้าม Tenants -- 1 user สามารถเป็นสมาชิกหลาย Tenants |

**Separation Principle:** M-BE-08 จัดการ "ใครเข้าถึงอะไรภายใน" (internal), M-DP-01 Extension จัดการ "ใครเข้าถึงอะไรภายใน Tenant" (tenant-scoped) ไม่ทับซ้อนกัน

### 9.6 Edge Cases (Tenant RBAC)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-CMT.7 | State | Tenant Admin ลบตัวเองออกจาก Tenant (เป็น Admin คนสุดท้าย) | Tenant จะไม่มี Admin เหลือ | ป้องกัน: "คุณเป็น Admin คนสุดท้าย ไม่สามารถออกจาก Tenant ได้ กรุณาแต่งตั้ง Admin ใหม่ก่อน" |
| EC-CMT.8 | State | สมาชิกถูก remove ขณะกำลังใช้งาน API อยู่ | Session ปัจจุบันอาจยังใช้ได้ชั่วคราว | API key ถูก revoke ทันที -- request ถัดไปจะได้รับ error "Unauthorized" |
| EC-CMT.9 | Data Boundary | Tenant invite สมาชิกจนเต็ม limit ตาม plan | ไม่สามารถ invite เพิ่มได้ | แสดง: "จำนวนสมาชิกเต็ม limit ของ plan ปัจจุบัน ([current]/[max]) กรุณาอัปเกรด plan หรือ remove สมาชิกที่ไม่ใช้งาน" |
| EC-CMT.10 | Integration | Invitation email ส่งไม่สำเร็จ | ผู้รับไม่ได้รับ invitation | แสดง warning: "อาจมีปัญหาในการส่ง email กรุณาลองใหม่" + Tenant Admin สามารถ resend invite ได้ |
| EC-CMT.11 | State | User ถูก invite เข้า Tenant แต่มี account อยู่ใน Tenant อื่นที่ถูก suspend | ต้องตัดสินใจว่าอนุญาตหรือไม่ | อนุญาตให้ accept invite ได้ -- suspension เป็นแค่ Tenant-scoped ไม่กระทบ SSO identity |

### 9.7 Error Scenarios (Tenant RBAC)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Email ซ้ำใน Tenant | Validation | Medium | Invite email ที่เป็นสมาชิกอยู่แล้ว | "[email] เป็นสมาชิกของทีมอยู่แล้ว" | ตรวจสอบ email ให้ถูกต้อง |
| Email format ไม่ valid | Validation | Low | กรอก email format ผิด | "กรุณากรอก email address ที่ถูกต้อง" | แก้ไข email |
| Member limit เต็ม | Business Rule | High | Invite สมาชิกเกิน plan limit | "จำนวนสมาชิกเต็ม limit แล้ว (10/10) กรุณาอัปเกรด plan" | อัปเกรด plan หรือ remove สมาชิก |
| Remove Admin คนสุดท้าย | Business Rule | Critical | ลบหรือ downgrade Admin คนสุดท้าย | "ไม่สามารถดำเนินการได้ ต้องมี Admin อย่างน้อย 1 คน" | แต่งตั้ง Admin ใหม่ก่อน |
| Invitation email ส่งล้มเหลว | Integration | Medium | คลิก Send Invitation | "ไม่สามารถส่ง invitation email ได้ กรุณาลองอีกครั้ง" | คลิก Resend |
| Token top-up ต่ำกว่า minimum | Validation | Medium | กรอก custom amount 10 tokens (minimum = 100) | "จำนวนขั้นต่ำสำหรับ top-up คือ 100 tokens" | กรอกจำนวนที่มากกว่า minimum |
| ชำระเงินล้มเหลว (card declined) | Integration | High | ชำระผ่าน credit card | "การชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตร หรือลองวิธีชำระเงินอื่น" | ลองบัตรใหม่หรือเปลี่ยนวิธีชำระ |
| Tokens ไม่ถูกเพิ่มหลังชำระสำเร็จ | System | Critical | ชำระเงินสำเร็จแต่ balance ไม่เปลี่ยน | "การชำระเงินสำเร็จแล้ว แต่ token ยังไม่ถูกเพิ่ม ระบบกำลังดำเนินการ หากไม่ได้รับภายใน 15 นาที กรุณาติดต่อ Support" | ระบบ auto-reconcile + ติดต่อ Support ถ้าเกิน 15 นาที |

---

## 10. Notification System

> **Scope:** V1 -- Telegram Bot เป็น primary channel, Email เป็น secondary channel
> Tenant Admin สามารถเลือก configure notification preferences ได้

### 10.1 Feature Overview (Notifications)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-CMT.14 | Notification Event Delivery | Tenant Admin | P0 | ระบบส่ง notification อัตโนมัติเมื่อเกิด event สำคัญ ผ่าน Telegram + Email |
| F-CMT.15 | Notification Preferences | Tenant Admin | P1 | Tenant Admin configure ว่าต้องการรับ notification event ไหนบ้าง ผ่านช่องทางไหน |
| F-CMT.16 | Custom Telegram Bot | Tenant Admin | P2 | Tenant Admin ตั้งค่า Telegram Bot Token ของตัวเอง (optional) |

### 10.2 Notification Channels -- V1

| Channel | Type | Configuration | Default |
|---------|------|---------------|---------|
| Telegram Bot | Primary | Tenant Admin ตั้ง Telegram Chat ID เพื่อรับ notification | ใช้ Realfact Official Bot ส่ง notification |
| Email | Secondary | ส่งไปยัง Tenant Admin email ที่ลงทะเบียนไว้ | เปิดใช้งานอัตโนมัติสำหรับทุก critical events |

**Channel Priority:** สำหรับ event ที่ส่งทั้ง 2 ช่องทาง -- Telegram ส่งก่อน (real-time) แล้วตามด้วย Email (เป็น formal record)

### 10.3 Notification Events Matrix

| Event | Telegram | Email | Trigger Condition | Recipient | Priority |
|-------|:--------:|:-----:|-------------------|-----------|----------|
| Subscription renewal reminder | Yes | Yes | 7 วันก่อนวันต่ออายุ | Tenant Admin | P0 |
| Subscription expired | Yes | Yes | ถึงวันหมดอายุ + ไม่ได้ต่ออายุ | Tenant Admin | P0 |
| Token balance low | Yes | No | Balance ต่ำกว่า threshold ที่ Tenant กำหนด | Tenant Admin | P0 |
| Token balance depleted | Yes | Yes | Balance = 0 tokens | Tenant Admin | P0 |
| Token top-up confirmation | Yes | Yes | หลังชำระเงินสำเร็จ | Tenant Admin | P1 |
| Payment success (subscription) | No | Yes | หลัง subscription payment สำเร็จ | Tenant Admin | P1 |
| Payment failed | Yes | Yes | Payment ถูกปฏิเสธ / ล้มเหลว | Tenant Admin | P0 |
| Plan upgrade/downgrade confirmation | No | Yes | หลัง plan change สำเร็จ | Tenant Admin | P1 |
| New team member joined | Yes | No | สมาชิก accept invitation | Tenant Admin | P2 |
| Sub-Platform specific alerts | Yes | No | ขึ้นกับ Sub-Platform (เช่น Avatar session limit, Booking threshold) | Tenant Admin | P1 |
| Grace period warning | Yes | Yes | Payment ล้มเหลว + เข้าสู่ grace period | Tenant Admin | P0 |
| Account suspension notice | Yes | Yes | Subscription ถูก suspend (หลัง grace period หมด) | Tenant Admin | P0 |

### 10.4 User Stories (Notifications)

#### US-CMT.13: Tenant Admin Configures Notification Preferences

**As a** Tenant Admin
**I want** to configure which notification events I receive and through which channels
**So that** I get alerted about important events without being overwhelmed by unnecessary notifications

**Acceptance Criteria:**
- [ ] ฉันสามารถเปิด/ปิดแต่ละ notification event ได้ (ยกเว้น Critical events ที่บังคับเปิดเสมอ)
- [ ] ฉันสามารถตั้ง Telegram Chat ID เพื่อรับ notification ผ่าน Telegram ได้
- [ ] ฉันสามารถทดสอบ Telegram connection ด้วยปุ่ม "Send Test Message" -- ได้รับ test message ใน Telegram ทันที
- [ ] ฉันสามารถกำหนด low-token-balance threshold ได้ (เช่น alert เมื่อเหลือ 500 tokens)
- [ ] Critical events (Subscription expired, Token depleted, Payment failed, Account suspension) บังคับเปิดเสมอ ไม่สามารถปิดได้ -- แสดง lock icon พร้อมคำอธิบาย
- [ ] ฉันเห็น notification history / log ย้อนหลัง 30 วัน
- [ ] (Optional V1) ฉันสามารถตั้ง Telegram Bot Token ของตัวเอง (custom bot) แทนการใช้ Realfact Official Bot

**UI/UX Notes:**
- Notification Settings อยู่ใน Tenant Admin Panel > Settings > Notifications
- แสดง event list เป็น table พร้อม toggle switch สำหรับแต่ละ channel
- Telegram setup: กรอก Chat ID + ปุ่ม "Test Connection"
- Token threshold: slider หรือ input field พร้อมแสดง current balance เป็น reference

**Business Rules:**
- BR-CMT.20: Critical events (Subscription expired, Token depleted, Payment failed, Account suspension, Grace period warning) ไม่สามารถปิด notification ได้ -- เพื่อความปลอดภัยของ Tenant
- BR-CMT.21: Low-token threshold default = 10% ของ monthly average usage (ถ้าไม่มีข้อมูล default = 500 tokens)
- BR-CMT.22: Telegram notification ส่งได้เฉพาะเมื่อ Chat ID ถูกตั้งค่าและ verify แล้ว
- BR-CMT.23: Notification history เก็บ 30 วัน -- หลัง 30 วัน auto-archive
- BR-CMT.24: ถ้า Telegram ส่งไม่สำเร็จ (chat ID ผิด, bot ถูก block) → fallback ไปส่ง Email แทน + แจ้ง Tenant Admin ว่า Telegram ใช้ไม่ได้

### 10.5 User Flow (Notification Configuration)

#### Flow 1: Setup Telegram Notifications

```
[Tenant Admin] → [Settings > Notifications] → [Telegram Section]
                                                      │
                                            ┌─────────┴──────────┐
                                            ▼                    ▼
                                     [Enter Chat ID]      [Enter Custom
                                                            Bot Token]
                                            │              (optional)
                                            └─────────┬──────────┘
                                                      ▼
                                            [Click "Test Connection"]
                                                      │
                                        ┌─────────────┴─────────────┐
                                        ▼                           ▼
                                [Test Success:                [Test Failed:
                                 "Message sent!"]              "Unable to send.
                                        │                       Check Chat ID"]
                                        ▼
                                [Configure Events]
                                (toggle on/off per event)
                                        │
                                        ▼
                                [Save Preferences]
```

**Happy Path:**
1. Tenant Admin ไปที่ Settings > Notifications > Telegram Section
2. Tenant Admin กรอก Telegram Chat ID → คลิก "Test Connection"
3. System ส่ง test message ไปยัง Chat ID → Tenant Admin ได้รับข้อความ "This is a test from Realfact Platform" ใน Telegram
4. Tenant Admin toggle เปิด/ปิด event ที่ต้องการ (Critical events แสดง lock ปิดไม่ได้)
5. Tenant Admin ตั้ง low-token threshold = 1,000 tokens
6. Tenant Admin คลิก "Save" → System บันทึกสำเร็จ → แสดง "Notification preferences saved"

**Alternative Path(s):**
- At Step 2: Tenant Admin กรอก custom Bot Token ด้วย (optional) → System ใช้ custom bot แทน Realfact Official Bot → Continue Step 3
- At Step 3: Test ล้มเหลว → Tenant Admin แก้ไข Chat ID → Test ใหม่ → Continue Step 4
- At Step 4: Tenant Admin ไม่แก้ไข event toggles (ใช้ default ทั้งหมด) → Continue Step 6

**Exception Path(s):**
- At Step 2: If Chat ID format ไม่ valid → See Error Scenario table
- At Step 3: If Telegram API ไม่ตอบสนอง → See Error Scenario table

### 10.6 Edge Cases (Notifications)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-CMT.12 | Integration | Telegram Bot ถูก Tenant block ใน Telegram app | Notification ส่งไม่ถึง | System detect send failure → fallback ส่ง Email แทน → แจ้ง Tenant Admin ผ่าน email: "Telegram notification ส่งไม่สำเร็จ กรุณาตรวจสอบ Bot settings" |
| EC-CMT.13 | Data Boundary | Tenant ไม่ได้ตั้ง Chat ID + email ก็ไม่ valid | ไม่สามารถส่ง notification ได้เลย | แสดง warning banner ใน Admin Panel: "กรุณาตั้งค่าช่องทางการแจ้งเตือนอย่างน้อย 1 ช่องทาง" |
| EC-CMT.14 | State/Timing | Notification events เกิดพร้อมกันหลายรายการ (เช่น payment failed + subscription expired + token depleted) | Tenant ได้รับ notification ถี่เกินไป | Aggregate notifications ที่เกิดภายใน 5 นาที ส่งเป็นรายการเดียว (digest mode) |
| EC-CMT.15 | Input Boundary | Tenant ตั้ง low-token threshold สูงกว่า current balance | ได้รับ alert ทันทีหลัง save | แสดง warning ก่อน save: "Threshold ที่ตั้งสูงกว่า balance ปัจจุบัน คุณจะได้รับ alert ทันที" |

### 10.7 Error Scenarios (Notifications)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Chat ID format ไม่ valid | Validation | Low | กรอก Chat ID ผิด format | "Chat ID ต้องเป็นตัวเลข กรุณาตรวจสอบ" | กรอก Chat ID ที่ถูกต้อง |
| Test message ส่งไม่สำเร็จ | Integration | Medium | คลิก Test Connection | "ไม่สามารถส่งข้อความทดสอบได้ กรุณาตรวจสอบ Chat ID และตรวจสอบว่าไม่ได้ block Bot" | ตรวจสอบ Chat ID + unblock Bot |
| Telegram API ล่ม | Integration | High | (ระบบส่ง notification อัตโนมัติ) | (ไม่มี user message -- system fallback ส่ง email) | Auto-fallback to email + retry Telegram ทุก 5 นาที |
| Custom Bot Token ไม่ valid | Validation | Medium | กรอก Bot Token ที่ผิด | "Bot Token ไม่ถูกต้อง กรุณาตรวจสอบจาก BotFather" | ขอ token ใหม่จาก Telegram BotFather |

---

## 11. Payment Methods

> **Context:** Realfact Platform รองรับ 3 ช่องทางชำระเงิน: (1) 2C2P Payment Gateway สำหรับ online payment, (2) Direct Bank Transfer พร้อมแนบสลิป, (3) Company QR Code พร้อมแนบสลิป
> M-BE-07 (Billing) รับผิดชอบ billing records, invoices, payment history -- Section นี้กำหนด WHAT payment capabilities ที่ Tenant ต้องการ

### 11.1 Feature Overview (Payment)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-CMT.17 | Subscription Payment | Tenant Admin | P0 | ชำระค่า subscription plan ผ่านช่องทางชำระเงินที่เลือก (2C2P / โอนตรง+สลิป / QR บริษัท) |
| F-CMT.18 | Token Top-up Payment | Tenant Admin | P0 | ซื้อ token เพิ่มผ่านช่องทางชำระเงินที่เลือก |
| F-CMT.19 | Auto-Payment (Recurring) | Tenant Admin | P1 | ตั้งค่า auto-charge สำหรับ subscription renewal |
| F-CMT.20 | Payment History | Tenant Admin | P1 | ดูประวัติการชำระเงินทั้งหมด |

### 11.2 Supported Payment Channels

| # | Channel | Type | Payment Methods | Settlement | Verification | Notes |
|---|---------|------|----------------|------------|--------------|-------|
| 1 | **2C2P Payment Gateway** | Online (automated) | Credit/Debit Card (Visa, Mastercard, JCB), PromptPay QR (via 2C2P), Bank Transfer (via 2C2P) | Card: T+2, QR: Real-time, Transfer: T+1 | Automated via 2C2P webhook callback | รองรับ 3D Secure สำหรับ Card |
| 2 | **Direct Bank Transfer + Slip** | Offline (manual) | โอนเงินเข้าบัญชีธนาคารของบริษัทโดยตรง + แนบสลิปการโอน | หลัง Admin verify สลิป | Admin ตรวจสอบสลิป + approve/reject | ใช้บัญชีธนาคารที่ตั้งค่าไว้ใน M-BE-07 |
| 3 | **Company QR Code** | Offline (manual) | สแกน QR PromptPay ของบริษัท + โอนเงิน + แนบสลิปการโอน | หลัง Admin verify สลิป | Admin ตรวจสอบสลิป + approve/reject | ใช้ QR Code ที่ตั้งค่าไว้ใน M-BE-07 |

**Business Rules:**
- BR-CMT.25: สกุลเงินหลักคือ THB (Thai Baht) -- ราคาทั้งหมดแสดงเป็น THB
- BR-CMT.26: 2C2P จัดการ PCI DSS compliance สำหรับ credit card data -- Realfact ไม่เก็บข้อมูลบัตรโดยตรง (เฉพาะ Channel 1)
- BR-CMT.27: ทุก transaction ต้องมี unique reference number สำหรับ reconciliation
- BR-CMT.27.1: สำหรับ offline payment (Channel 2, 3) — Subscription/Token จะ activate หลังจาก Admin verify สลิปเท่านั้น
- BR-CMT.27.2: Admin ต้อง verify สลิปภายใน 1 วันทำการ — ถ้าเกินเวลาระบบแจ้งเตือน Admin
- BR-CMT.27.3: Tenant สามารถเลือกช่องทางชำระเงินใดก็ได้ตามความสะดวก — ไม่จำกัดเฉพาะ 2C2P

### 11.3 User Stories (Payment)

#### US-CMT.11: Tenant Pays Subscription

**As a** Tenant Admin
**I want** to pay for a subscription plan via my preferred payment channel
**So that** my organization can access Sub-Platform services according to the selected plan

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก plan ที่ต้องการ (หรือเปลี่ยน plan) → เห็นสรุปราคาก่อนชำระ
- [ ] ฉันเห็นราคาที่ชัดเจน: ค่า plan/เดือน, ภาษี (ถ้ามี), ยอดรวม
- [ ] หลังคลิก "Subscribe" / "Change Plan" → ระบบแสดงตัวเลือกช่องทางชำระเงิน (2C2P Online / โอนตรง+สลิป / QR บริษัท)
- [ ] ฉันสามารถเลือกช่องทางชำระเงินได้: (1) 2C2P Online — Credit Card, PromptPay QR, Bank Transfer, (2) โอนเงินตรง+แนบสลิป, (3) สแกน QR บริษัท+แนบสลิป
- [ ] หลังชำระสำเร็จ → Subscription activate ทันที + redirect กลับพร้อมข้อความยืนยัน + ได้ email confirmation
- [ ] หลังชำระล้มเหลว → redirect กลับพร้อม error message + Subscription ไม่ activate + สามารถลองชำระใหม่ได้
- [ ] ถ้า upgrade plan กลางรอบ → ฉันเห็นราคา prorated (คิดตามวันที่เหลือ)
- [ ] ถ้า downgrade plan → มีผลรอบถัดไป + ฉันเห็น effective date ชัดเจน

**UI/UX Notes:**
- Plan selection อยู่ใน Tenant Admin Panel > Subscription
- แสดง Plan Comparison table ก่อนเลือก
- Prorate calculation แสดง breakdown ชัดเจน (เดิมจ่ายเท่าไหร่, ส่วนต่างเท่าไหร่)

**Business Rules:**
- BR-CMT.28: Upgrade plan → คิด prorated charge (ส่วนต่างตามวันที่เหลือของรอบปัจจุบัน) → activate ทันที
- BR-CMT.29: Downgrade plan → มีผลรอบถัดไป (ไม่ refund รอบปัจจุบัน) → ยังคงใช้ plan เดิมจนหมดรอบ
- BR-CMT.30: Cancel subscription → มีผล ณ สิ้นสุดรอบปัจจุบัน → ไม่ refund

---

#### US-CMT.12: Tenant Purchases Token Top-up

**As a** Tenant Admin
**I want** to purchase additional tokens through my preferred payment channel
**So that** my team can continue using Sub-Platform services when tokens are running low

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก token package หรือกรอก custom amount → เห็นราคารวมใน THB
- [ ] หลังคลิก "Purchase" → ระบบแสดงตัวเลือกช่องทางชำระเงิน
- [ ] หลังชำระสำเร็จ → Tokens เพิ่มเข้า wallet ทันที + redirect กลับ + ข้อความยืนยัน + receipt email
- [ ] หลังชำระล้มเหลว → Tokens ไม่ถูกเพิ่ม + redirect กลับ + error message + ลองชำระใหม่ได้

(User flow สำหรับ Token Top-up ดูรายละเอียดใน Section 9.3 Flow 2)

### 11.4 Payment Flow (Subscription)

```
[Tenant Admin] → [Subscription Page] → [Select/Change Plan]
                                              │
                                              ▼
                                     [Review Order Summary]
                                     (Plan name, price,
                                      prorate if applicable)
                                              │
                                              ▼
                                     [Click "Subscribe"
                                      or "Change Plan"]
                                              │
                                              ▼
                                     [เลือกช่องทางชำระเงิน]
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                  [2C2P Online]       [โอนตรง+สลิป]        [QR บริษัท+สลิป]
                         │                    │                    │
                         ▼                    └────────┬───────────┘
                  [Redirect to 2C2P                    ▼
                   Checkout Page]              [แนบสลิปการโอน]
                         │                             │
                  ┌──────┴──────┐                      ▼
                  ▼             ▼              [Admin Verify สลิป]
           [Success]     [Failed]                      │
                  │             │               ┌──────┴──────┐
                  ▼             ▼               ▼             ▼
           [Activate     [Show Error    [Approve →      [Reject →
            + Receipt     + Retry]       Activate        Show Reason
            + Notify]                    + Receipt        + Retry]
                                         + Notify]
```

**Happy Path:**
1. Tenant Admin ไปที่ Subscription Page → เลือก "Pro Plan" สำหรับ Avatar Sub-Platform → System แสดง Order Summary: Pro Plan - 2,990 THB/month
2. Tenant Admin คลิก "Subscribe" → เลือกช่องทางชำระเงิน → เลือก "2C2P Online" → Redirect ไป 2C2P Checkout
3. Tenant Admin เลือก Credit Card → กรอกข้อมูล → ยืนยัน 3D Secure → ชำระสำเร็จ
4. 2C2P redirect กลับ → System activate subscription ทันที → แสดง "Subscription activated! Pro Plan for Avatar is now active." → ส่ง email receipt + Telegram notification
5. Tenant Admin เห็น subscription status = Active บน Subscription Page

**Alternative Happy Path (Offline Payment):**
1. Tenant Admin เลือก Plan → เลือกช่องทาง "โอนตรง+แนบสลิป" → ระบบแสดงข้อมูลบัญชีธนาคาร
2. Tenant Admin โอนเงิน → อัปโหลดสลิป → ระบบแสดง "รอ Admin ตรวจสอบการชำระเงิน"
3. Admin verify สลิป + approve → System activate subscription → ส่ง notification

**Alternative Path(s):**
- At Step 1: Tenant Admin upgrade จาก Basic → Pro กลางรอบ → System คำนวณ prorate: "คุณใช้ Basic ไปแล้ว 15 วัน เหลือ 15 วัน ส่วนต่าง = 1,495 THB" → Continue Step 2
- At Step 1: Tenant Admin downgrade จาก Pro → Basic → System แจ้ง: "Downgrade จะมีผลในรอบถัดไป (เริ่ม [date]) คุณยังใช้ Pro ได้จนถึง [date]" → ไม่ต้องชำระเพิ่ม → Save preference
- At Step 2: Tenant Admin เลือกชำระผ่าน "QR บริษัท" → ระบบแสดง QR Code → Tenant สแกน QR + โอนเงิน + อัปโหลดสลิป → รอ Admin verify → Activate subscription

**Exception Path(s):**
- At Step 3: If ชำระล้มเหลว (card declined) → See Error Scenario table
- At Step 4: If Subscription ไม่ activate หลังชำระสำเร็จ → See Error Scenario table

### 11.5 Auto-Payment & Recurring Billing

**Business Flow:**

```
[Monthly Renewal Date] → [System Attempts Auto-Charge]
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
                [Charge Success]          [Charge Failed]
                        │                       │
                        ▼                       ▼
                [Renew Subscription]     [Enter Grace Period
                 + Receipt Email]         (3 days)]
                                                │
                                                ▼
                                        [Notify Tenant Admin:
                                         Payment failed,
                                         please update payment]
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                            [Tenant Pays            [Grace Period
                             Within 3 Days]          Expired]
                                    │                       │
                                    ▼                       ▼
                            [Renew Subscription]    [Suspend Subscription]
                                                           │
                                                           ▼
                                                    [Notify: Account
                                                     Suspended]
                                                           │
                                                           ▼
                                                    [Tenant Must Pay
                                                     to Reactivate]
```

**Business Rules:**
- BR-CMT.31: Auto-charge เกิดขึ้นเมื่อ Tenant Admin บันทึก card ไว้ + เลือกเปิด auto-payment
- BR-CMT.32: ถ้า auto-charge ล้มเหลว → เข้าสู่ Grace Period 3 วันปฏิทิน
- BR-CMT.33: ระหว่าง Grace Period → Tenant ยังใช้งานได้ปกติ + ได้รับ notification ทุกวัน (Telegram + Email) ให้ชำระเงิน
- BR-CMT.34: หลัง Grace Period หมด (3 วัน) + ยังไม่ชำระ → Subscription ถูก suspend
- BR-CMT.35: เมื่อ Subscription ถูก suspend:
  - Tenant ไม่สามารถเรียก API ของ Sub-Platform นั้นได้
  - Tenant ยังสามารถ login + ดู dashboard + ชำระเงินเพื่อ reactivate ได้
  - Data ของ Tenant ไม่ถูกลบ (เก็บไว้ 90 วัน)
- BR-CMT.36: Reactivation → Tenant ชำระค่า subscription ที่ค้าง + subscription กลับมา active ทันที
- BR-CMT.37: ถ้า Suspend เกิน 90 วัน → Tenant ถูก mark เป็น "Inactive" + แจ้งเตือน data retention policy

### 11.6 Relationship to M-BE-07 (Billing)

| Concern | Responsible | Notes |
|---------|------------|-------|
| Billing records & invoices | M-BE-07 | จัดเก็บและจัดการ invoice, receipt, billing history |
| Payment processing (multi-channel) | M-BE-07 | ดำเนินการชำระเงินผ่าน 3 ช่องทาง (2C2P + Direct Transfer + Company QR) |
| Auto-charge scheduling | M-BE-07 | กำหนด schedule สำหรับ recurring charge |
| Grace period management | M-BE-07 | Track grace period + trigger suspension |
| Token wallet management | M-BE-07 | เพิ่ม/ลด token balance |
| Payment flow UX (what Tenant sees) | **This PRD (X-MT-01)** | กำหนด user experience + acceptance criteria |
| Prorate calculation rules | **This PRD (X-MT-01)** | กำหนด business rules สำหรับ upgrade/downgrade |
| Grace period / suspension rules | **This PRD (X-MT-01)** | กำหนด business rules สำหรับ grace period |

> **Note:** This PRD defines WHAT payment capabilities Tenant needs and business rules; M-BE-07 defines HOW billing, invoicing, and payment processing work technically.

### 11.7 Edge Cases (Payment)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-CMT.16 | State/Timing | Tenant upgrade plan แล้วชำระเงินผ่าน Bank Transfer (ไม่ real-time) | Subscription ยังไม่ activate จนกว่าเงินเข้า | แสดง: "กำลังรอยืนยันการชำระเงิน Subscription จะ activate อัตโนมัติเมื่อได้รับเงิน (ภายใน 1 วันทำการ)" |
| EC-CMT.17 | Integration | 2C2P ล่ม / ไม่ตอบสนอง | Tenant ไม่สามารถชำระเงินผ่าน 2C2P ได้ | แสดง: "ระบบชำระเงินออนไลน์ขัดข้อง กรุณาลองอีกครั้ง หรือเลือกช่องทางอื่น (โอนตรง/QR บริษัท)" |
| EC-CMT.18 | State/Timing | Tenant ชำระเงินผ่าน 2C2P สำเร็จ แต่ระหว่าง redirect กลับ network ขาด | Tenant ไม่เห็นหน้า confirmation | Payment ยังคง valid -- Token/Subscription activate ตาม webhook callback จาก 2C2P ไม่ขึ้นกับ redirect + Tenant สามารถตรวจสอบใน Billing History |
| EC-CMT.19 | Data Boundary | Tenant พยายามซื้อ subscription plan ที่ถูก retire แล้ว (เพราะกดค้าง) | Plan ไม่มีให้ซื้อแล้ว | แสดง: "Plan นี้ไม่พร้อมให้บริการแล้ว กรุณาเลือก plan อื่น" + redirect ไปหน้า Plan Selection |
| EC-CMT.20 | State/Timing | Auto-charge ล้มเหลว 3 ครั้งติดต่อกัน (3 วัน grace period) | ใกล้ถูก suspend | วันที่ 1, 2, 3: ส่ง notification ทวีความเข้ม (วันที่ 1 = reminder, วันที่ 2 = urgent, วันที่ 3 = final warning before suspension) |
| EC-CMT.21 | Business Rule | Tenant ขอ downgrade ระหว่าง grace period | ไม่ควรอนุญาตเพราะยังค้างชำระ | แสดง: "ไม่สามารถเปลี่ยน plan ได้ขณะมียอดค้างชำระ กรุณาชำระเงินก่อน" |
| EC-CMT.22 | Business Rule | Admin ไม่ verify สลิปภายใน 1 วันทำการ | Tenant รอนาน, subscription/token ยัง pending | ระบบแจ้งเตือน Admin ซ้ำทุก 4 ชั่วโมง + Tenant ได้รับ notification "กำลังตรวจสอบการชำระเงิน" |
| EC-CMT.23 | Business Rule | Admin reject สลิป (สลิปปลอม/ไม่ตรง) | Tenant ต้องชำระใหม่ | แสดง: "สลิปไม่ผ่านการตรวจสอบ เหตุผล: [reason] กรุณาชำระเงินใหม่" + Tenant สามารถลองช่องทางอื่นได้ |

### 11.8 Error Scenarios (Payment)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Card declined | Integration | High | ชำระผ่าน credit card | "บัตรถูกปฏิเสธ กรุณาตรวจสอบข้อมูลบัตร วงเงิน หรือลองวิธีชำระเงินอื่น" | ลองบัตรใหม่ / เปลี่ยนวิธีชำระ |
| 3D Secure failed | Integration | High | ยืนยัน OTP ไม่สำเร็จ | "การยืนยันตัวตนไม่สำเร็จ กรุณาลองอีกครั้ง" | กรอก OTP ใหม่ / ลองบัตรอื่น |
| PromptPay QR expired | Integration | Medium | ไม่ scan QR ภายในเวลาที่กำหนด | "QR Code หมดอายุ กรุณาสร้างใหม่" | คลิก "Generate New QR" |
| 2C2P timeout | System | High | รอนานหน้า 2C2P checkout | "ระบบชำระเงินออนไลน์ไม่ตอบสนอง กรุณาลองอีกครั้ง หรือเลือกช่องทางอื่น" | คลิก Retry / เลือกโอนตรง/QR บริษัท |
| Duplicate payment | Business Rule | Critical | Tenant กด pay 2 ครั้ง (double click) | "รายการนี้กำลังดำเนินการอยู่ กรุณารอ..." | ปุ่มถูก disable หลังกดครั้งแรก + idempotency protection |
| Subscription ไม่ activate หลังชำระ | System | Critical | ชำระสำเร็จแต่ plan ไม่ active | "การชำระเงินสำเร็จ แต่ subscription อยู่ระหว่างดำเนินการ หากไม่ activate ภายใน 15 นาที กรุณาติดต่อ Support" | Auto-reconcile + contact Support ถ้าเกิน 15 นาที |
| Prorate คำนวณผิด | System | High | Upgrade plan กลางรอบ + เห็นราคาไม่ถูก | "เกิดข้อผิดพลาดในการคำนวณ กรุณาติดต่อ Support" | ติดต่อ Support + ไม่ดำเนินการจนกว่าจะแก้ไข |

---

# ===============================================================
# PART C: CENTRAL ADMIN EXPERIENCE
# ประสบการณ์ฝั่ง Central Admin (Super Admin, Platform Admin)
# ===============================================================

## 12. Central Admin Dashboard

> **Context:** Central Admin (Super Admin / Platform Admin) ต้องมองเห็นภาพรวมทุก Sub-Platform, ทุก Tenant, และสามารถ drill-down ดูรายละเอียดได้
> Dashboard นี้อยู่ใน Internal Portal (Backoffice) -- ขยาย M-BE-10 (Dashboard)

### 12.1 Feature Overview (Central Admin Dashboard)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-AMT.3 | Cross-Sub-Platform Overview | Central Admin | P0 | Dashboard แสดง metrics รวมทุก Sub-Platform |
| F-AMT.4 | Per-Sub-Platform Drill-Down | Central Admin | P0 | ดูรายละเอียด Tenant ภายใน Sub-Platform |
| F-AMT.5 | Tenant Purchase Log | Central Admin | P1 | ดูประวัติการซื้อของ Tenant ข้าม Sub-Platform |
| F-AMT.6 | Revenue Analytics | Central Admin | P1 | วิเคราะห์รายได้ตาม Sub-Platform และช่วงเวลา |

### 12.2 User Stories (Central Admin Dashboard)

#### US-AMT.3: Central Admin Views Cross-Sub-Platform Overview

**As a** Central Admin
**I want** to see a dashboard showing key metrics across all Sub-Platforms
**So that** I can monitor the overall health and performance of the entire platform at a glance

**Acceptance Criteria:**
- [ ] ฉันเห็น summary cards ของแต่ละ Sub-Platform: Total Tenants, Active Subscriptions, Total Revenue (เดือนนี้), Token Consumption (เดือนนี้)
- [ ] ฉันเห็น chart แสดง trend: Revenue ย้อนหลัง 6 เดือน แยกตาม Sub-Platform
- [ ] ฉันเห็น chart แสดง trend: Tenant Growth ย้อนหลัง 6 เดือน
- [ ] ฉันเห็น Top 5 Tenants by Revenue (เดือนนี้)
- [ ] ฉันเห็น alert section: Tenants in Grace Period, Suspended Tenants, Low Token Balance Tenants
- [ ] ฉันสามารถ click ที่ Sub-Platform card เพื่อ drill-down ดูรายละเอียดได้
- [ ] Dashboard auto-refresh ทุก 5 นาที หรือ manual refresh ได้

**UI/UX Notes:**
- Dashboard อยู่ใน Internal Portal > Dashboard (Home Page)
- Layout: Summary cards ด้านบน → Charts ตรงกลาง → Alerts/Tables ด้านล่าง
- Sub-Platform cards แสดงสีตาม status (green = healthy, yellow = warning, red = critical)

---

#### US-AMT.4: Central Admin Views Per-Sub-Platform Tenants

**As a** Central Admin
**I want** to view and filter the list of tenants within a specific Sub-Platform
**So that** I can manage and monitor individual tenant health within each Sub-Platform

**Acceptance Criteria:**
- [ ] ฉันเห็น Tenant list ที่แสดง: Company Name, Plan, Token Balance, Token Usage (เดือนนี้), Subscription Status, Join Date
- [ ] ฉันสามารถ filter ตาม: Plan (Free/Basic/Pro/Enterprise), Status (Active/Suspended/Grace Period/Inactive), Date Range (join date)
- [ ] ฉันสามารถ search ตาม Company Name หรือ Tenant ID
- [ ] ฉันสามารถ sort ตาม: Company Name, Token Usage, Revenue, Join Date
- [ ] ฉันสามารถ click ที่ Tenant เพื่อดู Tenant Detail Page (ข้อมูลรวมของ Tenant นั้นๆ ข้ามทุก Sub-Platform)
- [ ] ฉันสามารถ export Tenant list เป็น CSV ได้
- [ ] Pagination สำหรับ list ที่มี Tenant จำนวนมาก (แสดง 25/50/100 per page)

**UI/UX Notes:**
- เข้าได้จาก Dashboard > Click Sub-Platform card หรือ Sidebar > Sub-Platforms > [ชื่อ Sub-Platform]
- Data Table with sticky header + row hover highlight
- Quick actions ต่อ row: View Detail, Suspend, Activate (ตาม permission)

---

#### US-AMT.5: Central Admin Views Tenant Purchase Log

**As a** Central Admin
**I want** to view a unified purchase/transaction log across all Sub-Platforms for any tenant
**So that** I can audit financial activity, resolve disputes, and understand tenant spending patterns

**Acceptance Criteria:**
- [ ] ฉันเห็น unified transaction log ที่รวมทุก transaction types:
  - Token Purchases: จำนวน tokens, ราคา (THB), Sub-Platform, วันเวลา, payment method
  - Subscription Payments: ชื่อ plan, จำนวนเงิน (THB), Sub-Platform, วันเวลา, billing period
  - Plan Changes: จาก plan → ไป plan, Sub-Platform, วันเวลา, prorate amount (ถ้ามี)
  - Usage Events: ประเภท (Avatar interaction, Booking slot, etc.), จำนวน tokens ที่ใช้, Sub-Platform, วันเวลา
- [ ] ฉันสามารถ filter ตาม: Sub-Platform, Tenant (search by name/ID), Date Range, Transaction Type (Token Purchase / Subscription / Plan Change / Usage)
- [ ] ฉันสามารถ sort ตาม: Date, Amount, Sub-Platform
- [ ] ฉันเห็น summary ด้านบน: Total Transactions (ในช่วงที่ filter), Total Revenue, Total Tokens Consumed
- [ ] ฉันสามารถ export log เป็น CSV ได้ (สำหรับ accounting / reconciliation)
- [ ] ฉันสามารถ click ที่ transaction เพื่อดู detail (receipt, invoice reference)

**UI/UX Notes:**
- Purchase Log อยู่ใน Internal Portal > Finance > Purchase Log
- หรือเข้าจาก Tenant Detail Page > Purchase History tab
- Date Range default = เดือนปัจจุบัน, สามารถเลือก range ได้เอง

---

#### US-AMT.6: Central Admin Views Revenue Analytics

**As a** Central Admin
**I want** to view revenue analytics broken down by Sub-Platform, revenue type, and time period
**So that** I can make data-driven decisions about pricing, marketing, and resource allocation

**Acceptance Criteria:**
- [ ] ฉันเห็น Revenue breakdown ตาม Sub-Platform (bar chart หรือ pie chart)
- [ ] ฉันเห็น Revenue breakdown ตามประเภท: Subscription Fees vs Token Top-ups (stacked chart)
- [ ] ฉันเห็น Period comparison: เดือนปัจจุบัน vs เดือนก่อน (growth rate %)
- [ ] ฉันเห็น Top 10 Tenants by Spend (เดือนปัจจุบัน + สะสม)
- [ ] ฉันสามารถเลือก date range สำหรับ analysis (day/week/month/quarter/year)
- [ ] ฉันสามารถ filter ตาม Sub-Platform เพื่อดูเฉพาะ Sub-Platform ที่สนใจ
- [ ] ฉันสามารถ export revenue report เป็น CSV / PDF

**UI/UX Notes:**
- Revenue Analytics อยู่ใน Internal Portal > Finance > Revenue
- Interactive charts (hover เห็นตัวเลข, click เพื่อ drill-down)
- Default view = Monthly comparison for current year

### 12.3 User Flows (Central Admin Dashboard)

#### Flow 1: Cross-Sub-Platform Monitoring

```
[Central Admin Login] → [Dashboard Home]
                              │
                              ▼
                    [View Summary Cards]
                    (per Sub-Platform)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       [Click Avatar     [Click Booking   [Click Social
        Sub-Platform]     Sub-Platform]    Listening]
              │
              ▼
       [Per-Sub-Platform
        Tenant List]
              │
       ┌──────┴──────┐
       ▼              ▼
[Filter/Search]  [Click Tenant]
                      │
                      ▼
              [Tenant Detail Page]
              (all Sub-Platforms
               for this Tenant)
                      │
              ┌───────┼───────┐
              ▼       ▼       ▼
          [Purchase  [Usage  [Team
           History]  Stats]  Members]
```

**Happy Path:**
1. Central Admin login → เข้า Dashboard Home → เห็น Summary Cards ทุก Sub-Platform
2. Central Admin สังเกต Avatar Sub-Platform มี revenue สูงสุด → Click เข้าไป
3. System แสดง Tenant list ของ Avatar Sub-Platform → Admin เห็น 50 tenants
4. Admin filter by Status = "Grace Period" → เห็น 3 tenants ที่กำลังจะถูก suspend
5. Admin click เข้าไปดู Tenant "Company ABC" → เห็น Tenant Detail Page ครอบคลุมทุก Sub-Platform

**Alternative Path(s):**
- At Step 2: Admin ไปที่ Finance > Purchase Log แทน → ดู transaction log ทุก Sub-Platform → Filter by specific tenant
- At Step 4: Admin click "Export CSV" → ดาวน์โหลดรายชื่อ tenants → ส่งต่อ Finance team

### 12.4 Admin Business Rules

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-AMT.3 | Central Admin เห็นข้อมูลทุก Sub-Platform ทุก Tenant (cross-Sub-Platform visibility) | Dashboard, Tenant List, Purchase Log |
| BR-AMT.4 | Revenue data ต้องตรงกับ M-BE-07 (Billing) -- single source of truth | Revenue Analytics |
| BR-AMT.5 | Dashboard metrics คำนวณแบบ near-real-time (delay ไม่เกิน 5 นาที) | Dashboard |
| BR-AMT.6 | Export CSV ต้องรวม headers ที่ชัดเจน + timestamp ที่ export | All exports |
| BR-AMT.7 | Tenant Detail Page ต้องรวมข้อมูลจากทุก Sub-Platform ที่ Tenant subscribe | Tenant Detail |

### 12.5 Edge Cases (Central Admin Dashboard)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AMT.2 | Data Boundary | Sub-Platform ใหม่เพิ่งสร้าง ยังไม่มี Tenant | Dashboard card แสดง metrics = 0 | แสดง card ปกติพร้อมค่า 0 + tooltip "Sub-Platform ยังไม่มี Tenant" |
| EC-AMT.3 | Data Boundary | Tenant subscribe หลาย Sub-Platform -- revenue ต้องแยกให้ถูก | Revenue Analytics อาจนับซ้ำ | Revenue ต้อง attribute ไปยัง Sub-Platform ที่ transaction เกิดขึ้นจริง -- ไม่นับซ้ำ |
| EC-AMT.4 | State/Timing | Dashboard load ขณะที่ billing system กำลัง process end-of-month | ตัวเลขอาจไม่ stable | แสดง indicator "Data is being processed" + แนะนำ refresh ภายหลัง |
| EC-AMT.5 | Data Boundary | Export CSV ที่มีข้อมูลเป็นหมื่น rows | ไฟล์อาจใหญ่มาก / timeout | ถ้า rows > 10,000 ให้ async export → ส่ง download link ทาง email เมื่อพร้อม |

### 12.6 Error Scenarios (Central Admin Dashboard)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Dashboard load ล้มเหลว | System | High | เข้าหน้า Dashboard | "ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง" | คลิก Refresh / Retry |
| Revenue data ไม่ตรงกับ Billing | System | Critical | ดู Revenue Analytics | (ไม่แสดง error โดยตรง แต่ต้องมี data reconciliation process) | Internal monitoring alert → Finance team ตรวจสอบ |
| Export timeout (ข้อมูลมาก) | System | Medium | Export CSV ที่มีข้อมูลเกิน 10,000 rows | "ข้อมูลมากเกินไปสำหรับ export แบบทันที ระบบจะส่ง download link ไปทาง email เมื่อพร้อม" | รอ email download link |
| Sub-Platform data sync ล้าช้า | Integration | Medium | ดู Dashboard ตอนข้อมูลกำลัง sync | Banner: "ข้อมูลบาง Sub-Platform อาจยังไม่เป็นปัจจุบัน อัปเดตล่าสุด: [timestamp]" | รอ sync เสร็จ + refresh |

---

## 13. Sub-Platform Management -- M-BE-12 (New Module, Lightweight)

### 13.1 Why M-BE-12 is a Separate Module

**Business Rationale:**

| Concern | Reason for Separation |
|---------|----------------------|
| Independent Lifecycle | Sub-Platform entity มี CRUD lifecycle ของตัวเอง (Register → Configure → Active → Retired) ซึ่งแตกต่างจาก global settings |
| Scalability | เมื่อ Realfact เพิ่ม Sub-Platform ใหม่ (เช่น AI Live Commerce, MRP) ต้องมีที่จัดการ identity ที่ชัดเจน ไม่ใช่ buried ใน M-BE-11 |
| Separation of Concerns | M-BE-11 (Setting) จัดการ platform-wide config (เช่น global defaults, system parameters) ส่วน M-BE-12 จัดการ "ตัวตน" ของแต่ละ Sub-Platform |
| Cross-Module Reference | Sub-Platform ถูกอ้างถึงจากหลาย modules (M-BE-05, M-BE-06, M-BE-07, M-DP-01) ควรมี module เดียวที่เป็น source of truth |

**M-BE-12 Scope:** จัดการเฉพาะ "identity" ของ Sub-Platform (ชื่อ, code, status, branding defaults, landing domain) -- Lightweight module ไม่ซับซ้อน

### 13.2 Feature Overview (Sub-Platform Management)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-AMT.7 | Sub-Platform CRUD | Central Admin | P0 | สร้าง/แก้ไข/ดู Sub-Platform entity |
| F-AMT.8 | Sub-Platform Branding Defaults | Central Admin | P1 | กำหนด default branding สำหรับ Sub-Platform (Tenant สามารถ override ได้) |
| F-AMT.9 | Sub-Platform Lifecycle Management | Central Admin | P0 | จัดการ state transitions ของ Sub-Platform |
| F-AMT.10 | Sub-Platform Monitoring | Central Admin | P1 | ดู health & usage metrics ของแต่ละ Sub-Platform |

### 13.3 User Stories (Sub-Platform Management)

#### US-AMT.7: Admin Creates/Configures New Sub-Platform

**As a** Central Admin
**I want** to register and configure a new Sub-Platform
**So that** tenants can discover and subscribe to the new Sub-Platform's services

**Acceptance Criteria:**
- [ ] ฉันสามารถสร้าง Sub-Platform ใหม่โดยกรอก: Name (ชื่อแสดง), Code (unique identifier, ภาษาอังกฤษ, ไม่มีช่องว่าง), Description (คำอธิบาย)
- [ ] ฉันสามารถกำหนด Landing Domain สำหรับ Sub-Platform (เช่น avatar.realfact.ai)
- [ ] Sub-Platform ใหม่จะมี status = "Registered" (ยังไม่ active) จนกว่า Admin จะ configure ครบและ activate
- [ ] Code ต้องไม่ซ้ำกับ Sub-Platform อื่น -- ถ้าซ้ำฉันเห็น error message
- [ ] ฉันสามารถแก้ไขข้อมูล Sub-Platform ได้ตลอดเวลา (ยกเว้น Code ซึ่งแก้ไม่ได้หลัง create)
- [ ] ฉันเห็นรายชื่อ Sub-Platform ทั้งหมดพร้อม: Name, Code, Status, Tenant Count, Created Date

**UI/UX Notes:**
- Sub-Platform Management อยู่ใน Internal Portal > Sub-Platforms
- Create Sub-Platform ผ่าน modal หรือ dedicated form page
- Code field: auto-suggest จากชื่อ (lowercase, dash-separated) แต่ editable

**Business Rules:**
- BR-AMT.8: Sub-Platform Code ต้องเป็น unique, lowercase alphanumeric + dash เท่านั้น (เช่น "avatar", "social-listening", "ai-live-commerce")
- BR-AMT.9: Code ไม่สามารถเปลี่ยนได้หลังจากสร้าง (immutable) เพราะถูกอ้างถึงจาก modules อื่น
- BR-AMT.10: ทุกการเปลี่ยนแปลง Sub-Platform ต้องถูกบันทึกใน Activity Log (M-BE-09)

---

#### US-AMT.8: Admin Configures Sub-Platform Default Branding

**As a** Central Admin
**I want** to configure default branding for a Sub-Platform
**So that** tenants who don't customize their branding will see a professional, Sub-Platform-specific look and feel

**Acceptance Criteria:**
- [ ] ฉันสามารถกำหนด default branding สำหรับ Sub-Platform: Landing Page Design (hero image, tagline), Default Color Theme (primary/secondary/accent), Marketing Content (features list, screenshots), Logo
- [ ] Default branding ถูก apply ให้กับทุก Tenant ที่ยังไม่ได้ customize branding ของตัวเอง
- [ ] ถ้า Tenant customize branding เอง → Tenant's branding override Sub-Platform default
- [ ] ฉันสามารถ preview landing page ก่อน publish
- [ ] การเปลี่ยน default branding ไม่กระทบ Tenant ที่ customize เองแล้ว -- กระทบเฉพาะ Tenant ที่ใช้ default

**UI/UX Notes:**
- Branding Defaults อยู่ใน Internal Portal > Sub-Platforms > [ชื่อ Sub-Platform] > Branding tab
- Landing Page editor แบบ WYSIWYG หรือ preview-based (ไม่ต้อง code)

**Business Rules:**
- BR-AMT.11: Branding hierarchy: Tenant Custom Branding (P1) > Sub-Platform Default (P2) > Realfact Platform Default (P3)
- BR-AMT.12: เมื่อเปลี่ยน Sub-Platform default branding → propagate ทันทีให้ทุก Tenant ที่ใช้ default (ไม่กระทบ Tenant ที่ customize เอง)

---

#### US-AMT.9: Admin Manages Sub-Platform Lifecycle

**As a** Central Admin
**I want** to manage the lifecycle states of a Sub-Platform
**So that** I can control when Sub-Platforms are available to tenants and gracefully retire obsolete ones

**Acceptance Criteria:**
- [ ] ฉันสามารถเปลี่ยน status ของ Sub-Platform ตาม state transitions ที่อนุญาต
- [ ] ก่อน Activate: System ตรวจสอบว่า Sub-Platform ถูก configure ครบ (มี Subscription Plans อย่างน้อย 1 plan, มี Token Exchange Rate, มี Landing Page)
- [ ] ก่อน Retire: System แสดง warning รวมจำนวน active tenants ที่จะได้รับผลกระทบ
- [ ] ฉันต้อง confirm ก่อนทำ Retire + ต้องระบุเหตุผล
- [ ] หลัง Retire: Tenant ที่มีอยู่ยังใช้งานได้ตาม plan ที่เหลือ แต่ Tenant ใหม่สมัครไม่ได้
- [ ] ทุก state transition ต้องถูกบันทึกใน Activity Log

**Sub-Platform Lifecycle States:**

```
[Registered] ──► [Configured] ──► [Active] ──► [Retired]
     │                │               │
     │                │               └──► [Temporarily Inactive]
     │                │                           │
     │                │                           └──► [Active] (re-activate)
     └──► (Delete - only if no tenants ever)
```

| State | Description | Tenant Impact |
|-------|-------------|---------------|
| Registered | เพิ่งสร้าง ยังไม่ได้ configure | ไม่มี -- ไม่ visible ต่อ Tenant |
| Configured | Configure ครบ (plans, rate, landing) แต่ยังไม่เปิดให้ใช้ | ไม่มี -- ไม่ visible ต่อ Tenant |
| Active | เปิดให้ Tenant สมัครและใช้งานได้ | Tenant สมัครใหม่ได้ + Tenant เก่าใช้ได้ |
| Temporarily Inactive | ปิดชั่วคราว (เช่น maintenance) | Tenant เก่ายังใช้ได้ + Tenant ใหม่สมัครไม่ได้ |
| Retired | ปิดถาวร | Tenant เก่าใช้ได้จนหมด plan + Tenant ใหม่สมัครไม่ได้ + ไม่แสดง Landing Page |

**Business Rules:**
- BR-AMT.13: Activation requires: (a) มี Subscription Plan อย่างน้อย 1 plan, (b) มี Token Exchange Rate, (c) มี Landing Page content
- BR-AMT.14: Retire ต้อง confirm + ระบุเหตุผล + ไม่สามารถ undo ได้ (irreversible)
- BR-AMT.15: Retired Sub-Platform: existing tenants ยังใช้ได้จนหมด current billing cycle → หลังจากนั้น subscription ไม่ renew + data retention 90 วัน
- BR-AMT.16: Delete Sub-Platform ได้เฉพาะ status = Registered หรือ Configured ที่ยังไม่เคยมี Tenant เท่านั้น

---

#### US-AMT.10: Admin Monitors Sub-Platform Health & Usage

**As a** Central Admin
**I want** to monitor each Sub-Platform's health and usage metrics
**So that** I can identify issues early and allocate resources appropriately

**Acceptance Criteria:**
- [ ] ฉันเห็น per-Sub-Platform metrics: Active Tenant Count, Total Subscriptions (by plan), Token Consumption (day/week/month), Revenue (day/week/month)
- [ ] ฉันเห็น trend charts สำหรับ metrics ข้างต้น (เลือก period ได้)
- [ ] ฉันเห็น alert indicators: tenants in grace period, subscription churn rate, unusual token consumption spikes
- [ ] ฉันสามารถ compare 2 Sub-Platforms side-by-side ได้
- [ ] ฉันสามารถ export metrics report เป็น CSV / PDF

**UI/UX Notes:**
- Monitoring อยู่ใน Internal Portal > Sub-Platforms > [ชื่อ Sub-Platform] > Monitoring tab
- หรือเข้าจาก Dashboard > Click Sub-Platform card > Overview tab

### 13.4 User Flows (Sub-Platform Management)

#### Flow 1: Register and Activate New Sub-Platform

```
[Central Admin] → [Sub-Platforms] → [Click "Create New"]
                                           │
                                           ▼
                                    [Fill: Name, Code,
                                     Description, Domain]
                                           │
                                           ▼
                                    [Save → Status = "Registered"]
                                           │
                                           ▼
                              ┌────────────┼────────────┐
                              ▼            ▼            ▼
                       [Configure    [Configure    [Configure
                        Plans         Token Rate    Landing Page
                        (M-BE-06)]    (M-BE-05)]    Branding]
                              │            │            │
                              └────────────┼────────────┘
                                           ▼
                                    [All Configured?]
                                           │
                                    ┌──────┴──────┐
                                    ▼             ▼
                              [Yes: Status    [No: Cannot
                               = "Configured"]  Activate]
                                    │
                                    ▼
                              [Click "Activate"]
                                    │
                                    ▼
                              [Confirm Activation]
                                    │
                                    ▼
                              [Status = "Active"]
                              [Sub-Platform visible
                               to Tenants]
```

**Happy Path:**
1. Central Admin ไปที่ Sub-Platforms → คลิก "Create New"
2. Admin กรอก: Name = "AI Live Commerce", Code = "ai-live-commerce", Description = "...", Domain = "live.realfact.ai" → คลิก Save
3. System สร้าง Sub-Platform สำเร็จ → Status = "Registered"
4. Admin configure Subscription Plans (ผ่าน M-BE-06), Token Exchange Rate (ผ่าน M-BE-05), Landing Page Branding (ใน M-BE-12)
5. System ตรวจพบ configure ครบ → Status เปลี่ยนเป็น "Configured"
6. Admin คลิก "Activate" → System แสดง Confirmation → Admin confirm
7. Status = "Active" → Sub-Platform visible ต่อ Tenant + Tenant สามารถสมัครได้

**Alternative Path(s):**
- At Step 4: Admin configure Plans + Rate แต่ยังไม่ทำ Landing Page → Status ยังคง "Registered" → ไม่สามารถ Activate → Admin กลับมาทำ Landing Page ภายหลัง
- At Step 6: Admin ต้องการ soft-launch → Activate แต่ยังไม่ประกาศ → Sub-Platform visible เฉพาะใน platform (ไม่ featured บนหน้าแรก)

**Exception Path(s):**
- At Step 2: If Code ซ้ำ → See Error Scenario table
- At Step 6: If configuration ไม่ครบ → System แสดง checklist ว่ายังขาดอะไร

#### Flow 2: Retire Sub-Platform

```
[Central Admin] → [Sub-Platforms] → [Select Active Sub-Platform]
                                              │
                                              ▼
                                    [Click "Retire"]
                                              │
                                              ▼
                                    [System Shows Warning:]
                                    "Sub-Platform มี X active tenants
                                     Y active subscriptions
                                     จะได้รับผลกระทบ"
                                              │
                                              ▼
                                    [Admin Enters Reason]
                                              │
                                              ▼
                                    [Confirm Retire]
                                              │
                                              ▼
                                    [Status = "Retired"]
                                    [No new tenant signups]
                                    [Existing tenants: use until
                                     current billing cycle ends]
                                    [Activity Log recorded]
                                    [Notify affected tenants]
```

**Happy Path:**
1. Central Admin เลือก Sub-Platform "Booking" (Active, 5 tenants) → คลิก "Retire"
2. System แสดง warning: "Booking Sub-Platform มี 5 active tenants, 5 active subscriptions จะได้รับผลกระทบ"
3. Admin กรอกเหตุผล: "Discontinued due to low adoption" → คลิก "Confirm Retire"
4. System เปลี่ยน status = "Retired" → บันทึก Activity Log → ส่ง notification ไปยัง Tenant Admins ของ 5 tenants ว่า Sub-Platform จะถูก retire
5. Existing tenants ยังใช้งานได้จนหมด current billing cycle → หลังจากนั้น subscription ไม่ renew อัตโนมัติ

### 13.5 Edge Cases (Sub-Platform Management)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AMT.1 | Business Rule | Admin พยายาม Retire Sub-Platform ที่มี active tenants จำนวนมาก (เช่น 500 tenants) | Tenant จำนวนมากได้รับผลกระทบ | แสดง warning พร้อมจำนวน + ต้อง double-confirm (type Sub-Platform name เพื่อยืนยัน) + ระบุ transition plan |
| EC-AMT.6 | State | Admin พยายาม Activate Sub-Platform ที่ยังไม่ configure ครบ | ไม่สามารถ activate ได้ | แสดง checklist: "ยังขาด: (1) Subscription Plans (2) Token Exchange Rate กรุณา configure ให้ครบก่อน Activate" |
| EC-AMT.7 | Input Boundary | Admin สร้าง Sub-Platform Code ที่มี special characters | Code ไม่ valid | แสดง: "Code ต้องเป็น lowercase alphanumeric + dash เท่านั้น (เช่น ai-live-commerce)" |
| EC-AMT.8 | State/Timing | 2 Admin แก้ไข Sub-Platform เดียวกันพร้อมกัน | Admin คนที่ 2 อาจ overwrite | แสดง warning: "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นเมื่อ [timestamp] กรุณา refresh" |
| EC-AMT.9 | Business Rule | Admin พยายาม Delete Sub-Platform ที่เคยมี Tenant แล้ว (แม้ตอนนี้ไม่มี) | ข้อมูลอ้างอิงอาจหาย | ไม่อนุญาต Delete -- แสดง: "ไม่สามารถลบได้เพราะเคยมี Tenant ใช้งาน กรุณาใช้ Retire แทน" |

### 13.6 Error Scenarios (Sub-Platform Management)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Code ซ้ำ | Validation | Medium | สร้าง Sub-Platform ด้วย Code ที่มีอยู่แล้ว | "Code 'avatar' มีอยู่แล้ว กรุณาใช้ Code อื่น" | เปลี่ยน Code |
| Code format ไม่ valid | Validation | Low | กรอก Code มี space / uppercase | "Code ต้องเป็น lowercase, alphanumeric, และ dash เท่านั้น" | แก้ไข Code |
| Activate ไม่ครบ config | Business Rule | High | คลิก Activate ก่อน configure ครบ | "ยังไม่สามารถ Activate ได้ กรุณา configure: [missing items]" | ไป configure ให้ครบ |
| Retire ไม่สำเร็จ (system error) | System | High | คลิก Confirm Retire | "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง" | คลิก Retry |
| Delete Sub-Platform ที่เคยมี Tenant | Business Rule | Critical | คลิก Delete | "ไม่สามารถลบได้เพราะเคยมี Tenant ใช้งาน กรุณาใช้ Retire แทน" | ใช้ Retire แทน Delete |

### 13.7 Responsibility Distribution (NOT in M-BE-12)

> **Clarification:** M-BE-12 จัดการเฉพาะ "ตัวตน" ของ Sub-Platform เท่านั้น ส่วนเรื่องอื่นเป็นความรับผิดชอบของ modules ที่เหมาะสม

| Concern | Responsible Module | Reason |
|---------|-------------------|--------|
| Sub-Platform identity (name, code, status, lifecycle) | **M-BE-12 (Sub-Platform Mgmt)** | Core identity management |
| Sub-Platform default branding | **M-BE-12 (Sub-Platform Mgmt)** | Branding defaults เป็นส่วนหนึ่งของ Sub-Platform identity |
| Subscription Plan definitions (plan name, features, pricing) | M-BE-06 (Price Engine) | Plan pricing = pricing concern -- ต้องจัดการร่วมกับ Margin, Snapshot |
| Token Exchange Rate per Sub-Platform | M-BE-05 (Cost Engine) | Exchange rate = cost per unit -- เป็นเรื่อง cost calculation |
| Subscription billing, invoicing, pro-rata credit | M-BE-07 (Billing) | Billing lifecycle = billing concern |
| Token top-up + multi-channel payment processing | M-BE-07 (Billing) | Payment processing = billing concern |
| Tenant upgrade/downgrade UI (self-service) | M-DP-01 (Developer Portal) | Tenant-facing self-service action |
| Tenant data isolation | M-BE-04 (Customer) | Tenant/Customer management + data isolation |
| Per-Tenant RBAC (Tenant Admin/Developer roles) | M-DP-01 Extension | Tenant-scoped roles = Developer Portal concern |
| Activity Log for Sub-Platform changes | M-BE-09 (Activity Log) | Cross-cutting audit trail |

### 13.8 M-BE-12 Module Summary

```
M-BE-12 (Sub-Platform Management) -- Lightweight Module
├── Sub-Platform CRUD (name, code, description, domain)
├── Sub-Platform Default Branding (landing page, colors, logo)
├── Sub-Platform Lifecycle (Registered → Configured → Active → Retired)
└── Sub-Platform Monitoring (read-only metrics aggregated from other modules)

Dependencies:
├── M-BE-05 (Cost Engine) -- Token Exchange Rate per Sub-Platform
├── M-BE-06 (Price Engine) -- Subscription Plans per Sub-Platform
├── M-BE-07 (Billing) -- Revenue data per Sub-Platform
├── M-BE-09 (Activity Log) -- Audit trail for all changes
├── M-BE-10 (Dashboard) -- Central Admin Dashboard integration
└── M-DP-01 (Developer Portal) -- Tenant-facing Sub-Platform discovery
```

> **Note:** Technical specifications (API contracts, database schema, architecture) for M-BE-12 will be designed by Developer Team based on these business requirements.

---

# PART D: GAP RESOLUTION

---

## 14. Module Impact Assessment

การวิเคราะห์ผลกระทบต่อทุก Module ในระบบ (13 modules เดิม + 1 module ใหม่) เมื่อรองรับ Multi-Tenancy Platform และ Sub-Platform Model

### 14.1 Impact Summary Matrix

| Module | Impact Level | Key Changes Required |
|--------|-------------|---------------------|
| M-BE-01 (Authentication) | **Major** | SSO across Sub-Platforms, per-Sub-Platform domain resolution, account linking mechanism |
| M-BE-02 (AI Core) | Minor | Sub-Platform-aware resource visibility filtering |
| M-BE-03 (Service Builder) | Moderate | Service publish scoped to specific Sub-Platform(s) |
| M-BE-04 (Customer) | **Major** | Tenant = multi-Sub-Platform subscriber, plan assignment per Sub-Platform, cross-Sub-Platform tenant view |
| M-BE-05 (Cost Engine) | **Major** | Token Exchange Rate per Sub-Platform (extend cost-per-unit concept) |
| M-BE-06 (Price Engine) | **Major** | Subscription Plan definitions per Sub-Platform (extend pricing concept) |
| M-BE-07 (Billing) | **Major** | Subscription billing cycle, pro-rata credit (upgrade), extended days (downgrade), token top-up, multi-channel payment (2C2P + Direct Transfer + Company QR), per-Sub-Platform invoicing |
| M-BE-08 (User RBAC) | **Major** | Tenant Admin role, per-Sub-Platform permissions, cross-Sub-Platform role resolution |
| M-BE-09 (Activity Log) | Moderate | Cross-Sub-Platform audit logs, per-Sub-Platform filtering |
| M-BE-10 (Dashboard) | **Major** | Cross-Sub-Platform dashboard, per-Sub-Platform drill-down, revenue analytics |
| M-BE-11 (Setting) | Moderate | Global platform settings + Telegram notification config (NOT Sub-Platform config) |
| **M-BE-12 (NEW)** | **New Module** | Sub-Platform Management (lightweight): CRUD, Domain, Branding defaults, Lifecycle |
| M-DP-01 (Developer Portal) | **Major** | Per-Sub-Platform landing, SSO login, Tenant Admin features, token top-up, plan upgrade/downgrade UI |
| M-FW-01 (AI Framework Core) | Minor | Sub-Platform-aware routing for AI service calls |

### 14.2 Major Impact — Detailed Business Rationale

#### M-BE-01 (Authentication) — Major

ระบบ Authentication ต้องรองรับ SSO ข้าม Sub-Platform ทุกตัว โดย Tenant ใช้บัญชีเดียวเข้าใช้งานได้ทุก Sub-Platform ที่สมัครไว้ ระบบต้องสามารถ resolve domain ของ Sub-Platform (เช่น avatar.realfact.ai, booking.realfact.ai) แล้วนำ Tenant ไปยัง Landing Page ที่ถูกต้อง นอกจากนี้ต้องมี Account Linking เพื่อให้ Tenant ที่มีบัญชีอยู่แล้วสามารถเชื่อมต่อกับ Sub-Platform ใหม่ได้โดยไม่ต้องสมัครใหม่

#### M-BE-04 (Customer) — Major

แนวคิด "Customer/Tenant" ต้องขยายจาก Tenant ที่ใช้แค่ platform เดียว เป็น Tenant ที่สามารถสมัคร Subscription Plan ได้หลาย Sub-Platform พร้อมกัน Central Admin ต้องมี consolidated view ที่เห็น Tenant ทุกราย พร้อมสถานะ Subscription ของแต่ละ Sub-Platform ในมุมมองเดียว รวมถึงการจัดการ lifecycle ของ Tenant (suspend, reactivate, delete) ที่กระทบหลาย Sub-Platform พร้อมกัน

#### M-BE-05 (Cost Engine) — Major

Token Exchange Rate ต้องกำหนดได้ per Sub-Platform เนื่องจากแต่ละ Sub-Platform มีต้นทุนการให้บริการต่างกัน (เช่น Avatar ใช้ AI model ที่แพงกว่า Booking) ระบบต้องขยายแนวคิด cost-per-unit ให้รองรับ Exchange Rate ของ Universal Token เป็น usage unit ของแต่ละ Sub-Platform โดย Admin สามารถปรับ rate ได้ และ rate ใหม่มีผลเฉพาะ transaction ใหม่เท่านั้น

#### M-BE-06 (Price Engine) — Major

ระบบ Pricing ต้องขยายจาก usage-based pricing เป็น Subscription Plan per Sub-Platform โดยแต่ละ Sub-Platform มี Plan tiers ของตัวเอง (เช่น Avatar มี Free/Starter/Pro/Franchise, Booking มี Free/Basic/Premium) แต่ละ Plan กำหนด monthly fee, Bonus Token allocation, feature access level ซึ่ง Admin ต้องสามารถสร้างและจัดการ Plan definitions ได้ผ่าน Internal Portal

#### M-BE-07 (Billing) — Major

Module Billing ได้รับผลกระทบมากที่สุด เนื่องจากต้องรองรับ 5 business flows ใหม่: (1) Subscription billing cycle รายเดือนพร้อม auto-renewal, (2) Pro-rata credit calculation สำหรับ upgrade กลางรอบ, (3) Extended days calculation สำหรับ downgrade กลางรอบ, (4) Token top-up purchase ผ่าน multi-channel payment (2C2P + โอนตรง + QR บริษัท), (5) Consolidated invoicing per Sub-Platform และ cross-Sub-Platform สำหรับ Tenant ที่สมัครหลาย Sub-Platform

#### M-BE-08 (User RBAC) — Major

ต้องเพิ่ม role ใหม่คือ "Tenant Admin" ที่มีสิทธิ์จัดการ team, billing, branding ภายใน tenant ของตัวเอง Permission model ต้องขยายให้รองรับ per-Sub-Platform permissions เช่น Tenant Admin อาจมีสิทธิ์จัดการ billing ของ Avatar Sub-Platform แต่ไม่มีสิทธิ์ใน Booking Sub-Platform นอกจากนี้ระบบต้อง resolve role hierarchy ข้าม Sub-Platform ได้อย่างถูกต้อง (Central Admin > Sub-Platform Admin > Tenant Admin > Developer)

#### M-BE-10 (Dashboard) — Major

Dashboard ต้องขยายจาก single-platform view เป็น cross-Sub-Platform aggregated view สำหรับ Central Admin ที่ต้องเห็นภาพรวมทั้ง platform (total tenants, total revenue, token usage) พร้อม drill-down ไปยังแต่ละ Sub-Platform ได้ Revenue analytics ต้องแสดง breakdown per Sub-Platform, per Plan tier และ trend comparison ระหว่าง Sub-Platforms

#### M-DP-01 (Developer Portal) — Major

Developer Portal ต้องรองรับ per-Sub-Platform landing page ที่มี branding แตกต่างกัน (logo, theme, domain) SSO login ที่ redirect ไป Sub-Platform ที่ถูกต้องตาม domain นอกจากนี้ต้องเพิ่ม Tenant Admin features สำหรับ self-service: plan upgrade/downgrade, token top-up, billing history, team management และ branding customization (white-label V1)

### 14.3 Moderate Impact — Summary

| Module | Changes Summary |
|--------|----------------|
| M-BE-03 (Service Builder) | Service ที่ publish ต้องระบุว่าใช้ได้กับ Sub-Platform ใด เพื่อให้ Developer Portal แสดงเฉพาะ services ที่เกี่ยวข้อง |
| M-BE-09 (Activity Log) | Audit logs ต้องบันทึก Sub-Platform context (เช่น action เกิดที่ Sub-Platform ไหน) และ Admin สามารถ filter logs per Sub-Platform ได้ |
| M-BE-11 (Setting) | เพิ่ม Telegram Bot notification configuration เป็น platform-wide setting ไม่ใช่ per-Sub-Platform (Sub-Platform config อยู่ที่ M-BE-12) |

### 14.4 Minor Impact — Summary

| Module | Changes Summary |
|--------|----------------|
| M-BE-02 (AI Core) | Resource listing อาจต้อง filter by Sub-Platform context ที่ Admin กำลังทำงานอยู่ แต่ data model ไม่เปลี่ยน |
| M-FW-01 (AI Framework Core) | AI service routing ต้องรู้ว่า request มาจาก Sub-Platform ไหน เพื่อ metering/billing ที่ถูกต้อง แต่ core AI logic ไม่เปลี่ยน |

---

## 15. New Capabilities Not in Current Modules

ความสามารถใหม่ที่ไม่มีใน module ปัจจุบัน พร้อมคำแนะนำว่าควรจัดไว้ใน module ใด

### 15.1 New Capability Mapping

| # | Capability | Description | Recommended Home | Rationale |
|---|-----------|-------------|------------------|-----------|
| 1 | Sub-Platform Registry + CRUD | สร้าง/จัดการ Sub-Platform entity (ชื่อ, code, status) | **M-BE-12 (NEW)** | Sub-Platform เป็น entity ใหม่ที่ต้องมี lifecycle management แยก ไม่ควรปนกับ module อื่น |
| 2 | Sub-Platform Domain Configuration | กำหนด custom domain สำหรับ Landing Page (เช่น avatar.realfact.ai) | **M-BE-12** | Domain เป็นส่วนหนึ่งของ identity ของ Sub-Platform |
| 3 | Sub-Platform Branding Defaults | Landing page template, default theme, logo, favicon | **M-BE-12** | Branding defaults เป็นส่วนหนึ่งของ Sub-Platform identity ก่อนที่ Tenant จะ customize เพิ่ม |
| 4 | Sub-Platform Lifecycle Management | Draft -> Active -> Maintenance -> Retired workflow | **M-BE-12** | Lifecycle เป็น core behavior ของ Sub-Platform entity |
| 5 | Subscription Plan per Sub-Platform | Plan definitions (tier name, monthly price, Bonus Token, feature flags) | **M-BE-06 (Price Engine) extend** | Plan pricing เป็น pricing concern — ขยาย Price Engine ที่มีอยู่แล้ว |
| 6 | Token Exchange Rate per Sub-Platform | อัตราแลกเปลี่ยน Universal Token เป็น usage unit ของแต่ละ Sub-Platform | **M-BE-05 (Cost Engine) extend** | Exchange rate เทียบได้กับ cost-per-unit concept ที่มีอยู่แล้วใน Cost Engine |
| 7 | Universal Token Wallet | Central token balance management, token deduction per usage, balance inquiry | **M-BE-07 (Billing) extend** | Token wallet เป็น billing/payment concern เป็นส่วนขยายของ wallet ที่มีอยู่ |
| 8 | Pro-rata Credit Engine | คำนวณ credit เมื่อ upgrade Plan กลางรอบบิล (remaining value ของ plan เดิม) | **M-BE-07 (Billing) extend** | การคำนวณ credit เป็น billing concern |
| 9 | Extended Days Engine | คำนวณวันใช้งานเพิ่มเมื่อ downgrade Plan กลางรอบ (remaining value / new daily rate) | **M-BE-07 (Billing) extend** | การคำนวณ extended days เป็น billing concern |
| 10 | Multi-channel Payment Integration | รับชำระเงินสำหรับ Subscription และ Token Top-up ผ่าน 3 ช่องทาง (2C2P + โอนตรง + QR บริษัท) | **M-BE-07 (Billing) extend** | Payment processing เป็น billing concern |
| 11 | Subscription Billing Cycle | Monthly auto-renewal, Bonus Token allocation/reset, grace period management | **M-BE-07 (Billing) extend** | Recurring billing เป็น core billing function |
| 12 | Tenant Plan Upgrade/Downgrade UI | Self-service UI สำหรับ Tenant เปลี่ยน Plan พร้อม preview calculation | **M-DP-01 extend** | เป็น tenant self-service feature ที่อยู่บน Developer Portal |
| 13 | Token Top-up UI | Self-service UI สำหรับ Tenant ซื้อ Token เพิ่ม | **M-DP-01 extend** | เป็น tenant self-service feature ที่อยู่บน Developer Portal |
| 14 | Telegram Notification | Bot integration, event-based triggers (billing, usage alerts, plan expiry) | **M-BE-11 (Setting) extend** | Notification configuration เป็น platform setting |
| 15 | Email Notification | Transactional email (invoice, welcome, plan change confirmation) | **M-BE-11 (Setting) extend** | Notification configuration เป็น platform setting |
| 16 | Account Linking (SSO) | เชื่อมต่อบัญชีเดิมกับ Sub-Platform ใหม่โดยไม่ต้องสมัครใหม่ | **M-BE-01 (Auth) extend** | Identity management เป็น authentication concern |
| 17 | Per-Sub-Platform Landing Page | Registration + onboarding UI ที่มี branding ตาม Sub-Platform | **M-DP-01 extend** | Landing page เป็นส่วนหนึ่งของ Developer Portal |
| 18 | Consolidated Billing View | Cross-Sub-Platform billing dashboard สำหรับ Tenant ที่สมัครหลาย Sub-Platform | **M-DP-01 extend** | เป็น tenant self-service view |
| 19 | Tenant Admin Role + Permissions | Role ใหม่สำหรับ Tenant organization management | **M-BE-08 (User RBAC) extend** | Role/Permission management เป็น RBAC concern |
| 20 | Cross-Sub-Platform Admin Dashboard | Aggregated metrics, revenue per Sub-Platform, tenant distribution | **M-BE-10 (Dashboard) extend** | Dashboard/analytics concern |

### 15.2 New Module: M-BE-12 (Sub-Platform Management)

> **Scope Clarification:** M-BE-12 เป็น **lightweight module** ที่ทำหน้าที่เฉพาะ CRUD + Domain + Branding defaults + Lifecycle ของ Sub-Platform entity เท่านั้น ไม่รวม pricing, billing, token, หรือ RBAC ซึ่งอยู่ใน modules ที่เหมาะสมกว่า

| Responsibility | In M-BE-12 | NOT in M-BE-12 (อยู่ที่อื่น) |
|---------------|-----------|-------------------------------|
| Sub-Platform CRUD | Yes | - |
| Domain configuration | Yes | - |
| Branding defaults (logo, theme, favicon) | Yes | - |
| Lifecycle (Draft/Active/Maintenance/Retired) | Yes | - |
| DB Schema assignment | Yes (reference only) | DB provisioning (DevOps) |
| Subscription Plans | No | M-BE-06 (Price Engine) |
| Token Exchange Rates | No | M-BE-05 (Cost Engine) |
| Billing/Payment | No | M-BE-07 (Billing) |
| User Roles/Permissions | No | M-BE-08 (User RBAC) |
| Notifications | No | M-BE-11 (Setting) |

---

# PART E: SHARED SPECIFICATIONS

---

## 16. Success Metrics (Descriptive)

> **Note:** Success Metrics ด้านล่างเป็นแบบ qualitative/descriptive เพื่อระบุ "สิ่งที่ต้องเกิดขึ้น" ไม่ใช่ quantifiable KPIs ซึ่งเป็นหน้าที่ของทีม Operations กำหนดเป้าตัวเลขภายหลัง

### 16.1 Platform Success Indicators

| Area | Success Description |
|------|---------------------|
| Multi-Sub-Platform Access | Tenants สามารถลงทะเบียนและสมัคร Subscription ได้หลาย Sub-Platform โดยใช้ SSO account เดียว โดยไม่ต้องสร้างบัญชีใหม่ในแต่ละ Sub-Platform |
| Central Admin Efficiency | Central Admin สามารถจัดการ Sub-Platform ทั้งหมด และดู cross-Sub-Platform metrics จาก dashboard เดียว โดยไม่ต้องสลับระบบ |
| Token System Transparency | ระบบ Universal Token ทำงานได้อย่างราบรื่นข้าม Sub-Platforms โดย Tenant เห็นอัตราแลกเปลี่ยน, ยอดคงเหลือ, และประวัติการใช้งานอย่างชัดเจน |
| Payment Reliability | การชำระเงินทั้ง 3 ช่องทางทำงานได้อย่างน่าเชื่อถือ — 2C2P Online มี auto-retry, Offline (โอนตรง/QR) มี Admin verify SLA ภายใน 1 วันทำการ |
| Plan Change Transparency | การ upgrade/downgrade Plan แสดง pro-rata calculation ให้ Tenant เห็นก่อนยืนยัน ไม่มี hidden charges หรือ unexpected deductions |
| Sub-Platform Onboarding | Central Admin สามารถเพิ่ม Sub-Platform ใหม่ได้ผ่าน M-BE-12 โดยไม่ต้องแก้ไข code — กำหนด domain, branding, lifecycle ผ่าน UI |

### 16.2 Tenant Experience Success

| Area | Success Description |
|------|---------------------|
| Token Understanding | Tenants เข้าใจยอด Token คงเหลือ และรู้ว่า exchange rate ของแต่ละ Sub-Platform ต่างกันอย่างไร โดยดูจาก dashboard ที่แสดง breakdown ชัดเจน |
| Tenant Admin Autonomy | Tenant Admin สามารถจัดการ team members, billing, usage, และ white-label branding ได้ด้วยตัวเอง โดยไม่ต้องติดต่อ Central Admin |
| Notification Timeliness | Telegram และ Email notifications ส่งถึง Tenant ตามเวลาที่เหมาะสม สำหรับ events สำคัญ เช่น billing reminder, token low balance, plan expiry, payment confirmation |
| Self-Service Plan Management | Tenants สามารถ upgrade/downgrade Plan ได้ด้วยตัวเองผ่าน Developer Portal โดยเห็น preview ของ cost/credit ก่อนยืนยัน |
| Consolidated Billing View | Tenants ที่สมัครหลาย Sub-Platform เห็นประวัติ billing รวมในที่เดียว พร้อม filter per Sub-Platform |

### 16.3 Admin Experience Success

| Area | Success Description |
|------|---------------------|
| Sub-Platform Lifecycle | Central Admin สามารถ onboard Sub-Platform ใหม่ตั้งแต่ Draft ถึง Active ได้ผ่าน UI โดยมี checklist ก่อน go-live |
| Revenue Visibility | Revenue reporting แสดง breakdown per Sub-Platform, per Plan tier ทำให้ Admin เห็นภาพรวมธุรกิจได้ชัดเจน |
| Tenant Purchase Tracking | ประวัติการซื้อ (Subscription + Token Top-up) ของแต่ละ Tenant ดูได้ per Sub-Platform และ cross-Sub-Platform ในมุมมองเดียว |
| Efficient Troubleshooting | Activity Logs ที่มี Sub-Platform context ช่วยให้ Admin trace ปัญหาได้อย่างรวดเร็ว โดย filter per Sub-Platform, per Tenant |

### 16.4 Success Criteria Checklist (Descriptive)

- [ ] Tenant สามารถสมัคร 2+ Sub-Platform ด้วยบัญชี SSO เดียว
- [ ] Tenant เห็น token balance breakdown per Sub-Platform
- [ ] Plan upgrade/downgrade แสดง pro-rata preview ก่อนยืนยัน
- [ ] Payment ทั้ง 3 ช่องทางทำงานได้สำหรับ subscription fee และ token top-up (2C2P online + โอนตรง+สลิป + QR บริษัท)
- [ ] Central Admin dashboard แสดง cross-Sub-Platform aggregated data
- [ ] Sub-Platform ใหม่สามารถ onboard ได้ผ่าน M-BE-12 UI
- [ ] Telegram notification ส่งถึง Tenant สำหรับ billing events
- [ ] Tenant Admin จัดการ team และ branding ได้ด้วยตัวเอง
- [ ] Activity logs สามารถ filter per Sub-Platform ได้
- [ ] Data isolation ระหว่าง Tenant และระหว่าง Sub-Platform ทำงานถูกต้อง

---

## 17. Data Retention & Privacy (GDPR/PDPA)

> **Note:** Data modeling และ database schema จะถูกออกแบบโดย Developer Team ส่วนนี้ระบุเฉพาะ business requirements ด้าน data retention และ privacy

### 17.1 Data Retention Requirements

| # | Data Type | Retention Period | Business Reason |
|---|-----------|-----------------|-----------------|
| 1 | Tenant account data (profile, credentials) | Active period + 90 days after deletion request | PDPA compliance — ให้เวลา dispute resolution ก่อนลบถาวร |
| 2 | Payment records (transaction, receipt, invoice) | 7 years | กฎหมายภาษีและข้อบังคับทางกฎหมายของประเทศไทย |
| 3 | Token transaction logs (deduction, top-up, exchange) | 3 years | Audit trail และ dispute resolution สำหรับ token-related issues |
| 4 | Subscription history (plan changes, upgrade/downgrade) | 5 years | Business analytics, compliance, และ tenant dispute resolution |
| 5 | Activity/Audit logs (admin actions, tenant actions) | 2 years | Security compliance และ incident investigation |
| 6 | Notification logs (Telegram, Email delivery status) | 1 year | Troubleshooting notification delivery issues |
| 7 | Session/Authentication logs | 1 year | Security monitoring และ suspicious activity detection |
| 8 | Sub-Platform configuration history | Indefinite (while Sub-Platform active) | Configuration audit trail |

### 17.2 PDPA/GDPR Compliance Requirements

| # | Compliance Requirement | Description | Applicable User Story |
|---|----------------------|-------------|----------------------|
| 1 | Right to Data Export | Tenant สามารถร้องขอ export ข้อมูลทั้งหมดของตนในรูปแบบที่ portable ได้ | US-CMT.3 |
| 2 | Right to Deletion | Tenant สามารถร้องขอลบบัญชีและข้อมูลส่วนบุคคล (ยกเว้นข้อมูลที่ต้อง retain ตามกฎหมาย) | US-CMT.3 |
| 3 | Data Portability | ข้อมูลที่ export ต้องอยู่ในรูปแบบ machine-readable (เช่น JSON, CSV) | US-CMT.3 |
| 4 | Consent Management per Sub-Platform | Tenant ต้อง consent แยกสำหรับแต่ละ Sub-Platform ที่สมัคร | Section 3, Section 4 |
| 5 | Cross-Sub-Platform Data Sharing Consent | การแชร์ข้อมูลระหว่าง Sub-Platform ต้องได้ consent จาก Tenant ก่อน | Section 4.3 |
| 6 | Data Processing Transparency | Tenant ต้องเห็นว่าข้อมูลของตนถูกใช้อย่างไรในแต่ละ Sub-Platform | US-CMT.3 |
| 7 | Breach Notification | แจ้ง Tenant ภายใน 72 ชั่วโมงหากเกิด data breach (PDPA requirement) | Platform-wide |

### 17.3 Cross-Sub-Platform Privacy Rules

| Rule | Description | Impact |
|------|-------------|--------|
| **Business Data Isolation** | ข้อมูลธุรกิจใน Sub-Platform A ต้องแยกจาก Sub-Platform B อย่างสมบูรณ์ — ห้ามมี cross-Sub-Platform data leakage | ทุก Sub-Platform |
| **Tenant Data Isolation** | ข้อมูลของ Tenant A ต้องแยกจาก Tenant B ภายใน Sub-Platform เดียวกัน | ทุก Sub-Platform |
| **Shared Identity Data** | SSO identity data (email, name, profile) เป็นข้อมูลที่แชร์ข้าม Sub-Platform by design เนื่องจากเป็น central identity | M-BE-01 |
| **Account Linking Consent** | เมื่อ Tenant link บัญชีไปยัง Sub-Platform ใหม่ ต้องแสดง consent form ระบุว่าข้อมูล identity ใดจะถูกแชร์ | M-BE-01, M-DP-01 |
| **Billing Data Visibility** | Tenant Admin เห็นเฉพาะ billing data ของ organization ตัวเอง — Central Admin เห็นทุก Tenant | M-BE-07, M-DP-01 |
| **Deletion Cascade Policy** | เมื่อ Tenant request deletion: identity data ลบจาก central, business data ลบจากแต่ละ Sub-Platform แยกกัน | ทุก Module |

### 17.4 Data Classification

| Classification | Examples | Access Level | Encryption |
|---------------|----------|-------------|------------|
| **Confidential** | Payment card data, credentials | Card data ผ่าน 2C2P gateway เท่านั้น (PCI DSS); สลิปการโอนเก็บใน platform storage | Required at rest + transit |
| **Sensitive** | Personal info (name, email, phone), billing history | Tenant owner + Tenant Admin + Central Admin | Required at rest + transit |
| **Internal** | Usage logs, token transactions, activity logs | Central Admin + relevant Tenant Admin | Required at transit |
| **Public** | Sub-Platform branding, landing page content, plan descriptions | Anyone | Optional |

---

## 18. Integration Points (High-Level)

> **Note:** API contracts, endpoint specifications, และ technical integration details จะถูกออกแบบโดย Developer Team ส่วนนี้ระบุเฉพาะ business-level integration requirements

### 18.1 Internal Module Dependencies

| # | From | To | Integration Type | Business Description | Criticality |
|---|------|-----|-----------------|---------------------|-------------|
| 1 | X-MT-01 | M-BE-01 (Auth) | Required | SSO identity management, account linking, domain-based login routing | Critical — ไม่มี Auth ใช้งานไม่ได้ |
| 2 | X-MT-01 | M-BE-04 (Customer) | Required | Tenant registry, multi-Sub-Platform subscription status, tenant lifecycle | Critical — Tenant data เป็นศูนย์กลาง |
| 3 | X-MT-01 | M-BE-05 (Cost Engine) | Required | Token Exchange Rate per Sub-Platform, cost-per-unit configuration | Critical — กำหนดต้นทุน token |
| 4 | X-MT-01 | M-BE-06 (Price Engine) | Required | Subscription Plan definitions, tier pricing, feature flags per plan | Critical — กำหนดราคาขาย |
| 5 | X-MT-01 | M-BE-07 (Billing) | Required | Subscription billing cycle, payment processing, pro-rata calculation, token wallet | Critical — revenue flow |
| 6 | X-MT-01 | M-BE-08 (User RBAC) | Required | Tenant Admin role definition, per-Sub-Platform permissions | High — access control |
| 7 | X-MT-01 | M-BE-09 (Activity Log) | Required | Cross-Sub-Platform audit logging, per-Sub-Platform context | High — compliance |
| 8 | X-MT-01 | M-BE-10 (Dashboard) | Required | Cross-Sub-Platform metrics aggregation, revenue analytics | Medium — reporting |
| 9 | X-MT-01 | M-BE-11 (Setting) | Required | Telegram Bot configuration, Email notification templates, platform-wide settings | Medium — notifications |
| 10 | X-MT-01 | M-BE-12 (NEW) | Required | Sub-Platform registry, domain config, branding defaults, lifecycle | Critical — Sub-Platform entity |
| 11 | X-MT-01 | M-DP-01 (Dev Portal) | Required | Per-Sub-Platform landing, tenant self-service features, plan management UI | Critical — tenant-facing |
| 12 | X-MT-01 | M-FW-01 (Core) | Optional | Sub-Platform-aware AI service routing for metering | Low — AI routing context |

### 18.2 External System Integrations

| # | External System | Purpose | Direction | Business Impact |
|---|----------------|---------|-----------|-----------------|
| 1 | **Payment Methods (Multi-channel)** | ประมวลผลการชำระเงินสำหรับ Subscription monthly fee และ Token Top-up — 3 channels: 2C2P (online), Direct Transfer+Slip, Company QR+Slip | 2C2P: Outbound + Callback; Offline: Upload slip → Admin verify | Critical — revenue collection ผ่าน 3 ช่องทาง |
| 2 | **Telegram Bot API** | ส่ง notification ไปยัง Tenant ผ่าน Telegram (billing alerts, usage warnings, plan reminders) | Outbound (Platform -> Telegram) | Medium — notification channel หลัก |
| 3 | **Email Service (SMTP/SES)** | ส่ง transactional email (invoice, welcome, plan change confirmation, payment receipt) | Outbound (Platform -> Email Service) | Medium — notification channel สำรอง + formal communications |

### 18.3 Integration Dependency Diagram (Business View)

```
                        ┌─────────────────────┐
                        │   External Systems   │
                        ├─────────────────────┤
                        │  Payment (Multi-ch) │◄──── M-BE-07 (Billing)
                        │  Telegram (Notify)  │◄──── M-BE-11 (Setting)
                        │  Email (Notify)     │◄──── M-BE-11 (Setting)
                        └─────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │                    Central Platform Layer                     │
    │                                                              │
    │  M-BE-01 (Auth/SSO)  ←── foundation for all modules         │
    │       │                                                      │
    │       ├── M-BE-12 (Sub-Platform Mgmt) ←── NEW entity         │
    │       │       │                                              │
    │       ├── M-BE-04 (Customer/Tenant) ←── tenant registry      │
    │       │                                                      │
    │       ├── M-BE-05 (Cost) ←── exchange rates                  │
    │       │       │                                              │
    │       ├── M-BE-06 (Price) ←── subscription plans             │
    │       │       │                                              │
    │       ├── M-BE-07 (Billing) ←── payment + token wallet       │
    │       │                                                      │
    │       ├── M-BE-08 (RBAC) ←── Tenant Admin role               │
    │       │                                                      │
    │       ├── M-BE-09 (Activity Log) ←── cross-Sub-Platform logs │
    │       ├── M-BE-10 (Dashboard) ←── aggregated metrics         │
    │       └── M-BE-11 (Setting) ←── notifications config         │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌──────────────────────────────────────────────────────────────┐
    │  M-DP-01 (Developer Portal) — Tenant-facing                  │
    │  - Per-Sub-Platform Landing Pages                            │
    │  - SSO Login                                                 │
    │  - Plan Management (upgrade/downgrade)                       │
    │  - Token Top-up                                              │
    │  - Billing History                                           │
    │  - Team Management (Tenant Admin)                            │
    │  - White-label Branding                                      │
    └──────────────────────────────────────────────────────────────┘
```

---

## 19. Non-Functional Requirements (Business View)

> **Note:** ส่วนนี้ระบุ Non-Functional Requirements จากมุมมอง business/user ไม่ระบุ technical metrics ที่เฉพาะเจาะจง (เช่น p95 latency) ซึ่งเป็นหน้าที่ของ Developer Team กำหนด

### 19.1 Performance Expectations

| # | Scenario | User Expectation | Business Justification |
|---|----------|------------------|----------------------|
| 1 | Sub-Platform landing page load | โหลดเร็ว, responsive ทั้ง desktop และ mobile | First impression ของ Tenant ต่อ Sub-Platform — ต้อง smooth |
| 2 | Token balance inquiry | แสดง real-time balance ที่สะท้อน transaction ล่าสุด | Tenant ต้องเชื่อมั่นว่ายอดถูกต้องก่อนตัดสินใจใช้งานหรือ top-up |
| 3 | Plan upgrade/downgrade | มีผลทันทีหลัง payment confirmation | Tenant ไม่ควรต้องรอนานหลังจ่ายเงินแล้ว |
| 4 | Pro-rata calculation preview | แสดงผลทันทีเมื่อ Tenant เลือก plan ใหม่ | Tenant ต้องเห็น cost/credit ก่อนตัดสินใจ |
| 5 | Payment processing | ประสบการณ์ที่เหมาะสมตามช่องทาง: 2C2P = redirect → pay → callback; Offline = เลือกบัญชี/QR → โอน → อัปโหลดสลิป → รอ verify | ไม่ควร friction มากกว่า standard payment flow |
| 6 | Cross-Sub-Platform dashboard | Aggregated data พร้อมใช้งานโดยไม่ต้องรอนาน | Admin ต้องดูภาพรวมได้อย่างรวดเร็วเพื่อตัดสินใจ |
| 7 | Notification delivery (Telegram/Email) | ส่งถึง Tenant ภายในระยะเวลาที่เหมาะสมหลัง event เกิดขึ้น | Billing alerts ต้องทันเวลาเพื่อให้ Tenant ดำเนินการได้ |
| 8 | SSO login across Sub-Platforms | Login ครั้งเดียว เข้าถึง Sub-Platform อื่นได้ทันทีโดยไม่ต้อง re-authenticate | ลดความยุ่งยากในการเข้าถึงหลาย Sub-Platform |

### 19.2 Availability & Reliability Expectations

| # | Requirement | Target | Business Justification |
|---|-------------|--------|----------------------|
| 1 | Platform availability | Production-grade uptime ตามมาตรฐาน SaaS | Tenant ต้องเข้าใช้งานได้ตลอดเวลา |
| 2 | Payment processing availability | ต้องพร้อมใช้งานอย่างน้อยในช่วง business hours | Subscription renewal และ token top-up ต้องไม่ล้มเหลวบ่อย |
| 3 | Scheduled maintenance | แจ้ง Tenant ล่วงหน้าก่อนปิดปรับปรุง | Tenant ต้องเตรียมตัวได้ |
| 4 | Data backup | Backup สม่ำเสมอ พร้อม disaster recovery plan | ป้องกัน data loss จาก unexpected incidents |
| 5 | Payment failure recovery | Grace period สำหรับ subscription payment ที่ล้มเหลว + retry mechanism | ไม่ควร suspend Tenant ทันทีเมื่อ payment ล้มเหลว |
| 6 | Notification retry | ส่ง notification ใหม่อัตโนมัติหาก delivery ล้มเหลวครั้งแรก | Critical alerts ต้องถึง Tenant |

### 19.3 Security & Compliance

| # | Requirement | Description | Standard/Regulation |
|---|-------------|-------------|---------------------|
| 1 | Data Privacy | ข้อมูลส่วนบุคคลต้องได้รับการปกป้องตาม PDPA | PDPA (Thailand) |
| 2 | Tenant Data Isolation | ข้อมูลธุรกิจแยกอย่างเด็ดขาดระหว่าง Tenant และระหว่าง Sub-Platform | Multi-Tenancy best practice |
| 3 | Role-Based Access Control | สิทธิ์ตาม role hierarchy: Central Admin > Sub-Platform Admin > Tenant Admin > Developer | RBAC principle |
| 4 | Payment Security | Card data ต้องไม่ผ่าน platform — ให้ 2C2P gateway จัดการ; สลิปการโอนเก็บอย่างปลอดภัย | PCI DSS (via 2C2P) + Platform security |
| 5 | Audit Trail | ทุก critical action ต้องถูกบันทึก (who, what, when, where, from which Sub-Platform) | SOC 2 / Compliance |
| 6 | SSO Security | Token-based authentication ที่ปลอดภัย, session management ข้าม Sub-Platform | OAuth 2.0 / OIDC standard |
| 7 | Data Encryption | ข้อมูล sensitive ต้องเข้ารหัสทั้ง at-rest และ in-transit | Security best practice |
| 8 | API Authentication | Developer API calls ต้องใช้ HMAC-SHA256 signature | Platform standard |

### 19.4 Scalability Expectations

| # | Scenario | Expectation |
|---|----------|-------------|
| 1 | Number of Sub-Platforms | ระบบต้องรองรับการเพิ่ม Sub-Platform ใหม่ได้โดยไม่กระทบ performance ของ Sub-Platform เดิม |
| 2 | Number of Tenants per Sub-Platform | รองรับ Tenant จำนวนมากต่อ Sub-Platform โดย performance ไม่ลดลงอย่างมีนัยสำคัญ |
| 3 | Cross-Sub-Platform Tenants | ระบบต้องจัดการ Tenant ที่สมัครหลาย Sub-Platform ได้อย่างมีประสิทธิภาพ |
| 4 | Token Transaction Volume | รองรับ token transaction จำนวนมากต่อวันจากทุก Sub-Platform รวมกัน |

---

## 20. Risks & Mitigations

### 20.1 Risk Register

| # | Risk | Probability | Impact | Risk Level | Mitigation Strategy | Owner |
|---|------|-------------|--------|-----------|---------------------|-------|
| R1 | Sub-Platform schema migration ซับซ้อนเมื่อเพิ่ม Sub-Platform ใหม่ | Medium | High | **High** | กำหนด standardized onboarding template ผ่าน M-BE-12 พร้อม checklist ที่ Central Admin ต้องทำให้ครบก่อน go-live | CTO |
| R2 | Token exchange rate เปลี่ยนแปลง กระทบ Tenant ที่คาดหวังราคาเดิม | Medium | Medium | **Medium** | Rate changes apply เฉพาะ transactions ใหม่เท่านั้น พร้อมแจ้ง Tenant ล่วงหน้าผ่าน notification ก่อนมีผล | Product |
| R3 | 2C2P payment gateway downtime ทำให้ Tenant ชำระเงินออนไลน์ไม่ได้ | Low | High | **Low-Medium** | กำหนด grace period + auto-retry; Tenant สามารถใช้ช่องทาง offline (โอนตรง/QR บริษัท) แทนได้ | CTO |
| R4 | Tenant สับสนระหว่าง Universal Token กับ usage ของแต่ละ Sub-Platform | Medium | Medium | **Medium** | ออกแบบ UX ที่แสดง exchange rates และ balance breakdown อย่างชัดเจน พร้อม tooltip/help text อธิบาย | Product/Design |
| R5 | SSO account linking conflict — email เดียวกันมีบัญชีต่างกันในต่าง Sub-Platform | Low | Medium | **Low** | ใช้ email เป็น primary identifier, ต้อง verify email ก่อน link, conflict resolution flow ให้ Tenant เลือก | CTO |
| R6 | Pro-rata calculation disputes — Tenant ไม่เห็นด้วยกับจำนวนเงินที่คำนวณ | Medium | Medium | **Medium** | แสดง transparent calculation breakdown ให้ Tenant เห็นก่อนยืนยัน upgrade/downgrade พร้อมบันทึก calculation log | Product |
| R7 | Sub-Platform retirement ขณะมี Tenant ที่ active อยู่ | Low | High | **Medium** | บังคับให้มี migration plan + advance notice period (ขั้นต่ำ) ก่อน retire, Sub-Platform ต้องผ่าน "Maintenance" status ก่อน "Retired" | Business/CTO |
| R8 | Cross-Sub-Platform data privacy breach — ข้อมูลรั่วระหว่าง Sub-Platform | Low | Critical | **High** | Strict data isolation architecture, regular security audit, automated testing สำหรับ data isolation, incident response plan | CTO/Security |
| R9 | Bonus Token confusion — Tenant ไม่เข้าใจว่า Bonus Token หมดอายุทุกรอบบิล | Medium | Low | **Low** | แสดง Bonus Token expiry date ใน dashboard, ส่ง notification ก่อน Bonus Token reset, อธิบายใน plan description | Product/Design |
| R10 | Concurrent plan changes — Tenant Admin เปลี่ยน plan ขณะที่ billing cycle กำลังประมวลผล | Low | Medium | **Low** | Lock plan change ระหว่าง billing cycle processing, แสดง message ให้ Tenant ลองใหม่ภายหลัง | CTO |

### 20.2 Risk Heat Map

```
              │  Low Impact  │  Medium Impact  │  High Impact  │  Critical
──────────────┼──────────────┼─────────────────┼───────────────┼──────────
High Prob     │              │                 │               │
──────────────┼──────────────┼─────────────────┼───────────────┼──────────
Medium Prob   │  R9          │  R2, R4, R6     │  R1           │
──────────────┼──────────────┼─────────────────┼───────────────┼──────────
Low Prob      │  R5, R10     │                 │  R3, R7       │  R8
──────────────┼──────────────┼─────────────────┼───────────────┼──────────
```

---

## 21. Open Questions

| # | Question | Context | Owner | Status | Target Decision Date | Impact If Unresolved |
|---|----------|---------|-------|--------|---------------------|---------------------|
| OQ-1 | Token wallet: central wallet เดียว หรือ แยก per Sub-Platform? | กระทบวิธีที่ Tenant ใช้ token ข้าม Sub-Platform — central wallet = ใช้ได้ทุก Sub-Platform จาก balance เดียว, per-Sub-Platform wallet = allocate token แยก | CTO | **Open** | Before M-BE-07 detailed design | กระทบ token deduction flow, billing UX, และ balance display ทั้งหมด |
| OQ-2 | Social Listening, AI Live Commerce, MRP ต้องมี mock plan data หรือยัง? | ปัจจุบันมี mock plans เฉพาะ Avatar และ Booking เท่านั้น | Product | **Open** | Before V1 launch | ถ้าไม่มี mock data จะ test cross-Sub-Platform scenarios ไม่ครบ |
| OQ-3 | Enterprise plan: negotiation ผ่าน Admin หรือ self-service? | Enterprise ราคา custom — จะให้ Tenant request quote ผ่าน portal แล้ว Admin set price, หรือ Admin กำหนด custom plan ให้เลย? | Business | **Open** | Before M-BE-06 + M-DP-01 design | กระทบ UI flow ทั้ง admin-side และ tenant-side |
| OQ-4 | Free plan limits: hard cap (block usage) หรือ soft cap (notify + allow)? | เมื่อ Tenant ใช้ Token หมด — ระบบ block ทันที หรือ ให้ใช้ต่อแล้ว notify? | Product | **Open** | Before M-BE-07 token deduction logic | กระทบ user experience และ billing logic อย่างมาก |
| OQ-5 | Multi-currency support นอกจาก THB ในอนาคตหรือไม่? | ถ้า yes ต้อง design M-BE-05/06 ให้ currency-agnostic ตั้งแต่แรก, 2C2P + offline channels ต้อง config multi-currency | Business | **Open** | Before M-BE-05 + M-BE-06 design | ถ้าตัดสินใจทีหลัง อาจต้อง refactor pricing/cost modules |
| OQ-6 | Tenant deletion: cascade ลบทุก Sub-Platform data หรือ ลบ per-Sub-Platform? | Tenant request deletion — ลบ data จากทุก Sub-Platform ทีเดียว, หรือเลือกลบทีละ Sub-Platform? | Legal/CTO | **Open** | Before PDPA review | PDPA compliance — ต้องมี policy ชัดเจน |
| OQ-7 | Grace period duration สำหรับ failed subscription payment? | กี่วันก่อน suspend? 3 วัน? 7 วัน? Retry กี่ครั้ง? | Business/CTO | **Open** | Before M-BE-07 billing cycle design | กระทบ Tenant experience เมื่อ payment ล้มเหลว |
| OQ-8 | Tenant branding scope V1: เฉพาะ logo + theme + favicon, หรือรวม custom domain ด้วย? | White-label V1 ครอบคลุมแค่ไหน — custom domain (tenant.realfact.ai) ต้องมีใน V1 หรือไม่? | Product/CTO | **Open** | Before M-BE-12 + M-DP-01 design | กระทบ DNS config, SSL cert management |
| OQ-9 | Telegram notification: 1 bot per Sub-Platform หรือ 1 global bot? | ถ้า per Sub-Platform, ต้อง manage หลาย bot tokens; ถ้า global, messages ต้องระบุ Sub-Platform context | CTO | **Open** | Before M-BE-11 notification design | กระทบ bot management complexity |

---

## 22. Glossary

### 22.1 Platform & Architecture Terms

| Term | Thai (ถ้ามี) | Definition |
|------|-------------|------------|
| **Sub-Platform** | ซับแพลตฟอร์ม | Internal Realfact product/service (เช่น Avatar, Booking, Social Listening, AI Live Commerce, MRP) ที่ทำงานเป็นผลิตภัณฑ์แยกภายใน platform เดียวกัน แต่ละ Sub-Platform มี DB Schema, Subscription Plans, Token Exchange Rate, และ Landing Page ของตัวเอง |
| **Central Platform** | แพลตฟอร์มกลาง | Shared infrastructure layer ที่จัดการ identity (SSO), tokens, payments, admin dashboard, และ global settings สำหรับทุก Sub-Platform |
| **Multi-Tenancy** | ระบบหลายผู้เช่า | Architecture ที่รองรับหลาย Tenant (organizations) ใช้ platform ร่วมกันโดยข้อมูลแยกอย่างสมบูรณ์ |
| **Landing Page** | หน้า Landing | Per-Sub-Platform registration/marketing page ที่เข้าถึงผ่าน custom domain (เช่น avatar.realfact.ai, booking.realfact.ai) |
| **White-label** | ไวท์เลเบล | ความสามารถในการ customize branding ของ Tenant (V1: logo, theme color, favicon) |

### 22.2 Identity & Access Terms

| Term | Thai (ถ้ามี) | Definition |
|------|-------------|------------|
| **Tenant** | ผู้เช่า / องค์กร | Organization (company) ที่สมัคร Subscription กับ Sub-Platform หนึ่งหรือหลายตัว ใช้ SSO account เดียว |
| **SSO** | Single Sign-On | ระบบ shared identity ข้าม Sub-Platform — login ครั้งเดียวใช้ได้ทุก Sub-Platform ที่สมัครไว้ |
| **Account Linking** | การเชื่อมบัญชี | กระบวนการเชื่อมต่อบัญชี SSO ที่มีอยู่แล้วไปยัง Sub-Platform ใหม่โดยไม่ต้องลงทะเบียนใหม่ |
| **Central Admin** | แอดมินกลาง | ผู้ดูแลระบบภายใน Realfact ที่มีสิทธิ์มองเห็นและจัดการข้าม Sub-Platform ทั้งหมด |
| **Sub-Platform Admin** | แอดมินซับแพลตฟอร์ม | ผู้ดูแลระบบที่รับผิดชอบ Sub-Platform เฉพาะตัว |
| **Tenant Admin** | แอดมินผู้เช่า | Role ภายใน Tenant organization ที่มีสิทธิ์จัดการ team members, billing, branding ของ organization ตัวเอง |
| **Developer** | นักพัฒนา | ผู้ใช้งานภายใน Tenant organization ที่เรียกใช้ API, จัดการ app credentials |

### 22.3 Token & Billing Terms

| Term | Thai (ถ้ามี) | Definition |
|------|-------------|------------|
| **Universal Token** | โทเค็นสากล | สกุลเงิน token กลางที่ใช้ข้าม Sub-Platform ทั้งหมด ถูกใช้ (consumed) ตาม exchange rate ที่ต่างกันของแต่ละ Sub-Platform |
| **Exchange Rate** | อัตราแลกเปลี่ยน | อัตราการแปลง Universal Token เป็น usage unit ของแต่ละ Sub-Platform (เช่น Avatar: 10 tokens = 1 min interaction) |
| **Bonus Token** | โทเค็นโบนัส | Token ที่ได้ฟรีเมื่อสมัคร Subscription Plan — reset ทุกรอบบิล ไม่สะสมข้ามรอบ |
| **Top-up Token** | โทเค็นเติม | Token ที่ซื้อแยกต่างหาก — สะสมได้ ไม่หมดอายุจนกว่าจะใช้หมด |
| **Subscription Plan** | แผนสมาชิก | Plan tier per Sub-Platform (เช่น Free, Starter, Pro, Franchise) ที่กำหนด monthly fee, Bonus Token, และ feature access |
| **Billing Cycle** | รอบบิล | ระยะเวลารายเดือนสำหรับ subscription charges และ Bonus Token allocation/reset |
| **Pro-rata Credit** | เครดิตตามสัดส่วน | การคำนวณมูลค่าคงเหลือตามสัดส่วนเมื่อ upgrade Plan กลางรอบบิล — credit จาก plan เดิมหักจากราคา plan ใหม่ |
| **Extended Days** | วันขยายเวลา | จำนวนวันใช้งานเพิ่มเติมที่ได้เมื่อ downgrade Plan กลางรอบ คำนวณจาก remaining value ของ plan เดิม / daily rate ของ plan ใหม่ |
| **Grace Period** | ช่วงผ่อนผัน | ระยะเวลาที่ให้หลัง payment ล้มเหลวก่อนที่ระบบจะ suspend subscription |
| **2C2P** | - | หนึ่งใน payment gateway provider สำหรับ online payment (Credit/Debit Card, PromptPay QR, Bank Transfer via 2C2P) — Platform ยังรองรับ Direct Bank Transfer + Slip และ Company QR Code เป็นช่องทาง offline |

### 22.4 Sub-Platform Names & Codes

| Sub-Platform Name | Code | Description |
|-------------------|------|-------------|
| Avatar (Live Interact) | AVT | AI Avatar สำหรับ live interaction (chat, voice, video) |
| Booking | BKG | ระบบจอง (appointment, resource, event) |
| Social Listening | SLT | ติดตามและวิเคราะห์ social media mentions |
| AI Live Commerce | ALC | AI-assisted live commerce/shopping |
| MRP (Manufacturing Resource Planning) | MRP | วางแผนทรัพยากรการผลิต |

---

# Appendices

---

## Appendix A: CTO PRD Traceability Matrix

ตาราง traceability ระหว่าง features จาก CTO PRD เดิม ("SaaS Platform Version 1.0 (PRD).docx") กับ coverage ใน X-MT-01

| # | CTO PRD Feature | X-MT-01 Coverage | User Story / Section Reference | Status |
|---|----------------|------------------|-------------------------------|--------|
| 1 | Multi-Tenant (Separate DB per Tenant) | Sub-Platform Model + Tenant Data Isolation | Section 3 (Sub-Platform Model) + Section 4 (Tenant Model) | Covered |
| 2 | Subscription Plans (Free/Starter/Pro/Franchise) | Per-Sub-Platform Subscription Plans | US-CMT.6 + Section 7 (Subscription Plan Management) | Covered — extended to per-Sub-Platform |
| 3 | Token System | Universal Token with per-Sub-Platform Exchange Rates | US-CMT.4, US-CMT.5 + Section 6 (Token System) | Covered — enhanced with exchange rates |
| 4 | White-label (Logo, Theme) | Per-Tenant Branding V1 (logo, theme color, favicon) | US-CMT.7 + Section 8 (White-label/Branding) | Covered — V1 scope defined |
| 5 | Central Admin Panel | Central Admin Dashboard (cross-Sub-Platform) | US-AMT.3, US-AMT.4, US-AMT.5, US-AMT.6 + Section 12 | Covered — extended for multi-Sub-Platform |
| 6 | Tenant Admin Portal | Extend M-DP-01 with Tenant Admin features | US-CMT.8, US-CMT.9, US-CMT.10 + Section 9 | Covered — via Developer Portal extension |
| 7 | Notification System (Email + Push) | Telegram + Email notifications | US-CMT.13 + Section 10 (Notification System) | Covered — Telegram replaces push notification |
| 8 | Payment Gateway (Stripe/Omise) | Multi-channel Payment (2C2P + Direct Transfer + Company QR) | US-CMT.11, US-CMT.12 + Section 11 (Payment) | Covered — expanded to 3 payment channels |
| 9 | Billing API | Per-Sub-Platform Billing via M-BE-07 extension | Section 7.5 (Billing Cycle) + Section 11.4 (Invoice) | Covered — via M-BE-07 extension |
| 10 | GDPR/Data Compliance | PDPA/GDPR compliance section | US-CMT.3 + Section 17 (Data Retention & Privacy) | Covered — focused on PDPA for Thai operations |
| 11 | Plan Upgrade/Downgrade | Pro-rata Credit (upgrade) + Extended Days (downgrade) | US-CMT.6 + Section 7.4 (Plan Change Flows) | Covered — with detailed calculation logic |
| 12 | User Roles (Admin, Tenant Admin, User) | Extended RBAC: Central Admin, Sub-Platform Admin, Tenant Admin, Developer | Section 5 (Roles) + M-BE-08 extension | Covered — role hierarchy expanded |
| 13 | Analytics Dashboard | Cross-Sub-Platform metrics + per-Sub-Platform drill-down | Section 12 + M-BE-10 extension | Covered |
| 14 | API Rate Limiting | Referenced in NFR (business view) | Section 19 | Partially covered — detail is Developer responsibility |

### Traceability Notes

- CTO PRD ใช้ "Stripe/Omise" — X-MT-01 ขยายเป็น **Multi-channel Payment** (2C2P Gateway + Direct Bank Transfer + Company QR) ตามตัดสินใจของทีม Business
- CTO PRD ใช้ "Push Notification" — X-MT-01 ใช้ **Telegram** เป็น primary channel + Email เป็น secondary
- CTO PRD ระบุ "GDPR" — X-MT-01 เน้น **PDPA** เป็นหลัก (Thai operations) พร้อม GDPR principles
- CTO PRD ไม่มี concept "Sub-Platform" — X-MT-01 สร้าง concept ใหม่เพื่อรองรับ multi-product architecture

---

## Appendix B: Compatibility Gap Resolution Map

จาก Compatibility Analysis Report ที่วิเคราะห์ gap ระหว่าง CTO PRD กับ platform ปัจจุบัน — ตาราง resolution ด้านล่างแสดงว่าแต่ละ gap ถูกแก้ไขอย่างไรใน X-MT-01

| # | Gap Identified | Gap Description | Resolution in X-MT-01 | Resolution Section | Status |
|---|---------------|-----------------|----------------------|-------------------|--------|
| 1 | Business model mismatch | Platform ปัจจุบันเป็น Usage-based, CTO PRD ต้องการ Subscription-based | **Hybrid Model:** Subscription Plan เป็น base (monthly fee + Bonus Token) + Token Top-up เป็น additional purchase | Section 6 + Section 7 | Resolved |
| 2 | Missing White-label capability | Platform ปัจจุบันไม่มี branding customization สำหรับ Tenant | **Per-Tenant Branding V1:** Logo, theme color, favicon — manage ผ่าน Tenant Admin portal | Section 8 | Resolved |
| 3 | Missing Notification System | Platform ปัจจุบันไม่มี notification system สำหรับ Tenant | **Telegram + Email:** Event-based notifications for billing, usage, plan changes | Section 10 | Resolved |
| 4 | Missing Payment Gateway integration | Platform ปัจจุบันไม่มี external payment gateway | **Multi-channel Payment:** 2C2P (online) + Direct Transfer+Slip + Company QR (offline) | Section 11 | Resolved |
| 5 | Missing External Billing API | Platform ปัจจุบัน billing เป็น internal only | **M-BE-07 Extension:** Per-Sub-Platform invoicing, consolidated billing view for Tenant | Section 7.5 + Section 11.4 | Resolved |
| 6 | No Sub-Platform concept | Platform ปัจจุบันเป็น single-product | **Sub-Platform Model:** M-BE-12 (NEW) manages Sub-Platform lifecycle + ทุก existing module ขยายรองรับ | Section 3 + Section 14 | Resolved |
| 7 | No cross-Sub-Platform admin visibility | Admin เห็นเฉพาะ single platform | **Cross-Sub-Platform Dashboard:** Central Admin dashboard with aggregated metrics + per-Sub-Platform drill-down | Section 12 | Resolved |
| 8 | Single-platform token model | Token system ทำงานกับ product เดียว | **Universal Token with Exchange Rates:** Token กลางใช้ข้าม Sub-Platform, exchange rate ต่างกันตาม Sub-Platform | Section 6 | Resolved |
| 9 | No Tenant Admin role | RBAC มีแค่ Platform Admin | **Tenant Admin Role:** Per-organization management (team, billing, branding) ผ่าน M-BE-08 extension | Section 5 + Section 9 | Resolved |
| 10 | No plan change mechanism | ไม่มี upgrade/downgrade flow | **Pro-rata Credit + Extended Days:** Transparent calculation with preview before confirmation | Section 7.4 | Resolved |

---

## Appendix C: Module Amendment Template

Template สำหรับเพิ่ม Multi-Tenancy alignment appendix เข้าไปใน PRD ของ module ที่มีอยู่แล้ว — ใช้เมื่อ module ใดต้อง update PRD ให้สอดคล้องกับ X-MT-01

```markdown
## Appendix: Multi-Tenancy & Sub-Platform Alignment

### Reference
This appendix aligns [Module ID]: [Module Name] with the Multi-Tenancy Platform
requirements defined in X-MT-01 (Cross-Module Multi-Tenancy PRD).

### Impact Level: [Major / Moderate / Minor]

### Required Changes (Business Perspective)
1. [Change 1 — what business capability needs to be added/modified]
2. [Change 2 — what business capability needs to be added/modified]
3. [Change 3 — what business capability needs to be added/modified]

### New Business Rules
| Rule ID | Description | Source |
|---------|-------------|--------|
| BR-MT-{module}.1 | [Business rule description] | X-MT-01 Section [n] |
| BR-MT-{module}.2 | [Business rule description] | X-MT-01 Section [n] |

### Affected User Stories
| Original US | Change Required | New US (if any) |
|-------------|----------------|-----------------|
| US-{prefix}.{n} | [Description of change] | US-{prefix}.{n+x} (if new story needed) |
| US-{prefix}.{n} | [Description of change] | No new US (modification only) |

### New User Stories (Multi-Tenancy Specific)
| US ID | Title | Description |
|-------|-------|-------------|
| US-{prefix}.MT.1 | [Title] | [Brief description] |

### Edge Cases (Multi-Tenancy Specific)
| Edge Case ID | Category | Scenario | Handling |
|-------------|----------|----------|----------|
| EC-MT-{module}.1 | [Category] | [Scenario description] | [How it should be handled] |

### Cross-Reference
- X-MT-01 Section [n]: [Relevant section description]
- X-MT-01 Section 14: Module Impact Assessment — [Module] = [Impact Level]
- M-BE-12: [If Sub-Platform lifecycle affects this module]
```

### Usage Instructions

1. **เมื่อ X-MT-01 ได้รับ approve แล้ว** — ทุก module ที่มี Impact Level "Major" ต้องเพิ่ม appendix นี้ใน PRD ของตัวเอง
2. **Impact Level Major** (ต้องเพิ่ม appendix): M-BE-01, M-BE-04, M-BE-05, M-BE-06, M-BE-07, M-BE-08, M-BE-10, M-DP-01
3. **Impact Level Moderate** (แนะนำให้เพิ่ม): M-BE-03, M-BE-09, M-BE-11
4. **Impact Level Minor** (optional): M-BE-02, M-FW-01

---

## Appendix D: Mock Data -- Complete Plan + Token Examples

> **Note:** ตัวอย่างด้านล่างใช้ตัวเลข mock เพื่อแสดง business logic — ตัวเลขจริงจะถูกกำหนดโดย Business/Product team

### Scenario 1: Company A -- Multi-Sub-Platform Tenant

**Profile:**
- Company: ABC Corp
- Subscribes to: Avatar (Pro Plan), Booking (Starter Plan)
- Billing cycle: Monthly

**Monthly Cost Breakdown:**

| Sub-Platform | Plan | Monthly Fee | Bonus Token |
|-------------|------|------------|-------------|
| Avatar | Pro | 4,990 THB | 10,000 tokens |
| Booking | Starter | 590 THB | 2,000 tokens |
| **Total** | | **5,580 THB** | **12,000 tokens** |

**Token Usage Example (Month 1):**

| Usage Type | Sub-Platform | Quantity | Exchange Rate | Tokens Used |
|-----------|-------------|----------|--------------|-------------|
| AI Avatar interaction | Avatar | 500 minutes | 10 tokens/min | 5,000 tokens |
| Booking transactions | Booking | 50 bookings | 20 tokens/booking | 1,000 tokens |
| **Total Used** | | | | **6,000 tokens** |

**Result:** 6,000 tokens used out of 12,000 Bonus Token allocation = within budget, no top-up needed. Remaining 6,000 Bonus Tokens **do not carry over** to next month.

---

### Scenario 2: Company B -- Token Top-up Required

**Profile:**
- Company: XYZ Ltd
- Subscribes to: Avatar (Starter Plan)
- Monthly fee: 990 THB, Bonus Token: 1,000 tokens

**Token Usage:**

| Usage Type | Quantity | Exchange Rate | Tokens Used |
|-----------|----------|--------------|-------------|
| AI Avatar interaction | 150 minutes | 10 tokens/min | 1,500 tokens |

**Problem:** ต้องใช้ 1,500 tokens แต่มี Bonus Token เพียง 1,000 tokens

**Resolution:**
1. Bonus Token ถูกใช้ก่อน: 1,000 tokens (หมด)
2. ต้อง Top-up: 500 tokens
3. Top-up purchase ผ่านช่องทางชำระเงินที่เลือก (2C2P / โอนตรง+สลิป / QR บริษัท) ตามราคา token ที่กำหนด
4. Top-up Token สะสมได้ — ใช้ได้จนกว่าจะหมด

---

### Scenario 3: Company C -- Upgrade Mid-Cycle (Pro-rata Credit)

**Profile:**
- Company: DEF Inc
- Current plan: Avatar Starter (990 THB/month)
- Upgrade to: Avatar Pro (4,990 THB/month)
- Upgrade date: Day 15 of 30-day billing cycle

**Pro-rata Calculation:**

```
Step 1: คำนวณ credit จาก Starter plan ที่เหลือ
  Remaining days = 30 - 15 = 15 days
  Starter daily rate = 990 / 30 = 33 THB/day
  Credit = 33 x 15 = 495 THB

Step 2: คำนวณค่า Pro plan สำหรับช่วงที่เหลือ
  Pro daily rate = 4,990 / 30 = ~166.33 THB/day
  Pro remaining cost = 166.33 x 15 = 2,495 THB

Step 3: คำนวณยอดจ่ายจริง
  Payment = Pro remaining cost - Starter credit
  Payment = 2,495 - 495 = 2,000 THB

Step 4: Bonus Token adjustment
  - Starter Bonus Token ที่เหลือ (ถ้ามี) ยังใช้ได้จนหมดรอบปัจจุบัน
  - รอบถัดไป: ได้ Pro Bonus Token (10,000 tokens)
```

**Tenant เห็น preview ก่อนยืนยัน:**
> "Upgrade จาก Starter เป็น Pro: คุณจะได้รับ credit 495 THB จาก plan เดิม และจ่ายส่วนต่าง 2,000 THB สำหรับ 15 วันที่เหลือ รอบถัดไปจะคิด 4,990 THB เต็มจำนวน"

---

### Scenario 4: Company D -- Downgrade Mid-Cycle (Extended Days)

**Profile:**
- Company: GHI Co
- Current plan: Avatar Pro (4,990 THB/month)
- Downgrade to: Avatar Starter (990 THB/month)
- Downgrade date: Day 15 of 30-day billing cycle

**Extended Days Calculation:**

```
Step 1: คำนวณ remaining value จาก Pro plan
  Remaining days = 30 - 15 = 15 days
  Pro daily rate = 4,990 / 30 = ~166.33 THB/day
  Remaining value = 166.33 x 15 = 2,495 THB

Step 2: คำนวณ Starter daily rate
  Starter daily rate = 990 / 30 = 33 THB/day

Step 3: คำนวณ extended days
  Extended days = Remaining value / Starter daily rate
  Extended days = 2,495 / 33 = ~75.6 days (round down to 75 days)

Step 4: คำนวณวันที่เริ่มบิล Starter ใหม่
  - Day 15: Downgrade effective
  - Day 15 + 75 = Day 90: Extended days end
  - Day 91: First Starter billing cycle begins
  - ไม่ต้องจ่ายเพิ่มจนถึง Day 91

Step 5: Bonus Token adjustment
  - Pro Bonus Token ที่เหลือ (ถ้ามี) ยังใช้ได้จนหมดช่วง extended days
  - หลัง extended days: ได้ Starter Bonus Token (1,000 tokens)
```

**Tenant เห็น preview ก่อนยืนยัน:**
> "Downgrade จาก Pro เป็น Starter: คุณมีมูลค่าเหลือ 2,495 THB จาก Pro plan ซึ่งแปลงเป็น 75 วันใช้งาน Starter ฟรี ไม่ต้องจ่ายจนถึงวันที่ [calculated date] รอบถัดไปจะคิด 990 THB"

---

### Scenario 5: Company E -- New Sub-Platform Registration (Account Linking)

**Profile:**
- Company: JKL Corp
- Existing: Avatar (Pro Plan) via avatar.realfact.ai
- New: Booking Sub-Platform via booking.realfact.ai

**Flow:**

```
Step 1: Tenant Admin เข้า booking.realfact.ai
Step 2: ระบบตรวจพบว่ามีบัญชี SSO อยู่แล้ว (จาก Avatar)
Step 3: แสดง Account Linking prompt:
        "คุณมีบัญชี Realfact อยู่แล้ว (used with Avatar)
         ต้องการเชื่อมต่อกับ Booking หรือไม่?"
Step 4: Tenant ยืนยัน → Consent form แสดง:
        "ข้อมูลที่จะแชร์: ชื่อบริษัท, อีเมลผู้ดูแล, ข้อมูลโปรไฟล์"
Step 5: Tenant accept → บัญชีเชื่อมต่อสำเร็จ
Step 6: เลือก Booking Plan → ชำระเงินผ่านช่องทางที่เลือก
Step 7: ใน Dashboard เห็นทั้ง Avatar และ Booking
```

---

## Appendix E: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-16 | BA-Agent | Initial version -- Complete Multi-Tenancy Platform PRD covering: Part D (Gap Resolution: Module Impact Assessment + New Capabilities), Part E (Shared Specifications: Success Metrics, Data Retention/Privacy, Integration Points, NFR, Risks, Open Questions, Glossary), Appendices A-E (CTO PRD Traceability, Gap Resolution Map, Module Amendment Template, Mock Data Scenarios, Change Log) |

---

> **Note:** Technical specifications including API contracts, database schema, infrastructure architecture, and implementation details will be designed by Developer Team based on these business requirements.

---

*End of Document — X-MT-01 Multi-Tenancy Platform PRD (Sections 14-22 + Appendices)*