# PRD — Avatar Sub-Platform (Live Interact)

> **Version:** 1.1.0 | **Status:** Draft
> **Origin:** แยกขอบเขตจาก PRD_Admin_Backoffice_Draft_1.0.0.md — ส่วน Central Platform ย้ายไป prd-multitenancy_v1.md, ส่วน Avatar-specific เป็นเอกสารนี้

| Item | Detail |
|------|--------|
| Document Scope | Avatar Sub-Platform — ฟังก์ชันเฉพาะที่ Central Platform ไม่ครอบคลุม |
| Foundation Document | `prd-pricing-multitenancy.md` (Tenant, Billing, Cost, Price, Multi-Tenancy) |
| Extended Reference | `prd-multitenancy_v1.md` (X-MT-01 — Cross-Cutting Concern: User Stories, Edge Cases, Business Rules ระดับ Central Platform) |
| Related Document | PRD — User Web Application (แยกเอกสาร) |
| Audience | Backend Team, Admin/Ops Team, Frontend Team |

### Key Terms

| Term | Definition |
|------|-----------|
| **Central Platform** | ระบบกลางที่ให้บริการ shared services (Tenant, Billing, Token, RBAC) — ทุก Sub-Platform ใช้ร่วมกัน |
| **Backoffice** | Admin UI ของ Central Platform — เป็นหน้าเว็บรวมศูนย์ที่ Platform Admin ใช้จัดการทุก Sub-Platform รวมถึง Avatar |
| **Avatar Sub-Platform** | Module เฉพาะ Avatar ที่ plug-in เข้า Backoffice — มี Hardware, Preset, KB, Session เป็นของตัวเอง |
| **Platform Admin** | Admin ที่เข้าใช้งาน Backoffice จัดการทุก Sub-Platform (เดิมเรียก "Central Admin") |
| **Tenant Admin** | Admin ภายในองค์กร Tenant — จัดการ Device และ Preset ของ Tenant ตัวเองผ่าน Web App |
| **Web App** | หน้าเว็บ/แอปที่ Tenant ใช้งาน — แยกจาก Backoffice |

---

## 1. Overview

เอกสารฉบับนี้ครอบคลุมฟังก์ชัน **เฉพาะ Avatar Sub-Platform** ที่อยู่นอกขอบเขตของ Central Platform Foundation ได้แก่ การจัดการ Device, สร้าง Avatar Preset ผ่าน Service Builder, Knowledge Base (RAG) และ Avatar Defaults (Welcome Bonus, System Default Preset)

### Relationship กับ Central Platform

```
prd-pricing-multitenancy.md (Central Platform Foundation)
├── Tenant Service       → SSO, Registration, Hub Page, RBAC, Account Linking
├── M-BE-04              → Tenant Management (Admin-facing)
├── M-BE-05              → Cost Engine
├── M-BE-06              → Price Engine, Subscription Plans, Token Top-up
├── M-BE-07              → Billing, Universal Token Wallet, Invoice, Payment, Credit Line
├── M-BE-12              → Sub-Platform Management, Branding, Lifecycle
└── X-MT-01              → Multi-Tenancy Architecture, Data Isolation

prd-avatar-subplatform.md (เอกสารนี้ — Avatar-specific)
├── Hardware Inventory   → S/N Intake, Register Code, Sales Recording, Device Lifecycle
├── Device Operations    → Activation, Heartbeat, Session Log, Assign Log
├── Service Builder      → Avatar Preset CRUD (avatar + voice + agent + KB)
├── Knowledge Base       → RAG Pipeline (upload → chunk → embed → retrieve)
└── Avatar Defaults      → System Default Preset, Bonus Token config
```

### สิ่งที่ใช้จาก Central Platform (ไม่ define ซ้ำในเอกสารนี้)

| ความสามารถ | ใช้จาก Module | Reference |
|------------|---------------|-----------|
| Tenant Registration (SSO + self-register) | Tenant Service | FR1-FR3 |
| RBAC (Owner/Admin/Member) | Tenant Service | FR9 |
| Universal Token Wallet | M-BE-07 | FR49-FR55 |
| Subscription Plans (Free/Starter/Pro) | M-BE-06 | FR44-FR46 |
| Token Top-up (purchased tokens ไม่หมดอายุ) | M-BE-07 | FR50 |
| Token Deduction (real-time + idempotent) | M-BE-07 | FR52-FR54 |
| Invoice / Receipt (Thai law) | M-BE-07 | FR62-FR64 |
| Payment (2C2P + Bank Transfer + Company QR) | M-BE-07 | FR65-FR70 |
| Payment Verification (Bank Transfer) | M-BE-07 | FR69 |
| Credit Line (B2B post-paid) | M-BE-07 | FR71-FR77 |
| Purchase Log | M-BE-07 | FR88-FR91 |
| Sub-Platform Branding & Lifecycle | M-BE-12 | FR22-FR26 |
| Plan Upgrade (Pro-rata Credit ทันที) | M-BE-06 + M-BE-07 | prd-multitenancy_v1 Section 7.4, BR-CMT.24-25 |
| Plan Downgrade (Extended Service Days ทันที) | M-BE-06 + M-BE-07 | prd-multitenancy_v1 Section 7.4, BR-CMT.26-31 |
| Data Isolation & JWT Validation | X-MT-01 | FR15, FR27 |
| Notifications (Telegram + Email) | M-BE-11 | FR86-FR87 |

> **Access Gate:** Tenant ต้องมี **Active Subscription Plan** ก่อนจึงจะเข้าใช้งาน Avatar Sub-Platform ได้ — Subscription Plan เป็น prerequisite (ไม่ต้องรอ Admin Approve แยก หาก Tenant ผ่าน Central Platform Registration + Payment สำเร็จแล้ว) **[ref: prd-multitenancy_v1 Section 5.1 BR-CMT.4]**

### Avatar-specific Implications ของ Plan Upgrade/Downgrade

> **[ref: prd-multitenancy_v1 Section 7.4 US-CMT.6]** — Upgrade มีผลทันที (Pro-rata Credit), Downgrade มีผลทันที (Extended Service Days, ไม่คืนเงิน)

| Scenario | ผลกระทบต่อ Avatar | การจัดการ |
|----------|-------------------|----------|
| Downgrade → Avatar Slot limit ลดลง | Preset ที่ Assign เกิน limit ต้องจัดการ | Admin/Tenant เลือก Preset ที่จะ keep ก่อน Downgrade สำเร็จ — Preset ส่วนเกินถูก unassign (ไม่ลบ) |
| Downgrade → Token allocation ลดลง | Session อาจถูก block ถ้า balance ต่ำ | แจ้ง Tenant ก่อน Downgrade ว่า token allocation จะลดลงเท่าไหร่ |
| Upgrade → ได้ Avatar Slot เพิ่ม | Tenant Assign Preset เพิ่มได้ทันที | ไม่ต้องจัดการพิเศษ |
| Upgrade → Token allocation เพิ่ม | Token เพิ่มเข้า Wallet ตาม Plan ใหม่ | Subscription tokens ของ Plan เก่าถูก forfeit **[ref: BR-CMT.17 — EC-CMT.17]** |

---

## 2. Module: Hardware Inventory & Device Registration

ระบบลงทะเบียน Hardware และสร้าง Register Code สำหรับ Device Activation — เป็นขั้นตอน **ก่อน** Device เข้าสู่ระบบ Operational

### 2.1 Device Model Catalog (Reusable)

Admin สร้าง Device Model ไว้ล่วงหน้า — เป็น template ที่นำไปใช้ซ้ำได้เมื่อลงทะเบียน Device ใหม่ ไม่ต้องกรอกสเปคซ้ำทุกเครื่อง

| Field | รายละเอียด |
|-------|-----------|
| Model ID | UUID (auto-generated) |
| Model Name | ชื่อรุ่น เช่น `AvatarRealfact Pro 55"`, `AvatarRealfact Mini 32"` |
| Size | ขนาดหน้าจอ เช่น `55"`, `32"`, `27"` |
| Resolution | ความละเอียดหน้าจอ เช่น `4K (3840×2160)`, `1080p (1920×1080)` |
| Spec | สเปคเครื่อง (CPU, RAM, Storage) |
| Description | คำอธิบายเพิ่มเติม (optional) |
| Thumbnail | รูปภาพตัวอย่างของรุ่น (optional) |
| Status | `Active` / `Discontinued` |

- Admin สร้าง/แก้ไข/ปิดใช้งาน Model ได้ผ่าน Backoffice
- 1 Model ใช้ได้กับหลาย Device (1:N)
- Model ที่ `Discontinued` ไม่แสดงตอนลงทะเบียน Device ใหม่ แต่ Device เดิมที่อ้างอิงอยู่ยังใช้ได้

### 2.2 Hardware Inventory Record (Per Device)

Device แต่ละตัว — อ้างอิง Device Model + มีข้อมูลเฉพาะตัว

