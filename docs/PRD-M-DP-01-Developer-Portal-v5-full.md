# PRD: Developer Portal (M-DP-01)

## Document Information

| Field | Value |
|-------|-------|
| Module | M-DP-01: Developer Portal |
| Version | 5.0.0 |
| Status | Draft |
| Author | BMad Master (Updated from Mockup) |
| Created Date | 2026-01-16 |
| Last Updated | 2026-03-30 |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-16 | BA-Agent | Initial baseline — Standalone Developer Portal with HMAC Signature, Scalar API Docs, Next.js tech stack |
| 2.0.0 | 2026-02-17 | BA-Agent | Added App Approval Flow — Sandbox/Production two-tier system, approval workflow, document upload |
| 3.0.0 | 2026-02-18 | Product Owner | Full rewrite — Simple API Key architecture, updated auth flow, API Gateway boundary clarified |
| 3.1.0 | 2026-02-19 | BA-Agent | Updated architecture for MVP Embedded Gateway model — Portal owns its own DB, data ownership principle |
| 4.0.0 | 2026-03-13 | BMad Master (Merged) | Definitive merge — v3 architecture (Simple API Key, Embedded Gateway, Data Ownership) + v2 detail (User Stories, Business Rules, Edge Cases, Error Scenarios, Email Templates, Admin Features) |
| **5.0.0** | **2026-03-30** | **BMad Master (Updated from Mockup)** | **Major update — Added Billing UI (Credit/Invoices), Usage Analytics, API Logs (Advanced), Team Management, Settings, Landing Page, Enhanced Dashboard, Collapsible Sidebar, Multi-channel Notifications based on UI Mockup** |

---

## 1. Vision & Problem Statement

### 1.1 ปัญหาหลัก

- External developers ไม่มีช่องทาง self-service ในการเข้าถึง API ของ platform
- การขอ API access ต้องผ่านกระบวนการ manual (email, ticket) ซึ่งช้าและไม่ scale
- Admin ไม่มีระบบ centralized ในการ approve/reject app requests และ track การใช้งาน
- ไม่มี single source of truth สำหรับ API documentation
- ไม่มี quality control — Apps go live without review
- ไม่มี compliance trail — No record of who is using the platform for what purpose
- ไม่มีระบบ billing/credit self-service สำหรับ developers
- ไม่มีเครื่องมือ analytics ให้ developers ติดตามการใช้งาน API
- ไม่มีระบบ team management สำหรับองค์กร
- ไม่มี API log viewer ที่ developer สามารถ debug ได้ด้วยตนเอง

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

### 1.5 Business Impact

| Impact Area | Current | Expected | Improvement |
|-------------|---------|----------|-------------|
| Developer Onboarding Time | N/A (manual) | Sandbox: immediate, Production: < 48 hours | Self-service with quality control |
| API Integration Support | Manual via email | Self-service docs | Reduced support burden |
| Quality Control | None (no approval) | Platform Admin review before production | Verified usage |
| Compliance | No audit trail | Full approval history with documents | Regulatory readiness |
| Abuse Prevention | No controls | Rate limiting + approval | Platform protection |
| API Billing | Manual invoicing | Self-service credit/payment | Reduced billing overhead |
| Usage Visibility | No visibility | Real-time analytics dashboard | Developer empowerment |
| Team Collaboration | Single user only | Multi-member teams with roles | Enterprise readiness |

### 1.6 Benchmarks

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
- สร้าง App → ได้รับ API Key (`rf-sk-xxxx`) ในโหมด Sandbox
- Submit for Production Approval → Admin review → ได้ Production access
- ใช้ API Key เป็น Bearer token เพื่อเรียกใช้ Open APIs ผ่าน API Gateway
- ดู API documentation, test endpoints
- **Skill level:** Intermediate to Expert (REST APIs, JSON)

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
| Developer | สมัครสมาชิก → Verify Email → สร้าง App → ได้ Sandbox API Key |
| Developer | Submit for Production → รอ Approve → ได้ Production API Key |
| Developer | อ่าน API docs → ทดลอง API → Integrate เข้า application |
| Developer | จัดการ Apps (regenerate API key, view status, delete) |
| Developer | ดู usage analytics, ตรวจสอบ API logs, debug errors |
| Developer | จัดการ credit balance, ดู invoices, ชำระเงิน |
| Developer | เชิญ team members, จัดการ roles |
| Developer | ตั้งค่า notifications (In-App, Email, LINE) |
| Admin | ดู pending requests → Review app details + documents → Approve/Reject |
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
| Time to First API Call (หลัง registration) | < 15 นาที (sandbox) |
| App approval turnaround time | < 48 ชั่วโมง |
| Developer registration conversion rate | > 60% |
| Developer satisfaction (CSAT) | > 4.0/5.0 |
| Support ticket reduction for API access | ลด 50% |
| Monthly active developers | เพิ่มขึ้น 20% MoM |
| First-time approval rate | Majority approved first time |
| API Authentication Success Rate | > 99% |
| Invoice payment on-time rate | > 90% |
| Team adoption rate (orgs with 2+ members) | > 30% |
| Average API log debug time | < 10 minutes |
| Credit utilization rate | > 60% |

---

## 4. Scope & Features

### 4.1 Scope Summary

| Aspect | Description |
|--------|-------------|
| **In Scope (MVP + Phase 2)** | User Registration/Login, Forgot Password, Email Verification, App Management, Simple API Key, Sandbox/Production Approval Flow, Document Upload, API Documentation (Scalar), Admin Portal, Audit Log, Billing UI (Credit/Invoice), Usage Analytics, API Logs (Advanced), Team Management, Settings, Landing Page, Enhanced Dashboard, Sidebar Navigation, Multi-channel Notifications |
| **Out of Scope** | Billing Engine (แยกเป็น service ต่างหาก), Separate API Gateway (แยกเป็น service ต่างหาก), SDK Generation, Multi-tenant white-label, GraphQL, OAuth 2.0, Webhooks |

### 4.2 Key Design Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Auth (External API) | **Simple API Key (Bearer token)** | Industry standard (OpenAI, Anthropic, Cohere) — Time to first API call < 5 นาที |
| Auth (Portal Login) | Email + Password → JWT Session | แยกชัดจาก API Key — portal management เท่านั้น |
| Auth (Internal, existing) | HMAC-SHA256 (unchanged) | Admin Portal, Customer app ใช้ระบบเดิม |
| API Docs | Scalar | Modern, interactive, developer-friendly |
| App Access | Two-tier (Sandbox/Production) | Balance developer experience with quality control |
| Approval | Manual Platform Admin review | Human oversight for production access (no auto-approve in v1) |
| Rate Limiting | Status-based (Sandbox vs Production) | Protect platform while allowing testing |
| Data Ownership | Portal owns platform data, Backend owns business data | Clean separation, future-proof for Gateway extraction |
| Gateway (MVP) | Embedded middleware in Backend API | Simple, validates via shared cache (Redis) |
| Billing boundary | Portal = billing UI (display/pay), Billing Engine = billing engine (generate/calculate) | Portal เป็น UI consumer — ไม่เก็บ billing data locally |
| Team roles | 3 fixed roles (SP Admin, Admin, Developer), no custom RBAC in v1 | Simple and clear role hierarchy สำหรับ Phase 2 |
| Notifications | Multi-channel (In-App, Email, LINE) with per-event preferences | ครอบคลุม channels ที่ developer ใช้จริง |
| Analytics | Read-only visualization from existing API request logs | ใช้ข้อมูลที่มีอยู่แล้ว ไม่ต้องสร้าง data pipeline ใหม่ |

---

# ===============================================================
# PART A: DEVELOPER VIEW (Customer)
# ===============================================================

## 5. Developer Features

### 5.1 Feature Overview (Developer)

| Feature ID | Feature Name | Priority | Description |
|------------|--------------|----------|-------------|
| F-D01.1 | User Registration | P0 | Register for Developer Portal with email verification |
| F-D01.2 | User Login | P0 | Login with Email/Password → JWT session |
| F-D01.3 | Forgot Password | P0 | Reset password via Email |
| F-D01.4 | Resend Verification Email | P1 | Resend email verification |
| F-D01.5 | User Profile | P1 | View and edit personal information, change password |
| F-D01.6 | Create App | P0 | Create Application → receive Sandbox API Key (`rf-sk-xxxx`) |
| F-D01.7 | View Apps | P0 | View all Applications with status badges |
| F-D01.8 | View App Details | P0 | View details, API Key (masked), and Approval Status |
| F-D01.9 | Regenerate API Key | P0 | Generate new API Key, old key invalidated immediately |
| F-D01.10 | Revoke/Delete App | P0 | Disable or permanently delete Application |
| F-D01.11 | View API Documentation | P0 | View Interactive API Docs (Scalar) — Public |
| F-D01.12 | Submit App for Production Approval | P0 | Submit company info and documents for production access |
| F-D01.13 | View Approval Status | P0 | Track approval status and history |
| F-D01.14 | Resubmit Rejected App | P0 | Revise and resubmit after rejection |
| F-D01.15 | Landing Page | P1 | Public marketing page with API capabilities, code examples, and CTA |
| F-D01.16 | Enhanced Dashboard | P0 | Dashboard with alerts, API status, credit balance, 7-day usage chart, action items |
| F-D01.17 | Collapsible Sidebar Navigation | P1 | Sidebar with icon-only collapse, lockable expand, sectioned navigation |
| F-D01.18 | Enhanced App Cards | P1 | App cards with 7-day metrics (requests, tokens, latency), billing indicator |
| F-D01.19 | Usage Analytics | P1 | Usage charts with period selection, breakdown by app, request/token/latency metrics |
| F-D01.20 | API Logs | P0 | API log viewer with advanced filtering, summary stats, error breakdown |
| F-D01.21 | API Log Detail | P1 | Detailed request/response view with trace ID, headers, timing |
| F-D01.22 | Credit Management | P0 | View credit balance gauge, request credit increase, track request history |
| F-D01.23 | Invoice List | P0 | Invoice list with filtering by status, period, app, type |
| F-D01.24 | Invoice Detail | P1 | Invoice detail modal with line items, payment info, download |
| F-D01.25 | Payment Flow | P0 | Pay invoices via Bank Transfer or QR Code |
| F-D01.26 | Team Management | P1 | Manage team members with roles (SP Admin, Admin, Developer), invite flow |
| F-D01.27 | Settings | P1 | Account profile, security, organization info, billing info, notification preferences |
| F-D01.28 | Multi-Channel Notification Preferences | P1 | Configure notifications per event type across In-App, Email, LINE channels |

---

### 5.2 User Stories (Developer)

#### US-D01.1: User Registration

**As a** Developer
**I want** to register for a Developer Portal account
**So that** I can create apps and access the Open API

**Acceptance Criteria:**
- [ ] I can access the Registration page
- [ ] I fill in:
  - [ ] Email (required, unique, valid format)
  - [ ] Password (required, min 8 chars, must have uppercase, lowercase, number)
  - [ ] Confirm Password (required, must match)
  - [ ] First Name + Last Name (required)
  - [ ] Company/Organization (optional)
- [ ] I must accept Terms of Service and PDPA consent
- [ ] After successful registration I receive a verification Email
- [ ] I must Verify Email before using the portal
- [ ] If Email is duplicate I see an error message

**UI/UX Notes:**
- Clean registration form with real-time validation
- Password strength indicator
- PDPA consent checkbox with link to policy
- Success page with email verification instruction

**Business Rules:**
- BR-D01.1: Email must be unique in the system
- BR-D01.2: Password must meet minimum security requirements (8+ chars, uppercase, lowercase, number)
- BR-D01.3: Email verification required before using the portal
- BR-D01.4: User system is completely separate from M-BE (Backoffice)
- BR-D01.5: Rate limit registration = 5 times/hour/IP

---

#### US-D01.2: User Login

**As a** Registered Developer
**I want** to login to Developer Portal
**So that** I can manage my apps and credentials

**Acceptance Criteria:**
- [ ] I can access the Login page
- [ ] I enter Email and Password
- [ ] After successful Login I am redirected to Dashboard
- [ ] If Email is not verified I see a warning and resend verification link
- [ ] If Email/Password is wrong I see a generic error (security)
- [ ] I can click "Forgot Password"
- [ ] Session timeout = 24 hours

**UI/UX Notes:**
- Simple login form
- "Remember me" checkbox
- Forgot password link

