# Product Requirements Document (PRD)
# Module M-BE-10: Dashboard (Analytics & Reports) - MVP

## Document Information
| Field | Value |
|-------|-------|
| Module | M-BE-10: Dashboard (Analytics & Reports) |
| Version | 1.0.0 |
| Status | Draft |
| Author | BA-Agent |
| Created Date | 2026-02-05 |
| Last Updated | 2026-02-05 |

### Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-05 | BA-Agent | Initial version - MVP scope: Revenue & Billing, API Usage, Active Customers/Services, Manual Refresh & CSV Export |

---

## 1. Executive Summary

### 1.1 Purpose
M-BE-10 Dashboard เป็นระบบ Analytics & Reports สำหรับ Internal Platform (Backoffice) ที่ให้ Platform Admin สามารถดู core business metrics ได้แก่ Revenue & Billing, API Usage Analytics, และ Active Customers & Services เพื่อ monitor ภาพรวมของ platform และนำข้อมูลไปประกอบการตัดสินใจทางธุรกิจ

### 1.2 Scope
- **In Scope (MVP)**:
  - Revenue & Billing Overview (MTD, YTD, billing status, recent invoices)
  - API Usage Analytics (API calls, tokens, top customers by usage)
  - Active Customers & Services (counts, status breakdown)
  - Manual refresh button (ไม่มี auto-refresh)
  - CSV export
  - Last updated timestamp

- **Out of Scope (Post-MVP)**:
  - Profitability & Cost Analysis (ซับซ้อน ต้อง integrate หลาย modules)
  - Cash Flow & Collection Rate (ต้องมี advanced billing logic)
  - Embedding Analytics (Nice to have)
  - Real-time auto-refresh (ใช้ manual refresh ก่อน)
  - Excel/PNG export (รองรับเฉพาะ CSV)
  - Custom date range filters (ใช้ preset periods ก่อน: today, this week, this month, MTD, YTD)
  - Dashboard customization/widget arrangement
  - Scheduled report delivery (email)
  - Drill-down to individual transaction detail

### 1.3 Target Users
| User Type | Description |
|-----------|-------------|
| Platform Admin | ผู้ดูแลระบบ Platform (Internal) - ดู analytics และ reports |

---

## 2. Problem Statement

### 2.1 Current State
- Platform Admin ไม่มีหน้า dashboard สำหรับดูภาพรวม business metrics
- ต้อง query ข้อมูลจากหลายแหล่ง (Billing, Customer, Service) เพื่อดูสถานะ platform
- ไม่มี visibility ของ revenue trends, usage patterns, และ customer status
- ไม่สามารถ export ข้อมูลเพื่อนำไปวิเคราะห์ต่อได้

### 2.2 Desired State
- Platform Admin มีหน้า dashboard ที่แสดง core business metrics ได้ทันที
- เห็น revenue overview (MTD, YTD), billing status, recent invoices
- เห็น API usage trends, token consumption, top customers by usage
- เห็น active customers/services count และ status breakdown
- สามารถ export ข้อมูลเป็น CSV เพื่อนำไปวิเคราะห์ต่อได้

### 2.3 Business Impact
- **Visibility:** Admin เห็นภาพรวม platform health ได้ทันที
- **Decision-Making:** ข้อมูล revenue, usage, customer ช่วยประกอบการตัดสินใจทางธุรกิจ
- **Monitoring:** ติดตาม billing status (Paid, Pending, Overdue) เพื่อ follow up
- **Reporting:** Export CSV เพื่อนำไปรายงานต่อ management หรือวิเคราะห์เพิ่มเติม

---

# ═══════════════════════════════════════════════════════════════
# PART A: ADMIN FEATURES (Internal Users)
# M-BE-10 เป็น Admin-only module (ไม่มี Customer View)
# ═══════════════════════════════════════════════════════════════

## 3. Admin Features Overview

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-A10.1 | Revenue & Billing Overview | Platform Admin | P0 | แสดง total revenue (MTD, YTD), revenue trend chart, billing status summary, recent invoices |
| F-A10.2 | API Usage Analytics | Platform Admin | P0 | แสดง total API calls (จาก M-BE-03 Service Analytics), API calls trend, tokens used (จาก M-BE-07 Transaction Records), top 10 customers by usage |
| F-A10.3 | Active Customers & Services | Platform Admin | P0 | แสดง active customers/services count, customer status breakdown, services by agent category |
| F-A10.4 | Dashboard Refresh & Export | Platform Admin | P1 | Manual refresh button, CSV export, last updated timestamp |