| Field | รายละเอียด |
|-------|-----------|
| Serial Number (S/N) | รหัสเฉพาะของเครื่อง (unique, primary identifier) |
| Device Name | ชื่อที่ตั้งให้เครื่อง เช่น `ตู้ล็อบบี้ ชั้น 1`, `Kiosk สาขาสยาม` (Admin หรือ Tenant ตั้งได้) |
| Register Code | Short Code auto-generated (เช่น `AV-X7K9M2`) — ใช้สำหรับ Activate Device |
| Device Model | อ้างอิง Model ID จาก Device Model Catalog (ดึง Size, Resolution, Spec มาแสดงอัตโนมัติ) |
| Status | `Registered` / `Sold` / `Activated` / `Decommissioned` |
| Sold To (Tenant ID) | Tenant ที่ซื้อ Device นี้ (nullable — ยังไม่ขายก็ไม่มี) |
| Activated By (Tenant ID) | Tenant ที่ Activate Device นี้ (ปกติตรงกับ Sold To) |
| Registration Date | วันที่ลงทะเบียนเข้า Inventory |
| Sold Date | วันที่บันทึกการขาย |
| Activation Date | วันที่ Device ถูก Activate |
| Notes | หมายเหตุเพิ่มเติม (เช่น Lot/Batch, ใบสั่งซื้อ) |

> **Flow:** Admin เลือก Device Model → กรอก S/N + Device Name → ระบบสร้าง Record + Register Code
> สเปค (Size, Resolution, Spec) ดึงจาก Model อัตโนมัติ ไม่ต้องกรอกซ้ำ

### 2.3 Register Code

| Item | รายละเอียด |
|------|-----------|
| Format | Short Code 8 ตัวอักษร เช่น `AV-X7K9M2` (prefix `AV-` + 6 alphanumeric uppercase) |
| Generation | Auto-generate เมื่อ Admin ลงทะเบียน S/N เข้า Inventory |
| Uniqueness | Unique ทั้งระบบ — ไม่ซ้ำกันแม้ข้าม Sub-Platform |
| Usage | ใช้ได้ครั้งเดียว (single-use) — หลัง Activate แล้ว Code ถูก invalidate |
| Display | แสดงที่หน้าตู้ (Device แสดง Code บนจอก่อน Activate) **และ/หรือ** แนบไปกับใบส่งสินค้า |
| Expiry | ไม่หมดอายุ — ใช้ได้จนกว่าจะ Activate |
| Lookup | Admin สามารถค้นหา Device จาก Register Code ได้ใน Backoffice |

### 2.4 Device Lifecycle

```
Registered ──→ Sold ──→ Activated ──→ Decommissioned
    │             │          │
    │             │          └─ Device ใช้งานปกติ (Operational)
    │             │             สามารถ Transfer ระหว่าง Tenant ได้
    │             │
    │             └─ ระบุ Tenant ที่ซื้อ (Sold To)
    │                Register Code พร้อมใช้
    │
    └─ S/N ลงทะเบียนแล้ว
       Register Code ถูกสร้าง
       ยังไม่มี Tenant
```

**State Transitions:**

| From | To | Trigger | ใครทำ |
|------|----|---------|-------|
| — | Registered | Admin ลงทะเบียน S/N ใหม่ | Admin |
| Registered | Sold | Admin ระบุ Tenant ที่ซื้อ | Admin |
| Sold | Activated | กรอก Register Code สำเร็จ | Tenant หรือ Admin |
| Activated | Decommissioned | ปลดประจำการ Device | Admin |
| Decommissioned | Registered | Re-register (เคลียร์ข้อมูลเดิม, สร้าง Register Code ใหม่) | Admin |

### 2.5 Device Activation Flow

**2 วิธี Activate (ใช้ Register Code เหมือนกัน):**

**วิธี A — Tenant Self-Activate (ผ่าน Web App):**
1. Tenant login เข้า Web App
2. ไปหน้า "Add Device" → กรอก Register Code (เช่น `AV-X7K9M2`)
3. ระบบ validate: Code ถูกต้อง + ยังไม่ถูกใช้ + Sold To ตรงกับ Tenant นี้ (ถ้ามี)
4. Device link เข้า Tenant อัตโนมัติ → Status: Activated
5. Register Code ถูก invalidate (ใช้ซ้ำไม่ได้)

**วิธี B — Admin Activate (ผ่าน Backoffice):**
1. Admin เปิดหน้า Hardware Inventory → เลือก Device
2. กรอก Register Code หรือเลือก Device จาก S/N → เลือก Tenant ปลายทาง
3. ระบบ Activate + link เข้า Tenant → Status: Activated
4. Register Code ถูก invalidate

> **Validation Rule:** ถ้า Device มี `Sold To` แล้ว — Tenant ที่ Activate ต้องตรงกับ Sold To (ป้องกัน Tenant อื่นเอา Code ไป Activate)
> ถ้ายังไม่มี `Sold To` (Admin ยังไม่ record sale) — Admin Activate ได้เลย แต่ Tenant self-activate ไม่ได้

### 2.6 Bulk Operations

- **Bulk S/N Import:** Admin อัพโหลด CSV (S/N, Model ID, Device Name) → ระบบสร้าง Inventory Records + Register Codes ทั้งหมด (สเปคดึงจาก Device Model Catalog)
- **Bulk Sale Recording:** Admin อัพโหลด CSV (S/N, Tenant ID) → ระบบ update Sold To + Status ทั้ง batch
- **Export:** Admin export รายการ Inventory เป็น CSV (รวม Register Code) สำหรับแนบไปกับใบส่งสินค้า

### 2.7 User Stories (Hardware Inventory)

#### US-AV.1: Admin Manages Device Model Catalog

**As a** Platform Admin
**I want** to create and manage reusable Device Model templates (name, size, resolution, spec)
**So that** I don't have to re-enter device specifications each time I register a new device

**Acceptance Criteria:**
- [ ] ฉันสามารถสร้าง Device Model ใหม่: Model Name, Size, Resolution, Spec, Description (optional), Thumbnail (optional)
- [ ] ฉันสามารถแก้ไข Device Model ที่มีอยู่ได้ (ยกเว้น Model ID)
- [ ] ฉันสามารถตั้งสถานะ `Discontinued` — ไม่แสดงตอนลงทะเบียน Device ใหม่ แต่ Device เดิมที่อ้างอิงอยู่ยังใช้ได้
- [ ] ฉันเห็นจำนวน Device ที่ใช้ Model นี้อยู่ (Device Count)
- [ ] ฉันสามารถ search/filter Device Model ตาม Name, Size, Status ได้

#### US-AV.2: Admin Registers New Device

**As a** Platform Admin
**I want** to register a new device by selecting a Device Model and entering a serial number
**So that** the system generates a Register Code for device activation

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก Device Model จาก Catalog (แสดงเฉพาะ Active models)
- [ ] ฉันกรอก S/N + Device Name → ระบบ auto-generate Register Code (Short Code เช่น `AV-X7K9M2`)
- [ ] สเปค (Size, Resolution, Spec) ดึงจาก Device Model อัตโนมัติ ไม่ต้องกรอกซ้ำ
- [ ] Device เริ่มต้นที่สถานะ `Registered`
- [ ] ฉันสามารถ Bulk Import ผ่าน CSV (S/N, Model ID, Device Name) ได้
- [ ] หลัง Import สำเร็จ ระบบแสดง summary: จำนวนสำเร็จ, จำนวนล้มเหลว, รายละเอียด error

#### US-AV.3: Admin Records Device Sale

**As a** Platform Admin
**I want** to record which Tenant purchased a device
**So that** the Register Code can be used only by the correct Tenant

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก Device (จาก S/N หรือ Register Code) + ระบุ Tenant ที่ซื้อ
- [ ] Device status เปลี่ยนจาก `Registered` → `Sold`
- [ ] ฉันสามารถ Bulk Record Sale ผ่าน CSV (S/N, Tenant ID)
- [ ] ฉันสามารถ Export รายการ Inventory เป็น CSV (รวม Register Code) สำหรับแนบใบส่งสินค้า

#### US-AV.4: Tenant Self-Activates Device

**As a** Tenant Admin
**I want** to activate a device by entering the Register Code through the Web App
**So that** the device is linked to my Tenant account and ready to use

**Acceptance Criteria:**
- [ ] ฉันไปหน้า "Add Device" ใน Web App → กรอก Register Code
- [ ] ระบบ validate: Code ถูกต้อง + ยังไม่ถูกใช้ + Sold To ตรงกับ Tenant ของฉัน
- [ ] Device link เข้า Tenant อัตโนมัติ → Status: `Activated`
- [ ] Register Code ถูก invalidate ทันที (ใช้ซ้ำไม่ได้)
- [ ] ฉันเห็น Device ใหม่ใน Device List ของ Tenant