**Business Rules:**
- BR-D01.6: Lock account after 5 failed login attempts (30 minutes)
- BR-D01.7: Session timeout = 24 hours, token stored in HTTP-only cookie
- BR-D01.8: Record Login history
- BR-D01.9: Remember Me extends session to 7 days
- BR-D01.10: Rate limit login = 10 times/minute/IP

---

#### US-D01.3: Forgot Password

**As a** Developer who forgot their password
**I want** to reset my password via email
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] I can click "Forgot Password" from Login page
- [ ] I enter my registered Email
- [ ] System shows generic message (security — prevent email enumeration)
- [ ] Email has Reset Link that expires in 1 hour
- [ ] I click Link and enter new Password
- [ ] After Reset I am redirected to Login page
- [ ] Token is one-time use

**Business Rules:**
- BR-D01.11: Reset token expires in 1 hour
- BR-D01.12: Reset token can only be used once
- BR-D01.13: Rate limit forgot password = 3 times/hour/email
- BR-D01.14: Show generic message to prevent email enumeration

---

#### US-D01.4: Resend Verification Email

**As a** Developer who has not yet verified email
**I want** to resend the verification email
**So that** I can verify my email if the original was lost or expired

**Acceptance Criteria:**
- [ ] I can click "Resend verification email" from Login page or Registration Success page
- [ ] System sends new verification email
- [ ] Previous token invalidated
- [ ] Rate limit: 3 times per hour

**Business Rules:**
- BR-D01.15: Rate limit resend verification = 3 times/hour
- BR-D01.16: Previous token invalidated when new one is sent
- BR-D01.17: Verification token expires in 24 hours

---

#### US-D01.5: User Profile

**As a** Logged-in Developer
**I want** to view and edit my profile
**So that** I can keep my information up to date

**Acceptance Criteria:**
- [ ] I see my information:
  - [ ] Email (read-only)
  - [ ] First Name + Last Name
  - [ ] Company/Organization
  - [ ] Registration Date
  - [ ] Email Verification Status
- [ ] I can edit Name and Company
- [ ] I can change Password (must enter current Password)
- [ ] I can Delete Account (must confirm — all apps deleted)

**Business Rules:**
- BR-D01.18: Delete account = Delete all Apps owned by user
- BR-D01.19: Email cannot be changed

---

#### US-D01.6: Create App

**As a** Logged-in Developer
**I want** to create a new application
**So that** I can get an API Key to access the Open API

**Acceptance Criteria:**
- [ ] I can click "Create App" from Dashboard
- [ ] I fill in App information:
  - [ ] App Name (required, unique per user)
  - [ ] Description (optional, max 500 chars)
- [ ] After creation the system displays:
  - [ ] API Key (`rf-sk-sandbox-xxxx`) — **shown once only, must copy immediately**
- [ ] I see a Warning that API Key will not be shown again
- [ ] I must Acknowledge that I have copied the Key
- [ ] App Status = **Sandbox** after creation
- [ ] I see a "Sandbox" badge on the new app
- [ ] I see information about sandbox limitations
- [ ] I see a prompt to "Submit for Production" when ready

**UI/UX Notes:**
- Simple create form
- API Key modal with copy button
- Warning banner: "This key will only be shown once"
- Checkbox to acknowledge before closing
- Sandbox badge and limitation info displayed prominently

**Business Rules:**
- BR-D01.20: App Name must be unique within User
- BR-D01.21: API Key format: `rf-sk-sandbox-<random>` (sandbox) / `rf-sk-prod-<random>` (production)
- BR-D01.22: API Key stored as SHA-256 hash (not plaintext)
- BR-D01.23: API Key shown only once at creation
- BR-D01.24: Limit 10 Apps per User
- BR-D01.25: Rate limit app creation = 10 times/hour/user
- BR-D01.26: Apps start in sandbox status by default

---

#### US-D01.7: View Apps

**As a** Logged-in Developer
**I want** to view all my applications
**So that** I can manage them

**Acceptance Criteria:**
- [ ] I see Dashboard showing all my Apps
- [ ] Each App shows:
  - [ ] App Name
  - [ ] API Key (masked, e.g., `rf-sk-prod-...8f6a`)
  - [ ] Status Badge (Sandbox / Pending Approval / Approved / Rejected / Revoked)
  - [ ] Created Date
- [ ] I can Click to view Details
- [ ] I see Quick Stats: Total Apps, Active Apps
- [ ] Status badges are color-coded:
  - [ ] **Sandbox:** Yellow
  - [ ] **Pending Approval:** Orange (with pulse animation)
  - [ ] **Approved (Active):** Green
  - [ ] **Rejected:** Red
  - [ ] **Revoked:** Dark gray

**Business Rules:**
- BR-D01.27: Show only Apps owned by the logged-in user

---

#### US-D01.8: View App Details

**As a** Logged-in Developer
**I want** to view details of my application
**So that** I can see API Key info, manage the app, and track approval status

**Acceptance Criteria:**
- [ ] I see all App information:
  - [ ] App Name (editable)
  - [ ] Description (editable)
  - [ ] API Key (masked prefix only, e.g., `rf-sk-prod-...8f6a`)
  - [ ] Status (Sandbox / Pending Approval / Approved / Rejected / Revoked)
  - [ ] Created Date
  - [ ] Current rate limit information
- [ ] I see Action buttons:
  - [ ] Regenerate API Key
  - [ ] Revoke App
  - [ ] Delete App
  - [ ] "Submit for Production" (visible only for sandbox apps)
  - [ ] "Revise and Resubmit" (visible only for rejected apps)
- [ ] I see Approval Status Section:
  - [ ] For sandbox: "Submit for Production" call-to-action
  - [ ] For pending_approval: Days since submission, estimated review time
  - [ ] For rejected: Rejection reason in alert box, "Revise and Resubmit" button
  - [ ] For approved: Production enabled badge, rate limit info
- [ ] I see Approval Timeline showing status history

**Business Rules:**
- BR-D01.28: API Key not shown after creation (only masked prefix)
- BR-D01.29: Record Audit Log for every access

---

#### US-D01.9: Regenerate API Key

**As a** Logged-in Developer
**I want** to regenerate my app's API Key
**So that** I can rotate credentials for security

**Acceptance Criteria:**
- [ ] I can click "Regenerate API Key"
- [ ] System shows Confirmation Dialog with warnings
- [ ] After Confirm: New API Key generated, old key invalidated immediately
- [ ] New API Key shown once (must copy)
- [ ] Shared cache (Redis) invalidated immediately — takes effect for all requests
- [ ] Audit Log recorded

**Business Rules:**
- BR-D01.30: Old API Key invalidated immediately (no grace period)
- BR-D01.31: Shared cache entry invalidated immediately on regenerate
- BR-D01.32: Record Audit Log with timestamp and IP

---

#### US-D01.10: Revoke/Delete App

**As a** Logged-in Developer
**I want** to revoke or delete my application
**So that** I can disable unused apps

**Acceptance Criteria:**

**Revoke:**
- [ ] I can Revoke App
- [ ] Revoked App cannot authenticate (cache invalidated immediately)
- [ ] I can Re-activate App (must regenerate API Key)
- [ ] Audit Log recorded

**Delete:**
- [ ] I can Delete App
- [ ] System shows Confirmation requiring me to type App Name
- [ ] Delete = Hard Delete (cannot recover)
- [ ] If app has pending approval, approval request is cancelled
- [ ] Audit Log recorded

**Business Rules:**
- BR-D01.33: Revoke = Soft disable (recoverable)
- BR-D01.34: Delete = Hard delete (permanent)
- BR-D01.35: Re-activate requires regenerating API Key
- BR-D01.36: Cache invalidated immediately on revoke

---

#### US-D01.11: View API Documentation

**As a** Developer (logged-in or not)
**I want** to view interactive API documentation
**So that** I can understand how to use the Open API

**Acceptance Criteria:**
- [ ] I can access API Documentation (Public — no login required)
- [ ] I see Interactive API Docs powered by **Scalar**
- [ ] I see Authentication Guide (Simple API Key — Bearer token)
- [ ] I see available Endpoints grouped by category
- [ ] I see Code examples in multiple languages
- [ ] I can "Try it out" (must enter API Key)
- [ ] Documentation auto-generated from OpenAPI 3.0+ spec
- [ ] Dark mode, sidebar navigation, search (`⌘K`)

**Tech:** `@scalar/nextjs-api-reference` บน Next.js (route: `/docs/api`)

**Business Rules:**
- BR-D01.37: Documentation is Public (no login required)
- BR-D01.38: "Try it out" requires valid API Key

---

#### US-D01.12: Submit App for Production Approval

**As a** Logged-in Developer with a Sandbox app
**I want** to submit my app for production approval
**So that** I can get production access and higher rate limits

**Acceptance Criteria:**
- [ ] I see "Submit for Production" button on sandbox apps only
- [ ] Clicking opens a multi-step submission form:
  - **Step 1: Company Information**
    - [ ] Company/Organization Name (required, max 255 chars)
    - [ ] Business Registration Number (optional, max 100 chars)
    - [ ] Business Address (required, min 10 chars)
    - [ ] Use Case Description (required, min 50 chars, max 1,000 chars)
  - **Step 2: Upload Documents**
    - [ ] Drag-and-drop file upload area
    - [ ] Accepted file types: PDF, JPEG, PNG only
    - [ ] Maximum file size: 10 MB per file
    - [ ] Must upload at least 1 file, maximum 5 files
    - [ ] File preview list with remove button
  - **Step 3: Review and Submit**
    - [ ] Summary of all entered data
    - [ ] Document list with file sizes
    - [ ] Confirmation checkbox: "I confirm all information is accurate"
    - [ ] Submit button
- [ ] After successful submission:
  - [ ] App status changes to "Pending Approval"
  - [ ] I see confirmation message with estimated review time (48 hours)
  - [ ] I receive a "Submission Received" email
  - [ ] App continues to work in sandbox mode while pending
- [ ] I can navigate back/forward between steps without losing data
- [ ] Validation errors shown inline at the field level

**Business Rules:**
- BR-D01.39: Production approval requires Platform Admin action (no auto-approve)
- BR-D01.40: Use case description min 50 chars, max 1,000 chars
- BR-D01.41: Business address min 10 chars
- BR-D01.42: Documents: 1-5 files, max 10 MB each, PDF/JPG/PNG only
- BR-D01.43: Pending apps remain in sandbox mode
- BR-D01.44: All status changes trigger email notification to developer

---

#### US-D01.13: View Approval Status

**As a** Logged-in Developer
**I want** to view the approval status of my app
**So that** I can track the progress of my production approval request

**Acceptance Criteria:**
- [ ] I see the current approval status on the App Detail page
- [ ] Status displays include:
  - [ ] **Sandbox**: Yellow badge, "Submit for Production" call-to-action
  - [ ] **Pending Approval**: Orange badge, days since submission, estimated review time
  - [ ] **Approved**: Green badge, "Production Access Enabled", rate limit info
  - [ ] **Rejected**: Red badge, rejection reason, "Revise and Resubmit" button
  - [ ] **Revoked**: Dark gray badge, contact information
- [ ] I see an Approval Timeline showing:
  - [ ] When the app was created (sandbox)
  - [ ] When it was submitted for approval
  - [ ] When it was approved or rejected (with reviewer decision)
  - [ ] When it was resubmitted (if applicable)
- [ ] For rejected apps, the rejection reason is displayed prominently in a red alert box

---

#### US-D01.14: Resubmit Rejected App

**As a** Logged-in Developer with a rejected app
**I want** to revise my submission and resubmit
**So that** I can address the reviewer's feedback and get production approval

