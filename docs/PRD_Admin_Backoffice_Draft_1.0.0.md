# PRD — AvatarRealfact: Admin Backoffice

> **Version:** Draft 1.0.0 | **Status:** Draft / Ready for Development

| Item | Detail |
|------|--------|
| Document Scope | Admin Backoffice (Backend Management) |
| Related Document | PRD — User Web Application (แยกเอกสาร) |
| Audience | Backend Team, Admin/Ops Team |

---

## 1. Overview

เอกสารฉบับนี้ครอบคลุมฟังก์ชันทั้งหมดของ Admin Backoffice สำหรับจัดการระบบ AvatarRealfact ตั้งแต่ Onboarding ลูกค้า, จัดการ Device, สร้าง Avatar Preset ผ่าน Service Builder (avatar + voice + agent + KB), Assign Preset ให้ Tenant, กำหนด Token Package, อนุมัติการชำระเงิน และติดตามสถานะ

---

## 2. Admin Onboarding Flow: Customer Activation

ขั้นตอนทั้งหมดที่ Admin ต้องดำเนินการเพื่อเปิดใช้งานบัญชีลูกค้าใหม่ ตั้งแต่รับข้อมูลจนถึงเปิดใช้งานบัญชีสำเร็จ

| # | ขั้นตอน | รายละเอียด |
|---|---------|-----------|
| 1 | รับข้อมูลจากลูกค้า | ลูกค้าส่ง Email สำหรับสร้างบัญชี + Document สำหรับ Knowledge Base มาให้ทีมงาน |
| 2 | สร้าง Account | สร้างบัญชีลูกค้าจาก Email ที่ได้รับ → ระบบส่ง OTP / ลิงก์ยืนยัน → Account ได้รับ Demo Credit + System Default Preset อัตโนมัติ |
| 3 | Pre-pair Device | Admin ผูก S/N ของเครื่องทั้งหมดเข้ากับ Account ลูกค้า (1 Account : N S/N) |
| 4 | สร้าง Knowledge Base | Admin อัพโหลด Document จากลูกค้า → ระบบ Chunk + Embed อัตโนมัติ |
| 5 | สร้าง Avatar Preset | Admin สร้าง Preset ผ่าน **Service Builder** โดยประกอบ `avatar_id` + `voice_id` + `agent_id` (Inject Input) + `knowledge_base_id` |
| 6 | Assign Preset ให้ Tenant | Admin Assign Preset ที่สร้างแล้วให้ Tenant (ระดับบัญชี) → Tenant เลือก Load ไปยัง Device เอง |
| 7 | ตรวจสอบ & เปิดใช้งาน | Admin ทดสอบ Preset บน Device จริง → เปิดสถานะ Account เป็น Active |
| 8 | แจ้งลูกค้า | ระบบ / Admin แจ้งลูกค้าว่าบัญชีพร้อมใช้งาน พร้อม URL เข้าใช้งาน Web App (ซอฟต์แวร์ Pre-install ในเครื่องแล้ว) |

> **Prerequisite:** Admin ต้องได้รับทั้ง Email และ Document จากลูกค้าก่อนจึงจะเริ่มกระบวนการ Onboarding ได้

---

## 3. Module 1: Device Management

ระบบหลังบ้านสำหรับจัดการ Device รองรับ 1 Account : N Devices

- **S/N Registry:** เก็บ S/N, Model, Resolution, Spec ของแต่ละเครื่อง
- **Ownership Mapping:** Admin จับคู่ S/N ↔ Customer ID ผ่าน Backend / Import CSV (1 Customer : N S/N)
- **Device Heartbeat:** ตรวจสอบ Online/Offline Real-time
- **Device Session Log:** แสดงจำนวน Session ต่อตู้ต่อวัน + ระยะเวลารวม + Token รวมที่ถูกหัก
- **Avatar Assign Log:** บันทึกประวัติทุกครั้งที่มีการ Assign/สลับ Preset ไปยังตู้ — Log ID, วันที่/เวลา, Device, Preset ที่ Assign, Preset ก่อนหน้า, ผู้ทำรายการ (User / Admin) — Admin ดูย้อนหลังได้ทุก Tenant

