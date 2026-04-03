# PRD: Multi-Tenancy Zone Separation

**Feature**: แยก Backoffice ออกเป็น 3 โซนตาม Role
**Status**: In Progress
**Last Updated**: 2026-03-11

---

## 1. Problem Statement

ระบบ Backoffice ปัจจุบันเป็นแอปก้อนเดียว ใช้ RBAC Filter ซ่อน/แสดงเมนูตาม Role ทำให้:

- Tenant Admin (ลูกค้า) เห็นข้อมูลที่ควรเป็นของ Platform Owner เช่น Cost Configuration, Margin, Revenue Analytics
- ไม่มี Tenant Console สำหรับลูกค้าจัดการธุรกิจของตัวเอง
- SP Admin / Member ใช้ระบบเดียวกับ Owner โดยแค่ซ่อนเมนู
- ไม่มีจุดเชื่อมต่อไปยัง Sub-Platform App (External Subdomain)

---

## 2. Solution Overview

แยกระบบออกเป็น **3 โซน** ตาม Role ของ User:

```
Platform
├── Admin Backoffice  → Owner (Internal Staff)
├── Hub               → Tenant Admin (Customer)
└── SP App            → SP Admin / Member (External Subdomain)
```

### 2.1 Zone Definitions

| Zone | ผู้ใช้ | วัตถุประสงค์ | Entry Point |
|------|--------|-------------|-------------|
| **Admin Backoffice** | Owner (Lv.0) | จัดการ Platform ทั้งหมด | Admin App |
| **Hub (Tenant Console)** | Tenant Admin (Lv.1) | จัดการธุรกิจของ Tenant | Hub App |
| **SP App** | SP Admin (Lv.2), Member (Lv.3) | ทำงานใน Sub-Platform | External Subdomain |

### 2.2 RBAC Hierarchy

```
Lv.0  Owner (super_admin)          → Admin Backoffice
Lv.1  Tenant Admin (tenant_admin)  → Hub (Tenant Console)
Lv.2  SP Admin (subplatform_admin) → SP App (External)
Lv.3  Member (subplatform_member)  → SP App (External)
```

- **Cascade Down** — ระดับบนจัดการระดับล่างได้เสมอ
- **SP Admin เป็น Optional** — ถ้าไม่มี, Tenant Admin จัดการ SP ตรง
- **Custom Roles** — แต่ละระดับสร้าง Role ให้ระดับล่าง

---

## 3. Login Flow

### 3.1 Flow Diagram

```
                          ┌──────────┐
                          │  Login   │
                          │  Page    │
                          └────┬─────┘
                               │
                    ┌──────────┴──────────┐
                    │  Authenticate       │
                    │  + Check Memberships│
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          Owner          Tenant Admin      SP Admin / Member
              │                │                │
              ▼                │                │
      Admin Backoffice        │                │
      (เข้าตรง)               │                │
                    ┌─────────┴────────┐  ┌────┴────────┐
                    │  กี่ Tenant?     │  │ กี่ Membership?│
                    └────┬────────┬────┘  └────┬────────┬┘
                      1 อัน    หลายอัน      1 อัน   หลายอัน
                         │        │           │        │
                         ▼        ▼           ▼        ▼
                      Hub     Picker       SP App   Picker
                     (ตรง)   → Hub        (ตรง)   → SP App
```

### 3.2 Login Rules

| Role | Memberships | Behavior |
|------|------------|----------|
| Owner | ไม่จำกัด | → Admin Backoffice ตรง (เห็นทุก Tenant) |
| Tenant Admin | 1 Tenant | → Hub ตรง (scoped to Tenant นั้น) |
| Tenant Admin | หลาย Tenant | → Picker เลือก Tenant → Hub |
| SP Admin | 1 Membership | → SP App ตรง |
| SP Admin | หลาย Membership | → Picker เลือก Tenant/SP → SP App |
| Member | 1 Membership | → SP App ตรง |
| Member | หลาย Membership | → Picker เลือก Tenant/SP → SP App |