#### US-AV.5: Admin Activates Device for Tenant

**As a** Platform Admin
**I want** to activate a device on behalf of a Tenant through the Backoffice
**So that** I can help Tenants who cannot self-activate

**Acceptance Criteria:**
- [ ] ฉันเลือก Device (จาก S/N หรือ Register Code) + เลือก Tenant ปลายทาง
- [ ] ระบบ Activate + link เข้า Tenant → Status: `Activated`
- [ ] Register Code ถูก invalidate
- [ ] ถ้า Device มี `Sold To` อยู่แล้ว — Tenant ที่ Activate ต้องตรงกับ Sold To (หรือ Admin override ได้)

### 2.8 Edge Cases (Hardware Inventory)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AV.1 | Input Boundary | S/N ซ้ำกับ Device ที่มีอยู่แล้วในระบบ | ไม่สามารถลงทะเบียนได้ | แสดง: "S/N นี้มีอยู่ในระบบแล้ว (Status: [status])" พร้อม link ไปดู Device เดิม |
| EC-AV.2 | System | Register Code collision (random ซ้ำ) | ไม่กระทบ user — ระบบจัดการเอง | Retry auto-generate สูงสุด 3 ครั้ง ถ้ายังซ้ำ → alert Admin + log error |
| EC-AV.3 | Business Rule | Tenant พยายาม Self-Activate Device ที่ Sold To เป็น Tenant อื่น | Activation ถูก block | แสดง: "Register Code นี้ถูกกำหนดให้กับบัญชีอื่น กรุณาติดต่อผู้ดูแลระบบ" |
| EC-AV.4 | Business Rule | Tenant พยายาม Self-Activate แต่ Device ยังไม่มี Sold To | Activation ถูก block | แสดง: "Device นี้ยังไม่พร้อมสำหรับการ Activate กรุณาติดต่อผู้ดูแลระบบ" (ต้อง Admin activate) |
| EC-AV.5 | State | Admin Record Sale ให้ Tenant ที่ยังไม่มี Active Subscription | Record Sale ได้ แต่ Activate ไม่ได้จนกว่า Tenant จะมี Subscription | แสดง warning: "Tenant นี้ยังไม่มี Active Subscription — Device จะ Activate ไม่ได้จนกว่า Tenant จะสมัคร Plan" |
| EC-AV.6 | Data Boundary | Bulk Import CSV มี S/N ซ้ำ / Model ID ไม่ถูกต้อง | บาง rows ล้มเหลว | ระบบ process ทีละ row — แสดง report: rows สำเร็จ/ล้มเหลว พร้อม error detail ต่อ row |
| EC-AV.7 | State | Device Model ถูก Discontinued แต่มี Devices ที่อ้างอิงอยู่ | Devices เดิมไม่ได้รับผลกระทบ | แสดง warning ก่อน Discontinue: "มี [X] Devices ใช้ Model นี้อยู่ Devices เดิมจะยังทำงานได้ แต่ไม่สามารถลงทะเบียน Device ใหม่กับ Model นี้ได้" |
| EC-AV.8 | State | Re-register Device ที่ Decommissioned แต่ยังมี Session data เดิม | ข้อมูล Session เดิมต้องจัดการ | Session data เดิมถูกเก็บไว้ (ไม่ลบ) แต่ไม่แสดงใน Device ใหม่ — Device ได้ Register Code ใหม่ + เริ่มต้นสะอาด |

### 2.9 Error Scenarios (Hardware Inventory)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| S/N ซ้ำ | Validation | Medium | ลงทะเบียน Device ด้วย S/N ที่มีอยู่แล้ว | "S/N นี้มีอยู่ในระบบแล้ว" | ใช้ S/N อื่น หรือค้นหา Device เดิม |
| Model ID ไม่พบ | Validation | Medium | เลือก Model ที่ถูกลบหรือไม่มี | "Device Model ไม่พบในระบบ" | เลือก Model อื่น |
| CSV format ไม่ถูกต้อง | Validation | Medium | Upload CSV ที่ column ไม่ตรง | "รูปแบบ CSV ไม่ถูกต้อง กรุณาตรวจสอบ header: S/N, Model ID, Device Name" | แก้ไข CSV แล้วอัพโหลดใหม่ |
| Register Code ถูกใช้แล้ว | Business Rule | High | กรอก Code ที่ Activate ไปแล้ว | "Register Code นี้ถูกใช้งานแล้ว" | ตรวจสอบ Code กับ Admin |
| Device not found | Validation | Medium | ค้นหา S/N หรือ Code ที่ไม่มีในระบบ | "ไม่พบ Device ในระบบ กรุณาตรวจสอบ S/N หรือ Register Code" | ตรวจสอบข้อมูลให้ถูกต้อง |
| Tenant not found | Validation | Medium | Record Sale ให้ Tenant ID ที่ไม่มี | "ไม่พบ Tenant ในระบบ กรุณาตรวจสอบ Tenant ID" | ตรวจสอบ Tenant ID |
| Register Code generation ล้มเหลว | System | High | ลงทะเบียน Device แต่ระบบ generate Code ไม่ได้ | "เกิดข้อผิดพลาดในการสร้าง Register Code กรุณาลองอีกครั้ง" | Retry หรือติดต่อ Admin |
| Bulk Import > 500 rows | Performance | Medium | Upload CSV ขนาดใหญ่ | "กำลังดำเนินการ ระบบจะแจ้งผลเมื่อเสร็จ" | Async processing — ส่ง notification เมื่อเสร็จ |

---

## 3. Module: Device Operations

ระบบจัดการ Device **หลัง Activate** สำหรับ Avatar Sub-Platform — รองรับ 1 Tenant : N Devices

### 3.1 Ownership Mapping

- Device link เข้า Tenant อัตโนมัติผ่าน Activation Flow (Section 2.4)
- Admin สามารถ Transfer Device ระหว่าง Tenant ได้ (พร้อม audit log)
- รองรับ 1 Tenant : N Devices
- **Tenant Context:** ใช้ `active_tenant` จาก JWT validate ทุก API call **[ref: X-MT-01]**

### 3.2 Device Heartbeat

- ตรวจสอบ Online/Offline Real-time
- แสดงสถานะ Last Seen timestamp
- Alert เมื่อ Device offline เกินเวลาที่กำหนด

### 3.3 Device Session Log

บันทึกทุก Session แยกต่อ Device:

| Field | รายละเอียด |
|-------|-----------|
| Session ID | UUID ของ Session |
| Device ID | S/N ของเครื่อง |
| Tenant ID | Tenant ที่เป็นเจ้าของ Device |
| Preset ID | Preset ที่ใช้ใน Session นี้ |
| Start/End Time | เวลาเริ่ม-จบ Session |
| Duration | ระยะเวลารวม (นาที) |
| Token Consumed | จำนวน Token ที่ถูกหัก |

- แสดงจำนวน Session ต่อ Device ต่อวัน + ระยะเวลารวม + Token รวม
- **Token Deduction:** หัก Token ผ่าน Universal Token Wallet **[ref: M-BE-07 FR52-FR54]**

### 3.4 Avatar Assign Log

บันทึกประวัติทุกครั้งที่มีการ Assign/สลับ Preset:

| Field | รายละเอียด |
|-------|-----------|
| Log ID | UUID |
| Timestamp | วันที่/เวลา |
| Device ID | S/N ของเครื่อง |
| Preset ID (New) | Preset ที่ Assign ใหม่ |
| Preset ID (Old) | Preset ก่อนหน้า |
| Actor | ผู้ทำรายการ (User / Admin) + User ID |
| Tenant ID | Tenant ที่เป็นเจ้าของ |

- Admin ดูย้อนหลังได้ทุก Tenant (ผ่าน Backoffice)
- Tenant Admin ดูได้เฉพาะ Tenant ตัวเอง (ผ่าน Hub Page / Web App)

### 3.5 User Stories (Device Operations)

#### US-AV.6: Admin Transfers Device Between Tenants

**As a** Platform Admin
**I want** to transfer a device from one Tenant to another with a full audit trail
**So that** I can reassign devices when a Tenant returns hardware or when ownership changes

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก Device (จาก S/N) + เลือก Tenant ปลายทางใหม่
- [ ] ระบบบันทึก Transfer Log: Device ID, Tenant เดิม, Tenant ใหม่, Actor, Timestamp
- [ ] Preset ที่ Assign อยู่กับ Device ถูก unassign อัตโนมัติ (เพราะ Preset ผูกกับ Tenant เดิม)
- [ ] Tenant ใหม่เห็น Device ใน Device List ทันที
- [ ] Tenant เดิมไม่เห็น Device ใน Device List อีกต่อไป
- [ ] Session Log เดิมยังคงอยู่ — แต่แสดงภายใต้ Tenant เดิม (ไม่ย้ายตาม)

#### US-AV.7: Admin/Tenant Monitors Device Heartbeat