**Acceptance Criteria:**
- [ ] I see "Revise and Resubmit" button on rejected apps only
- [ ] Clicking opens the same multi-step form as US-D01.12
- [ ] The form is pre-filled with my previous submission data
- [ ] I can modify any field (company info, documents)
- [ ] I can upload new documents or keep existing ones
- [ ] The rejection reason is displayed at the top of the form as reference
- [ ] After successful resubmission:
  - [ ] App status changes back to "Pending Approval"
  - [ ] Submission number is incremented (Submission #2, #3, etc.)
  - [ ] I receive a "Resubmission Received" email
  - [ ] App continues in sandbox mode while pending
- [ ] There is no limit on the number of resubmissions

**Business Rules:**
- BR-D01.45: Rejected developers can resubmit unlimited times
- BR-D01.46: Each resubmission increments submission number

---

#### US-D01.15: Landing Page

**As a** Visitor (not logged in)
**I want** to see what the Developer Portal offers
**So that** I can decide whether to sign up and use the API

**Acceptance Criteria:**
- [ ] I can access the Landing Page without login (public page)
- [ ] I see a hero section with tagline about API capabilities ("Build with AI. Ship Faster.")
- [ ] I see an API status indicator showing all systems operational
- [ ] I see a quick start code example with language tabs (cURL, Python, JavaScript, Java)
- [ ] I see CTA buttons: "Get Started" (→ Registration page), "View API Docs" (→ Documentation)
- [ ] I see feature highlights section showcasing key API services
- [ ] I see footer with links to Docs, Terms, Privacy
- [ ] Page is responsive and works on mobile devices

**UI/UX Notes:**
- Hero section with gradient text effect for emphasis
- Terminal-style code block showing example API call and response
- Language tabs for code examples (cURL default)
- Clean, modern layout matching the overall design system
- Sticky header with Sign In and Get Started buttons

**Business Rules:**
- BR-D01.48: Landing page is public (no login required)
- BR-D01.49: Code examples auto-updated from OpenAPI spec

---

#### US-D01.16: Enhanced Dashboard

**As a** Logged-in Developer
**I want** to see a comprehensive dashboard with alerts and key metrics
**So that** I can quickly understand the status of my apps, billing, and API usage

**Acceptance Criteria:**
- [ ] I see alert banners at the top (dismissible):
  - [ ] Red banner: overdue invoices (e.g., "คุณมี 1 ใบแจ้งหนี้ค้างชำระ")
  - [ ] Yellow banner: rejected apps requiring action
  - [ ] Blue banner: pending actions (e.g., pending credit requests)
- [ ] I see API Service Status section showing uptime for each service:
  - [ ] NLP API, Speech API, Search API, Agent API, Auth Service
  - [ ] Each with status indicator (green dot = Operational, yellow = Degraded, red = Down)
  - [ ] Uptime percentage displayed (e.g., 99.99%)
- [ ] I see Summary cards row:
  - [ ] Credit Balance (with amount, e.g., ฿32,450)
  - [ ] Total Apps count
  - [ ] Active API Keys count
  - [ ] API Calls (last 7 days)
  - [ ] Items Needing Action count
  - [ ] Each card has left-border accent color
- [ ] I see 7-day usage chart (line chart, requests per day)
- [ ] I see Recent apps section showing latest 5 apps with status badges
- [ ] I see Quick actions: Create App, View Docs, View Logs

**UI/UX Notes:**
- Alert banners with close button (X) for dismissal
- Summary cards with colored left border (brand color for credit, green for apps, etc.)
- Line chart using Chart.js for 7-day usage visualization
- Card-based layout with consistent spacing and border radius

**Business Rules:**
- BR-D01.50: Dashboard data cached max 5 minutes
- BR-D01.51: Alert banners dismissible per session (reappear on next login)
- BR-D01.52: API status data from health check endpoint, cached 1 minute

---

#### US-D01.17: Collapsible Sidebar Navigation

**As a** Logged-in Developer
**I want** to navigate the portal using a collapsible sidebar
**So that** I can quickly access all sections while maximizing content area

**Acceptance Criteria:**
- [ ] Sidebar default state: collapsed (icon-only mode, 60px width)
- [ ] On hover: sidebar temporarily expands showing labels (256px width)
- [ ] Lock button: toggle between collapsed and permanently expanded
- [ ] Navigation sections with section labels:
  - [ ] **Overview:** Dashboard
  - [ ] **Develop:** Apps, API Docs, API Logs
  - [ ] **Analytics:** Usage
  - [ ] **Billing:** Invoices (บิลและการชำระ), Credit (วงเงินเครดิต)
  - [ ] **Account:** Team (จัดการทีม), Settings (ตั้งค่า)
- [ ] Badge counts on items (e.g., pending apps count on Apps, overdue invoices on Billing)
- [ ] Bottom section: Lock/Unlock toggle, Logout button
- [ ] Active state indicator (left border accent color + background highlight) on current page
- [ ] Labels fade in/out smoothly on expand/collapse

**UI/UX Notes:**
- Uses CSS transition for smooth width animation (cubic-bezier)
- Lock icon toggles between locked/unlocked states
- Section labels in uppercase with letter-spacing
- User avatar and name visible when expanded
- Responsive: on mobile (< 768px), sidebar hidden by default

**Business Rules:**
- BR-D01.53: Sidebar state (locked/collapsed) persisted in localStorage
- BR-D01.54: Badge counts updated real-time via polling (30 seconds)

---

#### US-D01.18: Enhanced App Cards

**As a** Logged-in Developer
**I want** to see my apps as cards with key metrics
**So that** I can quickly assess each app's health and activity

**Acceptance Criteria:**
- [ ] Apps displayed in card grid layout
- [ ] Each card shows:
  - [ ] App icon, name, description
  - [ ] API Key (masked) with copy button
  - [ ] Status badge (Production, Sandbox, Pending, Rejected, Revoked)
  - [ ] Metrics section: Requests 7d, Tokens 7d, Avg Latency
  - [ ] Last updated timestamp
- [ ] Overdue billing indicator (red banner on card) when app has unpaid invoices
- [ ] Click-through to app detail page
- [ ] Filter bar: All, Production, Sandbox, Pending, Rejected, Revoked
- [ ] Search by app name
- [ ] "+ Create App" button prominently displayed

**UI/UX Notes:**
- Card with rounded corners (14px), subtle border, hover shadow
- Status badges color-coded matching the design system
- Metrics displayed in a row with icons (requests, tokens, latency)
- Overdue billing indicator as red top banner on the card
- Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop

**Business Rules:**
- BR-D01.55: Metrics aggregated from API request logs (cached 15 minutes)
- BR-D01.56: Overdue billing indicator shown when app has unpaid invoices > 30 days

---

#### US-D01.19: Usage Analytics

**As a** Logged-in Developer
**I want** to view usage analytics for my API consumption
**So that** I can understand my usage patterns and optimize my integration

**Acceptance Criteria:**
- [ ] I see a period selector: Last 7 days, 30 days, 90 days, Custom range
- [ ] I see a main chart: API requests over time (line chart)
- [ ] I see summary stats cards:
  - [ ] Total Requests
  - [ ] Success Rate (percentage)
  - [ ] Avg Latency (ms)
  - [ ] Total Tokens consumed
- [ ] I see breakdown by app (pie chart or table)
- [ ] I see breakdown by endpoint (table with request count, avg latency)

**UI/UX Notes:**
- Tab bar for period selection with pill-style active state
- Chart.js line chart with filled area under the line
- Summary stat cards with accent-colored left border
- Responsive chart that adjusts to container width

**Business Rules:**
- BR-D01.57: Analytics data aggregated from API request logs
- BR-D01.58: Data available for last 90 days (matches log retention)
- BR-D01.59: Custom date range max 90 days

---

#### US-D01.20: API Logs

**As a** Logged-in Developer
**I want** to view and search my API request logs
**So that** I can debug issues and monitor my API integration

**Acceptance Criteria:**
- [ ] I see a filter bar: Date range, API category, Endpoint, Status code, App selector
- [ ] I see summary stats row:
  - [ ] Total Requests
  - [ ] Success Rate
  - [ ] Avg Latency
  - [ ] Error Count
- [ ] I see log table with columns: Timestamp, Method, Endpoint, Status Code, Latency, App Name
- [ ] I can click a row to expand detail (or navigate to detail page)
- [ ] I see error breakdown section: count by status code (429, 500, 400, 401, 403, 503) with examples
- [ ] I see Export CSV button
- [ ] Pagination (50 per page)

**UI/UX Notes:**
- Filter bar with dropdowns and date picker
- Table with alternating row hover effect
- Status code badges color-coded (2xx green, 4xx yellow, 5xx red)
- Summary stats as compact cards above the table
- Error breakdown as a collapsible section or side panel

**Business Rules:**
- BR-D01.60: Logs available for last 90 days
- BR-D01.61: Show only logs for apps owned by current user
- BR-D01.62: Export limited to 10,000 rows per export
- BR-D01.63: Rate limit export = 5 times/hour/user

---

#### US-D01.21: API Log Detail

**As a** Logged-in Developer
**I want** to view the full details of an API request
**So that** I can debug specific issues with request/response data

**Acceptance Criteria:**
- [ ] I see request info: Method, URL, Timestamp, Duration, Status Code
- [ ] I see Trace ID for support reference with copy button
- [ ] I see Request headers (sanitized — no API key shown)
- [ ] I see Request body (if applicable)
- [ ] I see Response headers
- [ ] I see Response body (truncated if > 10KB, with "Show full" option)
- [ ] I see Timing breakdown (if available): DNS, Connect, TLS, TTFB, Transfer
- [ ] Copy trace ID button for easy reference when contacting support

**UI/UX Notes:**
- Organized in collapsible sections (Request, Response, Timing)
- Code blocks with syntax highlighting for JSON bodies
- Trace ID prominently displayed with clipboard copy
- "Back to Logs" navigation link

**Business Rules:**
- BR-D01.64: API Key masked in log details (show prefix only)
- BR-D01.65: Response body truncated at 10KB with "Show full" option

---

#### US-D01.22: Credit Management

**As a** Logged-in Developer
**I want** to view my credit balance and request credit increases
**So that** I can manage my API spending and ensure uninterrupted service

**Acceptance Criteria:**
- [ ] I see a credit gauge chart showing:
  - [ ] Max credit limit
  - [ ] Current usage amount
  - [ ] Available balance
- [ ] I see credit summary cards:
  - [ ] Credit Limit (e.g., ฿50,000)
  - [ ] Used amount
  - [ ] Available balance
- [ ] I see "Request Credit Increase" button → opens modal form:
  - [ ] Requested amount (number input)
  - [ ] Reason/justification (required, min 20 chars)
  - [ ] Submit button → status changes to Pending
- [ ] I see credit request history table:
  - [ ] Columns: Date, Requested Amount, Status (Pending/Approved/Rejected), Approved Amount, Approved Date
  - [ ] Status badges color-coded

**UI/UX Notes:**
- Gauge chart (doughnut/arc) showing credit utilization percentage
- Summary cards with left-border accent colors
- Modal form with character counter for reason field
- History table with pagination

**Business Rules:**
- BR-D01.66: Credit data owned by Billing Engine billing engine, Portal reads via API
- BR-D01.67: Credit increase request requires reason (min 20 chars)
- BR-D01.68: Rate limit credit requests = 3 times/day/organization

---

#### US-D01.23: Invoice List

**As a** Logged-in Developer
**I want** to view all my invoices
**So that** I can track my billing and payment status

**Acceptance Criteria:**
- [ ] I see filter bar: Status (All/Pending/Paid/Overdue), Period, App, Type
- [ ] I see invoice table with columns:
  - [ ] Invoice #
  - [ ] Date
  - [ ] Due Date
  - [ ] Amount
  - [ ] Status
  - [ ] App
  - [ ] Actions
- [ ] Status badges: Pending (yellow), Paid (green), Overdue (red)
- [ ] Actions per row: View Detail, Download PDF, Pay (for pending/overdue)
- [ ] I see summary cards:
  - [ ] Total Outstanding amount
  - [ ] Overdue Amount
  - [ ] Last Payment date and amount

**UI/UX Notes:**
- Table wrapped in card with rounded corners
- Filter bar with pill-style status filters
- Summary cards at top with accent-colored left borders
- Action buttons as icon buttons or dropdown menu
- Responsive table with horizontal scroll on mobile

**Business Rules:**
- BR-D01.69: Invoice data owned by Billing Engine, Portal reads via API
- BR-D01.70: Invoices sorted by due date (nearest first)
- BR-D01.71: Overdue = unpaid past due date

---

#### US-D01.24: Invoice Detail

**As a** Logged-in Developer
**I want** to view the full details of an invoice
**So that** I can review charges and make payments

**Acceptance Criteria:**
- [ ] Modal overlay showing invoice detail:
  - [ ] Invoice header: Invoice #, Date, Due Date, Status badge
  - [ ] Billing info: Organization name, address, tax ID
  - [ ] Line items table: Description, Quantity, Unit Price, Amount
  - [ ] Summary: Subtotal, Tax (VAT 7%), Total
  - [ ] Payment info (if paid): Payment method, Transaction ID, Payment date
  - [ ] Download PDF button
  - [ ] Pay Now button (if pending/overdue)
- [ ] Invoice rendered in professional format (branded header, structured layout)

**UI/UX Notes:**
- Modal with branded invoice design (RealFact header, accent border)
- Professional invoice layout with From/To billing parties
- Line items table with clear typography
- Summary section right-aligned with bold total
- Footer with payment terms and bank details

**Business Rules:**
- BR-D01.72: Invoice detail read-only (no edit from Portal)
- BR-D01.73: PDF download includes all line items and payment info

---

#### US-D01.25: Payment Flow

**As a** Logged-in Developer
**I want** to pay my pending or overdue invoices
**So that** I can clear my balance and maintain API access

**Acceptance Criteria:**
- [ ] From invoice detail, I click "Pay Now"
- [ ] I see payment method selection:
  - [ ] **Bank Transfer:** Show bank account details, reference number, upload transfer slip
  - [ ] **QR Code:** Generate QR code for payment (PromptPay/bank QR)
- [ ] For Bank Transfer:
  - [ ] I see bank name, account number, account name
  - [ ] I see reference number to include in transfer
  - [ ] I can upload transfer slip (PDF/JPG/PNG, max 5MB)
  - [ ] Submit button to confirm payment
- [ ] For QR Code:
  - [ ] I see generated QR code with amount
  - [ ] QR code has expiry timer (30 minutes)
  - [ ] I can download QR code image
- [ ] After payment submission:
  - [ ] Status changes to "Processing"
  - [ ] Confirmation message shown
  - [ ] Email notification sent when payment is verified

**UI/UX Notes:**
- Step-by-step payment wizard
- Bank details displayed in a copyable format
- QR code prominently displayed with countdown timer
- Upload area with drag-and-drop support
- Success confirmation with clear next steps

**Business Rules:**
- BR-D01.74: Payment processing owned by Billing Engine, Portal submits payment intent
- BR-D01.75: Bank transfer requires slip upload (PDF/JPG/PNG, max 5MB)
- BR-D01.76: QR code expires in 30 minutes
- BR-D01.77: Payment verification is async (manual or automated by Billing Engine)

---

#### US-D01.26: Team Management

**As a** Logged-in Developer (SP Admin)
**I want** to manage my team members and their roles
**So that** I can collaborate with my organization on API projects

**Acceptance Criteria:**
- [ ] I see team member list with columns:
  - [ ] Name
  - [ ] Email
  - [ ] Role (SP Admin / Admin / Developer)
  - [ ] Status (Active / Pending)
  - [ ] Last Active date
  - [ ] Actions
- [ ] Roles defined as:
  - [ ] **SP Admin:** Full access — manage apps, billing, team, settings
  - [ ] **Admin:** Manage apps + billing — cannot manage team or settings
  - [ ] **Developer:** Use apps + view — cannot manage billing or team
- [ ] "Invite Member" button → opens modal:
  - [ ] Email (required, valid format)
  - [ ] Role selector (Admin or Developer — cannot invite SP Admin)
  - [ ] Send Invite button
- [ ] Invited member receives email with join link
- [ ] Actions menu (3-dot): Change Role, Remove Member
- [ ] Search by name or email
- [ ] Role badges color-coded (SP Admin = brand orange, Admin = blue, Developer = gray)

**UI/UX Notes:**
- Table with avatar circles for each member
- Invite modal with role selector dropdown
- Pending members shown with "Pending" badge in italic
- 3-dot action menu with confirmation dialogs for destructive actions
- Search bar above the table

**Business Rules:**
- BR-D01.78: Maximum 20 team members per organization
- BR-D01.79: Only SP Admin can invite members and change roles
- BR-D01.80: Cannot remove last SP Admin
- BR-D01.81: Invitation expires in 7 days
- BR-D01.82: Removing a member revokes their access immediately
- BR-D01.83: Role hierarchy: SP Admin > Admin > Developer

---

#### US-D01.27: Settings

**As a** Logged-in Developer
**I want** to manage my account and organization settings
**So that** I can keep my information current and configure preferences

**Acceptance Criteria:**
- [ ] I see 5 tabs:
  - **Profile:**
    - [ ] First name, Last name (editable)
    - [ ] Email (read-only, grayed out)
    - [ ] Phone number (editable)
    - [ ] Avatar upload (click to change)
  - **Security:**
    - [ ] Change password section (current + new + confirm)
    - [ ] Two-factor authentication toggle (future — disabled with "Coming Soon" label)
    - [ ] Active sessions list with device/browser info and "Revoke" action
  - **Organization:**
    - [ ] Organization name
    - [ ] Address (street, city, province, postal code)
    - [ ] Tax ID
    - [ ] Business registration number
  - **Billing:**
    - [ ] Default payment method display
    - [ ] Billing contact email
    - [ ] Billing address (can differ from org address)
  - **Notifications:**
    - [ ] Per-event notification preferences (see US-D01.28)

**UI/UX Notes:**
- Pill-style tab bar at top of settings page
- Section separators with labels and divider lines
- Form fields with labels above, consistent input styling
- Avatar displayed as circular image with edit overlay
- Save Changes button per section (not global save)

**Business Rules:**
- BR-D01.84: Email cannot be changed (matches v4 BR-D01.19)
- BR-D01.85: Organization info editable by SP Admin only
- BR-D01.86: Avatar max 2MB, JPG/PNG only

---

#### US-D01.28: Multi-Channel Notification Preferences

**As a** Logged-in Developer
**I want** to configure my notification preferences per event and per channel
**So that** I receive relevant notifications through my preferred channels

**Acceptance Criteria:**
- [ ] I see a table/matrix of notification events vs channels:
  - [ ] **Channels:** In-App, Email, LINE
  - [ ] **Events:**
    - [ ] App Approved
    - [ ] App Rejected
    - [ ] Invoice Created
    - [ ] Invoice Overdue
    - [ ] Credit Alert (low balance, limit changes)
    - [ ] Team Invite
    - [ ] API Anomaly Alert (spike, errors)
- [ ] Each cell has a toggle (on/off) per event per channel
- [ ] "LINE Connect" button to link LINE account (OAuth flow)
- [ ] LINE column disabled/grayed out until LINE is connected
- [ ] Default: all events enabled for Email; In-App enabled for critical events

**UI/UX Notes:**
- Grid/table layout with event rows and channel columns
- Toggle switches (custom styled) for each preference
- LINE Connect button with LINE brand green color
- "Connected" indicator when LINE is linked
- Responsive: stack on mobile

**Business Rules:**
- BR-D01.87: Email channel cannot be disabled for security events (password reset, account lock)
- BR-D01.88: LINE requires OAuth connection (one-time setup)
- BR-D01.89: Notification preferences per user (not per organization)

---

### 5.3 Developer User Flows

#### Flow 1: Developer Registration

```
[Landing Page] → [Click "Sign Up"]
                        |
                        v
                  [Registration Form]
                        |
                        v
                  [Submit]
                        |
                        v
                  [Verification Email Sent]
                        |
                        v
                  [Click Email Link]
                        |
                        v
                  [Email Verified] → [Login Page]
```

#### Flow 2: Create App and Get API Key

```
[Dashboard] → [Click "Create App"]
                      |
                      v
                [App Form: Name, Description]
                      |
                      v
                [Submit]
                      |
                      v
                [API Key Modal]
                - API Key: rf-sk-sandbox-xxxx (copy, shown once!)
                - Status: Sandbox
                      |
                      v
                [Acknowledge checkbox]
                      |
                      v
                [App Detail Page]
                Status = Sandbox
                "Submit for Production" button visible
```

#### Flow 3: Submit App for Production Approval

```
[App Detail (Sandbox)] → [Click "Submit for Production"]
                                 |
                                 v
                           [Step 1: Company Info]
                                 |
                                 v
                           [Step 2: Upload Documents]
                                 |
                                 v
                           [Step 3: Review & Submit]
                                 |
                                 v
                           [Confirm Submission]
                                 |
                                 v
                           [App Status = Pending Approval]
                           [Confirmation Email Sent]
                           [App still works in sandbox mode]
```

#### Flow 4: Approval Outcomes

```
[Pending Approval]
       |
       v
  [Admin Reviews]
       |
  +----+----+
  |         |
  v         v
[Approved] [Rejected]
  |         |
  v         v
[Production Access]  [View Rejection Reason]
[Email Notification]        |
                            v
                     [Revise and Resubmit]
                            |
                            v
                     [Pending Approval Again]
                     [Resubmission Email]
```

#### Flow 5: API Authentication

```
[Developer App] → [Authorization: Bearer rf-sk-xxxx]
                          |
                          v
                    [Embedded Middleware]
                          |
                          v
                    [Validate via Shared Cache (Redis)]
                          |
              +-----------+-----------+
              |                       |
          [Valid]                 [Invalid]
              |                       |
              v                       v
    [Check App Status]          [Return 401 Error]
              |
    +---------+---------+
    |         |         |
[sandbox] [approved] [revoked]
    |         |         |
    v         v         v
[Limited] [Full Access] [Blocked]
```

#### Flow 6: Invoice Payment

```
[Invoice List] → [Click "Pay" on overdue/pending invoice]
                        |
                        v
                  [Invoice Detail Modal]
                        |
                        v
                  [Click "Pay Now"]
                        |
                  +-----+-----+
                  |           |
                  v           v
          [Bank Transfer] [QR Code]
                  |           |
                  v           v
        [Upload Slip]   [Scan & Pay]
                  |           |
                  v           v
            [Submit Payment Intent]
                        |
                        v
              [Status = Processing]
              [Email when verified]
```

#### Flow 7: Team Invite

```
[Team Management] → [Click "Invite Member"]
                            |
                            v
                      [Enter Email + Select Role]
                            |
                            v
                      [Send Invite]
                            |
                            v
                      [Email sent to invitee]
                      [Status = Pending]
                            |
                            v
                      [Invitee clicks join link]
                            |
                            v
                      [Register/Login → Join Team]
                      [Status = Active]
```

---

### 5.4 Developer Business Rules Summary

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-D01.1 | Email must be unique in the system | US-D01.1 |
| BR-D01.2 | Password: min 8 chars, uppercase, lowercase, number | US-D01.1 |
| BR-D01.3 | Email verification required before using the portal | US-D01.1 |
| BR-D01.4 | User system is separate from M-BE (Backoffice) | All |
| BR-D01.5 | Rate limit registration = 5 times/hour/IP | US-D01.1 |
| BR-D01.6 | Lock account after 5 failed login attempts (30 minutes) | US-D01.2 |
| BR-D01.7 | Session timeout = 24 hours, token in HTTP-only cookie | US-D01.2 |
| BR-D01.8 | Record Login history | US-D01.2 |
| BR-D01.9 | Remember Me extends session to 7 days | US-D01.2 |
| BR-D01.10 | Rate limit login = 10 times/minute/IP | US-D01.2 |
| BR-D01.11 | Reset token expires in 1 hour | US-D01.3 |
| BR-D01.12 | Reset token is one-time use | US-D01.3 |
| BR-D01.13 | Rate limit forgot password = 3 times/hour/email | US-D01.3 |
| BR-D01.14 | Generic message to prevent email enumeration | US-D01.3 |
| BR-D01.15 | Rate limit resend verification = 3 times/hour | US-D01.4 |
| BR-D01.16 | Previous verification token invalidated when new sent | US-D01.4 |
| BR-D01.17 | Verification token expires in 24 hours | US-D01.4 |
| BR-D01.18 | Delete account = Delete all Apps | US-D01.5 |
| BR-D01.19 | Email cannot be changed | US-D01.5 |
| BR-D01.20 | App Name must be unique within User | US-D01.6 |
| BR-D01.21 | API Key format: `rf-sk-sandbox-<random>` / `rf-sk-prod-<random>` | US-D01.6 |
| BR-D01.22 | API Key stored as SHA-256 hash (not plaintext) | US-D01.6 |
| BR-D01.23 | API Key shown only once at creation | US-D01.6 |
| BR-D01.24 | Limit 10 Apps per User | US-D01.6 |
| BR-D01.25 | Rate limit app creation = 10 times/hour/user | US-D01.6 |
| BR-D01.26 | Apps start in sandbox status by default | US-D01.6 |
| BR-D01.27 | Show only Apps owned by logged-in User | US-D01.7 |
| BR-D01.28 | API Key not shown after creation (only masked prefix) | US-D01.8 |
| BR-D01.29 | Record Audit Log for every access | US-D01.8 |
| BR-D01.30 | Old API Key invalidated immediately on regenerate | US-D01.9 |
| BR-D01.31 | Shared cache invalidated immediately on regenerate | US-D01.9 |
| BR-D01.32 | Audit Log with timestamp and IP | US-D01.9 |
| BR-D01.33 | Revoke = Soft disable (recoverable) | US-D01.10 |
| BR-D01.34 | Delete = Hard delete (permanent) | US-D01.10 |
| BR-D01.35 | Re-activate requires regenerating API Key | US-D01.10 |
| BR-D01.36 | Cache invalidated immediately on revoke | US-D01.10 |
| BR-D01.37 | Documentation is Public (no login required) | US-D01.11 |
| BR-D01.38 | "Try it out" requires valid API Key | US-D01.11 |
| BR-D01.39 | Production approval requires Platform Admin action | US-D01.12 |
| BR-D01.40 | Use case description min 50 chars, max 1,000 chars | US-D01.12 |
| BR-D01.41 | Business address min 10 chars | US-D01.12 |
| BR-D01.42 | Documents: 1-5 files, max 10 MB each, PDF/JPG/PNG only | US-D01.12 |
| BR-D01.43 | Pending and rejected apps remain in sandbox mode | US-D01.12, 13 |
| BR-D01.44 | All status changes trigger email notification | All Approval |
| BR-D01.45 | Rejected developers can resubmit unlimited times | US-D01.14 |
| BR-D01.46 | Each resubmission increments submission number | US-D01.14 |
| BR-D01.47 | Audit Logs archive 7 years for compliance | All |
| BR-D01.48 | Landing page is public (no login required) | US-D01.15 |
| BR-D01.49 | Code examples auto-updated from OpenAPI spec | US-D01.15 |
| BR-D01.50 | Dashboard data cached max 5 minutes | US-D01.16 |
| BR-D01.51 | Alert banners dismissible per session (reappear on next login) | US-D01.16 |
| BR-D01.52 | API status data from health check endpoint, cached 1 minute | US-D01.16 |
| BR-D01.53 | Sidebar state (locked/collapsed) persisted in localStorage | US-D01.17 |
| BR-D01.54 | Badge counts updated real-time via polling (30 seconds) | US-D01.17 |
| BR-D01.55 | Metrics aggregated from API request logs (cached 15 minutes) | US-D01.18 |
| BR-D01.56 | Overdue billing indicator shown when app has unpaid invoices > 30 days | US-D01.18 |
| BR-D01.57 | Analytics data aggregated from API request logs | US-D01.19 |
| BR-D01.58 | Data available for last 90 days (matches log retention) | US-D01.19 |
| BR-D01.59 | Custom date range max 90 days | US-D01.19 |
| BR-D01.60 | Logs available for last 90 days | US-D01.20 |
| BR-D01.61 | Show only logs for apps owned by current user | US-D01.20 |
| BR-D01.62 | Export limited to 10,000 rows per export | US-D01.20 |
| BR-D01.63 | Rate limit export = 5 times/hour/user | US-D01.20 |
| BR-D01.64 | API Key masked in log details (show prefix only) | US-D01.21 |
| BR-D01.65 | Response body truncated at 10KB with "Show full" option | US-D01.21 |
| BR-D01.66 | Credit data owned by Billing Engine billing engine, Portal reads via API | US-D01.22 |
| BR-D01.67 | Credit increase request requires reason (min 20 chars) | US-D01.22 |
| BR-D01.68 | Rate limit credit requests = 3 times/day/organization | US-D01.22 |
| BR-D01.69 | Invoice data owned by Billing Engine, Portal reads via API | US-D01.23 |
| BR-D01.70 | Invoices sorted by due date (nearest first) | US-D01.23 |
| BR-D01.71 | Overdue = unpaid past due date | US-D01.23 |
| BR-D01.72 | Invoice detail read-only (no edit from Portal) | US-D01.24 |
| BR-D01.73 | PDF download includes all line items and payment info | US-D01.24 |
| BR-D01.74 | Payment processing owned by Billing Engine, Portal submits payment intent | US-D01.25 |
| BR-D01.75 | Bank transfer requires slip upload (PDF/JPG/PNG, max 5MB) | US-D01.25 |
| BR-D01.76 | QR code expires in 30 minutes | US-D01.25 |
| BR-D01.77 | Payment verification is async (manual or automated by Billing Engine) | US-D01.25 |
| BR-D01.78 | Maximum 20 team members per organization | US-D01.26 |
| BR-D01.79 | Only SP Admin can invite members and change roles | US-D01.26 |
| BR-D01.80 | Cannot remove last SP Admin | US-D01.26 |
| BR-D01.81 | Invitation expires in 7 days | US-D01.26 |
| BR-D01.82 | Removing a member revokes their access immediately | US-D01.26 |
| BR-D01.83 | Role hierarchy: SP Admin > Admin > Developer | US-D01.26 |
| BR-D01.84 | Email cannot be changed (matches BR-D01.19) | US-D01.27 |
| BR-D01.85 | Organization info editable by SP Admin only | US-D01.27 |
| BR-D01.86 | Avatar max 2MB, JPG/PNG only | US-D01.27 |
| BR-D01.87 | Email channel cannot be disabled for security events | US-D01.28 |
| BR-D01.88 | LINE requires OAuth connection (one-time setup) | US-D01.28 |
| BR-D01.89 | Notification preferences per user (not per organization) | US-D01.28 |

---

### 5.5 Developer Edge Cases

| Edge Case ID | Category | Scenario | Handling |
|-------------|----------|----------|----------|
| EC-D01.1 | Input Boundary | Use case description exactly 50 characters (minimum) | Accept and proceed |
| EC-D01.2 | Input Boundary | File upload exactly 10 MB | Accept the file |
| EC-D01.3 | Data Boundary | Developer tries to submit for approval twice | Hide "Submit for Production" button when status is pending_approval |
| EC-D01.4 | State/Timing | App is approved while developer is editing a resubmission | Show notification that app has been approved, close form |
| EC-D01.5 | State/Timing | Developer deletes app while approval is pending | Cancel pending approval request when app is deleted |
| EC-D01.6 | Data Boundary | Developer reaches sandbox limit, then submits for production | Display message: sandbox limits remain until approval |
| EC-D01.7 | Integration | File upload service is temporarily unavailable | Show error: "File upload temporarily unavailable. Please try again later." |
| EC-D01.8 | State/Timing | Admin revokes an app that has a pending approval | Set status to "revoked", cancel pending approval request |
| EC-D01.9 | State/Timing | Credit request while previous request still pending | Show "You have a pending credit request. Please wait for it to be processed." |
| EC-D01.10 | State/Timing | Payment submitted but verification delayed > 24 hours | Show "Payment being verified" status with expected resolution time |
| EC-D01.11 | Data Boundary | Team member invited but already has account with another org | Show "User already belongs to another organization" |
| EC-D01.12 | Business Rule | SP Admin tries to remove themselves (last SP Admin) | Block with error: "Cannot remove the last SP Admin. Transfer ownership first." |
| EC-D01.13 | State/Timing | Invoice generated while credit limit exceeded | Show alert banner on dashboard: "Credit limit exceeded. Please request credit increase." |
| EC-D01.14 | Data Boundary | API logs query returns > 100,000 results | Show "Too many results, please narrow your filters" and enforce filter selection |
| EC-D01.15 | Integration | LINE connection revoked externally | Show "Reconnect LINE" prompt in notification preferences |

### 5.6 Developer Error Scenarios

| Scenario | Category | Severity | Expected Message | Recovery |
|----------|----------|----------|------------------|----------|
| Email already registered | Validation | Medium | "Email already registered" | Use another email or login |
| Email not verified | Business Rule | Medium | "Please verify your email first" | Click resend verification |
| Login failed | Validation | Medium | "Invalid email or password" | Retry or reset password |
| Account locked | Business Rule | High | "Account locked. Try again in 30 minutes" | Wait 30 minutes |
| App name duplicate | Validation | Medium | "App name already exists" | Use different name |
| App limit reached | Business Rule | High | "Maximum apps (10) reached" | Delete unused apps |
| Invalid API Key | Business Rule | Medium | 401: "Invalid API Key" | Check key value |
| App revoked | Business Rule | High | 401: "API Key revoked" | Re-activate or create new |
| Use case too short | Validation | Medium | "Use case description must be at least 50 characters" | Add more detail |
| File too large | Validation | Medium | "File size exceeds 10 MB limit" | Compress or split file |
| Wrong file type | Validation | Medium | "Only PDF, JPEG, and PNG files are accepted" | Convert to accepted format |
| Too many files | Validation | Medium | "Maximum 5 files per submission" | Remove extra files |
| No files uploaded | Validation | Medium | "At least 1 supporting document is required" | Upload at least 1 file |
| Rate limit exceeded (sandbox) | Business Rule | Medium | "Rate limit exceeded. Submit for production approval for higher limits." | Wait for reset or submit for approval |
| File upload failed | System | High | "File upload failed. Please try again." | Retry upload |
| Credit request too frequent | Business Rule | Medium | "Maximum 3 credit requests per day" | Wait until next day |
| Payment slip wrong format | Validation | Medium | "Only PDF, JPEG, PNG accepted (max 5MB)" | Convert file or reduce size |
| Team member limit reached | Business Rule | Medium | "Maximum 20 team members per organization" | Remove inactive members |
| Invalid invitation email | Validation | Medium | "Please enter a valid email address" | Correct email format |
| Export too large | Business Rule | Medium | "Export limited to 10,000 rows. Please narrow filters." | Add more filters |
| LINE connection failed | Integration | Medium | "Unable to connect LINE. Please try again." | Retry LINE OAuth flow |
| Invoice not found | Business Rule | Medium | "Invoice not found or access denied" | Verify invoice number |
| Credit API unavailable | System | High | "Credit information temporarily unavailable" | Retry later |

---

# ===============================================================
# PART B: ADMIN VIEW (Platform Admin)
# ===============================================================

## 6. Admin Features

### 6.1 Feature Overview (Admin)

| Feature ID | Feature Name | Priority | Description |
|------------|--------------|----------|-------------|
| F-A01.0 | Admin Authentication | P0 | Login to Admin Portal (via Backoffice) |
| F-A01.1 | View All Developers | P1 | View list of all Developers |
| F-A01.2 | View All Apps | P0 | View list of all Apps with status filter |
| F-A01.3 | Admin Revoke App | P0 | Revoke any Developer's App |
| F-A01.4 | View Audit Logs | P1 | View Audit Logs |
| F-A01.5 | View Platform Statistics | P1 | Dashboard with metrics |
| F-A01.6 | Review Approval Requests | P0 | View, approve, or reject app approval requests |
| F-A01.7 | Review Credit Increase Requests | P1 | Review, approve, or reject developer credit increase requests |

---

### 6.2 User Stories (Admin)

#### US-A01.0: Admin Authentication

**As a** Platform Admin
**I want** to login to the Admin Portal
**So that** I can manage developers, apps, and review approval requests

**Acceptance Criteria:**
- [ ] I can access Admin Login page (via Backoffice — separate from Developer Login)
- [ ] I enter Email and Password
- [ ] After Login I am redirected to Admin Dashboard
- [ ] If wrong I see generic error
- [ ] Session timeout = 8 hours

**Business Rules:**
- BR-A01.1: Admin accounts are separate from Developer accounts
- BR-A01.2: Admin accounts created by Super Admin only
- BR-A01.3: Lock admin account after 3 failed login attempts (Super Admin unlock required)
- BR-A01.4: Admin session timeout = 8 hours
- BR-A01.5: Admin cannot reuse last 5 passwords
- BR-A01.6: Admin password: min 12 chars + uppercase + lowercase + number + special character

---

#### US-A01.1: View All Developers

**As a** Platform Admin
**I want** to view all registered developers
**So that** I can monitor developer registrations and manage accounts

**Acceptance Criteria:**
- [ ] I see list of all Developers with: Email, Full Name, Company, Registration Date, Verified Status, Account Status, App Count
- [ ] I can Search by Email, Name, Company
- [ ] I can Filter by Email Verified, Account Status, Date Range
- [ ] I can Sort by columns
- [ ] I can Export to CSV

**Business Rules:**
- BR-A01.7: Admin can only view (Read-Only) for Phase 1
- BR-A01.8: Record Audit Log when Admin views developer data

---

#### US-A01.2: View All Apps

**As a** Platform Admin
**I want** to view all applications across all developers
**So that** I can monitor API usage and identify suspicious apps

**Acceptance Criteria:**
- [ ] I see list of all Apps with: App Name, Developer Email, API Key (masked prefix), Status (Sandbox/Pending/Approved/Rejected/Revoked), Created Date
- [ ] I can Search by App Name, Developer Email
- [ ] I can Filter by Status, Date Range
- [ ] I see Quick Stats: Total Apps, Sandbox, Pending, Approved, Rejected, Revoked

**Business Rules:**
- BR-A01.9: Admin sees masked API Key prefix only
- BR-A01.10: Admin does NOT see full API Key

---

#### US-A01.3: Admin Revoke App

**As a** Platform Admin
**I want** to revoke any application
**So that** I can disable abusive or suspicious apps immediately

**Acceptance Criteria:**
- [ ] I can Revoke any App from App Details page
- [ ] System shows Confirmation Dialog with reason field (required, min 10 chars)
- [ ] After Revoke: App disabled, shared cache invalidated, Developer notified by email, Audit Log recorded

**Business Rules:**
- BR-A01.11: Revoke must include Reason (min 10 chars)
- BR-A01.12: Send Email notification to Developer automatically
- BR-A01.13: Record Audit Log with Admin ID, Reason, Timestamp
- BR-A01.14: Cache invalidated immediately on admin revoke

---

#### US-A01.4: View Audit Logs

**As a** Platform Admin
**I want** to view audit logs of all activities
**So that** I can track security events and troubleshoot issues

**Acceptance Criteria:**
- [ ] I see list of Audit Logs with: Timestamp, Actor, Action Type, Resource, IP Address
- [ ] I can Search, Filter by Date/Action/Actor Type
- [ ] I can expand to see full Details (JSON)
- [ ] I can Export to CSV

**Business Rules:**
- BR-A01.15: Audit Logs retained 1 year active, 7 years archived
- BR-A01.16: Audit Logs are Read-Only (Immutable)
- BR-A01.17: Record Audit Log when Admin views Audit Logs

---

#### US-A01.5: View Platform Statistics

**As a** Platform Admin
**I want** to view platform usage statistics
**So that** I can monitor platform health and growth

**Acceptance Criteria:**
- [ ] I see Summary Cards: Total Developers, Total Apps, Active/Revoked ratio, New Developers (7d), New Apps (7d)
- [ ] I see Approval Stats: Pending Count, Approved Today, Average Review Time
- [ ] I see Charts: Developer Registration Trend (30d), App Creation Trend (30d)
- [ ] I see Recent Activity: 10 latest Audit Logs
- [ ] I see Pending Approval notification badge on sidebar

**Business Rules:**
- BR-A01.18: Statistics calculated real-time or cached (max 5 minutes stale)
- BR-A01.19: Dashboard accessible to Platform Admin and Super Admin

---

#### US-A01.6: Review Approval Requests

**As a** Platform Admin
**I want** to review, approve, or reject app approval requests
**So that** I can verify developer organizations and control production access

**Acceptance Criteria:**

**Approval Request List:**
- [ ] I see a dedicated "Approval Requests" section in the Backoffice
- [ ] I see Quick Stats cards: Total Pending, Approved Today, Average Review Time
- [ ] I see filter: Status (All/Pending/Approved/Rejected), Date range, Search
- [ ] I see data table: App Name, Developer Email, Company Name, Submitted Date, Days Pending, Status, Actions
- [ ] Pending requests sorted by oldest first (FIFO) by default
- [ ] Pagination (20 per page)

**Approval Request Detail:**
- [ ] I see full details organized in tabs:
  - **Overview Tab:** App info, Developer info, Company info (name, reg number, address, use case)
  - **Documents Tab:** Document list with download, file preview (images/PDFs)
  - **History Tab:** Timeline of all submissions, previous rejection reasons, submission number
- [ ] I see floating action buttons: Approve (green) / Reject (red)

**Approve Action:**
- [ ] Confirmation Dialog showing: App Name, Developer Email, what happens after approval
- [ ] After confirming: Status → Approved, email sent, audit log recorded

**Reject Action:**
- [ ] Rejection Dialog with reason textarea (required, min 20 chars, max 500 chars, character counter)
- [ ] Reject button disabled until reason is valid
- [ ] After confirming: Status → Rejected, rejection email with reason sent, audit log recorded

**Business Rules:**
- BR-A01.20: Rejection requires reason (min 20 chars, max 500 chars)
- BR-A01.21: Admin approval/rejection creates audit log entry
- BR-A01.22: All status changes trigger email notification to developer

---

#### US-A01.7: Review Credit Increase Requests

**As a** Platform Admin
**I want** to review, approve, or reject developer credit increase requests
**So that** I can manage credit allocation across organizations

**Acceptance Criteria:**

**Credit Request List:**
- [ ] I see a dedicated "Credit Requests" section in the Backoffice
- [ ] I see list with columns: Organization, Requested Amount, Current Limit, Requested By, Date, Status, Actions
- [ ] I can filter by Status (All/Pending/Approved/Rejected), Date range
- [ ] Pending requests sorted by oldest first (FIFO) by default
- [ ] Pagination (20 per page)

**Credit Request Detail:**
- [ ] I see organization info: name, current credit limit, current usage, utilization %
- [ ] I see request details: requested amount, reason/justification
- [ ] I see requester info: name, email, role

**Approve Action:**
- [ ] I set the new credit limit (can be different from requested amount)
- [ ] Confirmation dialog showing: Organization, Current Limit, New Limit
- [ ] After confirming: Status → Approved, new limit takes effect immediately, email sent to developer

**Reject Action:**
- [ ] Rejection dialog with reason textarea (required, min 20 chars)
- [ ] After confirming: Status → Rejected, email sent with reason and contact info

**Business Rules:**
- BR-A01.23: Credit approval creates audit log
- BR-A01.24: Approved amount can differ from requested amount
- BR-A01.25: Credit changes take effect immediately

---

### 6.3 Admin Edge Cases

| Edge Case ID | Category | Scenario | Handling |
|-------------|----------|----------|----------|
| EC-A01.1 | State/Timing | Two admins try to approve/reject the same request simultaneously | Show: "This request has already been processed by another admin." |
| EC-A01.2 | State/Timing | Admin opens request detail, but developer deletes the app | Show: "This app has been deleted by the developer." |
| EC-A01.3 | Data Boundary | Approval request has no documents (data integrity issue) | Show warning with option to reject |
| EC-A01.4 | Integration | Document download fails (storage unavailable) | Show: "Unable to download document. Please try again later." |
| EC-A01.5 | State/Timing | Developer resubmits while admin is reviewing previous submission | Show: "Developer has submitted an updated version. Please refresh." |
| EC-A01.6 | State/Timing | Two admins process same credit request simultaneously | Show: "This credit request has already been processed by another admin." |
| EC-A01.7 | State/Timing | Organization deleted while credit request pending | Cancel the credit request and show: "Organization no longer exists." |

### 6.4 Admin Error Scenarios

| Scenario | Category | Severity | Expected Message | Recovery |
|----------|----------|----------|------------------|----------|
| Admin login failed | Validation | Medium | "Invalid email or password" | Retry |
| Admin account locked | Business Rule | High | "Account locked. Contact Super Admin" | Contact Super Admin |
| Admin session expired | System | Medium | "Session expired. Please login again" | Re-login |
| Revoke without reason | Validation | Medium | "Reason is required (min 10 characters)" | Enter reason |
| App already revoked | Business Rule | Low | "App is already revoked" | No action needed |
| Reject without reason | Validation | Medium | "Rejection reason is required (min 20 characters)" | Enter reason |
| Reject reason too short | Validation | Medium | "Rejection reason must be at least 20 characters" | Add more detail |
| Request already processed | Business Rule | Low | "This request has already been processed" | Refresh the page |
| App deleted during review | Business Rule | Medium | "This app has been deleted by the developer" | Close the request |
| Document download failed | Integration | Medium | "Unable to download. Please try again later." | Retry later |
| Credit request already processed | Business Rule | Low | "This credit request has already been processed" | Refresh the page |
| Approved amount invalid | Validation | Medium | "Approved amount must be greater than current limit" | Enter valid amount |

### 6.5 Admin Capabilities Matrix

| Capability | Platform Admin | Super Admin | Notes |
|------------|----------------|-------------|-------|
| View all Developers | Yes | Yes | Read-only |
| Edit Developer data | No | Yes | Future Phase |
| Delete Developer | No | Yes | Future Phase |
| View all Apps | Yes | Yes | — |
| Revoke any App | Yes | Yes | Requires reason |
| Delete any App | No | Yes | Future Phase |
| Approve App for Production | Yes | Yes | — |
| Reject App | Yes | Yes | Requires reason |
| View Audit Logs | Yes | Yes | — |
| Export Audit Logs | Yes | Yes | — |
| System Configuration | No | Yes | Future Phase |
| Review Credit Requests | Yes | Yes | Requires reason for rejection |

---

# ===============================================================
# PART C: SHARED SPECIFICATIONS
# ===============================================================

## 7. App Status Model

### 7.1 Status Definitions

| Status | Description | Can Submit for Approval | Can Authenticate |
|--------|-------------|------------------------|------------------|
| **sandbox** | Default status after app creation | Yes | Yes |
| **pending_approval** | Developer submitted for production approval | No (already submitted) | Yes |
| **approved** | Platform Admin approved for production | No (already approved) | Yes |
| **rejected** | Platform Admin rejected with reason | Yes (resubmit) | Yes |
| **revoked** | Admin or developer disabled the app | No | No |

### 7.2 Status Transition Diagram

```
[Create App] → [sandbox] ──(submit for approval)──→ [pending_approval]
                   |                                        |
                   |                                   +────+────+
                   |                                   |         |
                   |                             [approved]  [rejected]
                   |                                   |         |
                   |                                   |    (resubmit)
                   |                                   |         |
                   |                                   |  [pending_approval]
                   |                                   |
                   +───(admin/developer revoke)────────+──────→ [revoked]
```

### 7.3 Valid Status Transitions

| From | To | Trigger | Actor |
|------|-----|---------|-------|
| (new) | sandbox | App created | Developer |
| sandbox | pending_approval | Submit for approval | Developer |
| pending_approval | approved | Admin approves | Platform Admin |
| pending_approval | rejected | Admin rejects with reason | Platform Admin |
| rejected | pending_approval | Developer resubmits | Developer |
| sandbox | revoked | Developer or Admin revokes | Developer / Platform Admin |
| pending_approval | revoked | Admin revokes | Platform Admin |
| approved | revoked | Admin revokes | Platform Admin |
| rejected | revoked | Developer or Admin revokes | Developer / Platform Admin |

---

## 8. Authentication Architecture

### 8.1 Auth Methods (MVP)

| Consumer | Auth Method | Validated By |
|----------|-------------|--------------|
| External developer (API calls) | **Simple API Key** (Bearer token `rf-sk-xxxx`) | Embedded middleware via shared cache |
| Developer (Portal login) | Email + Password → JWT session | Portal backend |
| Admin (Backoffice) | HMAC-SHA256 + JWT | Existing middleware (unchanged) |
| Customer app | HMAC-SHA256 + JWT | Existing middleware (unchanged) |

### 8.2 Auth Flow — MVP (Embedded Gateway)

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

### 8.3 Auth Flow — Future (Separate Gateway)

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

### 8.4 API Key Ownership & Verification

- Portal เป็น **sole owner** ของ API Key data — writes only via Portal
- Portal DB เป็น source of truth — เก็บ key hash (SHA-256, ไม่เก็บ plaintext)
- Shared cache (Redis) เก็บ validation data สำหรับ runtime — auto-expires (TTL)
- Middleware เป็น read-only consumer ของ cache — ไม่เข้าถึง Portal DB โดยตรง
- Revoke/Regenerate → invalidate cache ทันที — มีผลทันทีสำหรับทุก request
- แสดง key เต็มครั้งเดียวตอนสร้าง → หลังจากนั้นแสดงแค่ prefix เท่านั้น

### 8.5 Security Measures

**Portal Security (this module):**

1. HTTPS Only (reject HTTP, TLS 1.2+)
2. Key Hashing (SHA-256 at rest)
3. Show Once (แสดงเต็มครั้งเดียว)
4. Key Prefix (`rf-sk-`) สำหรับ leak detection
5. Approval-Gated (ใช้ production ได้หลัง admin approve เท่านั้น)
6. Instant Revoke (admin/developer revoke ได้ทันที, cache invalidated immediately)
7. Key Regeneration (สร้างใหม่ได้, key เก่า auto-revoke)
8. Document Storage: server-side encryption, access via time-limited signed URLs only
9. File Validation: server-side file type validation (not just extension check)

**Future Gateway Security (→ API Gateway, reference only):**

10. Rate Limiting (per key per minute/hour)
11. IP Allowlisting enforcement
12. Usage Alerts (anomaly/spike detection)

---

## 9. Notifications (Multi-Channel)

### 9.1 Email Templates

| Template | Trigger | Recipient | Key Content |
|----------|---------|-----------|-------------|
| Welcome Email | After registration | Developer | Welcome message, verification link |
| Email Verification | Registration / Resend | Developer | Verification link (expires 24 hours) |
| Password Reset | Forgot Password request | Developer | Reset link (expires 1 hour) |
| Password Changed | After password reset | Developer | Confirmation, security tips |
| App Revoked (Admin) | Admin revokes app | Developer | App name, reason, contact info |
| **App Submitted** | Developer submits for approval | Developer | App name, submission date, estimated review time (48 hours), tracking link |
| **App Approved** | Admin approves app | Developer | App name, production access details, Client ID reminder |
| **App Rejected** | Admin rejects app | Developer | App name, rejection reason, clear next steps, resubmit link |
| **App Resubmitted** | Developer resubmits after rejection | Developer | App name, submission number, submitted date, estimated review time |
| **Invoice Created** | New invoice generated | Developer | Invoice #, amount, due date, pay link |
| **Invoice Overdue** | Invoice past due date | Developer | Invoice #, amount, days overdue, pay link |
| **Credit Request Submitted** | Developer requests increase | Developer | Requested amount, estimated review time |
| **Credit Request Approved** | Admin approves credit request | Developer | New limit, effective immediately |
| **Credit Request Rejected** | Admin rejects credit request | Developer | Reason, contact info for further discussion |
| **Team Invite** | SP Admin invites member | Invitee | Organization name, join link (7 day expiry) |
| **Team Member Joined** | New member joins team | SP Admin | Member name, email, role assigned |
| **Payment Received** | Payment verified by Billing Engine | Developer | Invoice #, amount, confirmation number |

### 9.2 Email Content Specifications

#### App Submitted Email

| Field | Content |
|-------|---------|
| Subject | "App Submitted for Approval - [App Name]" |
| Greeting | "Hi [Developer Name]," |
| Body | "Your app '[App Name]' has been successfully submitted for production approval." |
| Details | Submitted date/time, Estimated review time: 48 hours |
| Call to Action | "Track Approval Status" button → app detail page |
| Footer | "Questions? Contact us at support@realfact.ai" |

#### App Approved Email

| Field | Content |
|-------|---------|
| Subject | "Your App is Approved - [App Name]" |
| Greeting | "Hi [Developer Name]," |
| Body | "Great news! Your app '[App Name]' has been approved for production use." |
| Details | Production access enabled, API Key prefix reminder |
| Call to Action | "View App Details" button → app detail page |
| Tone | Congratulatory, encouraging |

#### App Rejected Email

| Field | Content |
|-------|---------|
| Subject | "Action Required: App Needs Revision - [App Name]" |
| Greeting | "Hi [Developer Name]," |
| Body | "We've reviewed your app '[App Name]' and it needs some revisions before approval." |
| Rejection Reason | Displayed prominently in a highlighted box |
| Next Steps | 1) Review feedback, 2) Update info/documents, 3) Resubmit |
| Note | "You can resubmit your app as many times as needed." |
| Call to Action | "Revise and Resubmit" button → resubmission page |