### 3.3 Picker (Tenant/SP Selector)

- แสดงเมื่อ User มี **หลาย Membership** (ยกเว้น Owner)
- แสดงเป็น **Overlay เต็มจอ** พร้อม Card ให้เลือก
- แต่ละ Card แสดง: ชื่อ Tenant, Role badge, Sub-Platform (ถ้ามี)
- หลังเลือก → redirect ไป Zone ที่ถูกต้องตาม Role

### 3.4 Zone Guard (Redirect Logic)

เมื่อ User เข้า Zone ที่ไม่ตรงกับ Role ระบบต้อง redirect ไป Zone ที่ถูกต้องอัตโนมัติ:

| สถานการณ์ | Action |
|-----------|--------|
| Tenant Admin เข้า Admin Backoffice | → Redirect ไป Hub |
| Owner เข้า Hub | → Redirect ไป Admin Backoffice |
| SP Admin/Member เข้า Hub | → Redirect ไป SP App |
| Logout จาก Hub | → Redirect กลับ Login Page |

---

## 4. Zone A: Admin Backoffice

### 4.1 ผู้ใช้
- Owner (Lv.0) เท่านั้น
- Internal Staff ที่ได้รับมอบหมาย (ผ่าน Custom Role ในอนาคต)

### 4.2 Features
- **Context Switcher**: สลับได้หลาย Context ตาม Sub-Platform ที่มี (e.g. Central BO, Avatar, Developer Portal)
- **Data Scope**: Platform-wide (ข้ามทุก Tenant)

### 4.3 Pages ที่เป็น Owner-Only (ตัวอย่าง)

| กลุ่ม | ลักษณะ |
|-------|--------|
| Platform Overview | Dashboard รวม, Tenant Management (CRUD), Sub-Platform Management |
| Cost & Revenue | Cost Configuration, Margin Config, Snapshots, Change Requests |
| Plans & Pricing | สร้าง/แก้ไข Subscription Plans, Token Packages, Welcome Bonus |
| Billing Admin | Invoice ทุก Tenant, Payment Verification, Credit & Refunds, Overdue |
| Platform Settings | Payment Settings, Platform Members, Exchange Rates |
| Analytics | Revenue & Billing, API Usage, Customers — ข้อมูล Platform-wide |
| Sub-Platform Modules | ดูข้อมูล Sub-Platform ข้ามทุก Tenant |

> หมายเหตุ: Pages เหล่านี้เป็นตัวอย่างที่ได้จากการวิเคราะห์ โปรเจคอื่นสามารถปรับตาม Domain ได้

### 4.4 Owner Impersonate (Future)
- Owner สามารถ "เข้าดูในฐานะ Tenant" จากหน้า Tenant Management
- เปิด Hub ในมุมมองของ Tenant นั้น
- มี Banner แจ้ง "กำลังดูในฐานะ [ชื่อ Tenant]" + ปุ่มกลับ Admin BO

---

## 5. Zone B: Hub (Tenant Console)

### 5.1 ผู้ใช้
- Tenant Admin (Lv.1) เท่านั้น

### 5.2 Layout
- **Sidebar**: เมนูหลักสำหรับจัดการธุรกิจ (ไม่มี Sub-Platform เมนูย่อย)
- **Context Switcher**: ไม่มี (ไม่จำเป็น เพราะ Hub คือ Context ของ Tenant)
- **Topbar ซ้าย**: Tenant Switcher (ชื่อ Tenant + ปุ่มสลับ ถ้ามีหลาย Tenant)

### 5.3 Pages

| Page | รายละเอียด |
|------|-----------|
| **Dashboard** | KPI ของ Tenant (e.g. Token Balance, ค่าใช้จ่าย, Sessions) + Sub-Platform Cards พร้อมปุ่ม [เข้าใช้งาน] → External Link |
| **Subscriptions** | แพ็กเกจที่สมัคร (View-only), Token Balance, Activity Log |
| **Billing** | Invoice ของ Tenant, สรุปยอดชำระ/ค้าง, แจ้งโอน |
| **Team** | จัดการสมาชิกใน Tenant, Role assignment, Custom Roles |
| **Usage Report** | สถิติการใช้งาน, Session Log |
| **Settings** | Company Profile, Notification Preferences |