**As a** Platform Admin or Tenant Admin
**I want** to see real-time online/offline status of all devices
**So that** I can quickly identify and troubleshoot devices that are offline

**Acceptance Criteria:**
- [ ] ฉันเห็นสถานะ Online/Offline ของทุก Device ใน Device List (real-time update)
- [ ] ฉันเห็น Last Seen timestamp สำหรับ Device ที่ Offline
- [ ] ระบบส่ง Alert เมื่อ Device offline เกินเวลาที่กำหนด (configurable threshold)
- [ ] Admin เห็น Heartbeat ของทุก Device ข้าม Tenant (ผ่าน Backoffice)
- [ ] Tenant Admin เห็น Heartbeat เฉพาะ Device ของ Tenant ตัวเอง

#### US-AV.8: Admin/Tenant Views Device Session Log

**As a** Platform Admin or Tenant Admin
**I want** to view session history per device with duration and token consumption details
**So that** I can monitor usage patterns and track token spending

**Acceptance Criteria:**
- [ ] ฉันเห็นรายการ Session ของแต่ละ Device: Session ID, Preset ที่ใช้, Start/End Time, Duration, Token Consumed
- [ ] ฉันสามารถ filter Session Log ตาม Date Range, Device, Preset
- [ ] ฉันเห็น Summary ต่อ Device ต่อวัน: จำนวน Session, ระยะเวลารวม, Token รวม
- [ ] Admin ดู Session Log ได้ทุก Tenant (Backoffice)
- [ ] Tenant Admin ดูได้เฉพาะ Tenant ตัวเอง **[ref: X-MT-01 FR15]**

#### US-AV.9: Admin/Tenant Views Avatar Assign Log

**As a** Platform Admin or Tenant Admin
**I want** to view the history of Preset assignments and switches per device
**So that** I can audit who changed which Preset and when

**Acceptance Criteria:**
- [ ] ฉันเห็นรายการ Assign Log: Timestamp, Device, Preset ใหม่, Preset เก่า, Actor (User/Admin + User ID)
- [ ] ฉันสามารถ filter Assign Log ตาม Date Range, Device, Actor
- [ ] Admin ดู Assign Log ได้ทุก Tenant (Backoffice)
- [ ] Tenant Admin ดูได้เฉพาะ Tenant ตัวเอง **[ref: X-MT-01 FR15]**

### 3.6 Edge Cases (Device Operations)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AV.9 | Business Rule | Transfer Device ที่มี Active Session อยู่ | Session อาจถูก interrupt | Block Transfer จนกว่า Session จะจบ — แสดง: "Device มี Active Session อยู่ กรุณารอให้ Session จบก่อน Transfer" |
| EC-AV.10 | Business Rule | Transfer Device ไปยัง Tenant ที่ไม่มี Active Subscription | Transfer ได้ แต่ Device จะใช้งานไม่ได้ | แสดง warning: "Tenant ปลายทางไม่มี Active Subscription — Device จะไม่สามารถเริ่ม Session ใหม่ได้" |
| EC-AV.11 | System | Device Heartbeat ขาดหายเป็นช่วง ๆ (flapping) | Alert ถูกส่งซ้ำหลายครั้ง | ใช้ debounce: ส่ง Alert ครั้งแรกเมื่อ offline เกิน threshold, ไม่ส่งซ้ำจนกว่า Device จะ online แล้ว offline อีกครั้ง |
| EC-AV.12 | Data Boundary | Session Log มีจำนวนมาก (Device ใช้งานมานานหลายเดือน) | หน้า Load ช้า | ใช้ Pagination + Date Range filter เป็น default (แสดง 30 วันล่าสุด) |
| EC-AV.13 | Business Rule | Tenant Downgrade → Device Slot เกิน limit | Device ส่วนเกินต้องจัดการ | Device ทั้งหมดยังทำงานได้จนสิ้น billing cycle ปัจจุบัน — แจ้ง Tenant ให้เลือก Device ที่จะ keep ก่อนรอบถัดไป **[ref: Section 1 Avatar-specific Implications]** |
| EC-AV.14 | State | Session จบผิดปกติ (Device crash / network disconnect) | Duration + Token Consumed อาจไม่ถูกต้อง | ระบบใช้ Last Heartbeat timestamp เป็น End Time — หัก Token ตาม duration จริง + log flag `abnormal_end` |

### 3.7 Error Scenarios (Device Operations)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Transfer ไป Tenant ที่ไม่มีในระบบ | Validation | Medium | เลือก Tenant ID ที่ไม่ถูกต้อง | "ไม่พบ Tenant ปลายทางในระบบ" | ตรวจสอบ Tenant ID |
| Transfer Device ที่ Decommissioned | Business Rule | Medium | เลือก Device ที่ปลดประจำการแล้ว | "Device นี้ถูก Decommission แล้ว ไม่สามารถ Transfer ได้" | Re-register Device ก่อน |
| Heartbeat connection ล้มเหลว | System | High | Device ไม่สามารถส่ง Heartbeat ได้ | (Admin) แสดง Device เป็น "Offline" + Last Seen timestamp | ตรวจสอบ network / restart Device |
| Session Log query timeout | Performance | Medium | ดึง Log ช่วงเวลายาว (> 90 วัน) | "ข้อมูลมีจำนวนมาก กรุณาจำกัด Date Range ให้แคบลง" | ใช้ Date Range filter |
| Token Deduction ล้มเหลวหลัง Session จบ | System | Critical | Session จบแต่หัก Token ไม่สำเร็จ | (Admin) Alert: "Token Deduction failed — Session [ID]" | ระบบ retry อัตโนมัติ 3 ครั้ง → ถ้ายังล้มเหลว queue สำหรับ manual reconciliation |
| Assign Preset ที่ไม่ compatible กับ Device Model | Business Rule | Medium | เลือก Preset ที่ไม่รองรับ Model ของ Device | "Preset นี้ไม่รองรับ Device Model [model_name]" | เลือก Preset ที่ compatible หรือใช้ System Default |
| Assign Preset ขณะ Device มี Active Session | Business Rule | Medium | เปลี่ยน Preset ขณะ Device กำลังใช้งาน | "Device มี Active Session อยู่ Preset จะเปลี่ยนเมื่อ Session ถัดไปเริ่ม" | Queue การเปลี่ยน — มีผลตอน Session ถัดไป |

---

## 4. Module: Avatar Preset Management (Service Builder)

Admin สร้าง Preset ผ่านหน้า **Service Builder** ใน Backoffice โดยประกอบจาก 4 ส่วนหลัก เพื่อสร้าง AI Character ที่มีทั้งหน้าตา เสียง บุคลิกภาพ และฐานความรู้เฉพาะตัว

### 4.1 Preset Composition

| Component | ID | รายละเอียด |
|-----------|----|-----------|
| Avatar | `avatar_id` | ไฟล์ 3D Model / Animation ที่แสดงผลบน Device (หน้าตา) |
| Voice | `voice_id` | เสียงพูดของตัวละคร (TTS Voice Profile) |
| Agent | `agent_id` | บุคลิกภาพ + ความสามารถ — Admin Inject Input แปะใน System Prompt |
| Knowledge Base | `knowledge_base_id` | ชุดข้อมูล RAG สำหรับตอบคำถามเฉพาะทาง |

### 4.2 Agent Configuration (`agent_id`)

Admin กำหนดบุคลิกภาพและความเชี่ยวชาญผ่าน Inject Input แล้วระบบนำไปประกอบ System Prompt อัตโนมัติเมื่อเริ่ม Session

- **Inject Input Field:** ช่องข้อความอิสระ เช่น `"คุณคือผู้เชี่ยวชาญด้านการเงิน พูดจาสุภาพเสมอ"`
- **System Prompt Assembly:** ระบบนำ Inject Input ไปประกอบใน System Prompt Template อัตโนมัติ
- **Template ตัวอย่าง:** `"คุณคือ {inject_input} ตอบคำถามเป็นภาษาไทย สุภาพและเป็นมิตร"`

### 4.3 Knowledge Base Management (RAG)

Admin อัพโหลด Document จากลูกค้าเข้าระบบ เพื่อสร้าง Knowledge Base ให้ Avatar ใช้อ้างอิงผ่าน RAG

- **Upload:** Admin อัพโหลด Document (PDF, DOCX, TXT, CSV) ผ่าน Backoffice
- **Processing:** ระบบทำ Chunking + Embedding → เก็บเข้า Vector Store อัตโนมัติ
- **Mapping:** 1 Knowledge Base ผูกได้กับหลาย Preset (1:N) แต่ 1 Preset มีได้ 1 KB เท่านั้น (N:1)
- **Session Integration:** เมื่อเริ่ม Session ระบบดึง KB ที่ผูกกับ Preset มาใช้ Retrieve ข้อมูลตอบคำถาม
- **Management:** ดู/แก้ไข/ลบ Document ใน KB ได้ — ระบบ Re-index อัตโนมัติเมื่อมีการเปลี่ยนแปลง
- **Tenant Isolation:** KB ของแต่ละ Tenant แยกกัน 100% **[ref: X-MT-01 FR15]**