---

## 4. Module 2: Avatar Preset Management (Service Builder)

Admin สร้าง Preset ผ่านหน้า **Service Builder** ใน Admin Backoffice โดยประกอบจาก 4 ส่วนหลัก เพื่อสร้าง AI Character ที่มีทั้งหน้าตา เสียง บุคลิกภาพ และฐานความรู้เฉพาะตัว แล้ว Assign ให้ Tenant (ระดับบัญชี) เพื่อให้ Tenant เลือก Load ไปยัง Device เอง

### 4.1 Preset Composition

| Component | ID | รายละเอียด |
|-----------|----|-----------|
| Avatar | `avatar_id` | ไฟล์ 3D Model / Animation ที่แสดงผลบน AvatarRealfact (หน้าตา) |
| Voice | `voice_id` | เสียงพูดของตัวละคร (TTS Voice Profile) |
| Agent | `agent_id` | บุคลิกภาพ + ความสามารถ — Admin Inject Input แปะใน System Prompt |
| Knowledge Base | `knowledge_base_id` | ชุดข้อมูล RAG ที่ลูกค้าอัพโหลด Document เอง |

### 4.2 Agent Configuration (`agent_id`)

Admin กำหนดบุคลิกภาพและความเชี่ยวชาญผ่าน Inject Input แล้วระบบนำไปแปะใน System Prompt อัตโนมัติเมื่อเริ่ม Session

- **Inject Input Field:** ช่องข้อความอิสระ เช่น `"คุณคือผู้เชี่ยวชาญด้านการเงิน พูดจาสุภาพเสมอ"`
- **System Prompt Assembly:** ระบบนำ Inject Input ไปแปะใน System Prompt Template อัตโนมัติ
- **ตัวอย่าง:** `"คุณคือ {inject_input} ตอบคำถามเป็นภาษาไทย สุภาพและเป็นมิตร"`

### 4.3 Knowledge Base Management (RAG)

Admin อัพโหลด Document จากลูกค้าเข้าระบบ เพื่อสร้าง Knowledge Base ให้ Avatar ใช้อ้างอิงในการตอบคำถามผ่าน RAG โดย Admin เป็นผู้จัดการทั้งหมด

- **Upload:** Admin อัพโหลด Document จากลูกค้า (เช่น PDF, DOCX, TXT, CSV) ผ่าน Admin Backend
- **Processing:** ระบบทำ Chunking + Embedding และเก็บเข้า Vector Store อัตโนมัติ
- **Mapping:** 1 Knowledge Base ผูกได้กับหลาย Preset (1:N) แต่ 1 Preset มีได้ 1 KB เท่านั้น (N:1)
- **Session Integration:** เมื่อเริ่ม Session (End User มา Interact ที่ตู้) ระบบดึง KB ที่ผูกกับ Preset นั้นมาใช้ในการ Retrieve ข้อมูลตอบคำถาม
- **Management:** ดู/แก้ไข/ลบ Document ใน KB ได้ ระบบ Re-index อัตโนมัติเมื่อมีการเปลี่ยนแปลง

### 4.4 Preset CRUD & API (Service Builder)

- **Service Builder:** หน้าเฉพาะใน Admin Backoffice สำหรับสร้าง/แก้ไข Preset โดยเลือก `avatar_id` + `voice_id` + `agent_id` + `knowledge_base_id` ประกอบกัน
- **Multi-size Asset:** เก็บไฟล์หลาย Resolution ต่อ 1 `avatar_id` (เช่น 4K, 1080p)
- **Device Compatibility Tag:** ระบุรุ่นเครื่องที่รองรับแต่ละ Preset
- **Assign Preset ให้ Tenant:** Admin Assign Preset ให้ Tenant (ระดับบัญชี) — Tenant เห็นเฉพาะ Preset ที่ถูก Assign ให้ + System Default Preset
- **Suggested Preset:** Admin กำหนด Suggested Preset ต่อ Tenant ได้ (แสดง `Suggested` Badge ใน Preset List ฝั่ง User)
- **Preset API:** RESTful endpoint ให้ User Web App ดึงรายการ Preset ที่ Assign ให้ Tenant + กรองตาม Device Model + ระบุ Suggested Preset อัตโนมัติ