### 5.4 Sub-Platform Cards (Dashboard)

- แสดงเฉพาะ SP ที่ Tenant สมัครใช้งาน
- แต่ละ Card แสดง: ชื่อ SP, สถานะ (Active/Pending), Plan, สรุปข้อมูลเบื้องต้น (Devices, Sessions)
- ปุ่ม **[เข้าใช้งาน]** → เปิด SP App (External Subdomain) ใน Tab ใหม่
- **ไม่มีเมนูย่อยของ SP ใน Sidebar** — Sub-Platform เป็นแค่จุดเชื่อมต่อออกไป

### 5.5 Tenant Switcher (Topbar ซ้าย)

ใช้ 2 รูปแบบ แยกตามจังหวะ:

```
สลับระหว่างใช้งาน:       Login ครั้งแรก:
┌──────────────────┐     ┌──────────────────────┐
│ 🏢 Tenant A  ▼  │     │   Picker Overlay     │
├──────────────────┤     │   (เต็มจอ)            │
│ ✅ Tenant A      │     │   ┌────────────────┐  │
│    Tenant B      │     │   │ Tenant A       │  │
└──────────────────┘     │   │ Tenant B       │  │
   Dropdown              │   └────────────────┘  │
   (เร็ว, ไม่สะดุด)       └──────────────────────┘
                            Picker Overlay
                            (ตัดสินใจครั้งแรก)
```

| จังหวะ | UI | เหตุผล |
|--------|-----|--------|
| Login ครั้งแรก (ยังไม่เลือก Tenant) | Picker Overlay | ให้เวลาตัดสินใจ, เห็นข้อมูลครบ |
| สลับระหว่างใช้งาน (กดที่มุมซ้ายบน) | Dropdown | สลับเร็ว, ไม่สะดุดการทำงาน |

**เงื่อนไขการแสดงผล:**

| เงื่อนไข | Tenant Switcher |
|----------|----------------|
| User มี 1 Tenant | แสดงชื่อ Tenant เฉยๆ (static, กดไม่ได้, ไม่มี ▼) |
| User มีหลาย Tenant | แสดงชื่อ Tenant + ▼ + border (กดได้ → Dropdown) |

### 5.6 ข้อมูลที่ Tenant Admin ต้องไม่เห็น

Hub ต้อง **ไม่มี** หน้าหรือข้อมูลเหล่านี้:

| ข้อมูล | เหตุผล |
|--------|--------|
| Cost Configuration / Margin Config | ต้นทุนและกำไรของ Platform — ความลับทางธุรกิจ |
| Revenue Analytics | รายได้รวม Platform — ข้ามทุก Tenant |
| ข้อมูลลูกค้ารายอื่น | Data isolation — แต่ละ Tenant เห็นแค่ของตัวเอง |
| Tenant Management (CRUD) | สร้าง/ลบ Tenant เป็น Owner job |
| Sub-Platform Management | จัดการ SP ระดับ Platform |
| Plans & Pricing (edit) | กำหนดราคา — Owner job (Tenant แค่ดู) |

---

## 6. Zone C: SP App (External Subdomain)

### 6.1 ผู้ใช้
- SP Admin (Lv.2) — จัดการ SP Config + Members
- Member (Lv.3) — ทำงานตาม Permission ที่ได้รับ

### 6.2 Architecture
- เป็น **แอปแยก** บน External Subdomain (e.g. `avatar.example.com`, `devportal.example.com`)
- SP Admin / Member **ไม่ผ่าน Hub** — เข้า SP App ตรงหลัง Login
- Authentication ผ่าน Shared Auth หรือ SSO