#### App Resubmitted Email

| Field | Content |
|-------|---------|
| Subject | "App Resubmitted for Review - [App Name]" |
| Body | "Your app '[App Name]' has been resubmitted for production approval." |
| Details | Submission number (e.g., "#2"), submitted date/time, estimated review time: 48 hours |
| Call to Action | "Track Status" button → app detail page |

### 9.3 Notification Channels

| Channel | Description | Requirements | Delivery Target |
|---------|-------------|--------------|-----------------|
| **Email** | Primary channel, always enabled for security events | SMTP service, email templates | Developer's registered email |
| **In-App** | Real-time notifications within Portal UI | WebSocket or SSE connection | Notification bell icon with badge count |
| **LINE** | Optional channel, requires OAuth connection | LINE Messaging API, OAuth link | Developer's linked LINE account |

**Channel Characteristics:**

- **Email:** Reliable, async delivery. Always enabled for security-critical events (password reset, account lock). Supports rich HTML templates. Delivery target < 30 seconds.
- **In-App:** Real-time, shown in Portal UI. Notification bell icon in top bar with unread count badge. Click to view notification list. Mark as read individually or all. Delivery target < 1 second.
- **LINE:** Push notification via LINE Messaging API. Supports rich messages with buttons and links. Requires one-time OAuth connection from Settings. Delivery target < 5 seconds.