---

## 4. Admin User Stories

### 4.1 Revenue & Billing

#### US-A10.1: View Revenue & Billing Overview
**As a** Platform Admin
**I want** to view revenue and billing overview on the dashboard
**So that** I can monitor platform revenue and billing status at a glance

**Acceptance Criteria:**
- [ ] ฉันเห็น total revenue (MTD) แสดงเป็น KPI card พร้อมสกุลเงิน
- [ ] ฉันเห็น total revenue (YTD) แสดงเป็น KPI card พร้อมสกุลเงิน
- [ ] ฉันเห็น revenue trend chart (line chart, last 30 days)
- [ ] ฉันเห็น billing status summary แสดงจำนวน invoices แยกตาม status (Paid, Pending, Overdue)
- [ ] ฉันเห็น recent invoices list (latest 10) พร้อมข้อมูล: Customer name, Amount, Status, Date
- [ ] Revenue values แสดงเป็นตัวเลขที่อ่านง่าย (comma-separated, 2 decimal places)

**UI/UX Notes:**
- KPI cards ด้านบนสำหรับ MTD และ YTD revenue
- Line chart ใต้ KPI cards แสดง daily revenue trend (last 30 days)
- Billing status summary แสดงเป็น count badges (Paid=Green, Pending=Yellow, Overdue=Red)
- Recent invoices แสดงเป็น table (latest 10 รายการ เรียงตาม date DESC)

**Business Rules:**
- BR-A10.2: MTD = Month-to-Date (1st ของเดือนถึงวันนี้), YTD = Year-to-Date (Jan 1 ถึงวันนี้)
- BR-A10.3: Recent invoices แสดงล่าสุด 10 รายการ เรียงตาม date DESC
- BR-A10.6: Revenue trend chart ใช้ last 30 days เพื่อดู monthly revenue pattern ให้ Admin เห็น revenue trend ระยะยาว

---

### 4.2 API Usage

#### US-A10.2: View API Usage Analytics
**As a** Platform Admin
**I want** to view API usage analytics on the dashboard
**So that** I can monitor platform usage and identify top customers

**Acceptance Criteria:**
- [ ] ฉันเห็น total API calls (today, this week, this month) แสดงเป็น KPI cards
- [ ] ฉันเห็น API calls trend chart (line chart, last 7 days)
- [ ] ฉันเห็น total tokens used (input + output combined)
- [ ] ฉันเห็น top 10 customers by API usage แสดงเป็น bar chart
- [ ] API calls แสดงเป็นตัวเลข comma-separated

**UI/UX Notes:**
- KPI cards สำหรับ API calls (today, this week, this month)
- Line chart แสดง daily API calls trend (last 7 days)
- Bar chart แสดง top 10 customers ranked by total API calls DESC
- Token usage แสดงเป็น KPI card (total tokens used)

**Business Rules:**
- BR-A10.4: Top 10 customers เรียงตาม total API calls DESC
- BR-A10.7: API calls trend chart ใช้ last 7 days เพื่อดู recent usage pattern สำหรับ operational monitoring (ต่างจาก Revenue ที่ดู 30 days เพราะ API usage เปลี่ยนแปลงเร็วกว่า ดู recent pattern เพียงพอ)

---

### 4.3 Customers & Services

#### US-A10.3: View Active Customers & Services
**As a** Platform Admin
**I want** to view active customers and services overview
**So that** I can monitor platform adoption and service utilization

**Acceptance Criteria:**
- [ ] ฉันเห็น active customers count แสดงเป็น KPI card
- [ ] ฉันเห็น active services count แสดงเป็น KPI card
- [ ] ฉันเห็น customer status breakdown (Active, Suspended, Pending) แสดงเป็น pie chart
- [ ] ฉันเห็น services by agent category แสดงเป็น pie chart

**UI/UX Notes:**
- KPI cards สำหรับ active customers count และ active services count
- Pie chart สำหรับ customer status breakdown (Active=Green, Suspended=Red, Pending=Yellow)
- Pie chart สำหรับ services by agent category

---

### 4.4 Refresh & Export

#### US-A10.4: Refresh & Export Dashboard Data
**As a** Platform Admin
**I want** to manually refresh dashboard data and export data as CSV
**So that** I can see the latest data and share reports externally