### 4.4 Preset CRUD & Assignment

- **Service Builder UI:** สร้าง/แก้ไข Preset โดยเลือก `avatar_id` + `voice_id` + `agent_id` + `knowledge_base_id`
- **Multi-size Asset:** เก็บไฟล์หลาย Resolution ต่อ 1 `avatar_id` (เช่น 4K, 1080p)
- **Device Compatibility Tag:** ระบุ Device Model (จาก Catalog) ที่รองรับแต่ละ Preset
- **Assign Preset ให้ Tenant:** Admin Assign Preset ให้ Tenant (ระดับบัญชี) — Tenant เห็นเฉพาะ Preset ที่ถูก Assign + System Default Preset
- **Suggested Preset:** Admin กำหนด Suggested Preset ต่อ Tenant (แสดง `Suggested` Badge ใน Preset List ฝั่ง User)

### 4.5 Preset API

RESTful endpoint ให้ User Web App:

| Endpoint | รายละเอียด |
|----------|-----------|
| `GET /presets` | ดึงรายการ Preset ที่ Assign ให้ Tenant + System Default |
| `GET /presets?device_model=xxx` | กรองตาม Device Model Compatibility |
| `GET /presets/:id` | ดึง Preset detail พร้อม asset URLs (ตาม device resolution) |

- ทุก request ต้อง validate JWT + `active_tenant` claim **[ref: X-MT-01 FR27]**

### 4.6 User Stories (Service Builder)

#### US-AV.10: Admin Creates/Edits Avatar Preset

**As a** Platform Admin
**I want** to create and edit Avatar Presets by combining avatar, voice, agent personality, and knowledge base
**So that** I can build customized AI characters for Tenants

**Acceptance Criteria:**
- [ ] ฉันสามารถสร้าง Preset ใหม่ผ่าน Service Builder: เลือก `avatar_id` + `voice_id` + `agent_id` + `knowledge_base_id`
- [ ] ฉันสามารถแก้ไข Preset ที่มีอยู่ (เปลี่ยน component ใดก็ได้)
- [ ] ฉันสามารถลบ Preset ที่ไม่ได้ถูก Assign ให้ Tenant ใด
- [ ] ฉันสามารถ Preview Preset ก่อน Save (ดู avatar + ฟังเสียงตัวอย่าง)
- [ ] ฉันสามารถกำหนด Device Compatibility Tag — ระบุ Device Model ที่รองรับ Preset นี้

#### US-AV.11: Admin Configures Agent Personality

**As a** Platform Admin
**I want** to define the agent's personality and expertise through the Inject Input field
**So that** the AI character behaves and responds according to the Tenant's business needs

**Acceptance Criteria:**
- [ ] ฉันสามารถกรอก Inject Input (free-text) เช่น `"คุณคือผู้เชี่ยวชาญด้านการเงิน พูดจาสุภาพเสมอ"`
- [ ] ระบบประกอบ Inject Input เข้า System Prompt Template อัตโนมัติ
- [ ] ฉันสามารถ Preview System Prompt ที่ประกอบแล้วก่อน Save
- [ ] ฉันสามารถแก้ไข Inject Input ได้ตลอดเวลา — มีผลกับ Session ถัดไป

#### US-AV.12: Admin Manages Knowledge Base (RAG)

**As a** Platform Admin
**I want** to upload and manage documents for a Knowledge Base that the Avatar uses to answer domain-specific questions
**So that** each Tenant's Avatar can provide accurate, contextual answers from their own data

**Acceptance Criteria:**
- [ ] ฉันสามารถสร้าง Knowledge Base ใหม่ + อัพโหลด Document (PDF, DOCX, TXT, CSV)
- [ ] ระบบทำ Chunking + Embedding อัตโนมัติหลังอัพโหลด — แสดง Processing Status (Pending/Processing/Ready/Failed)
- [ ] ฉันสามารถดูรายการ Document ใน KB + สถานะ Index ของแต่ละ Document
- [ ] ฉันสามารถลบ Document ออกจาก KB → ระบบ Re-index อัตโนมัติ
- [ ] ฉันสามารถอัพโหลด Document เพิ่มเข้า KB ที่มีอยู่ → ระบบ Incremental Index
- [ ] KB ของแต่ละ Tenant แยกกัน 100% **[ref: X-MT-01 FR15]**

#### US-AV.13: Admin Assigns Preset to Tenant

**As a** Platform Admin
**I want** to assign one or more Presets to a Tenant account
**So that** the Tenant can choose and load Presets onto their devices

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก Tenant + เลือก Preset ที่จะ Assign (เลือกได้หลาย Preset)
- [ ] จำนวน Preset ที่ Assign ต้องไม่เกิน Slot Limit ตาม Subscription Plan ของ Tenant
- [ ] ฉันสามารถกำหนด Suggested Preset ต่อ Tenant (แสดง `Suggested` Badge ฝั่ง User)
- [ ] Tenant เห็นเฉพาะ Preset ที่ถูก Assign + System Default Preset
- [ ] ฉันสามารถ Unassign Preset จาก Tenant ได้ — ถ้า Preset กำลังถูกใช้บน Device จะมีผลตอน Session ถัดไป

### 4.7 Edge Cases (Service Builder)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AV.15 | Business Rule | ลบ Preset ที่ถูก Assign ให้ Tenant อยู่ | Tenant สูญเสีย Preset | Block การลบ — แสดง: "Preset นี้ถูก Assign ให้ [X] Tenant อยู่ กรุณา Unassign ก่อนลบ" |
| EC-AV.16 | Business Rule | Assign Preset เกิน Slot Limit ของ Tenant (ตาม Plan) | Assign ถูก block | แสดง: "Tenant มี Preset ถึง limit แล้ว ([X]/[max] slots) — กรุณา Upgrade Plan หรือ Unassign Preset อื่นก่อน" |
| EC-AV.17 | Data Boundary | อัพโหลด Document ขนาดใหญ่เข้า KB (> 50MB) | Processing ใช้เวลานาน | Async processing — แสดง progress bar + ส่ง notification เมื่อเสร็จ, จำกัด max file size ต่อ Document (configurable, default 50MB) |
| EC-AV.18 | System | Embedding/Chunking ล้มเหลวระหว่าง Processing | Document ใน KB ไม่พร้อมใช้ | Document status เป็น `Failed` + แสดง error detail + Admin retry ได้ — Preset ที่ผูก KB นี้ยังใช้ Document อื่นใน KB ที่ Ready ได้ |
| EC-AV.19 | Business Rule | แก้ไข Preset ที่กำลังถูกใช้ใน Active Session | Session ที่กำลังทำงานอยู่อาจได้รับผลกระทบ | การแก้ไขมีผลกับ Session ถัดไปเท่านั้น — Session ปัจจุบันใช้ Preset version เดิม |
| EC-AV.20 | Business Rule | 1 KB ผูกกับหลาย Preset (1:N) แล้วลบ KB | หลาย Preset สูญเสีย KB | แสดง warning: "KB นี้ผูกกับ [X] Presets — ลบแล้ว Presets เหล่านี้จะไม่มี KB" + ต้อง confirm ก่อนลบ |
| EC-AV.21 | State | อัพโหลด Document ซ้ำ (ชื่อไฟล์เดียวกัน) เข้า KB เดิม | อาจเกิด duplicate data | แสดง warning: "ไฟล์ชื่อ [filename] มีอยู่ใน KB แล้ว" + ให้เลือก Replace หรือ Keep Both |

### 4.8 Error Scenarios (Service Builder)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| avatar_id / voice_id / agent_id ไม่พบ | Validation | Medium | เลือก component ที่ถูกลบหรือไม่มี | "ไม่พบ [component_type] ที่เลือก กรุณาเลือกใหม่" | เลือก component อื่น |
| KB Processing timeout | System | High | อัพโหลด Document แต่ระบบ process ไม่เสร็จใน timeout | "การประมวลผล Document ใช้เวลานานกว่าปกติ ระบบจะแจ้งผลเมื่อเสร็จ" | Async — ส่ง notification เมื่อเสร็จ/ล้มเหลว |
| Document format ไม่รองรับ | Validation | Medium | อัพโหลดไฟล์ที่ไม่ใช่ PDF/DOCX/TXT/CSV | "รูปแบบไฟล์ไม่รองรับ กรุณาอัพโหลด PDF, DOCX, TXT หรือ CSV" | เปลี่ยน format แล้วอัพโหลดใหม่ |
| Preset name ซ้ำ | Validation | Low | สร้าง Preset ชื่อเดียวกับที่มีอยู่แล้ว | "ชื่อ Preset นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น" | เปลี่ยนชื่อ Preset |
| Assign Preset ให้ Tenant ที่ไม่มี Active Subscription | Business Rule | Medium | เลือก Tenant ที่ไม่มี Subscription | "Tenant นี้ไม่มี Active Subscription — Assign ได้แต่ Tenant จะยังใช้งาน Preset ไม่ได้จนกว่าจะมี Subscription" | Assign ได้ (pre-assign) แต่แสดง warning |
| Vector Store เต็ม / Embedding quota exceeded | System | Critical | อัพโหลด Document เพิ่มแต่ quota เต็ม | "ไม่สามารถ Index Document ได้ — Storage/Quota เต็ม กรุณาติดต่อ System Admin" | System Admin เพิ่ม capacity |
| Multi-size Asset upload ล้มเหลวบาง Resolution | System | Medium | อัพโหลด Avatar asset แต่บาง resolution ล้มเหลว | "อัพโหลดสำเร็จบางส่วน: [resolution_list] ล้มเหลว" | Retry เฉพาะ resolution ที่ล้มเหลว |