### 9.4 Default Notification Matrix

| Event | In-App | Email | LINE | Configurable |
|-------|--------|-------|------|-------------|
| App Approved | ON | ON | ON | Yes |
| App Rejected | ON | ON | ON | Yes |
| Invoice Created | ON | ON | OFF | Yes |
| Invoice Overdue | ON | ON | ON | Yes |
| Credit Alert (low balance) | ON | ON | OFF | Yes |
| Credit Request Approved | ON | ON | OFF | Yes |
| Credit Request Rejected | ON | ON | OFF | Yes |
| Team Invite | ON | ON | OFF | Yes |
| Team Member Joined | OFF | ON | OFF | Yes |
| API Anomaly Alert | ON | ON | OFF | Yes |
| Password Reset | OFF | ON (forced) | OFF | No (Email forced) |
| Account Lock | OFF | ON (forced) | OFF | No (Email forced) |
| Payment Received | ON | ON | OFF | Yes |

---

## 10. Technical Architecture

### 10.1 Architecture Layers

| Layer | Role | Owns |
|-------|------|------|
| Developer Portal (Management Plane) | Developer/Admin UI, API Key provisioning, docs, approval workflow | Portal DB: developers, apps, api_keys, audit_logs, request_logs |
| Backend API (Data Plane — embedded for MVP) | Business logic + embedded API Key validation middleware | Business DB: users, conversations, personas, messages |
| Shared Cache | Runtime API Key validation (read-only by middleware) | Key validation cache (Portal writes, middleware reads) |