**Acceptance Criteria:**
- [ ] ฉันเห็น "Refresh" button บน dashboard
- [ ] ฉันคลิก Refresh → dashboard reload ข้อมูลใหม่ทั้งหมด
- [ ] ฉันเห็น "Last updated: [timestamp]" แสดงเวลา refresh ล่าสุด
- [ ] ฉันเห็น "Export CSV" button
- [ ] ฉันคลิก Export CSV → browser download ไฟล์ CSV
- [ ] CSV file มีข้อมูลครบถ้วนตามที่แสดงบน dashboard
- [ ] ระหว่าง refresh แสดง loading indicator

**UI/UX Notes:**
- Refresh button อยู่มุมขวาบนของ dashboard
- "Last updated" timestamp ข้างๆ refresh button
- Export CSV button อยู่ข้างๆ refresh button
- Loading spinner/overlay ขณะ refresh

**Business Rules:**
- BR-A10.1: Dashboard data refresh เป็น manual (คลิก refresh button)
- BR-A10.5: Export เป็น CSV format เท่านั้น (ยังไม่รองรับ Excel/PNG)

---

## 5. Admin User Flows

### Flow 1: View Dashboard Overview

```
[Admin Login] --> [Dashboard Menu] --> [Dashboard Page]
                                            |
                   +------------------------+------------------------+
                   |                        |                        |
                   v                        v                        v
          [Revenue & Billing]      [API Usage Analytics]    [Customers & Services]
          - MTD/YTD KPI cards      - API calls KPI cards    - Active counts KPI cards
          - Revenue trend chart    - Calls trend chart      - Status pie chart
          - Billing status         - Top 10 customers       - Agent category pie chart
          - Recent invoices        - Tokens used
```

**Happy Path:**
1. Admin เข้าสู่ระบบและไปที่ Dashboard menu
2. System โหลดข้อมูลจาก M-BE-07 (Billing: revenue + tokens), M-BE-03 (Service Builder: API calls + services), M-BE-04 (Customer)
3. System แสดง dashboard พร้อมข้อมูลครบทุก section (Revenue, API Usage, Customers/Services)
4. Admin เห็น KPI cards, charts, tables แสดงข้อมูล business metrics
5. System แสดง "Last updated: [timestamp]"

**Alternative Paths:**
- At Step 2: ข้อมูลบาง section โหลดไม่ได้ → System แสดง sections ที่โหลดได้สำเร็จ ส่วนที่ล้มเหลวแสดง "Data unavailable" → Admin ยังใช้งาน dashboard ได้บางส่วน

**Exception Paths:**
- At Step 2: โหลดข้อมูลทั้งหมดล้มเหลว → See Error Scenario ES-A10.1
- At Step 2: Integration timeout → See Error Scenario ES-A10.3

---

### Flow 2: Refresh Dashboard Data

```
[Dashboard Page] --> [Click Refresh Button] --> [Loading Indicator]
                                                       |
                                                       v
                                              [Reload All Data]
                                                       |
                                    +------------------+------------------+
                                    |                                     |
                                    v                                     v
                          [Success: Update Data]              [Partial Failure]
                          [Update "Last updated"]             [Show "Data unavailable"
                                                               for failed sections]
```

**Happy Path:**
1. Admin คลิก "Refresh" button
2. System แสดง loading indicator
3. System โหลดข้อมูลใหม่จากทุก source (M-BE-07, M-BE-03, M-BE-04)
4. System อัพเดท dashboard ด้วยข้อมูลใหม่
5. System อัพเดท "Last updated" timestamp

**Alternative Paths:**
- At Step 3: บาง source โหลดไม่ได้ → System อัพเดทเฉพาะ sections ที่โหลดสำเร็จ พร้อมแสดง "Data unavailable" สำหรับ sections ที่ล้มเหลว

**Exception Paths:**
- At Step 3: ทุก source ล้มเหลว → See Error Scenario ES-A10.1

---

### Flow 3: Export Dashboard Data to CSV

```
[Dashboard Page] --> [Click Export CSV] --> [System Generate CSV]
                                                    |
                                    +---------------+---------------+
                                    |                               |
                                    v                               v
                          [Success: Download CSV]         [Failure: Error Message]
```

**Happy Path:**
1. Admin คลิก "Export CSV" button
2. System รวบรวมข้อมูลที่แสดงบน dashboard
3. System สร้าง CSV file
4. Browser download CSV file
5. Admin ได้ CSV file สำหรับวิเคราะห์ต่อ

**Alternative Paths:**
- At Step 2: ข้อมูลบาง section ไม่พร้อม → System export เฉพาะ sections ที่มีข้อมูล พร้อม note ใน CSV