---

## 5. Module 3: Token Package Management

Admin กำหนด Package ใน Backoffice โดย User เลือกซื้อผ่าน Web App — **ราคา Package เป็นแบบ Ex VAT**

| หัวข้อ | รายละเอียด |
|--------|-----------|
| Package CRUD | Admin สร้าง/แก้ไข/ปิดการใช้งาน Package ได้ผ่าน Backoffice |
| โครงสร้าง Package | ชื่อ Package + จำนวน Token + ราคา Ex VAT (THB) + สถานะ (Active / Inactive) |
| Bonus Token (Optional) | Admin กำหนด Bonus เพิ่มเติมต่อ Package ได้ (เช่น ซื้อ 500 แถม 50) |
| ราคา | กำหนดภายหลังโดย Business Team — PRD ระบุแค่โครงสร้าง |
| การคำนวณ VAT | ฝั่ง User: ราคา Ex VAT × 1.07 = ยอดชำระจริง (ปัดทศนิยม 2 ตำแหน่ง) |

---

## 6. Module 4: New Account Defaults

การตั้งค่าที่ Account ใหม่ทุกรายจะได้รับอัตโนมัติเมื่อสร้าง Account สำเร็จ เพื่อให้ลูกค้าทดลองใช้งานได้ทันที

### 6.1 Demo Credit

| หัวข้อ | รายละเอียด |
|--------|-----------|
| Trigger | เติมอัตโนมัติเมื่อ Account สร้างสำเร็จ (ครั้งเดียวต่อ Account) |
| จำนวน | Admin กำหนดจำนวน Demo Credit ใน Backoffice (Configurable) — จำนวนจริงกำหนดภายหลัง |
| การใช้งาน | ใช้เหมือน Token ปกติทุกประการ (หักตามเวลา, Pre-check เหมือนกัน) |
| แสดงผลใน Wallet | แสดงรวมใน Token Balance เดียวกัน ไม่แยกแสดง |
| หมดอายุ | ไม่หมดอายุ (ใช้ได้จนกว่าจะหมด) |

### 6.2 System Default Preset

| หัวข้อ | รายละเอียด |
|--------|-----------|
| Preset ตั้งต้น | ระบบมี System Default Preset 1 ตัว ใช้เหมือนกันทุก Account |
| ประกอบด้วย | `avatar_id` (ตัวละครกลาง) + `voice_id` + `agent_id` (personality ทั่วไป) + ไม่มี KB (ตอบจาก LLM ตรง) |
| การจัดการ | Admin ตั้งค่า System Default Preset ใน Backoffice (เปลี่ยนได้ มีผลกับ Account ใหม่ถัดไป) |
| แสดงผลฝั่ง User | แสดงใน Preset List พร้อม Badge "System Default" ให้ User ทดลองใช้งานได้ทันที |
| ความสัมพันธ์ | User ยังเห็น Preset เฉพาะที่ Admin สร้างให้ด้วย (ถ้ามี) + สลับไปใช้ตัวไหนก็ได้ |

---

## 7. Module 5: Payment Approval (โอนผ่านธนาคาร)

สำหรับช่องทางโอนเงินตรงผ่านบัญชีธนาคาร Admin ต้องตรวจสอบและอนุมัติยอดก่อน Token จะเข้า Wallet