---

## 5. Module: Avatar Defaults (New Tenant Setup)

การตั้งค่าเฉพาะ Avatar ที่ Tenant ใหม่ได้รับเมื่อ subscribe Avatar Sub-Platform

### 5.1 Welcome Bonus Tokens (Avatar-specific)

> **Scope:** Welcome Bonus Tokens เป็น **Avatar Sub-Platform–specific logic** ไม่ได้ define ใน Central Platform (prd-multitenancy_v1) — Avatar Sub-Platform เป็นผู้จัดการ allocation เองผ่าน Backoffice, แต่ token ถูกเก็บใน Universal Token Wallet กลาง

| หัวข้อ | รายละเอียด |
|--------|-----------|
| Trigger | เติมเข้า Universal Token Wallet อัตโนมัติเมื่อ Tenant subscribe Avatar ครั้งแรก (ครั้งเดียวต่อ Tenant ต่อ Sub-Platform) |
| จำนวน | Admin กำหนดจำนวน Welcome Bonus ใน Backoffice (Configurable per Sub-Platform) |
| ประเภท Token | เป็น **bonus tokens** ใน Universal Token Wallet — ใช้ได้เฉพาะ Avatar Sub-Platform |
| Token Deduction Order | **Avatar-specific 3-tier priority:** subscription bonus tokens ก่อน → welcome bonus (Avatar-specific) → purchased tokens **[ref: M-BE-07 FR52 — extended]** |
| หมดอายุ | ไม่หมดอายุ (ใช้ได้จนกว่าจะหมด) — ต่างจาก subscription bonus ที่ reset ทุก billing cycle |
| Re-subscribe | Tenant ที่ cancel แล้วสมัครใหม่ **ไม่ได้รับ** Welcome Bonus อีก (ครั้งเดียวต่อ Tenant ต่อ Sub-Platform) |

> **Note:** Welcome Bonus ใช้ Universal Token Wallet จาก Central Platform — ไม่ใช่ระบบ Token แยกต่างหาก
> **Note:** Central Platform (prd-multitenancy_v1) define เฉพาะ 2-tier priority: Subscription → Purchased. Avatar Sub-Platform เพิ่ม Welcome Bonus เป็น tier กลาง — ต้องส่ง request ให้ Central Platform รองรับ Sub-Platform–specific bonus tier ใน Token Wallet API

### 5.2 System Default Preset

| หัวข้อ | รายละเอียด |
|--------|-----------|
| Preset ตั้งต้น | ระบบมี System Default Preset 1 ตัว ใช้เหมือนกันทุก Tenant |
| ประกอบด้วย | `avatar_id` (ตัวละครกลาง) + `voice_id` + `agent_id` (personality ทั่วไป) + ไม่มี KB (ตอบจาก LLM ตรง) |
| การจัดการ | Admin ตั้งค่า System Default Preset ใน Backoffice (เปลี่ยนได้ มีผลกับ Tenant ใหม่ถัดไป) |
| แสดงผลฝั่ง User | แสดงใน Preset List พร้อม Badge "System Default" ให้ Tenant ทดลองใช้งานได้ทันที |
| ความสัมพันธ์ | Tenant เห็น System Default + Preset ที่ Admin Assign ให้โดยเฉพาะ (ถ้ามี) — สลับใช้ตัวไหนก็ได้ |

### 5.3 User Stories (Avatar Defaults)

#### US-AV.14: Admin Configures Welcome Bonus Tokens

**As a** Platform Admin
**I want** to configure the Welcome Bonus Token amount for the Avatar Sub-Platform
**So that** new Tenants receive a one-time token bonus upon their first subscription

**Acceptance Criteria:**
- [ ] ฉันสามารถกำหนดจำนวน Welcome Bonus Tokens ใน Backoffice (ตัวเลขจำนวนเต็ม ≥ 0)
- [ ] การเปลี่ยนจำนวนมีผลกับ Tenant ใหม่ที่ subscribe หลังจากนั้นเท่านั้น — ไม่กระทบ Tenant เดิม
- [ ] ฉันเห็น Current Value ของ Welcome Bonus + วันที่แก้ไขล่าสุด + ผู้แก้ไข
- [ ] ฉันเห็น History Log ของการเปลี่ยนแปลงค่า Welcome Bonus (ย้อนหลังทั้งหมด)
- [ ] ระบบเติม Welcome Bonus เข้า Universal Token Wallet อัตโนมัติเมื่อ Tenant subscribe Avatar ครั้งแรก

#### US-AV.15: Admin Sets System Default Preset

**As a** Platform Admin
**I want** to set a System Default Preset that all Tenants see automatically
**So that** new Tenants can start using the Avatar immediately without waiting for a custom Preset

**Acceptance Criteria:**
- [ ] ฉันสามารถเลือก Preset ที่มีอยู่เป็น System Default Preset (ได้ 1 ตัว)
- [ ] การเปลี่ยน System Default มีผลกับ Tenant ใหม่ถัดไป — Tenant เดิมยังเห็น Default เดิม
- [ ] System Default Preset แสดงใน Preset List ฝั่ง User พร้อม Badge "System Default"
- [ ] ฉันเห็น Current System Default Preset + วันที่ตั้งค่าล่าสุด + ผู้ตั้งค่า
- [ ] System Default Preset ไม่นับรวมใน Slot Limit ของ Tenant (เป็นของระบบ)

### 5.4 Edge Cases (Avatar Defaults)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-AV.22 | Business Rule | Tenant cancel แล้ว subscribe ใหม่ → ขอ Welcome Bonus อีกครั้ง | Tenant ไม่ได้รับ Bonus | ระบบตรวจสอบ `welcome_bonus_granted` flag — ถ้าเคยได้แล้วจะไม่ให้อีก (ครั้งเดียวต่อ Tenant ต่อ Sub-Platform) |
| EC-AV.23 | Business Rule | Admin ตั้ง Welcome Bonus = 0 | Tenant ใหม่ไม่ได้รับ Bonus | ระบบข้าม Welcome Bonus step — ไม่ error, ไม่สร้าง transaction ที่ amount = 0 |
| EC-AV.24 | State | System Default Preset ถูกลบ (component ถูกลบ) | Tenant ใหม่ไม่มี Default Preset | Block การลบ component ที่เป็นส่วนหนึ่งของ System Default — แสดง: "Component นี้ถูกใช้ใน System Default Preset ไม่สามารถลบได้" |
| EC-AV.25 | Business Rule | Admin เปลี่ยน System Default Preset → Tenant เดิมที่ใช้ Default เดิมอยู่ | Tenant เดิมอาจสับสน | Tenant เดิมยังเห็น + ใช้ Default เดิมได้ — ไม่เปลี่ยนอัตโนมัติ, เฉพาะ Tenant ใหม่ที่เห็น Default ใหม่ |
| EC-AV.26 | Data Boundary | Welcome Bonus Token amount ถูกตั้งค่าสูงมาก (เช่น 1,000,000 tokens) | อาจส่งผลกระทบต่อ cost | แสดง confirmation: "จำนวน Welcome Bonus ([X] tokens) สูงกว่าค่าเฉลี่ย กรุณายืนยัน" (threshold: > 10x ของ plan token allocation) |