**Exception Paths:**
- At Step 3: Export ล้มเหลว → See Error Scenario ES-A10.2
- At Step 2: Data เยอะเกินไป (>10,000 rows) → See Edge Case EC-A10.4

---

## 6. Admin Business Rules

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-A10.1 | Dashboard data refresh เป็น manual (คลิก refresh button) ไม่มี auto-refresh | F-A10.4 (Refresh & Export) |
| BR-A10.2 | MTD = Month-to-Date (1st ของเดือนถึงวันนี้), YTD = Year-to-Date (Jan 1 ถึงวันนี้) | F-A10.1 (Revenue & Billing) |
| BR-A10.3 | Recent invoices แสดงล่าสุด 10 รายการ เรียงตาม date DESC | F-A10.1 (Revenue & Billing) |
| BR-A10.4 | Top 10 customers by usage เรียงตาม total API calls DESC | F-A10.2 (API Usage) |
| BR-A10.5 | Export เป็น CSV format เท่านั้น (ยังไม่รองรับ Excel/PNG) | F-A10.4 (Refresh & Export) |
| BR-A10.6 | Revenue trend chart ใช้ last 30 days เพื่อดู monthly revenue pattern ให้เห็น trend ระยะยาว | F-A10.1 (Revenue & Billing) |
| BR-A10.7 | API calls trend chart ใช้ last 7 days เพื่อดู recent usage pattern สำหรับ operational monitoring (API usage เปลี่ยนแปลงเร็วกว่า revenue) | F-A10.2 (API Usage) |

### Edge Cases

> **Reference:** ใช้ checklist จาก `requirements_analysis.md` > "Edge Case Identification" ในการวิเคราะห์
> **Reference:** ดู `scenario_analysis.md` > "Edge Case Analysis Guide" สำหรับ framework

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-A10.1 | State | ยังไม่มี revenue data (platform ใหม่ ยังไม่มี transaction) | KPI cards แสดง "0" | แสดง "0" ใน KPI cards พร้อม empty state message "No revenue data yet" ใน chart area |
| EC-A10.2 | State | ยังไม่มี customers ในระบบ | Customer section ว่างเปล่า | แสดง "0" ใน KPI cards พร้อม empty state "No customers yet" ใน pie chart area |
| EC-A10.3 | Integration | Billing data unavailable (M-BE-07 ไม่ตอบ) | Revenue section ไม่แสดงข้อมูล | แสดง "Data unavailable" พร้อม last updated timestamp สำหรับ Revenue section ส่วน sections อื่นยังใช้ได้ |
| EC-A10.4 | Data Boundary | Export data เยอะเกินไป (>10,000 rows) | Export file ใหญ่มาก | Export แค่ top 10,000 records พร้อม warning message "Data truncated to 10,000 records. Please narrow date range for complete data." |
| EC-A10.5 | State | ยังไม่มี API usage data (platform ใหม่ ยังไม่มี API calls) | API Usage KPI cards แสดง "0" | แสดง "0" ใน KPI cards พร้อม empty state message "No API usage data yet" ใน chart area |

### Admin Error Scenarios

> **Reference:** ดู `scenario_analysis.md` > "Error Scenario Enhancement" สำหรับ Categories และ Severity definitions

| Scenario | Category | Severity | Admin Experience | Recovery |
|----------|----------|----------|------------------|----------|
| ES-A10.1: โหลด dashboard ล้มเหลว | System | High | แสดง error message "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่" พร้อม Refresh button | คลิก Refresh button |
| ES-A10.2: Export CSV ล้มเหลว | System | Medium | แสดง error toast "Export failed. Please try again." | คลิก Export อีกครั้ง |
| ES-A10.3: Integration timeout (M-BE-07, M-BE-03, หรือ M-BE-04 ตอบช้า) | Integration | Medium | แสดง "Loading..." indicator สำหรับ section ที่รอ แล้วแสดง "Data unavailable" หลัง timeout 30 วินาที | Manual refresh |

---

## 7. Success Metrics

> **Note:** Success Metrics เป็นแบบ qualitative/descriptive ไม่ใช่ quantifiable KPIs

### Success Indicators

- **Admin Visibility:** Admin สามารถเห็น core business metrics (revenue, usage, customers) ได้ทันทีจากหน้า dashboard เดียว โดยไม่ต้อง query ข้อมูลจากหลายที่
- **Decision Support:** Dashboard ให้ข้อมูลที่เพียงพอสำหรับ Admin ในการ identify trends และ monitor platform health
- **Data Accessibility:** Admin สามารถ export ข้อมูลเป็น CSV เพื่อนำไปวิเคราะห์ต่อหรือรายงานต่อ management ได้
- **Responsiveness:** Dashboard โหลดข้อมูลและแสดงผลภายในเวลาที่เหมาะสม (ไม่เกิน 5 วินาที)