### 6.3 Entry Flow
- Login → ตรวจ Role → SP Admin/Member → SP App
- ถ้ามีหลาย Membership → Picker เลือก Tenant/SP ก่อน → SP App
- Hub (Tenant Console) ทำหน้าที่เป็น **จุดลิงก์** ไป SP App เท่านั้น (สำหรับ Tenant Admin)

---

## 7. Acceptance Criteria

### AC-1: Zone Routing

| # | Criteria | Expected |
|---|----------|----------|
| 1.1 | Owner login | → เข้า Admin Backoffice เต็มระบบ |
| 1.2 | Tenant Admin login (1 Tenant) | → เข้า Hub ตรง scoped to Tenant นั้น |
| 1.3 | Tenant Admin login (หลาย Tenant) | → แสดง Picker Overlay ให้เลือก → เข้า Hub |
| 1.4 | SP Admin login (1 Membership) | → เข้า SP App ตรง |
| 1.5 | SP Admin login (หลาย Membership) | → แสดง Picker ให้เลือก → เข้า SP App |
| 1.6 | Tenant Admin เข้า Admin Backoffice โดยตรง (bookmark/URL) | → Redirect ไป Hub อัตโนมัติ |
| 1.7 | Owner เข้า Hub โดยตรง | → Redirect ไป Admin Backoffice อัตโนมัติ |

### AC-2: Hub (Tenant Console)

| # | Criteria | Expected |
|---|----------|----------|
| 2.1 | Hub Sidebar | แสดงเมนู: Dashboard, Subscriptions, Billing, Team, Usage, Settings |
| 2.2 | Hub Dashboard — KPI Cards | แสดง KPI ของ Tenant (e.g. Token, ค่าใช้จ่าย, Sessions) — ข้อมูล scoped to Tenant |
| 2.3 | Hub Dashboard — SP Cards | แสดง Sub-Platform ที่ Tenant สมัคร พร้อมปุ่ม [เข้าใช้งาน] → เปิด External Link ใน Tab ใหม่ |
| 2.4 | Hub Dashboard — Invoice | แสดง Invoice ล่าสุดของ Tenant เท่านั้น (ไม่เห็น Tenant อื่น) |
| 2.5 | Hub Subscriptions | แสดง Token Balance + แพ็กเกจที่สมัคร + Activity Log |
| 2.6 | Hub Billing | แสดง Invoice ทั้งหมดของ Tenant + สรุปยอดชำระ/ค้าง |
| 2.7 | Hub Team | แสดงสมาชิกใน Tenant พร้อม Role |
| 2.8 | Hub Usage | แสดง Usage KPI + Log ของ Tenant |
| 2.9 | Hub Settings | แสดง Company Profile + Notification Preferences |
| 2.10 | Hub ไม่มี Context Switcher | ไม่มีปุ่มสลับ Context (เหมือนใน Admin BO) |
| 2.11 | Hub ไม่มี SP เมนูย่อยใน Sidebar | Sub-Platform แสดงเป็น Card ใน Dashboard + External Link เท่านั้น |

### AC-3: Tenant Switcher

| # | Criteria | Expected |
|---|----------|----------|
| 3.1 | User มี 1 Tenant | แสดงชื่อ Tenant ที่มุมซ้ายบน (static, กดไม่ได้, ไม่มี ▼) |
| 3.2 | User มีหลาย Tenant | แสดงชื่อ Tenant + ▼ + border (กดได้ → Dropdown) |
| 3.3 | กดปุ่มสลับ (ระหว่างใช้งาน) | → แสดง Dropdown รายชื่อ Tenant ที่มีสิทธิ์ |
| 3.4 | เลือก Tenant อื่นใน Dropdown | → เปลี่ยน Context + รีเฟรชข้อมูลทุกหน้าเป็นของ Tenant ใหม่ |
| 3.5 | Login ครั้งแรก (หลาย Tenant) | → แสดง Picker Overlay เต็มจอ (ไม่ใช่ Dropdown) |