### 10.2 Data Ownership Principle

- **Portal owns ALL platform data** — developers, apps, API keys, logs — Portal is sole writer
- **Backend API owns ALL business data** — users, conversations, personas, messages — does NOT know about developers or API keys
- **Shared cache bridges the two** — Portal writes validation data, middleware reads it; Backend API knows only `app_id` from validated request context
- **Billing Engine owns ALL billing data** — invoices, payments, credits, pricing — Portal is a UI consumer
- This separation ensures Backend API requires no changes when Gateway is extracted

### 10.3 Tech Stack (Confirmed)

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
| API Docs | **Scalar** (`@scalar/nextjs-api-reference`) — route: `/docs/api` |
| Document Storage | Cloud storage with server-side encryption |
| Deployment | Docker, Kubernetes (AWS ECS), GitHub Actions |
| Notification Service | In-App (WebSocket/SSE) + Email (existing SMTP) + LINE Messaging API |
| Charts/Visualization | **Chart.js** (used in mockup) — line charts, doughnut/gauge charts |

### 10.4 System Integration

| System | Integration |
|--------|-------------|
| Portal DB | Portal owns and manages all platform data |
| Backend API (realfact-api) | Embedded API Key middleware — validates via shared cache |
| Shared Cache (Redis) | Portal writes key data; middleware reads for runtime validation |
| Email Service | Notifications for approval/rejection, email verification |
| Document Storage | Upload/download for approval documents |
| Audit Log | All portal actions logged with who/what/when |
| Billing Engine (Billing Engine) | Portal reads invoice/credit data via API, submits payment intents and credit requests |
| LINE Messaging API | Push notifications to connected LINE accounts |
| Notification Service | In-App real-time notifications via WebSocket/SSE |