### Success Criteria (Descriptive)

- [ ] Admin สามารถเห็น revenue overview (MTD, YTD) ได้ทันทีจาก dashboard
- [ ] Admin สามารถติดตาม billing status (Paid, Pending, Overdue) เพื่อ follow up ได้
- [ ] Admin สามารถ identify top customers by API usage เพื่อ prioritize support ได้
- [ ] Admin สามารถ monitor active customers/services count เพื่อ track platform adoption ได้
- [ ] Admin สามารถ export CSV เพื่อนำไป share กับ management ได้
- [ ] Dashboard ทำงานได้ปกติแม้ข้อมูลบาง section ไม่พร้อม (graceful degradation)

---

## 8. Data Retention & Privacy Requirements

> **Note:** Data modeling and database schema จะถูกออกแบบโดย Developer Team

### 8.1 Data Retention Requirements

| Data Type | Retention | Business Reason |
|-----------|-----------|-----------------|
| Dashboard cached/aggregated data | ไม่เก็บถาวร (transient, สร้างใหม่ทุกครั้งที่ refresh) | Dashboard ดึงข้อมูลจาก source modules แบบ real-time ไม่ต้องเก็บ snapshot |
| CSV export files | ไม่เก็บบน server (download ไปยัง client ทันที) | Export เป็นการ download ครั้งเดียว ไม่เก็บไว้บน server |
| Dashboard access logs | 90 days | Audit trail สำหรับ compliance |

### 8.2 Privacy & Compliance

- **Revenue Data:** ข้อมูล aggregated ไม่มี personal data โดยตรง แต่ต้องจำกัดการเข้าถึงเฉพาะ Platform Admin
- **Customer Data:** Dashboard แสดงเฉพาะ customer name และ usage metrics (ไม่แสดง personal data อื่น)
- **Audit Trail:** ทุกการเข้าถึง dashboard ต้อง log (sent to M-BE-09)
- **PDPA Compliance:** Export CSV ที่มี customer name ต้อง handle ตาม PDPA

---

## 9. Integration Points (High-Level)

> **Note:** API Contracts และ Technical Specifications จะถูกออกแบบโดย Developer Team

### 9.1 Internal Dependencies

| Module | Dependency Type | Description |
|--------|-----------------|-------------|
| M-BE-01 (Authentication) | Required | Authentication, user context, RBAC |
| M-BE-07 (Billing) | Required | Revenue data (MTD, YTD), billing status (Paid/Pending/Overdue), invoices list, tokens used (Transaction Records) |
| M-BE-03 (Service Builder) | Required | API calls count (Service Analytics), services count, services by agent category |
| M-BE-04 (Customer) | Required | Customer count, customer status breakdown (Active/Suspended/Pending) |
| M-BE-09 (Activity Log) | Optional | ส่ง dashboard access events สำหรับ audit trail |

### 9.2 External Integrations

ไม่มี external integrations สำหรับ MVP (Dashboard ใช้ข้อมูลจาก internal modules เท่านั้น)

---

## 10. Non-Functional Requirements (Business View)

### 10.1 Performance Expectations

| Scenario | User Expectation |
|----------|------------------|
| Dashboard initial load | แสดงข้อมูลครบภายในไม่เกิน 5 วินาที |
| Manual refresh | โหลดข้อมูลใหม่ภายในไม่เกิน 5 วินาที |
| CSV export | สร้างและ download CSV ภายในไม่เกิน 10 วินาที |
| Chart rendering | Charts แสดงผลทันทีหลังข้อมูลโหลดเสร็จ (ไม่เกิน 1 วินาที) |

### 10.2 Availability Expectations

| Requirement | Target |
|-------------|--------|
| Service availability | 99.9% uptime |
| Graceful degradation | ถ้า source module บาง module down, dashboard ยังแสดง sections อื่นได้ |
| Maintenance window | แจ้งล่วงหน้า 24 ชม. |

### 10.3 Security & Compliance