### 5.5 Error Scenarios (Avatar Defaults)

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Welcome Bonus Tokens เติมเข้า Wallet ล้มเหลว | System | Critical | Tenant subscribe ครั้งแรก แต่ระบบเติม Bonus ไม่สำเร็จ | (Admin) Alert: "Welcome Bonus failed — Tenant [ID]" | ระบบ retry อัตโนมัติ 3 ครั้ง → ถ้ายังล้มเหลว queue สำหรับ manual credit |
| Welcome Bonus amount ไม่ถูกต้อง (ค่าติดลบ) | Validation | Medium | Admin ใส่ค่าติดลบ | "จำนวน Welcome Bonus ต้องเป็นตัวเลข ≥ 0" | ใส่ค่าที่ถูกต้อง |
| System Default Preset ไม่พร้อมใช้งาน (KB ยัง Processing) | System | Medium | Admin ตั้ง Preset ที่ KB ยัง Process ไม่เสร็จเป็น Default | "Preset นี้มี Knowledge Base ที่ยังประมวลผลไม่เสร็จ กรุณารอให้ KB พร้อมก่อนตั้งเป็น System Default" | รอ KB Processing เสร็จแล้วตั้งค่าใหม่ |
| ไม่มี System Default Preset ในระบบ | Configuration | High | Admin ยังไม่ได้ตั้ง System Default | (System) Warning ใน Backoffice Dashboard: "ยังไม่มี System Default Preset — Tenant ใหม่จะไม่มี Preset ให้ใช้ทันที" | Admin ตั้ง System Default Preset |
| Welcome Bonus granted ซ้ำ (race condition) | System | Critical | Tenant subscribe พร้อมกัน 2 request | ระบบ grant Bonus แค่ครั้งเดียว | ใช้ idempotent operation + `welcome_bonus_granted` flag — request ที่ 2 จะ skip โดยไม่ error |

---

## 6. Technical Specifications (Avatar-specific)

### Avatar Service Stack

| Component | Technology | รายละเอียด |
|-----------|-----------|-----------|
| Hardware Inventory API | Go + ConnectRPC/gRPC | S/N Registry, Register Code generation, Sale recording |
| Device Activation API | Go + ConnectRPC/gRPC | Validate Register Code, Link Device → Tenant |
| Preset API | Go + ConnectRPC/gRPC | RESTful gateway + gRPC internal |
| RAG Pipeline | Document upload → Chunking → Embedding → Vector Store | ใช้ existing Builder infrastructure |
| System Prompt Engine | Template + `{inject_input}` + `{knowledge_base}` | ประกอบอัตโนมัติตอน Session Start |
| Session Log Engine | Go + PostgreSQL | บันทึกทุก Session แยกต่อ Device |
| Assign Log Engine | Go + PostgreSQL | บันทึกทุกการ Assign/สลับ Preset |
| Multi-size Assets | Object Storage (S3-compatible) | หลาย Resolution ต่อ avatar |
| Device Heartbeat | WebSocket / MQTT | Real-time status monitoring |

### Register Code Generation Spec

| Item | รายละเอียด |
|------|-----------|
| Format | `AV-` + 6 alphanumeric uppercase (A-Z, 0-9 ไม่รวม O/0/I/1 ป้องกันสับสน) |
| Uniqueness | DB unique constraint — collision retry up to 3 ครั้ง |
| Storage | เก็บเป็น plaintext (ไม่ต้อง hash เพราะเป็น single-use + Admin ต้อง lookup ได้) |
| Invalidation | หลัง Activate สำเร็จ → mark as `used` + บันทึก Activated By + Activation Date |

### Integration กับ Central Platform

| Integration Point | Protocol | รายละเอียด |
|-------------------|----------|-----------|
| Token Deduction | gRPC → M-BE-07 | หัก Token เมื่อ Session start/end — ใช้ Trace ID สำหรับ idempotency |
| Tenant Validation | JWT (X-MT-01) | ทุก API call validate `active_tenant` claim |
| Subscription Check | gRPC → M-BE-06 | ตรวจสอบ plan tier สำหรับ feature access |
| Notifications | Event → M-BE-11 | แจ้ง Tenant เมื่อ Preset พร้อมใช้งาน |
| Sub-Platform Registry | M-BE-12 | Avatar ลงทะเบียนเป็น Sub-Platform พร้อม Branding |

### Token Deduction Spec (Avatar-specific)

| Item | รายละเอียด |
|------|-----------|
| Billing Type | Per Minute (1 token = 1 minute) **[ref: M-BE-05 FR28]** |
| Exchange Rate | กำหนดโดย Platform Admin per Sub-Platform **[ref: M-BE-06 FR46]** |
| Pre-check | Balance ≥ minimum threshold (configurable, default 20 min) ก่อนเริ่ม Session |
| Deduction Trigger | เมื่อ Session จบ — หักตาม duration จริง |
| Idempotency | ใช้ Session ID เป็น Trace ID **[ref: M-BE-07 FR53]** |
| Insufficient Balance | Block Session start + แจ้ง Tenant ให้ top-up **[ref: M-BE-07 FR55]** |

**Token Deduction Priority (Avatar-specific — 3-tier):**

```
เมื่อ Tenant ใช้ Avatar Session ระบบหัก Token ตามลำดับ:
1. Subscription Tokens  (หักก่อน — reset ทุก billing cycle) [Central Platform]
2. Welcome Bonus Tokens  (หักถัดมา — ไม่หมดอายุ, ได้ครั้งเดียว) [Avatar-specific]
3. Purchased Tokens      (หักสุดท้าย — สะสมได้ ไม่หมดอายุ) [Central Platform]
```

> **Note:** Central Platform (prd-multitenancy_v1) define เฉพาะ 2-tier (Subscription → Purchased). Welcome Bonus เป็น Avatar Sub-Platform–specific tier ที่แทรกตรงกลาง

---

## 7. Functional Requirements (Avatar-specific)

> **Target System Legend:**
> `[Backoffice]` = Backoffice UI (Platform Admin) · `[Web App]` = Tenant-facing Web App · `[Avatar API]` = Avatar backend service · `[Device]` = Device firmware/hardware

### Device Model Catalog

- **A-FR1:** Admin สามารถสร้าง/แก้ไข/ปิดใช้งาน Device Model (Model Name, Size, Resolution, Spec, Description, Thumbnail) `[Backoffice]`
- **A-FR2:** Admin สามารถตั้งสถานะ Device Model เป็น `Discontinued` — ไม่แสดงตอนลงทะเบียน Device ใหม่ แต่ Device เดิมที่อ้างอิงอยู่ยังใช้ได้ `[Backoffice]`
- **A-FR3:** Device Model สามารถนำไปใช้ซ้ำได้ (1 Model : N Devices) — ลงทะเบียน Device ใหม่เลือก Model แล้วสเปคดึงมาอัตโนมัติ `[Avatar API]`

### Hardware Inventory & Registration

- **A-FR4:** Admin สามารถลงทะเบียน Device ใหม่ โดยเลือก Device Model + กรอก S/N + Device Name → ระบบ auto-generate Register Code (Short Code เช่น `AV-X7K9M2`) → Status: Registered `[Backoffice]`
- **A-FR5:** Admin สามารถ Import CSV เพื่อ bulk register หลาย Device พร้อมกัน (S/N, Model ID, Device Name) → ระบบสร้าง Register Code ทั้ง batch `[Backoffice]`
- **A-FR6:** Admin สามารถ Record Sale — ระบุ Tenant ID ที่ซื้อ Device → Status: Sold → สามารถ bulk record sale ผ่าน CSV (S/N, Tenant ID) `[Backoffice]`
- **A-FR7:** Admin สามารถ Export รายการ Inventory เป็น CSV (รวม S/N, Device Name, Model, Register Code) สำหรับแนบไปกับใบส่งสินค้า `[Backoffice]`
- **A-FR8:** Admin สามารถค้นหา Device จาก Register Code, S/N หรือ Device Name ใน Backoffice `[Backoffice]`
- **A-FR9:** Admin สามารถดูรายการ Hardware Inventory ทั้งหมด พร้อม filter ตาม Status (Registered/Sold/Activated/Decommissioned), Model, Tenant `[Backoffice]`
- **A-FR10:** Admin หรือ Tenant Admin สามารถแก้ไข Device Name ได้ (เช่น เปลี่ยนชื่อจาก `ตู้ล็อบบี้` เป็น `ตู้ชั้น 2`) `[Backoffice + Web App]`
- **A-FR11:** Admin สามารถ Decommission Device → Status: Decommissioned → Device หยุดทำงาน `[Backoffice]`
- **A-FR12:** Admin สามารถ Re-register Device ที่ Decommissioned → เคลียร์ข้อมูลเดิม, สร้าง Register Code ใหม่ → Status: Registered `[Backoffice]`

### Device Activation

- **A-FR13:** Tenant สามารถ self-activate Device โดยกรอก Register Code ผ่าน Web App → ระบบ validate Code + ตรวจสอบ Sold To ตรงกับ Tenant → Device link เข้า Tenant อัตโนมัติ → Status: Activated `[Web App → Avatar API]`
- **A-FR14:** Admin สามารถ Activate Device ผ่าน Backoffice โดยเลือก Device (จาก S/N หรือ Register Code) + เลือก Tenant ปลายทาง → Status: Activated `[Backoffice → Avatar API]`
- **A-FR15:** Register Code ใช้ได้ครั้งเดียว — หลัง Activate สำเร็จ Code ถูก invalidate ทันที `[Avatar API]`
- **A-FR16:** ระบบ enforce validation: ถ้า Device มี Sold To แล้ว Tenant ที่ Activate ต้องตรงกับ Sold To — ถ้ายังไม่มี Sold To จะ Tenant self-activate ไม่ได้ (ต้อง Admin activate) `[Avatar API]`
- **A-FR17:** Device แสดง Register Code บนหน้าจอก่อน Activate (สำหรับกรณีที่ Tenant ไม่มี Code จากใบส่งสินค้า) `[Device]`