### 10.5 Module Boundary

**MVP (Embedded Gateway):**

```
┌────────────────────────────────────────────────────────────┐
│           Developer Portal (Management Plane)               │
│  • Developer/Admin UI, App CRUD, Key provisioning           │
│  • API Documentation (Scalar), Approval Workflow            │
│  • Document Upload/Review, Audit Log                        │
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

---

## 10.6 Logging Strategy

| Log Type | Generated By | Stored In | Read By | Retention |
|----------|-------------|-----------|---------|-----------|
| API Request Logs (runtime) | Embedded middleware | Portal DB (MVP), dedicated log store (future) | Developer (usage), Admin (analytics) | 90 days |
| Portal Audit Logs (management) | Portal controllers | Portal DB | Admin only | 1 year active, 7 years archived |

**Key design principles:**

- Portal UI reads logs via API — never queries storage directly
- Request logs written asynchronously (non-blocking to API response)
- Audit logs written synchronously — every portal action must be recorded
- MVP: both log types stored in Portal DB for simplicity
- Future: API Request Logs may migrate to dedicated log store (e.g., ClickHouse, BigQuery)

---

## 10.7 Billing Integration Architecture

```
┌─────────────────────────────┐      ┌──────────────────────────┐
│   Developer Portal          │      │   Billing Engine         │
│   (Billing UI)              │      │   (Billing Engine)              │
│                             │      │                          │
│   • View Credit Balance     │ API  │   • Invoice Generation   │
│   • View Invoices           │◄────►│   • Credit Management    │
│   • Submit Payment Intent   │      │   • Payment Processing   │
│   • Request Credit Increase │      │   • Payment Verification │
│                             │      │                          │
│   READ + Limited WRITE      │      │   Source of Truth         │
│   (payment intent, credit   │      │   (all billing data)     │
│    request only)            │      │                          │
└─────────────────────────────┘      └──────────────────────────┘
```

**Data ownership principle:**

- **Billing Engine owns ALL billing data** — invoices, payments, credits, pricing
- **Portal is a UI consumer** — reads billing data via API, submits payment intents and credit requests
- **Portal does NOT store billing data locally** — all billing reads go through Billing Engine API
- **Portal writes are limited to:** payment intent submissions and credit increase requests
- **Billing Engine generates events** (invoice created, payment verified) → Portal receives via webhook/polling for notifications

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Scenario | Target |
|----------|--------|
| Portal page load time | < 2 seconds |
| API docs rendering | < 3 seconds |
| App creation API response | < 1 second |
| API Key validation | < 100ms |
| Search responsiveness | < 500ms |
| Credential Generation | < 500ms |
| File Upload (10 MB) | < 5 seconds |
| Approval Status Check | < 200ms |
| Document Download | < 2 seconds |
| Analytics dashboard load | < 3 seconds |
| API log query (filtered) | < 2 seconds |
| Credit/Invoice page load | < 2 seconds |
| Notification delivery (In-App) | < 1 second |
| Notification delivery (Email) | < 30 seconds |
| Notification delivery (LINE) | < 5 seconds |
| CSV Export (10K rows) | < 10 seconds |

### 11.2 Security

| Requirement | Description |
|-------------|-------------|
| Password Storage | bcrypt with cost factor 12 |
| API Key Storage | SHA-256 hashed |
| Session Token | HTTP-only, Secure, SameSite=Strict cookies |
| HTTPS | Required for all endpoints (TLS 1.2+) |
| PDPA Compliance | สำหรับ developer personal data |
| OWASP Top 10 | Protection required |
| Rate limiting | On auth endpoints (brute-force protection) |
| JWT | With expiry for session management |
| Document Storage | Server-side encryption, access via time-limited signed URLs only |
| File Validation | Server-side file type validation (not just extension check) |

### 11.3 Availability

| Requirement | Target |
|-------------|--------|
| Developer Portal (public) | 99.9% uptime |
| Admin Portal (internal) | 99.5% uptime |
| API Documentation | 99.9% uptime |
| File Upload Service | 99.9% uptime |
| Billing UI | 99.9% uptime (dependent on Billing Engine API availability) |
| Notification Service | 99.5% uptime |

### 11.4 Scalability

- MVP: 200 concurrent developers, 50 apps per developer
- Scale target: 10,000 developers, 100,000 apps
- Stateless architecture (horizontal scaling)

### 11.5 Accessibility

- MVP: Basic (semantic HTML, keyboard navigation, color contrast)
- Future: WCAG 2.1 Level AA

### 11.6 Multi-language

- **MVP:** Thai + English (i18n from day one)

---

## 12. Release Plan

### Phase 1 — MVP (4–6 weeks)

- Developer: Registration, Login, Email Verification, Forgot Password, App CRUD, Sandbox API Key, API docs (Scalar)
- Developer: Submit for Production flow (3-step form + document upload)
- Admin: App approval workflow (approve/reject with reason)
- Admin: Developer list, Audit log, Dashboard
- Auth: Simple API Key + JWT session for portal
- i18n: Thai + English

### Phase 2 — Enhanced (6–8 weeks)

- Enhanced Dashboard (alerts, API status, credit balance, charts)
- Landing Page
- Collapsible Sidebar Navigation
- Enhanced App Cards (metrics, billing indicator)
- Usage Analytics
- API Logs (advanced filtering, export)
- Invoice List & Payment Flow
- Credit Management
- Settings Page (Profile, Security, Organization)
- Multi-channel Notifications (Email + In-App)
- Quick start guides, code snippets

### Phase 3 — Scale (6–8 weeks)

- Team Management (Members, Invite, Roles)
- LINE Notification channel
- Advanced team RBAC
- Webhook management
- API versioning + changelog
- Extract Gateway to separate service (API Gateway)
- SDK generation

---

## 13. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Scope creep (API Gateway features เข้ามาปน Portal) | High | High | ตั้ง boundary ชัด: Portal = management plane, Gateway = data plane |
| Developer adoption ต่ำ | High | Medium | UX research, quick start guides, responsive support |
| Security vulnerability ใน credential management | Critical | Medium | Security review, pen testing, industry-standard crypto |
| Admin approval bottleneck | Medium | Medium | 48-hour SLA target, pending count dashboard, notification badge |
| Integration complexity กับ existing systems | Medium | Medium | API-first design, clear interface contracts |
| API Key leaked | Medium | Medium | Show once, easy regenerate, enforce HTTPS, prefix for leak detection |
| File upload abuse | Low | Medium | Strict file size/count limits, file type validation, monitoring |
| Email delivery failure | Low | Low | Retry mechanism, status check endpoint |
| Billing engine dependency: Portal billing features dependent on Billing Engine API | High | Medium | Design fallback UI showing "Billing data temporarily unavailable", cache billing data with TTL |
| LINE API integration complexity: External dependency | Medium | Medium | LINE as optional channel, graceful degradation if LINE API is down |
| Team permission escalation: Role-based access bugs | High | Low | Thorough RBAC testing, audit logs for all role changes, principle of least privilege |
| Analytics data volume: Large log datasets impact performance | Medium | High | Pre-aggregation, caching, pagination, enforce max date range (90 days) |

---

## 14. Dependencies

| Dependency | Required Before |
|------------|-----------------|
| Auth system (JWT) | Portal launch |
| Internal APIs + OpenAPI spec | Portal launch |
| Email/Notification service | Approval flow |
| Document storage service | Approval flow |
| Redis (shared cache) | API Key validation |
| Infrastructure (domain, SSL, hosting) | Deployment |
| Billing Engine API (Billing Engine) | Credit/Invoice pages (Phase 2) |
| LINE Messaging API | LINE notifications (Phase 3) |
| Chart.js or equivalent | Analytics/Usage charts (Phase 2) |
| WebSocket/SSE infrastructure | In-App notifications (Phase 2) |

---

## 15. Data Migration

- ไม่มี — เริ่มจาก zero (confirmed)
- หากมี existing apps ก่อน deploy: auto-migrate to "approved" status

---

## 16. Future Phases (Out of Scope)

| Phase | Features |
|-------|----------|
| Phase 3 | Advanced team RBAC, Webhook management |
| Separate Module | Billing Engine (แยกเป็น service ต่างหาก), API Gateway (แยกเป็น service ต่างหาก) |
| Future | OAuth 2.0, SDK Generation, Multi-tenant white-label, GraphQL |

---

## 17. Open Questions

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | Should we support social login (Google/GitHub)? | Open | Consider for Phase 2 |
| 2 | Maximum apps per user? | Resolved | 10 apps |
| 3 | Session duration? | Resolved | 24 hours |
| 4 | Should there be auto-approval rules? | Resolved | No auto-approve in v1, consider Phase 2 |
| 5 | Should rate limits be configurable per app? | Open | Consider for Phase 2 (via API Gateway) |
| 6 | Should admin be notified of new approval requests? | Resolved | Yes, via pending count badge |
| 7 | Sandbox rate limit model? | Open | Needs alignment with Mockup (30 req lifetime vs daily limit) |
| 8 | Credit limit tiers (fixed or custom per organization)? | Open | Need to align with Billing Engine billing model |
| 9 | LINE notification format (text vs rich message)? | Open | Rich message preferred but depends on LINE API plan |
| 10 | Team member billing visibility (can Developer role see invoices)? | Open | Current mockup shows billing in sidebar for all roles |
| 11 | Analytics data granularity (hourly vs daily aggregation)? | Open | Daily aggregation for charts, hourly for detailed views |
| 12 | Payment method: support credit/debit card in v1? | Open | Mockup shows Bank Transfer + QR only. Card may be Phase 3. |

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

### Future (Separate Gateway — API Gateway)

| Data | Source of Truth | Runtime Read From |
|------|----------------|-------------------|
| API Keys | Portal DB | Shared cache (Redis) |
| App config/plan | Portal DB | Shared cache (Redis) |
| IP allowlists | Portal DB | Shared cache (Redis) |
| Request logs | Dedicated log store | Log API |

---

## Appendix B: Gateway Migration Path

| Phase | Architecture | Key Change |
|-------|-------------|------------|
| Phase 1 (MVP) | Embedded middleware in Backend API | Portal provisions keys, middleware validates via shared cache |
| Phase 2 | Extract to separate Gateway service (API Gateway) | Move validation + rate limiting out; Backend API returns to HMAC-only |
| Phase 3 (Scale) | Full API management | Dedicated log store, advanced analytics, circuit breaking |

**Design principle:** Each phase requires **zero changes to Developer Portal** — Portal always writes to the same shared cache, regardless of which service reads from it.

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| API Key | Credential for external developers (`rf-sk-xxxx`) — Bearer token |
| Scalar | Modern API documentation tool |
| OpenAPI | Specification for describing REST APIs (v3.0+) |
| Audit Log | Immutable record of system activities |
| Revoke | Temporarily disable an application (recoverable) |
| Sandbox | Default app mode with limited access for testing |
| Production | Full access mode after admin approval |
| Approval Request | Submission from developer requesting production access |
| Submission Number | Sequential counter for resubmissions (1, 2, 3...) |
| Shared Cache | Redis layer bridging Portal (writes) and middleware (reads) |
| Management Plane | Portal — provisions and manages platform data |
| Data Plane | Backend API / Gateway — enforces rules at runtime |
| Credit Line | Maximum billing credit allocated to an organization |
| Invoice | Billing document generated by Billing Engine for API usage charges |
| Payment Intent | Portal's request to Billing Engine to process a payment for an invoice |
| Team | Group of users belonging to the same organization |
| SP Admin | Super Platform Admin — highest role within a team/organization |
| In-App Notification | Real-time notification displayed within Portal UI via notification bell |
| LINE Notification | Push notification sent via LINE Messaging API to developer's linked LINE account |

---

## Appendix D: Notification Event x Channel Matrix

| Event | In-App | Email | LINE | Default State | Configurable |
|-------|--------|-------|------|---------------|-------------|
| App Approved | ON | ON | ON | All ON | Yes |
| App Rejected | ON | ON | ON | All ON | Yes |
| Invoice Created | ON | ON | OFF | In-App + Email | Yes |
| Invoice Overdue | ON | ON | ON | All ON | Yes |
| Credit Alert (Low Balance) | ON | ON | OFF | In-App + Email | Yes |
| Credit Request Submitted | ON | ON | OFF | In-App + Email | Yes |
| Credit Request Approved | ON | ON | OFF | In-App + Email | Yes |
| Credit Request Rejected | ON | ON | OFF | In-App + Email | Yes |
| Team Invite Received | ON | ON | OFF | In-App + Email | Yes |
| Team Member Joined | OFF | ON | OFF | Email only | Yes |
| API Anomaly Alert | ON | ON | OFF | In-App + Email | Yes |
| Payment Received | ON | ON | OFF | In-App + Email | Yes |
| Password Reset | OFF | ON (forced) | OFF | Email forced | No |
| Account Locked | OFF | ON (forced) | OFF | Email forced | No |
| Account Unlocked | OFF | ON (forced) | OFF | Email forced | No |

**Notes:**
- "Forced" means the user cannot disable this notification channel for this event
- LINE column is only active when the user has connected their LINE account via OAuth
- In-App notifications persist in notification list for 30 days
- Email notifications use branded HTML templates
- LINE notifications use LINE Flex Message format when available

---

## Appendix E: Billing/Credit Data Contract

> Portal is a UI consumer of billing data. Billing Engine is the source of truth for all billing, credit, invoice, and payment data.

### API Endpoints (Portal → Billing Engine)

| Method | Endpoint | Direction | Description |
|--------|----------|-----------|-------------|
| GET | `/api/billing/credit` | Read | Get current credit balance, limit, and usage for the organization |
| GET | `/api/billing/invoices` | Read | List invoices with filters (status, period, app, type). Supports pagination. |
| GET | `/api/billing/invoices/:id` | Read | Get invoice detail including line items, payment info |
| POST | `/api/billing/credit/request` | Write | Submit credit increase request (amount + reason) |
| POST | `/api/billing/invoices/:id/pay` | Write | Submit payment intent (method, slip upload, QR request) |
| GET | `/api/billing/credit/requests` | Read | List credit request history (status, dates, amounts) |

### Data Models (Reference)

**Credit Response (`GET /api/billing/credit`):**
```json
{
  "organization_id": "org-xxx",
  "credit_limit": 50000,
  "credit_used": 17550,
  "credit_available": 32450,
  "currency": "THB",
  "last_updated": "2026-03-30T10:00:00Z"
}
```

**Invoice List Item (`GET /api/billing/invoices`):**
```json
{
  "invoice_id": "INV-2026-0042",
  "date": "2026-03-01",
  "due_date": "2026-03-31",
  "amount": 8750.00,
  "tax": 612.50,
  "total": 9362.50,
  "currency": "THB",
  "status": "pending",
  "app_name": "SmartSearch Pro",
  "type": "monthly"
}
```

**Credit Request (`POST /api/billing/credit/request`):**
```json
{
  "requested_amount": 100000,
  "reason": "Expected increase in API usage due to product launch in Q2 2026"
}
```

**Payment Intent (`POST /api/billing/invoices/:id/pay`):**
```json
{
  "method": "bank_transfer",
  "slip_file_url": "https://storage.example.com/slips/xxx.pdf",
  "reference_number": "REF-20260330-001"
}
```

### Data Ownership Principle

- **Billing Engine is source of truth** for all billing data
- Portal **never caches billing data** beyond display (no local persistence)
- Portal **reads are always fresh** — API calls on page load (with short client-side cache for UX)
- Portal **writes are limited** to payment intents and credit requests
- Invoice generation, credit calculation, payment verification — all owned by Billing Engine

---

## Appendix F: Extended Glossary

> เพิ่มเติมจาก Appendix C — คำศัพท์เฉพาะสำหรับ features ใหม่ใน v5

| Term | Definition |
|------|------------|
| Credit Line | วงเงินเครดิตสูงสุดที่จัดสรรให้องค์กร (managed by Billing Engine) |
| Invoice | เอกสารเรียกเก็บเงินที่ generate โดย Billing Engine สำหรับค่าใช้งาน API |
| Payment Intent | คำร้องจาก Portal ไปยัง Billing Engine เพื่อประมวลผลการชำระเงินสำหรับ invoice |
| Team | กลุ่มผู้ใช้ที่อยู่ในองค์กรเดียวกัน สามารถแชร์ apps และ billing |
| SP Admin | Super Platform Admin — role สูงสุดภายในทีม/องค์กร มีสิทธิ์จัดการทุกอย่าง |
| Admin (Team Role) | สมาชิกทีมที่จัดการ apps และ billing ได้ แต่ไม่สามารถจัดการทีมหรือ settings |
| Developer (Team Role) | สมาชิกทีมที่ใช้งาน apps และดูข้อมูลได้ แต่ไม่สามารถจัดการ billing หรือทีม |
| In-App Notification | การแจ้งเตือนแบบ real-time ภายใน Portal UI ผ่าน notification bell icon |
| LINE Notification | การแจ้งเตือนแบบ push ผ่าน LINE Messaging API ไปยัง LINE account ที่เชื่อมต่อ |
| PromptPay | ระบบชำระเงินอิเล็กทรอนิกส์ของประเทศไทย ใช้สำหรับ QR Code payment |
| Credit Request | คำร้องขอเพิ่มวงเงินเครดิตจาก developer ไปยัง admin |
| Payment Slip | หลักฐานการโอนเงิน (PDF/JPG/PNG) ที่ upload เมื่อชำระผ่าน Bank Transfer |
| Trace ID | รหัสอ้างอิงเฉพาะของ API request สำหรับใช้ debug และติดต่อ support |