| Requirement | Description |
|-------------|-------------|
| Access Control | เฉพาะ Platform Admin เท่านั้นที่เข้าถึง Dashboard ได้ |
| Audit Trail | Log ทุกการเข้าถึง dashboard และ export action (sent to M-BE-09) |
| Data Privacy | Export CSV ที่มี customer name ต้อง handle ตาม PDPA |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Source module (M-BE-07/03/04) unavailable | Medium | High | Graceful degradation - แสดง "Data unavailable" เฉพาะ section ที่ล้มเหลว ส่วนอื่นยังใช้ได้ |
| Dashboard load time ช้าเกินไป | Medium | Medium | Manual refresh แทน auto-refresh เพื่อลด load, aggregated data caching (Developer Team จะ design) |
| Data inconsistency ระหว่าง sections | Low | Medium | แสดง "Last updated" timestamp เพื่อให้ Admin ทราบว่าข้อมูลอัพเดทเมื่อไร |
| CSV export file ใหญ่เกินไป | Low | Low | จำกัด export ที่ 10,000 records พร้อม warning message |

---

## 12. Open Questions

| # | Question | Owner | Status | Decision |
|---|----------|-------|--------|----------|
| 1 | Revenue data ควรแสดงเป็นสกุลเงินอะไร? (THB, USD, หรือ multi-currency) | BA | Open | Pending - ขึ้นกับ M-BE-05 Cost Engine currency configuration |
| 2 | Dashboard ควรมี role-based visibility หรือไม่? (บาง metrics เห็นได้เฉพาะบาง role) | BA | Open | Pending - MVP แสดงทุก metrics ให้ทุก Platform Admin |
| 3 | Chart libraries ที่ใช้ควรเป็นอะไร? | Dev | Open | Pending - Developer Team จะเลือก |

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **MTD** | Month-to-Date: ข้อมูลตั้งแต่วันที่ 1 ของเดือนจนถึงวันปัจจุบัน |
| **YTD** | Year-to-Date: ข้อมูลตั้งแต่วันที่ 1 มกราคมจนถึงวันปัจจุบัน |
| **KPI Card** | UI component ที่แสดงตัวเลข metric สำคัญ (เช่น Total Revenue, Active Customers) |
| **Revenue** | รายได้รวมจาก invoices ที่ออกให้ customers |
| **Billing Status** | สถานะของ invoice: Paid (ชำระแล้ว), Pending (รอชำระ), Overdue (เลยกำหนด) |
| **API Calls** | จำนวนครั้งที่ customers เรียกใช้ API ของ platform |
| **Tokens** | หน่วยวัดการใช้งาน AI model (input tokens + output tokens) |
| **Graceful Degradation** | ระบบยังทำงานได้บางส่วนแม้ components บางตัวล้มเหลว |
| **CSV** | Comma-Separated Values: รูปแบบไฟล์สำหรับ export ข้อมูลเป็น spreadsheet |

---

## Appendix: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-05 | BA-Agent | Initial version - MVP scope (Revenue & Billing, API Usage, Active Customers/Services, Manual Refresh & CSV Export) |

---

*Document maintained by: BA-Agent*
*Last updated: 5 February 2026*

---

## Appendix: Multi-Tenancy & Sub-Platform Alignment

> **Reference:** [X-MT-01 Multi-Tenancy Platform PRD](../X-MT-01-Multi-Tenancy/PRD-X-MT-01-Multi-Tenancy-Platform.md)
> **Impact Level:** Major

### MT-BE10.1 Overview

M-BE-10 Dashboard ต้องขยายจาก **single-platform view** เป็น **cross-Sub-Platform aggregated view** สำหรับ Central Admin (Platform Admin) ที่ต้องเห็นภาพรวมทั้ง platform รวมถึง total tenants, total revenue, token usage ของทุก Sub-Platform พร้อมความสามารถในการ drill-down ไปยังแต่ละ Sub-Platform ได้ Revenue analytics ต้องแสดง breakdown per Sub-Platform, per Plan tier และ trend comparison ระหว่าง Sub-Platforms

**Sub-Platforms ที่รองรับ:** Avatar, Booking, Social Listening, AI Live Commerce, MRP

### MT-BE10.2 Required Changes (Business Perspective)