### Device Operations

- **A-FR18:** Admin สามารถ Transfer Device ระหว่าง Tenant พร้อม audit log `[Backoffice]`
- **A-FR19:** ระบบแสดง Device Heartbeat (Online/Offline) แบบ Real-time `[Avatar API → Backoffice + Web App]`
- **A-FR20:** ระบบบันทึก Session Log ทุก Session แยกต่อ Device (Session ID, Device ID, Preset ID, Duration, Token consumed) `[Avatar API]`
- **A-FR21:** ระบบบันทึก Avatar Assign Log ทุกครั้งที่มีการ Assign/สลับ Preset (Log ID, Timestamp, Device, Preset new/old, Actor) `[Avatar API]`
- **A-FR22:** Admin สามารถดู Session Log และ Assign Log ย้อนหลังของทุก Tenant `[Backoffice]`
- **A-FR23:** Tenant Admin สามารถดู Session Log และ Assign Log ของ Tenant ตัวเองเท่านั้น **[ref: X-MT-01 FR15]** `[Web App]`

### Service Builder / Preset

- **A-FR24:** Admin สามารถสร้าง/แก้ไข/ลบ Preset ผ่าน Service Builder (เลือก `avatar_id` + `voice_id` + `agent_id` + `knowledge_base_id`) `[Backoffice]`
- **A-FR25:** Admin สามารถกำหนด Agent personality ผ่าน Inject Input field — ระบบประกอบเข้า System Prompt อัตโนมัติ `[Backoffice → Avatar API]`
- **A-FR26:** Admin สามารถเก็บ Multi-size Asset หลาย Resolution ต่อ avatar `[Backoffice → Avatar API]`
- **A-FR27:** Admin สามารถกำหนด Device Compatibility Tag ต่อ Preset — อ้างอิง Device Model จาก Catalog `[Backoffice]`
- **A-FR28:** Admin สามารถ Assign Preset ให้ Tenant (ระดับบัญชี) — Tenant เห็นเฉพาะ Preset ที่ถูก Assign + System Default `[Backoffice]`
- **A-FR29:** Admin สามารถกำหนด Suggested Preset ต่อ Tenant (แสดง `Suggested` Badge ฝั่ง User) `[Backoffice]`
- **A-FR30:** Preset API ส่งรายการ Preset ที่ Assign ให้ Tenant + กรองตาม Device Model + ระบุ Suggested Preset `[Avatar API]`

### Knowledge Base (RAG)

- **A-FR31:** Admin สามารถอัพโหลด Document (PDF, DOCX, TXT, CSV) เพื่อสร้าง Knowledge Base `[Backoffice]`
- **A-FR32:** ระบบทำ Chunking + Embedding อัตโนมัติหลังอัพโหลด `[Avatar API]`
- **A-FR33:** Admin สามารถดู/แก้ไข/ลบ Document ใน KB — ระบบ Re-index อัตโนมัติ `[Backoffice → Avatar API]`
- **A-FR34:** 1 KB ผูกได้กับหลาย Preset (1:N) แต่ 1 Preset มีได้ 1 KB (N:1) `[Avatar API]`
- **A-FR35:** ระบบดึง KB ที่ผูกกับ Preset มาใช้ Retrieve ข้อมูลตอน Session `[Avatar API]`
- **A-FR36:** KB ของแต่ละ Tenant แยกกัน 100% (Data Isolation) **[ref: X-MT-01 FR15]** `[Avatar API]`

### Avatar Defaults

- **A-FR37:** Admin สามารถกำหนดจำนวน Welcome Bonus Tokens ใน Backoffice (configurable per Sub-Platform) `[Backoffice]`
- **A-FR38:** ระบบเติม Welcome Bonus Tokens เข้า Universal Token Wallet อัตโนมัติเมื่อ Tenant subscribe Avatar ครั้งแรก `[Avatar API → Central Platform]`
- **A-FR39:** Admin สามารถกำหนด System Default Preset — ทุก Tenant ใหม่ได้รับอัตโนมัติ `[Backoffice]`
- **A-FR40:** Admin สามารถเปลี่ยน System Default Preset ได้ (มีผลกับ Tenant ใหม่ถัดไป ไม่กระทบ Tenant เดิม) `[Backoffice]`

---

## 8. Success Metrics (Avatar-specific)

| Metric | รายละเอียด | เป้าหมาย |
|--------|-----------|----------|
| Total Devices in Inventory | จำนวน Device ทั้งหมดที่ลงทะเบียน (ทุกสถานะ) | Dashboard tracking |
| Devices Pending Activation | จำนวน Device ที่ Sold แล้วแต่ยัง Activate ไม่ได้ | Monitor — ลดจำนวนนี้ |
| Activation Rate | สัดส่วน Device ที่ Activate สำเร็จ vs ที่ขายไป | > 90% ภายใน 7 วันหลังส่งของ |
| Self-Activate vs Admin-Activate | สัดส่วน Tenant activate เอง vs Admin ทำให้ | Dashboard tracking |
| Active Devices | เครื่องที่ Activated และ Online | Dashboard tracking |
| Devices/Tenant | Device เฉลี่ยต่อ Tenant | Dashboard tracking |
| Sessions/Day/Device | จำนวน Session เฉลี่ยต่อวันต่อ Device | Dashboard tracking |
| Avg Session Duration | ระยะเวลาเฉลี่ยต่อ Session | Dashboard tracking |
| Token Consumed/Day | จำนวน Token ที่ถูกหักต่อวัน (ข้าม Tenant) | Dashboard tracking |
| Onboarding Time | ระยะเวลาตั้งแต่ Tenant subscribe จน Preset พร้อมใช้ | < 3 วันทำการ |
| KB Upload Success Rate | สัดส่วน Document ที่อัพโหลดและ Index สำเร็จ | > 95% |
| Preset Utilization | สัดส่วน Preset ที่ถูกใช้งานจริง vs ทั้งหมดที่สร้าง | Dashboard tracking |

> **Note:** Metrics ด้าน Revenue, Payment, Invoice ดูจาก Central Platform Dashboard **[ref: M-BE-12 FR26, M-BE-07 FR88]**

---

## 9. Deferred to V2 (Roadmap)

- Device Settings (Brightness, Volume, Wi-Fi) — remote control
- QR Code Activation — สแกน QR ที่ตู้แทนการกรอก Short Code (เพิ่มเติมจาก Short Code ที่มี V1)
- Scheduling (ตั้งเวลาเปิด-ปิด/สลับ Avatar อัตโนมัติ)
- Avatar Marketplace (ซื้อ-ขาย Avatar/Preset ระหว่าง Tenant)
- Tiered Token Rate (คิด Rate ต่างกันตามประเภท action เช่น พูด vs เงียบ)
- System Knowledge Base (ชุดข้อมูล RAG ที่ระบบเตรียมไว้ให้ทุก Tenant)
- Location Tracking & Geographic Insights
- BI & Analytics Dashboard (Avatar-specific)
- Hardware E-commerce ในระบบ
- Warranty Tracking — ติดตามการรับประกัน Hardware per Device

---

## Appendix: Change Log จาก PRD_Admin_Backoffice_Draft_1.0.0

| Section เดิม | สถานะ | เหตุผล |
|-------------|--------|--------|
| Module 3: Token Package Management | **ตัดออก** | ใช้ M-BE-06 Subscription Plans + M-BE-07 Token Top-up จาก Central Platform แทน |
| Module 4: Demo Credit | **ปรับเป็น** Welcome Bonus Tokens | Map เข้า Universal Token Wallet เป็น bonus tokens เมื่อ subscribe ครั้งแรก |
| Module 5: Payment Approval | **ตัดออก** | ใช้ M-BE-07 Payment Processing (FR65-FR70) จาก Central Platform แทน |
| Section 2: Admin สร้าง Account | **ปรับเป็น** Tenant self-register | ใช้ Tenant Service SSO + self-register (FR1-FR3) แทน Admin สร้างมือ |
| e-Receipt / VAT | **ตัดออก** | ใช้ M-BE-07 Invoice/Receipt Thai law compliance (FR62-FR64) จาก Central Platform แทน |
| Payment Gateway (Omise/2C2P) | **ตัดออก** | ใช้ M-BE-07 Payment Gateway integration จาก Central Platform แทน |