- User ส่งสลิปหลักฐานผ่าน Web App
- Admin เห็นรายการรออนุมัติใน Backoffice พร้อมรูปสลิป
- Admin ตรวจสอบยอดเงิน (ต้องตรงกับ ราคา Ex VAT + VAT 7%) → Approve / Reject
- **Approve:** Token เข้า Wallet ของ User อัตโนมัติ + ออก e-Receipt (แสดง Ex VAT + VAT + Inc VAT)
- **Reject:** แจ้ง User พร้อมเหตุผล
- **หมายเหตุ:** PromptPay และ Credit Card เข้า Wallet อัตโนมัติผ่าน Payment Gateway ไม่ต้อง Admin อนุมัติ

---

## 8. Technical Specifications (Admin Side)

- **Preset API:** RESTful + Filter ตาม Tenant Assignment + Device Model Compatibility
- **Multi-size Assets:** หลาย Resolution ต่อ 1 `avatar_id` ส่งไฟล์ที่เหมาะสมอัตโนมัติ
- **RAG Pipeline:** Document upload → Chunking → Embedding → Vector Store → Retrieve ตอน Session
- **System Prompt Engine:** Template + `{inject_input}` + `{knowledge_base}` ประกอบอัตโนมัติตอน Session Start
- **Token Service:** Unsigned integer + Pre-check Balance (Token ≥ 20min × Rate) ก่อนเริ่มทุก Session + Atomic transaction ป้องกัน Race condition
- **Session Log Engine:** บันทึกทุก Session แยกต่อ Device — Session ID, Device ID, Preset ID, Start/End Time, Duration, Token consumed — รองรับหลาย Session ต่อตู้ต่อวัน
- **Pricing:** Package ราคา Ex VAT — VAT 7% คำนวณตอนชำระเงิน
- **Payment Gateway:** Omise / 2C2P รองรับ PromptPay + Credit Card + Webhook callback
- **Bank Transfer Approval:** Queue-based + Admin review UI + auto-credit on approve
- **e-Receipt Engine:** ออก Receipt อัตโนมัติทุกการชำระเงินที่สำเร็จ แสดง ราคา Ex VAT + VAT 7% + ยอดรวม Inc VAT
- **Event Logging:** เก็บ Log ทุก Session + Event สำหรับ BI V2
- **Avatar Assign Log Engine:** บันทึกทุกครั้งที่มีการ Assign/สลับ Preset — Log ID, Timestamp, Device ID, Preset ID (new), Preset ID (old), Actor (User/Admin)
- **PDPA Compliance:** เก็บข้อมูลส่วนบุคคลตามมาตรฐาน

---

## 9. Success Metrics (Admin Side)

| Metric | เป้าหมาย |
|--------|----------|
| Active Devices | เครื่องที่ Pre-pair และ Online |
| Devices/Account | Device เฉลี่ยต่อ Account |
| Sessions/Day/Device | จำนวน Session เฉลี่ยต่อวันต่อตู้ |
| Onboarding Time | ระยะเวลาเฉลี่ยตั้งแต่รับข้อมูลจนเปิดใช้งาน |
| KB Upload Success Rate | สัดส่วน Doc ที่อัพโหลดและ Index สำเร็จ |
| Payment Approval Time | ระยะเวลาเฉลี่ยที่ Admin อนุมัติสลิป |
| Token Revenue | ยอดเงินรวมจากการขาย Token Package (Ex VAT) |

---

## 10. Deferred to V2 (Roadmap)

- Device Settings (Brightness, Volume, Wi-Fi)
- Self-service Device Pairing (QR Code / S/N)
- Scheduling (ตั้งเวลาเปิด-ปิด/สลับ Avatar)
- Avatar Marketplace (ซื้อ-ขาย Avatar)
- Tiered Token Rate (คิด Rate ต่างกันตามประเภท)
- Subscription / Token Package รายเดือน
- System Knowledge Base (ชุดข้อมูล RAG ที่ระบบเตรียมไว้ให้)
- Location Tracking & Geographic Insights
- BI & Analytics Dashboard
- Hardware E-commerce ในระบบ