- **Cross-Sub-Platform Aggregated View:** Dashboard ต้องแสดง aggregated metrics จากทุก Sub-Platform (total revenue, total tenants, total token usage) ใน view เดียว
- **Sub-Platform Selector/Filter:** เพิ่ม filter ให้ Admin เลือกดูข้อมูลแบบ All Sub-Platforms (aggregated) หรือเลือก Sub-Platform ใด Sub-Platform หนึ่ง
- **Revenue Breakdown per Sub-Platform:** Revenue section ต้องแสดง breakdown แยกตาม Sub-Platform (Avatar, Booking, Social Listening, AI Live Commerce, MRP)
- **Revenue Breakdown per Plan Tier:** แสดง revenue แยกตาม Subscription Plan tier ของแต่ละ Sub-Platform (เช่น Free, Starter, Professional, Enterprise)
- **Trend Comparison ระหว่าง Sub-Platforms:** Revenue trend chart ต้องรองรับ multi-line comparison ระหว่าง Sub-Platforms
- **Tenant Distribution Overview:** เพิ่ม widget แสดง tenant distribution across Sub-Platforms (จำนวน tenants ต่อ Sub-Platform)
- **Token Usage per Sub-Platform:** Token usage ต้องแสดง breakdown แยกตาม Sub-Platform (แต่ละ Sub-Platform มี exchange rate ต่างกัน)
- **Separate Invoice Tracking:** Billing status ต้องแสดงแยกตาม Sub-Platform (เพราะ invoice แยก per Sub-Platform)
- **CSV Export with Sub-Platform Dimension:** Export CSV ต้อง include Sub-Platform column เพื่อให้ Admin filter/group ใน spreadsheet ได้

### MT-BE10.3 New Business Rules

| ID | Business Rule | Reference |
|----|--------------|-----------|
| BR-MT-BE10.1 | Dashboard default view แสดง aggregated data จากทุก Sub-Platform (All Sub-Platforms) Admin สามารถ filter เลือก Sub-Platform ได้ | X-MT-01 SS14 |
| BR-MT-BE10.2 | Revenue MTD/YTD ต้องแสดงได้ทั้งแบบ aggregated (รวมทุก Sub-Platform) และแบบ per Sub-Platform | X-MT-01 SS14 |
| BR-MT-BE10.3 | Revenue breakdown per Plan tier ต้องแสดงตาม Subscription Plans ของแต่ละ Sub-Platform (แต่ละ Sub-Platform มี Plans ต่างกัน) | X-MT-01 SS15 |
| BR-MT-BE10.4 | Token usage ที่แสดงใน Dashboard ต้องเป็น Universal Token unit (ไม่ใช่ raw provider tokens) เนื่องจากแต่ละ Sub-Platform มี exchange rate ต่างกัน | X-MT-01 SS15 |
| BR-MT-BE10.5 | Billing status (Paid/Pending/Overdue) ต้องแสดงแยก per Sub-Platform เพราะแต่ละ Sub-Platform ออก invoice แยกกัน | X-MT-01 SS15 |
| BR-MT-BE10.6 | Tenant distribution widget ต้องแสดง active tenant count per Sub-Platform พร้อม percentage share | X-MT-01 SS14 |
| BR-MT-BE10.7 | Trend comparison chart ต้องรองรับ overlay หลาย Sub-Platforms ใน chart เดียวเพื่อเปรียบเทียบ revenue/usage trends | X-MT-01 SS14 |

### MT-BE10.4 Affected User Stories

- **US-A10.1 (View Revenue & Billing Overview):** ต้องขยายเป็น cross-Sub-Platform view พร้อม Sub-Platform filter, breakdown per Sub-Platform, breakdown per Plan tier
- **US-A10.2 (View API Usage Analytics):** Token usage ต้องแสดงแยก per Sub-Platform (Universal Token พร้อม exchange rate context), Top 10 customers ต้องแสดง Sub-Platform ที่ใช้งาน
- **US-A10.3 (View Active Customers & Services):** Customer count ต้องแสดงแยก per Sub-Platform (tenant distribution), services ต้อง group by Sub-Platform
- **US-A10.4 (Refresh & Export Dashboard Data):** CSV export ต้อง include Sub-Platform dimension ใน data columns

### MT-BE10.5 New User Stories (Multi-Tenancy Specific)