### AC-4: Data Isolation

| # | Criteria | Expected |
|---|----------|----------|
| 4.1 | Hub ทุกหน้า | แสดงเฉพาะข้อมูลของ Tenant ที่เลือก — ไม่เห็นข้อมูล Tenant อื่น |
| 4.2 | สลับ Tenant | ข้อมูลทุกหน้าเปลี่ยนไปเป็นของ Tenant ใหม่ทันที |
| 4.3 | Admin BO (Owner) | เห็นข้อมูลทุก Tenant แบบ Platform-wide |
| 4.4 | ข้อมูลลับของ Platform | Tenant Admin ไม่เห็น Cost, Margin, Revenue, ข้อมูลลูกค้ารายอื่น |

### AC-5: Admin Backoffice (Owner)

| # | Criteria | Expected |
|---|----------|----------|
| 5.1 | Context Switcher | ยังทำงานปกติ — สลับได้ตาม Sub-Platform ที่มี |
| 5.2 | Data Scope | Owner เห็นข้อมูลทุก Tenant (Platform-wide) |
| 5.3 | Owner-Only Pages | เข้าถึงได้เฉพาะ Owner (Cost, Revenue, Tenant CRUD, etc.) |
| 5.4 | Zone Guard | Tenant Admin ที่เข้า Admin BO ถูก redirect ไป Hub |

### AC-6: Logout & Session

| # | Criteria | Expected |
|---|----------|----------|
| 6.1 | Logout จาก Hub | Clear session → Redirect กลับ Login Page |
| 6.2 | Logout จาก Admin BO | Clear session → แสดง Login Page |
| 6.3 | Session expired / invalid | Redirect กลับ Login Page |
| 6.4 | เปิด Browser ใหม่ (session ยังอยู่) | เข้า Zone ที่ถูกต้องตาม Role ที่เลือกไว้ |

---

## 8. Implementation Notes

### 8.1 Shared Components

ทั้ง 3 Zone ใช้ร่วมกัน:

| Component | หน้าที่ |
|-----------|--------|
| **Auth Module** | Login, Logout, Session persistence, Picker/Hub overlay, Zone detection + Redirect |
| **Design System** | CSS / Component library ใช้ร่วมกันทุก Zone ให้ look & feel เหมือนกัน |
| **Data Layer** | Data scoping ผ่าน Active Context (tenantId, subPlatformId) |

### 8.2 Zone Detection

Auth Module ต้องรู้ว่ากำลังทำงานอยู่ใน Zone ไหน เพื่อ:

1. **Redirect** ถ้าอยู่ผิด Zone
2. **Render** UI ที่เหมาะสม (Picker/Hub/Admin)
3. **Scope** ข้อมูลตาม Context ที่เลือก

### 8.3 Key Principles

- **Zone = App แยก** — แต่ละ Zone เป็น Application ที่แยกจากกัน (คนละ route, คนละ layout)
- **Auth = Shared** — ใช้ระบบ Authentication เดียวกัน ข้ามทุก Zone
- **Data = Scoped** — ข้อมูลถูก scope ตาม Tenant/SP ที่เลือก ไม่ใช่ filter ที่หน้า UI

---

## 9. Future Enhancements

| Feature | Priority | Description |
|---------|----------|-------------|
| SP App Subdomain | High | แยก SP App ออกเป็น External Subdomain จริง |
| Owner Impersonate | Medium | Owner เข้าดู Hub ในฐานะ Tenant ที่เลือก |
| Tenant Branding | Low | Tenant กำหนด Logo/สีธีมใน Hub ได้ |
| SSO Integration | Medium | Shared authentication ระหว่าง Hub กับ SP App |
| Tenant Self-Service | Medium | Tenant ขอเปลี่ยนแพ็กเกจ / ขอ Credit ผ่าน Hub |
| Hub Notifications | Low | แจ้งเตือน Invoice ใหม่, Token เหลือน้อย |