| ID | User Story | Acceptance Criteria |
|----|-----------|-------------------|
| US-MT-BE10.1 | As a Platform Admin, I want to view aggregated revenue across all Sub-Platforms so that I can see the total platform revenue at a glance | - ฉันเห็น total revenue (MTD/YTD) ของทุก Sub-Platforms รวมกัน - ฉันเห็น revenue breakdown bar/pie chart แยกตาม Sub-Platform - ฉันเห็น percentage contribution ของแต่ละ Sub-Platform |
| US-MT-BE10.2 | As a Platform Admin, I want to filter dashboard data by specific Sub-Platform so that I can drill-down into each Sub-Platform's performance | - ฉันเห็น Sub-Platform selector (dropdown/tabs) ด้านบน dashboard - เมื่อเลือก Sub-Platform ทุก section อัพเดทตาม - เมื่อเลือก "All" กลับไปแสดง aggregated view |
| US-MT-BE10.3 | As a Platform Admin, I want to compare revenue trends across Sub-Platforms so that I can identify growth patterns | - ฉันเห็น multi-line chart ที่แสดง revenue trend ของแต่ละ Sub-Platform - ฉันสามารถ toggle on/off แต่ละ Sub-Platform line ได้ - Chart ใช้สีที่แตกต่างกันชัดเจนสำหรับแต่ละ Sub-Platform |
| US-MT-BE10.4 | As a Platform Admin, I want to see tenant distribution across Sub-Platforms so that I can understand platform adoption | - ฉันเห็น tenant count per Sub-Platform (KPI cards หรือ chart) - ฉันเห็น percentage share ของแต่ละ Sub-Platform - ฉันเห็น tenants ที่ subscribe หลาย Sub-Platforms |
| US-MT-BE10.5 | As a Platform Admin, I want to view revenue breakdown by Plan tier per Sub-Platform so that I can analyze plan adoption | - ฉันเห็น revenue grouped by Plan tier (Free, Starter, Professional, Enterprise) - ฉันสามารถ filter by Sub-Platform เพื่อดู Plan tier distribution ของแต่ละ Sub-Platform |
| US-MT-BE10.6 | As a Platform Admin, I want to view token usage breakdown per Sub-Platform so that I can monitor consumption patterns | - ฉันเห็น total Universal Tokens used per Sub-Platform - ฉันเห็น token trend chart แยก per Sub-Platform - Token values แสดงเป็น Universal Token unit |

### MT-BE10.6 Edge Cases (Multi-Tenancy Specific)

| ID | Edge Case | Expected Behavior |
|----|----------|-------------------|
| EC-MT-BE10.1 | Sub-Platform ใหม่ที่ยังไม่มี tenant เลย | แสดง Sub-Platform ใน list พร้อม "0" tenants, "0" revenue, empty chart area พร้อม message "No data yet for [Sub-Platform Name]" |
| EC-MT-BE10.2 | Tenant subscribe หลาย Sub-Platforms พร้อมกัน | Revenue/usage นับแยกตาม Sub-Platform ที่เกิดขึ้นจริง (ไม่ double count), Tenant count นับ 1 ใน distribution แต่ระบุว่า "multi-platform tenant" |
| EC-MT-BE10.3 | Sub-Platform หนึ่ง down แต่ Sub-Platform อื่นยังทำงานปกติ | Dashboard แสดง data ของ Sub-Platforms ที่ยังทำงานได้ พร้อม "Data unavailable" สำหรับ Sub-Platform ที่ down (graceful degradation per Sub-Platform) |
| EC-MT-BE10.4 | Exchange rate ของ Sub-Platform เปลี่ยนระหว่างวัน | Token usage ใน dashboard ใช้ exchange rate ณ เวลาที่ transaction เกิดขึ้น (historical rate) ไม่ใช่ current rate |
| EC-MT-BE10.5 | CSV export ของ aggregated data มีจำนวน rows เยอะมาก (>10,000 rows across all Sub-Platforms) | Export truncate ที่ 10,000 rows per Sub-Platform (รวมทุก Sub-Platform อาจเกิน 10,000) พร้อม warning message |

### MT-BE10.7 Cross-References

| X-MT-01 Section | Relevance to Dashboard |
|-----------------|------------------------|
| SS5 (Sub-Platform Architecture) | Dashboard ต้องเข้าใจ Sub-Platform structure เพื่อแสดง data แยกตาม Sub-Platform |
| SS7 (Universal Token System) | Token usage ใน Dashboard ต้องแสดงเป็น Universal Token unit พร้อมเข้าใจ exchange rate per Sub-Platform |
| SS8 (Subscription & Billing) | Revenue breakdown ต้องรองรับ per-Sub-Platform billing model (Subscription Base + Token Top-up) |
| SS9 (Tenant Management) | Tenant distribution widget ต้องดึงข้อมูลจาก tenant management system |
| SS14 (Module Impact - M-BE-10) | รายละเอียด impact หลักที่ระบุ cross-Sub-Platform aggregated view, drill-down, revenue analytics |
| SS15 (New Capabilities) | Cross-Sub-Platform Admin Dashboard, aggregated metrics, revenue per Sub-Platform, tenant distribution |
