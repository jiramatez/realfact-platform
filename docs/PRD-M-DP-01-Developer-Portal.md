> **⛔ DEPRECATED (2026-03-13)** — เอกสารนี้ถูกแทนที่โดย **PRD-M-DP-01-Developer-Portal-v4.md (v4.0.0)**
> v2 มี detail ที่ครบถ้วน (business rules, edge cases, user stories) แต่ใช้ HMAC auth ซึ่งถูกเปลี่ยนเป็น Simple API Key ใน v3+
> Detail ทั้งหมดถูก merge เข้า v4 แล้วโดยปรับจาก HMAC → API Key — **กรุณาใช้ v4 เป็น Source of Truth**

# Product Requirements Document (PRD)
# Module M-DP-01: Developer Portal

## Document Information

| Field | Value |
|-------|-------|
| Module | M-DP-01: Developer Portal |
| Version | 2.0.0 |
| Status | ~~Draft~~ **DEPRECATED — See v4.0.0** |
| Author | BA-Agent |
| Created Date | 2026-01-16 |
| Last Updated | 2026-02-17 |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-16 | BA-Agent | Initial baseline - Standalone Developer Portal with HMAC Signature, Scalar API Docs, Next.js tech stack, Forgot Password, PART A/B/C structure |
| 2.0.0 | 2026-02-17 | BA-Agent | **MAJOR:** Added App Approval Flow feature - Sandbox/Production two-tier system, approval workflow, document upload, email notifications, status-based rate limiting, Admin approval interface in Backoffice |

---

## 1. Executive Summary

### 1.1 Purpose

Module M-DP-01 (Developer Portal) is a **Standalone Open API Platform** that is completely separate from M-BE (Backoffice). It consists of:

- **Standalone User System**: Register/Login system separate from M-BE (Backoffice)
- **App Management**: Create, manage, and delete Applications
- **App Approval Flow (v2.0)**: Two-tier Sandbox/Production system with Platform Admin approval
- **HMAC Signature Authentication**: Client ID + Client Secret for API Authentication with status-based rate limiting
- **API Documentation**: Interactive API Docs with Scalar

### 1.2 Scope

| Aspect | Description |
|--------|-------------|
| **In Scope (Phase 1)** | User Registration/Login, Forgot Password, App Management, HMAC Credentials, API Documentation with Scalar |
| **In Scope (Phase 1.5 - App Approval)** | Sandbox Mode (100 calls/day), Production Approval Flow, Document Upload, Admin Review/Approve/Reject, Rejection Resubmission, Email Notifications, Status-based Rate Limiting |
| **Out of Scope** | Integration with M-BE (Backoffice), OAuth 2.0, Webhooks, Usage Analytics (Phase 2) |

### 1.3 Target Users

| User Type | Description | Capabilities |
|-----------|-------------|--------------|
| Developer | External developer who wants to use Open API | Register, Login, Create App, Submit for Production Approval, View API Docs |
| Platform Admin | Administrator of the Developer Portal (via Backoffice) | Review approval requests, Approve/Reject apps, Manage Users, Manage Apps, View Statistics |

---

## 2. Problem Statement

### 2.1 Current State

- No system for external Developers to connect to the Platform
- No API Documentation for Developers
- No Authentication system for Third-party Applications
- **No quality control**: Apps go live without review
- **No organization verification**: Developers can claim to represent any company
- **No compliance trail**: No record of who is using the platform for what purpose
- **Potential abuse risk**: No verification of legitimate use cases

### 2.2 Desired State

- Developer Portal where Developers can self-service
- Standalone User System for Developers
- Secure HMAC Signature Authentication
- Interactive API Documentation with Scalar
- **Two-tier access system**: Sandbox for immediate testing, Production requires approval
- **Organization verification**: Company documentation required for production access
- **Audit trail**: Clear record of approval decisions and reviewer identity
- **Developer-friendly**: Developers can test immediately without delays

### 2.3 Business Impact

| Impact Area | Current | Expected | Improvement |
|-------------|---------|----------|-------------|
| Developer Onboarding Time | N/A (manual) | Sandbox: immediate, Production: < 48 hours | Self-service with quality control |
| API Integration Support | Manual via email | Self-service docs | Reduced support burden |
| Quality Control | None (no approval) | Platform Admin review before production | Verified usage |
| Compliance | No audit trail | Full approval history with documents | Regulatory readiness |
| Abuse Prevention | No controls | Rate limiting + approval | Platform protection |

### 2.4 Key Design Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| User System | Standalone (separate from M-BE Backoffice) | Separation of concerns, independent deployment |
| Authentication | HMAC Signature | Secure, stateless, industry standard for APIs |
| API Docs | Scalar | Modern, interactive, developer-friendly |
| App Access | Two-tier (Sandbox/Production) | Balance developer experience with quality control |
| Approval | Manual Platform Admin review | Human oversight for production access (no auto-approve in v1) |
| Rate Limiting | Status-based (100/day sandbox, 10,000/day production) | Protect platform while allowing testing |

---

# ===============================================================
# PART A: CUSTOMER VIEW
# Developer (External Developers)
# ===============================================================

## 3. Customer Features

### 3.1 Feature Overview (Customer)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-C10.1 | User Registration | Developer | P0 | Register for Developer Portal |
| F-C10.2 | User Login | Developer | P0 | Login with Email/Password |
| F-C10.3 | User Profile | Developer | P1 | View and edit personal information |
| F-C10.4 | Create App | Developer | P0 | Create Application and receive Credentials (starts in Sandbox) |
| F-C10.5 | View Apps | Developer | P0 | View all Applications with status badges |
| F-C10.6 | View App Details | Developer | P0 | View details, Credentials, and Approval Status |
| F-C10.7 | Regenerate Secret | Developer | P0 | Generate new Client Secret |
| F-C10.8 | Revoke/Delete App | Developer | P0 | Disable or delete Application |
| F-C10.9 | View API Documentation | Developer | P0 | View Interactive API Docs (Scalar) |
| F-C10.10 | Resend Verification Email | Developer | P1 | Resend email verification |
| F-C10.11 | Forgot Password | Developer | P0 | Reset password via Email |
| **F-C10.12** | **Submit App for Production Approval** | Developer | **P0** | **Submit company info and documents for production access** |
| **F-C10.13** | **View Approval Status** | Developer | **P0** | **Track approval status and history** |
| **F-C10.14** | **Resubmit Rejected App** | Developer | **P0** | **Revise and resubmit after rejection** |

---

### 3.2 User Stories (Customer)

#### US-C10.1: User Registration

**As a** Developer
**I want** to register for a Developer Portal account
**So that** I can create apps and access the Open API

**Acceptance Criteria:**
- [ ] I can access the Registration page
- [ ] I fill in:
  - [ ] Email (required, unique, valid format)
  - [ ] Password (required, min 8 chars, must have uppercase, lowercase, number)
  - [ ] Confirm Password (required, must match)
  - [ ] Full Name (required)
  - [ ] Company/Organization (optional)
- [ ] I must accept Terms of Service
- [ ] After successful registration I receive a verification Email
- [ ] I must Verify Email before using the portal
- [ ] If Email is duplicate I see an error message

**UI/UX Notes:**
- Clean registration form
- Real-time validation
- Password strength indicator
- Success page with email verification instruction

**Business Rules:**
- BR-C10.1: Email must be unique in the system
- BR-C10.2: Password must meet minimum security requirements
- BR-C10.3: Email verification required before using the portal
- BR-C10.4: User system is completely separate from M-BE (Backoffice)
- BR-C10.35: Rate limit registration = 5 times/hour/IP

---

#### US-C10.2: User Login

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
- BR-C10.5: Lock account after 5 failed login attempts (30 minutes)
- BR-C10.6: Session timeout = 24 hours, token stored in HTTP-only cookie
- BR-C10.7: Record Login history
- BR-C10.34: Remember Me extends session to 7 days
- BR-C10.36: Rate limit login = 10 times/minute/IP

---

#### US-C10.3: User Profile

**As a** Logged-in Developer
**I want** to view and edit my profile
**So that** I can keep my information up to date

**Acceptance Criteria:**
- [ ] I see my information:
  - [ ] Email (read-only)
  - [ ] Full Name
  - [ ] Company/Organization
  - [ ] Registration Date
  - [ ] Email Verification Status
- [ ] I can edit Full Name and Company
- [ ] I can change Password (must enter current Password)
- [ ] I can Delete Account (must confirm)

**Business Rules:**
- BR-C10.8: Delete account = Delete all Apps owned by user
- BR-C10.9: Email cannot be changed

---

#### US-C10.4: Create App

**As a** Logged-in Developer
**I want** to create a new application
**So that** I can get credentials to access the Open API

**Acceptance Criteria:**
- [ ] I can click "Create App" from Dashboard
- [ ] I fill in App information:
  - [ ] App Name (required, unique per user)
  - [ ] Description (optional, max 500 chars)
- [ ] After creation the system displays:
  - [ ] Client ID (visible, copyable)
  - [ ] Client Secret (shown once, must copy immediately)
- [ ] I see a Warning that Client Secret will not be shown again
- [ ] I must Acknowledge that I have copied the Secret
- [ ] **App Status = Sandbox after creation (v2.0)**
- [ ] **I see a "Sandbox" badge on the new app (v2.0)**
- [ ] **I see information about sandbox limitations (100 API calls/day) (v2.0)**
- [ ] **I see a prompt to "Submit for Production" when ready (v2.0)**

**UI/UX Notes:**
- Simple create form
- Credentials modal with copy buttons
- Warning banner about secret visibility
- Checkbox to acknowledge before closing
- **Sandbox badge and rate limit info displayed prominently (v2.0)**

**Business Rules:**
- BR-C10.10: App Name must be unique within User
- BR-C10.11: Client ID format: `rf_client_<uuid>`
- BR-C10.12: Client Secret format: `rf_secret_<random_64_chars>`
- BR-C10.13: Client Secret stored as Hashed (bcrypt)
- BR-C10.14: Client Secret shown only once at creation
- BR-C10.15: Limit 10 Apps per User
- BR-C10.37: Rate limit app creation = 10 times/hour/user
- **BR-DP01.1: Apps start in sandbox status by default (v2.0)**
- **BR-DP01.2: Sandbox apps limited to 100 API requests/day (v2.0)**

---

#### US-C10.5: View Apps

**As a** Logged-in Developer
**I want** to view all my applications
**So that** I can manage them

**Acceptance Criteria:**
- [ ] I see Dashboard showing all my Apps
- [ ] Each App shows:
  - [ ] App Name
  - [ ] Client ID (truncated)
  - [ ] **Status Badge (Sandbox/Pending Approval/Approved/Rejected/Revoked) (v2.0)**
  - [ ] Created Date
  - [ ] Last Used Date
- [ ] I can Click to view Details
- [ ] I see Quick Stats: Total Apps, Active Apps
- [ ] **Status badges are color-coded (v2.0):**
  - [ ] **Sandbox: Gray**
  - [ ] **Pending Approval: Yellow (with pulse animation)**
  - [ ] **Approved: Green**
  - [ ] **Rejected: Red**
  - [ ] **Revoked: Dark gray**

**Business Rules:**
- BR-C10.16: Show only Apps owned by the logged-in user

---

#### US-C10.6: View App Details

**As a** Logged-in Developer
**I want** to view details of my application
**So that** I can see credentials, manage the app, and track approval status

**Acceptance Criteria:**
- [ ] I see all App information:
  - [ ] App Name
  - [ ] Description
  - [ ] Client ID (full, copyable)
  - [ ] Client Secret Status (Masked)
  - [ ] **Status (Sandbox/Pending Approval/Approved/Rejected/Revoked) (v2.0)**
  - [ ] Created Date
  - [ ] Last Used Date
  - [ ] **Current rate limit information (v2.0)**
- [ ] I can edit App Name and Description
- [ ] I see Action buttons:
  - [ ] Regenerate Secret
  - [ ] Revoke App
  - [ ] Delete App
  - [ ] **"Submit for Production" (visible only for sandbox apps) (v2.0)**
  - [ ] **"Revise and Resubmit" (visible only for rejected apps) (v2.0)**
- [ ] I see HMAC Authentication Guide
- [ ] **I see Approval Status Section (v2.0):**
  - [ ] **For sandbox: "Submit for Production" call-to-action**
  - [ ] **For pending_approval: Days since submission, estimated review time**
  - [ ] **For rejected: Rejection reason in alert box, "Revise and Resubmit" button**
  - [ ] **For approved: Production enabled badge, rate limit info (10,000/day)**
- [ ] **I see Approval Timeline showing status history (v2.0)**

**Business Rules:**
- BR-C10.17: Client Secret not shown after creation (only regenerate)
- BR-C10.18: Record Audit Log for every access

---

#### US-C10.7: Regenerate Secret

**As a** Logged-in Developer
**I want** to regenerate my app's Client Secret
**So that** I can rotate credentials for security

**Acceptance Criteria:**
- [ ] I can click "Regenerate Secret"
- [ ] System shows Confirmation Dialog with warnings
- [ ] After Confirm: New Secret generated, old Secret invalid immediately
- [ ] New Secret shown once (must copy)
- [ ] Audit Log recorded

**Business Rules:**
- BR-C10.19: Old secret invalidated immediately (no grace period)
- BR-C10.20: Record Audit Log with timestamp and IP

---

#### US-C10.8: Revoke/Delete App

**As a** Logged-in Developer
**I want** to revoke or delete my application
**So that** I can disable unused apps

**Acceptance Criteria:**

**Revoke:**
- [ ] I can Revoke App
- [ ] Revoked App cannot authenticate
- [ ] I can Re-activate App (must regenerate secret)
- [ ] Audit Log recorded

**Delete:**
- [ ] I can Delete App
- [ ] System shows Confirmation requiring me to type App Name
- [ ] Delete = Hard Delete (cannot recover)
- [ ] Audit Log recorded

**Business Rules:**
- BR-C10.21: Revoke = Soft disable (recoverable)
- BR-C10.22: Delete = Hard delete (permanent)
- BR-C10.23: Re-activate requires regenerating secret

---

#### US-C10.9: View API Documentation

**As a** Developer (logged-in or not)
**I want** to view interactive API documentation
**So that** I can understand how to use the Open API

**Acceptance Criteria:**
- [ ] I can access API Documentation (Public)
- [ ] I see Interactive API Docs powered by Scalar
- [ ] I see Authentication Guide (HMAC Signature)
- [ ] I see available Endpoints grouped by category
- [ ] I see Code examples in multiple languages
- [ ] I can "Try it out" (must enter credentials)
- [ ] Documentation auto-generated from OpenAPI spec

**Business Rules:**
- BR-C10.24: Documentation is Public (no login required)
- BR-C10.25: "Try it out" requires Client ID + Secret

---

#### US-C10.10: Resend Verification Email

**As a** Developer who has not yet verified email
**I want** to resend the verification email
**So that** I can verify my email if the original was lost or expired

**Acceptance Criteria:**
- [ ] I can click "Resend verification email" from Login page or Registration Success page
- [ ] System sends new verification email
- [ ] Previous token invalidated
- [ ] Rate limit: 3 times per hour

**Business Rules:**
- BR-C10.26: Rate limit resend verification = 3 times/hour
- BR-C10.27: Previous token invalidated when new one is sent
- BR-C10.28: Show generic message for security
- BR-C10.33: Verification token expires in 24 hours

---

#### US-C10.11: Forgot Password

**As a** Developer who forgot their password
**I want** to reset my password via email
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] I can click "Forgot Password" from Login page
- [ ] I enter my registered Email
- [ ] System shows generic message (security)
- [ ] Email has Reset Link that expires in 1 hour
- [ ] I click Link and enter new Password
- [ ] After Reset I am redirected to Login page
- [ ] Token is one-time use

**Business Rules:**
- BR-C10.29: Reset token expires in 1 hour
- BR-C10.30: Reset token can only be used once
- BR-C10.31: Rate limit forgot password = 3 times/hour/email
- BR-C10.32: Show generic message to prevent email enumeration

---

#### US-C10.12: Submit App for Production Approval (v2.0)

**As a** Logged-in Developer with a Sandbox app
**I want** to submit my app for production approval
**So that** I can get higher rate limits (10,000 calls/day) and production access

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
  - [ ] App continues to work in sandbox mode (100 calls/day) while pending
- [ ] I can navigate back/forward between steps without losing data
- [ ] Validation errors shown inline at the field level

**UI/UX Notes:**

```
+---------------------------------------------------------------+
| Submit for Production Approval                                 |
+---------------------------------------------------------------+
| Step [1] Company Info  >  [2] Documents  >  [3] Review        |
+---------------------------------------------------------------+
|                                                                |
| Company/Organization Name *                                    |
| [____________________________________]                         |
|                                                                |
| Business Registration Number                                   |
| [____________________________________]                         |
|                                                                |
| Business Address *                                             |
| [____________________________________]                         |
| [____________________________________]                         |
|                                                                |
| Use Case Description *                                         |
| [____________________________________]                         |
| [____________________________________]                         |
| [____________________________________]                         |
| 0/1000 characters (minimum 50)                                 |
|                                                                |
|                               [Back]  [Next: Upload Documents] |
+---------------------------------------------------------------+
```

```
+---------------------------------------------------------------+
| Submit for Production Approval                                 |
+---------------------------------------------------------------+
| Step [1] Company Info  >  [2] Documents  >  [3] Review        |
+---------------------------------------------------------------+
|                                                                |
| Upload Supporting Documents *                                  |
| (Business registration, company certificate, etc.)             |
|                                                                |
| +---------------------------------------------------+         |
| |                                                   |         |
| |     Drag & drop files here, or click to browse    |         |
| |     PDF, JPEG, PNG - Max 10MB per file            |         |
| |                                                   |         |
| +---------------------------------------------------+         |
|                                                                |
| Uploaded Files (1/5):                                          |
| +---------------------------------------------------+         |
| | business_reg.pdf          2.4 MB     [x Remove]   |         |
| +---------------------------------------------------+         |
|                                                                |
|                               [Back]  [Next: Review & Submit]  |
+---------------------------------------------------------------+
```

```
+---------------------------------------------------------------+
| Submit for Production Approval                                 |
+---------------------------------------------------------------+
| Step [1] Company Info  >  [2] Documents  >  [3] Review        |
+---------------------------------------------------------------+
|                                                                |
| Review Your Submission                                         |
|                                                                |
| Company Information:                                           |
|   Company Name:     ABC Corporation Co., Ltd.                  |
|   Registration No:  0105560123456                              |
|   Address:          123 Sukhumvit Rd, Bangkok 10110            |
|   Use Case:         We plan to integrate the AI chat API       |
|                     into our customer service platform...      |
|                                                                |
| Documents (1 file):                                            |
|   - business_reg.pdf (2.4 MB)                                  |
|                                                                |
| [x] I confirm all information is accurate                      |
|                                                                |
|                               [Back]  [Submit for Approval]    |
+---------------------------------------------------------------+
```

**Business Rules:**
- BR-DP01.1: Apps created by developers start in sandbox status by default
- BR-DP01.3: Production approval requires Platform Admin action (no auto-approve)
- BR-DP01.6: Use case description min 50 chars, max 1,000 chars
- BR-DP01.7: Business address min 10 chars
- BR-DP01.8: Documents: 1-5 files, max 10 MB each, PDF/JPG/PNG only
- BR-DP01.11: Pending and rejected apps remain in sandbox mode (100 calls/day)
- BR-DP01.14: All status changes trigger email notification to developer

---

#### US-C10.13: View Approval Status (v2.0)

**As a** Logged-in Developer
**I want** to view the approval status of my app
**So that** I can track the progress of my production approval request

**Acceptance Criteria:**
- [ ] I see the current approval status on the App Detail page
- [ ] Status displays include:
  - [ ] **Sandbox**: Gray badge, "Submit for Production" call-to-action
  - [ ] **Pending Approval**: Yellow badge, days since submission, estimated review time
  - [ ] **Approved**: Green badge, "Production Access Enabled", rate limit info
  - [ ] **Rejected**: Red badge, rejection reason, "Revise and Resubmit" button
  - [ ] **Revoked**: Dark gray badge, contact information
- [ ] I see an Approval Timeline showing:
  - [ ] When the app was created (sandbox)
  - [ ] When it was submitted for approval
  - [ ] When it was approved or rejected (with reviewer decision)
  - [ ] When it was resubmitted (if applicable)
- [ ] For rejected apps, the rejection reason is displayed prominently in a red alert box
- [ ] I see my current rate limit (100/day for sandbox, 10,000/day for production)

**UI/UX Notes:**

```
+---------------------------------------------------------------+
| App: My Customer Service Bot                                   |
+---------------------------------------------------------------+
| Status: [Rejected]                                             |
|                                                                |
| +-----------------------------------------------------------+ |
| | Rejection Reason:                                          | |
| | "Company registration documents are unclear. Please        | |
| |  upload official business registration certificate with    | |
| |  company stamp."                                           | |
| +-----------------------------------------------------------+ |
|                                                                |
| [Revise and Resubmit]                                          |
|                                                                |
| Approval Timeline:                                             |
| o Created (Sandbox)        2026-02-01 10:00                    |
| o Submitted for Approval   2026-02-05 14:30                    |
| x Rejected                 2026-02-06 09:15                    |
|                                                                |
| Rate Limit: 100 API calls/day (Sandbox)                        |
+---------------------------------------------------------------+
```

**Business Rules:**
- BR-DP01.11: Pending and rejected apps remain in sandbox mode (100 calls/day)
- BR-DP01.14: All status changes trigger email notification to developer

---

#### US-C10.14: Resubmit Rejected App (v2.0)

**As a** Logged-in Developer with a rejected app
**I want** to revise my submission and resubmit
**So that** I can address the reviewer's feedback and get production approval

**Acceptance Criteria:**
- [ ] I see "Revise and Resubmit" button on rejected apps only
- [ ] Clicking opens the same multi-step form as US-C10.12 (Submit for Approval)
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

**UI/UX Notes:**

```
+---------------------------------------------------------------+
| Revise and Resubmit                                            |
+---------------------------------------------------------------+
| Previous Rejection Reason:                                     |
| +-----------------------------------------------------------+ |
| | "Company registration documents are unclear. Please        | |
| |  upload official business registration certificate."       | |
| +-----------------------------------------------------------+ |
|                                                                |
| Step [1] Company Info  >  [2] Documents  >  [3] Review        |
+---------------------------------------------------------------+
| (Pre-filled form with previous data)                           |
|                                                                |
| Company/Organization Name *                                    |
| [ABC Corporation Co., Ltd._______________]                     |
| ...                                                            |
+---------------------------------------------------------------+
```

**Business Rules:**
- BR-DP01.5: Rejected developers can resubmit unlimited times
- BR-DP01.12: Each resubmission increments submission number
- BR-DP01.14: All status changes trigger email notification to developer

---

### 3.3 Customer User Flows

#### Flow 1: Developer Registration

```
[Landing Page] --> [Click "Sign Up"]
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
                   [Email Verified] --> [Login Page]
```

**Happy Path:**
1. User enters Landing Page
2. User clicks "Sign Up"
3. User fills in Registration form
4. User Submits form
5. System sends Verification Email
6. User clicks Link in Email
7. Email is Verified
8. User is redirected to Login page

---

#### Flow 2: Create App and Get Credentials (Updated v2.0)

```
[Dashboard] --> [Click "Create App"]
                       |
                       v
                 [App Form: Name, Description]
                       |
                       v
                 [Submit]
                       |
                       v
                 [Credentials Modal]
                 - Client ID (copy)
                 - Client Secret (copy, shown once!)
                 - Status: Sandbox (100 calls/day)
                       |
                       v
                 [Acknowledge checkbox]
                       |
                       v
                 [App Detail Page]
                 Status = Sandbox
                 "Submit for Production" button visible
```

**Happy Path:**
1. User is on Dashboard
2. User clicks "Create App"
3. User fills in App Name and Description
4. User Submits
5. System creates app with Sandbox status
6. System shows Credentials Modal with Client ID, Client Secret, and Sandbox badge
7. User copies credentials and acknowledges
8. User is taken to App Detail page showing Sandbox status and "Submit for Production" button

---

#### Flow 3: Submit App for Production Approval (v2.0)

```
[App Detail (Sandbox)] --> [Click "Submit for Production"]
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
                            [App still works: 100 calls/day]
```

**Happy Path:**
1. User views a Sandbox app's detail page
2. User clicks "Submit for Production"
3. User fills in company information (Step 1)
4. User uploads supporting documents (Step 2)
5. User reviews and confirms submission (Step 3)
6. System changes app status to "Pending Approval"
7. System sends confirmation email to developer
8. App continues to function in sandbox mode (100 calls/day)

**Alternative Path(s):**
- At Step 3: User navigates back to Step 1 or 2 to edit information before submitting
- At Step 2: User removes uploaded file and uploads a different one

**Exception Path(s):**
- At Step 1: If required fields are missing or invalid, see Error Scenarios
- At Step 2: If file is too large or wrong format, see Error Scenarios
- At Step 2: If user uploads more than 5 files, see Error Scenarios

---

#### Flow 4: Approval Outcomes (v2.0)

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
[10,000 calls/day]        |
[Approval Email]          v
                    [Revise and Resubmit]
                          |
                          v
                    [Pending Approval Again]
                    [Resubmission Email]
```

**Happy Path (Approved):**
1. Admin approves the app
2. System changes status to "Approved"
3. System sends approval email to developer
4. Developer's app rate limit increases to 10,000 calls/day
5. Developer sees "Production Access Enabled" badge

**Alternative Path (Rejected then Resubmitted):**
1. Admin rejects the app with a reason
2. System changes status to "Rejected"
3. System sends rejection email with reason to developer
4. Developer reviews rejection reason
5. Developer clicks "Revise and Resubmit"
6. Developer modifies submission and resubmits
7. System changes status back to "Pending Approval"
8. System sends resubmission email to developer

---

#### Flow 5: API Authentication (with Status-based Rate Limiting v2.0)

```
[Developer App] --> [Prepare Request with HMAC]
                          |
                          v
                    [Send Request to API]
                          |
                          v
                    [Server Validates Signature]
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
[100/day] [10K/day] [Blocked]
    |         |
    v         v
[Check Rate] [Check Rate]
    |         |
    v         v
[Under limit?] [Under limit?]
  Yes|  No|     Yes|  No|
    v    v       v    v
[Process] [429]  [Process] [429]
```

**Happy Path:**
1. Developer app prepares request with HMAC signature
2. Server validates signature
3. Server checks app status and rate limit
4. If within limits: process request and return response
5. If over limit: return rate limit exceeded error with upgrade message

---

### 3.4 Customer Business Rules Summary

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-C10.1 | Email must be unique in the system | US-C10.1 |
| BR-C10.2 | Password: min 8 chars, uppercase, lowercase, number | US-C10.1 |
| BR-C10.3 | Email verification required before using the portal | US-C10.1 |
| BR-C10.4 | User system is separate from M-BE (Backoffice) | All |
| BR-C10.5 | Lock account after 5 failed login attempts (30 minutes) | US-C10.2 |
| BR-C10.6 | Session timeout = 24 hours, token in HTTP-only cookie | US-C10.2 |
| BR-C10.7 | Record Login history | US-C10.2 |
| BR-C10.8 | Delete account = Delete all Apps | US-C10.3 |
| BR-C10.9 | Email cannot be changed | US-C10.3 |
| BR-C10.10 | App Name must be unique within User | US-C10.4 |
| BR-C10.11 | Client ID format: `rf_client_<uuid>` | US-C10.4 |
| BR-C10.12 | Client Secret format: `rf_secret_<random_64_chars>` | US-C10.4 |
| BR-C10.13 | Client Secret stored as Hashed (bcrypt) | US-C10.4 |
| BR-C10.14 | Client Secret shown only once at creation | US-C10.4 |
| BR-C10.15 | Limit 10 Apps per User | US-C10.4 |
| BR-C10.16 | Show only Apps owned by logged-in User | US-C10.5 |
| BR-C10.17 | Client Secret not shown after creation | US-C10.6 |
| BR-C10.18 | Record Audit Log for every access | US-C10.6 |
| BR-C10.19 | Old secret invalidated immediately | US-C10.7 |
| BR-C10.20 | Audit Log with timestamp and IP | US-C10.7 |
| BR-C10.21 | Revoke = Soft disable (recoverable) | US-C10.8 |
| BR-C10.22 | Delete = Hard delete (permanent) | US-C10.8 |
| BR-C10.23 | Re-activate requires regenerating secret | US-C10.8 |
| BR-C10.24 | Documentation is Public | US-C10.9 |
| BR-C10.25 | "Try it out" requires Client ID + Secret | US-C10.9 |
| BR-C10.26 | Rate limit resend verification = 3 times/hour | US-C10.10 |
| BR-C10.27 | Previous token invalidated when new one sent | US-C10.10 |
| BR-C10.28 | Generic message for security | US-C10.10 |
| BR-C10.29 | Reset token expires in 1 hour | US-C10.11 |
| BR-C10.30 | Reset token is one-time use | US-C10.11 |
| BR-C10.31 | Rate limit forgot password = 3 times/hour/email | US-C10.11 |
| BR-C10.32 | Generic message to prevent email enumeration | US-C10.11 |
| BR-C10.33 | Verification token expires in 24 hours | US-C10.10 |
| BR-C10.34 | Remember Me extends session to 7 days | US-C10.2 |
| BR-C10.35 | Rate limit registration = 5 times/hour/IP | US-C10.1 |
| BR-C10.36 | Rate limit login = 10 times/minute/IP | US-C10.2 |
| BR-C10.37 | Rate limit app creation = 10 times/hour/user | US-C10.4 |
| BR-C10.38 | Audit Logs archive 7 years for compliance | US-A10.4 |
| **BR-DP01.1** | **Apps start in sandbox status by default** | **US-C10.4, US-C10.12** |
| **BR-DP01.2** | **Sandbox apps limited to 100 API requests/day** | **US-C10.4, US-C10.12** |
| **BR-DP01.3** | **Production approval requires Platform Admin action (no auto-approve)** | **US-C10.12, US-A10.6** |
| **BR-DP01.4** | **Rejection requires reason (min 20 chars, max 500 chars)** | **US-A10.6** |
| **BR-DP01.5** | **Rejected developers can resubmit unlimited times** | **US-C10.14** |
| **BR-DP01.6** | **Use case description min 50 chars, max 1,000 chars** | **US-C10.12** |
| **BR-DP01.7** | **Business address min 10 chars** | **US-C10.12** |
| **BR-DP01.8** | **Documents: 1-5 files, max 10 MB each, PDF/JPG/PNG only** | **US-C10.12** |
| **BR-DP01.9** | **Approved apps get 10,000 API calls/day rate limit** | **US-C10.13** |
| **BR-DP01.10** | **Revoked apps get 0 API calls (blocked)** | **US-C10.8** |
| **BR-DP01.11** | **Pending and rejected apps remain in sandbox mode (100 calls/day)** | **US-C10.12, US-C10.13** |
| **BR-DP01.12** | **Each resubmission increments submission number** | **US-C10.14** |
| **BR-DP01.13** | **Admin approval/rejection creates audit log entry** | **US-A10.6** |
| **BR-DP01.14** | **All status changes trigger email notification to developer** | **All Approval Features** |

#### Edge Cases (v2.0 - App Approval)

> **Reference:** Checklist from `requirements_analysis.md` > "Edge Case Identification"
> **Reference:** Framework from `scenario_analysis.md` > "Edge Case Analysis Guide"

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-C10.1 | Input Boundary | Developer submits use case description with exactly 50 characters (minimum) | Submission accepted at boundary | Accept and proceed normally |
| EC-C10.2 | Input Boundary | Developer uploads a file that is exactly 10 MB | Upload accepted at boundary | Accept the file |
| EC-C10.3 | Data Boundary | Developer has already submitted for approval and tries to submit again | Cannot submit twice | Hide "Submit for Production" button when status is pending_approval |
| EC-C10.4 | State/Timing | Developer's app is approved while they are editing a resubmission | Resubmission is no longer needed | Show notification that app has been approved, close form |
| EC-C10.5 | State/Timing | Developer deletes app while approval is pending | Approval request becomes orphaned | Cancel pending approval request when app is deleted |
| EC-C10.6 | Data Boundary | Developer reaches 100 API calls/day in sandbox, then submits for production | Still limited to 100/day until approved | Display message explaining sandbox limits remain until approval |
| EC-C10.7 | Integration | File upload service is temporarily unavailable | Cannot upload documents | Show error: "File upload temporarily unavailable. Please try again later." |
| EC-C10.8 | State/Timing | Admin revokes an app that has a pending approval | App should be blocked and approval cancelled | Set status to "revoked", cancel pending approval request |

### 3.5 Customer Error Scenarios

> **Reference:** `scenario_analysis.md` > "Error Scenario Enhancement" for Categories and Severity definitions

| Scenario | Category | Severity | User Action | Expected Message | Recovery |
|----------|----------|----------|-------------|------------------|----------|
| Email already registered | Validation | Medium | Register with existing email | "Email already registered" | Use another email or login |
| Email not verified | Business Rule | Medium | Login with unverified email | "Please verify your email first" | Click resend verification |
| Login failed | Validation | Medium | Wrong password | "Invalid email or password" | Retry or reset password |
| Account locked | Business Rule | High | Login wrong 5 times | "Account locked. Try again in 30 minutes" | Wait 30 minutes |
| App name duplicate | Validation | Medium | Create app with existing name | "App name already exists" | Use different name |
| App limit reached | Business Rule | High | Create app beyond limit (10) | "Maximum apps (10) reached" | Delete unused apps |
| Invalid signature | Business Rule | Medium | Wrong HMAC signature | 401: "Invalid signature" | Check signature generation |
| Timestamp expired | Validation | Medium | Timestamp older than 5 min | 401: "Timestamp expired" | Use current timestamp |
| App revoked | Business Rule | High | Use credentials of revoked app | 401: "Client revoked" | Re-activate or create new |
| **Use case too short** | **Validation** | **Medium** | **Enter use case < 50 chars** | **"Use case description must be at least 50 characters"** | **Add more detail** |
| **File too large** | **Validation** | **Medium** | **Upload file > 10 MB** | **"File size exceeds 10 MB limit"** | **Compress or split file** |
| **Wrong file type** | **Validation** | **Medium** | **Upload .docx or .zip** | **"Only PDF, JPEG, and PNG files are accepted"** | **Convert to accepted format** |
| **Too many files** | **Validation** | **Medium** | **Upload more than 5 files** | **"Maximum 5 files per submission"** | **Remove extra files** |
| **No files uploaded** | **Validation** | **Medium** | **Submit without documents** | **"At least 1 supporting document is required"** | **Upload at least 1 file** |
| **Rate limit exceeded (sandbox)** | **Business Rule** | **Medium** | **Make 101st API call in sandbox** | **"Rate limit exceeded (100 requests/day). Submit for production approval to increase to 10,000/day."** | **Wait for reset or submit for approval** |
| **Rate limit exceeded (production)** | **Business Rule** | **Medium** | **Make 10,001st API call** | **"Rate limit exceeded (10,000 requests/day). Contact support for higher limits."** | **Wait for reset or contact support** |
| **Submit with missing required fields** | **Validation** | **Medium** | **Skip company name or address** | **"Company name is required" / "Business address is required"** | **Fill in required fields** |
| **File upload failed** | **System** | **High** | **Network error during upload** | **"File upload failed. Please try again."** | **Retry upload** |

---

# ===============================================================
# PART B: ADMIN VIEW
# Platform Admin (via Backoffice)
# ===============================================================

## 4. Admin Features

### 4.1 Feature Overview (Admin)

| Feature ID | Feature Name | User | Priority | Description |
|------------|--------------|------|----------|-------------|
| F-A10.0 | Admin Authentication | Platform Admin | P0 | Login to Admin Portal |
| F-A10.1 | View All Developers | Platform Admin | P1 | View list of all Developers |
| F-A10.2 | View All Apps | Platform Admin | P0 | View list of all Apps |
| F-A10.3 | Admin Revoke App | Platform Admin | P0 | Revoke any Developer's App |
| F-A10.4 | View Audit Logs | Platform Admin | P1 | View Audit Logs |
| F-A10.5 | View Statistics | Platform Admin | P1 | View Platform Statistics (Dashboard) |
| **F-A10.6** | **Review Approval Requests** | **Platform Admin** | **P0** | **View, approve, or reject app approval requests** |

---

### 4.2 User Stories (Admin)

#### US-A10.0: Admin Authentication

**As a** Platform Admin
**I want** to login to the Admin Portal
**So that** I can manage developers, apps, and review approval requests

**Acceptance Criteria:**
- [ ] I can access Admin Login page (separate URL from Developer Login)
- [ ] I enter Email and Password
- [ ] After Login I am redirected to Admin Dashboard
- [ ] If wrong I see generic error
- [ ] Session timeout = 8 hours

**Business Rules:**
- BR-A10.1: Admin accounts are separate from Developer accounts
- BR-A10.2: Admin accounts created by Super Admin only
- BR-A10.3: Lock admin account after 3 failed login attempts (Super Admin unlock required)
- BR-A10.4: Admin session timeout = 8 hours
- BR-A10.17: Admin cannot reuse last 5 passwords
- BR-A10.18: Admin password: min 12 chars + uppercase + lowercase + number + special character

---

#### US-A10.1: View All Developers

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
- BR-A10.5: Admin can only view (Read-Only) for Phase 1
- BR-A10.6: Record Audit Log when Admin views developer data

---

#### US-A10.2: View All Apps

**As a** Platform Admin
**I want** to view all applications across all developers
**So that** I can monitor API usage and identify suspicious apps

**Acceptance Criteria:**
- [ ] I see list of all Apps with: App Name, Developer Email, Client ID, **Status (Sandbox/Pending/Approved/Rejected/Revoked) (v2.0)**, Created Date, Last Used Date
- [ ] I can Search by App Name, Developer Email, Client ID
- [ ] I can Filter by **Status (Sandbox/Pending/Approved/Rejected/Revoked/All) (v2.0)**, Date Range
- [ ] I see Quick Stats: Total Apps, **Sandbox Apps, Pending Approval, Approved Apps, Rejected Apps (v2.0)**, Revoked Apps

**Business Rules:**
- BR-A10.7: Admin sees full Client ID
- BR-A10.8: Admin does NOT see Client Secret

---

#### US-A10.3: Admin Revoke App

**As a** Platform Admin
**I want** to revoke any application
**So that** I can disable abusive or suspicious apps immediately

**Acceptance Criteria:**
- [ ] I can Revoke any App from App Details page
- [ ] System shows Confirmation Dialog with reason field (required, min 10 chars)
- [ ] After Revoke: App disabled, Developer notified by email, Audit Log recorded

**Business Rules:**
- BR-A10.9: Revoke must include Reason (min 10 chars)
- BR-A10.10: Send Email notification to Developer automatically
- BR-A10.11: Record Audit Log with Admin ID, Reason, Timestamp

---

#### US-A10.4: View Audit Logs

**As a** Platform Admin
**I want** to view audit logs of all activities
**So that** I can track security events and troubleshoot issues

**Acceptance Criteria:**
- [ ] I see list of Audit Logs with: Timestamp, Actor, Action Type, Resource, IP Address
- [ ] I can Search, Filter by Date/Action/Actor Type
- [ ] I can expand to see full Details (JSON)
- [ ] I can Export to CSV

**Business Rules:**
- BR-A10.12: Audit Logs retained 1 year active
- BR-A10.13: Audit Logs are Read-Only (Immutable)
- BR-A10.14: Record Audit Log when Admin views Audit Logs

---

#### US-A10.5: View Platform Statistics

**As a** Platform Admin
**I want** to view platform usage statistics
**So that** I can monitor platform health and growth

**Acceptance Criteria:**
- [ ] I see Summary Cards: Total Developers, Total Apps, Active/Revoked ratio, New Developers (7d), New Apps (7d)
- [ ] **I see Approval Stats: Pending Count, Approved Today, Average Review Time (v2.0)**
- [ ] I see Charts: Developer Registration Trend (30d), App Creation Trend (30d)
- [ ] I see Recent Activity: 10 latest Audit Logs
- [ ] **I see Pending Approval notification badge on sidebar (v2.0)**

**Business Rules:**
- BR-A10.15: Statistics calculated real-time or cached (max 5 minutes stale)
- BR-A10.16: Dashboard accessible to Platform Admin and Super Admin

---

#### US-A10.6: Review Approval Requests (v2.0)

**As a** Platform Admin
**I want** to review, approve, or reject app approval requests
**So that** I can verify developer organizations and control production access

**Acceptance Criteria:**

**Approval Request List:**
- [ ] I see a dedicated "Approval Requests" section in the Backoffice
- [ ] I see Quick Stats cards at the top:
  - [ ] Total Pending (with count)
  - [ ] Approved Today (with count)
  - [ ] Average Review Time (in hours)
- [ ] I see a filter bar:
  - [ ] Status dropdown: All / Pending / Approved / Rejected
  - [ ] Date range picker
  - [ ] Search by app name or developer email
- [ ] I see a data table with columns:
  - [ ] App Name
  - [ ] Developer Email
  - [ ] Company Name
  - [ ] Submitted Date
  - [ ] Days Pending
  - [ ] Status (Pending/Approved/Rejected)
  - [ ] Actions (View Details, Quick Approve, Quick Reject)
- [ ] Table supports sorting by any column
- [ ] Pagination (20 per page)
- [ ] **Pending requests sorted by oldest first (FIFO) by default**

**Approval Request Detail:**
- [ ] I see full details of an approval request organized in tabs:
  - **Overview Tab:**
    - [ ] App information (name, client ID, created date)
    - [ ] Developer information (email, name, registered date)
    - [ ] Company information (name, registration number, address, use case)
  - **Documents Tab:**
    - [ ] List of uploaded documents with download buttons
    - [ ] File preview capability (for images and PDFs)
  - **History Tab:**
    - [ ] Timeline of all submissions for this app
    - [ ] Previous rejection reasons (if any)
    - [ ] Submission number indicator
- [ ] I see floating action buttons: Approve (green) / Reject (red)

**Approve Action:**
- [ ] Clicking "Approve" shows a Confirmation Dialog:
  - [ ] App Name and Developer Email displayed
  - [ ] Summary of what happens after approval:
    - App moved to production
    - Rate limit increased to 10,000 calls/day
    - Developer receives approval email
  - [ ] "Cancel" and "Confirm Approve" buttons
- [ ] After confirming:
  - [ ] App status changes to "Approved"
  - [ ] Approval email sent to developer
  - [ ] Audit Log recorded with Admin ID and timestamp
  - [ ] Success notification displayed

**Reject Action:**
- [ ] Clicking "Reject" shows a Rejection Dialog:
  - [ ] App Name displayed
  - [ ] Warning: "Please provide clear, actionable feedback so the developer can revise and resubmit."
  - [ ] Rejection Reason textarea (required, min 20 chars, max 500 chars, with character counter)
  - [ ] "Cancel" and "Confirm Reject" buttons (Reject button disabled until reason is valid)
- [ ] After confirming:
  - [ ] App status changes to "Rejected"
  - [ ] Rejection email sent to developer with the reason
  - [ ] Audit Log recorded with Admin ID, reason, and timestamp
  - [ ] Success notification displayed

**UI/UX Notes:**

```
+------------------------------------------------------------------------+
| Approval Requests                                                       |
+------------------------------------------------------------------------+
| [Pending: 5]    [Approved Today: 3]    [Avg Review: 12 hours]          |
+------------------------------------------------------------------------+
| [Search: _______________]  Status: [All v]  Date: [From] [To]          |
+------------------------------------------------------------------------+
| App Name         | Developer       | Company    | Submitted | Days | St|
|------------------|-----------------|------------|-----------|------|---|
| My Chat Bot      | dev@abc.com     | ABC Corp   | Feb 15    | 2    | P |
| Service API      | admin@xyz.com   | XYZ Tech   | Feb 14    | 3    | P |
| Analytics Tool   | data@acme.com   | Acme Inc   | Feb 10    | 7    | P |
+------------------------------------------------------------------------+
| Actions:                                                                |
| My Chat Bot     [View Details] [Approve] [Reject]                      |
+------------------------------------------------------------------------+
| Showing 1-3 of 5                                      [< 1 2 >]       |
+------------------------------------------------------------------------+
```

```
+------------------------------------------------------------------------+
| Approval Request: My Chat Bot                    [Approve] [Reject]    |
+------------------------------------------------------------------------+
| Tabs: [Overview] [Documents] [History]                                  |
+------------------------------------------------------------------------+
| Overview:                                                               |
|                                                                         |
| App Information:                                                        |
|   Name:       My Chat Bot                                               |
|   Client ID:  rf_client_abc123...                                       |
|   Created:    2026-02-10                                                |
|                                                                         |
| Developer Information:                                                  |
|   Email:      dev@abc.com                                               |
|   Name:       John Smith                                                |
|   Registered: 2026-01-20                                                |
|                                                                         |
| Company Information:                                                    |
|   Company:    ABC Corporation Co., Ltd.                                 |
|   Reg. No:    0105560123456                                             |
|   Address:    123 Sukhumvit Rd, Bangkok 10110                           |
|   Use Case:   We plan to integrate the AI chat API into our            |
|               customer service platform to provide 24/7 automated       |
|               support for our retail customers...                       |
+------------------------------------------------------------------------+
```

**Business Rules:**
- BR-DP01.3: Production approval requires Platform Admin action (no auto-approve)
- BR-DP01.4: Rejection requires reason (min 20 chars, max 500 chars)
- BR-DP01.13: Admin approval/rejection creates audit log entry
- BR-DP01.14: All status changes trigger email notification to developer

---

### 4.3 Admin User Flows

#### Flow 1: Admin Revoke Suspicious App

```
[Admin Dashboard] --> [View All Apps]
                            |
                            v
                      [Search/Filter Apps]
                            |
                            v
                      [Click App Detail] --> [Click "Revoke"]
                            |
                            v
                      [Enter Reason] --> [Confirm Revoke]
                            |
                            v
                      [App Revoked, Email Sent, Audit Log]
```

**Happy Path:**
1. Admin navigates to View All Apps
2. Admin searches or filters for suspicious app
3. Admin clicks on App Detail
4. Admin clicks "Revoke"
5. Admin enters reason and confirms
6. App is revoked, Developer notified by email, Audit Log recorded

---

#### Flow 2: Admin Approves App for Production (v2.0)

```
[Admin Dashboard] --> [Approval Requests]
                            |
                            v
                      [View Pending Requests]
                            |
                            v
                      [Click Request Detail]
                            |
                            v
                      [Review: Company Info, Documents, History]
                            |
                            v
                      [Click "Approve"]
                            |
                            v
                      [Confirmation Dialog]
                            |
                            v
                      [Confirm Approve]
                            |
                            v
                      [App = Approved, Email Sent, Audit Log]
```

**Happy Path:**
1. Admin navigates to Approval Requests
2. Admin sees list of pending requests (sorted oldest first)
3. Admin clicks on a request to view details
4. Admin reviews company information, documents, and submission history
5. Admin clicks "Approve"
6. Admin confirms in the confirmation dialog
7. App status changes to "Approved"
8. Developer receives approval email
9. Audit Log recorded

---

#### Flow 3: Admin Rejects App (v2.0)

```
[Admin Dashboard] --> [Approval Requests]
                            |
                            v
                      [Click Request Detail]
                            |
                            v
                      [Review Details]
                            |
                            v
                      [Click "Reject"]
                            |
                            v
                      [Enter Rejection Reason]
                      (min 20 chars, max 500 chars)
                            |
                            v
                      [Confirm Reject]
                            |
                            v
                      [App = Rejected, Email with Reason Sent, Audit Log]
```

**Happy Path:**
1. Admin navigates to Approval Requests
2. Admin clicks on a request to view details
3. Admin reviews and decides to reject
4. Admin clicks "Reject"
5. Admin enters clear, actionable rejection reason (min 20 chars)
6. Admin confirms rejection
7. App status changes to "Rejected"
8. Developer receives rejection email with reason
9. Audit Log recorded with reason

**Alternative Path:**
- At Step 5: Admin starts typing reason but decides to cancel and go back to review

---

### 4.4 Admin Business Rules Summary

| Rule ID | Rule Description | Applies To |
|---------|------------------|------------|
| BR-A10.1 | Admin accounts are separate from Developer accounts | US-A10.0 |
| BR-A10.2 | Admin accounts created by Super Admin only | US-A10.0 |
| BR-A10.3 | Lock admin account after 3 failed login attempts | US-A10.0 |
| BR-A10.4 | Admin session timeout = 8 hours | US-A10.0 |
| BR-A10.5 | Admin can only view (Read-Only) for Developer data | US-A10.1 |
| BR-A10.6 | Record Audit Log when Admin views data | All Admin Features |
| BR-A10.7 | Admin sees full Client ID | US-A10.2 |
| BR-A10.8 | Admin does NOT see Client Secret | US-A10.2 |
| BR-A10.9 | Revoke must include Reason (min 10 chars) | US-A10.3 |
| BR-A10.10 | Send Email notification on revoke | US-A10.3 |
| BR-A10.11 | Audit Log with Admin ID, Reason, Timestamp | US-A10.3 |
| BR-A10.12 | Audit Logs retained 1 year | US-A10.4 |
| BR-A10.13 | Audit Logs are Read-Only (Immutable) | US-A10.4 |
| BR-A10.14 | Record Audit Log when Admin views Audit Logs | US-A10.4 |
| BR-A10.15 | Statistics real-time or cached (max 5 min) | US-A10.5 |
| BR-A10.16 | Dashboard for Platform Admin and Super Admin | US-A10.5 |
| BR-A10.17 | Admin cannot reuse last 5 passwords | US-A10.0 |
| BR-A10.18 | Admin password: min 12 chars + special character | US-A10.0 |
| **BR-DP01.3** | **Production approval requires Platform Admin action** | **US-A10.6** |
| **BR-DP01.4** | **Rejection requires reason (min 20 chars, max 500 chars)** | **US-A10.6** |
| **BR-DP01.13** | **Approval/rejection creates audit log entry** | **US-A10.6** |

#### Edge Cases (v2.0 - Admin Approval)

| Edge Case ID | Category | Scenario | User Impact | Handling |
|-------------|----------|----------|-------------|----------|
| EC-A10.1 | State/Timing | Two admins try to approve/reject the same request simultaneously | Second admin's action may conflict | Show message: "This request has already been processed by another admin." |
| EC-A10.2 | State/Timing | Admin opens request detail, but developer deletes the app before admin acts | Approval request becomes invalid | Show message: "This app has been deleted by the developer." |
| EC-A10.3 | Data Boundary | Approval request has no documents (data integrity issue) | Admin cannot properly review | Show warning: "No documents found for this request." with option to reject |
| EC-A10.4 | Integration | Document download fails (storage service unavailable) | Admin cannot view documents | Show error: "Unable to download document. Please try again later." |
| EC-A10.5 | State/Timing | Developer resubmits while admin is reviewing the previous submission | Admin may be reviewing stale data | Show notification: "Developer has submitted an updated version. Please refresh." |

### 4.5 Admin Capabilities Matrix

| Capability | Platform Admin | Super Admin | Notes |
|------------|----------------|-------------|-------|
| View all Developers | Yes | Yes | Read-only |
| Edit Developer data | No | Yes | Future Phase |
| Delete Developer | No | Yes | Future Phase |
| View all Apps | Yes | Yes | - |
| Revoke any App | Yes | Yes | Requires reason |
| Delete any App | No | Yes | Future Phase |
| **Approve App for Production** | **Yes** | **Yes** | **v2.0** |
| **Reject App** | **Yes** | **Yes** | **v2.0, requires reason** |
| View Audit Logs | Yes | Yes | - |
| Export Audit Logs | Yes | Yes | - |
| System Configuration | No | Yes | Future Phase |

### 4.6 Admin Error Scenarios

| Scenario | Category | Severity | Admin Action | Expected Message | Recovery |
|----------|----------|----------|--------------|------------------|----------|
| Admin login failed | Validation | Medium | Wrong password | "Invalid email or password" | Retry |
| Admin account locked | Business Rule | High | Login wrong 3 times | "Account locked. Contact Super Admin" | Contact Super Admin |
| Admin session expired | System | Medium | Work after 8 hours | "Session expired. Please login again" | Re-login |
| Revoke without reason | Validation | Medium | Revoke app without reason | "Reason is required (min 10 characters)" | Enter reason |
| App already revoked | Business Rule | Low | Revoke already-revoked app | "App is already revoked" | No action needed |
| **Reject without reason** | **Validation** | **Medium** | **Reject without entering reason** | **"Rejection reason is required (min 20 characters)"** | **Enter reason** |
| **Reject reason too short** | **Validation** | **Medium** | **Enter rejection reason < 20 chars** | **"Rejection reason must be at least 20 characters"** | **Add more detail** |
| **Request already processed** | **Business Rule** | **Low** | **Approve/reject already-processed request** | **"This request has already been processed"** | **Refresh the page** |
| **App deleted during review** | **Business Rule** | **Medium** | **Try to approve deleted app** | **"This app has been deleted by the developer"** | **Close the request** |
| **Document download failed** | **Integration** | **Medium** | **Try to download document** | **"Unable to download. Please try again later."** | **Retry later** |

---

# ===============================================================
# PART C: SHARED SPECIFICATIONS
# ===============================================================

## 5. App Status Model (v2.0)

### 5.1 Status Definitions

| Status | Description | Rate Limit | Can Submit for Approval | Can Authenticate |
|--------|-------------|------------|------------------------|------------------|
| **sandbox** | Default status after app creation | 100 calls/day | Yes | Yes |
| **pending_approval** | Developer submitted for production approval | 100 calls/day | No (already submitted) | Yes |
| **approved** | Platform Admin approved for production | 10,000 calls/day | No (already approved) | Yes |
| **rejected** | Platform Admin rejected with reason | 100 calls/day | Yes (resubmit) | Yes |
| **revoked** | Admin or developer disabled the app | 0 calls/day | No | No |

### 5.2 Status Transition Diagram

```
[Create App] --> [sandbox] --(submit for approval)--> [pending_approval]
                    |                                        |
                    |                                   +----+----+
                    |                                   |         |
                    |                             [approved]  [rejected]
                    |                                   |         |
                    |                                   |    (resubmit)
                    |                                   |         |
                    |                                   |  [pending_approval]
                    |                                   |
                    +---(admin/developer revoke)--------+-------> [revoked]
```

### 5.3 Valid Status Transitions

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

## 6. Email Notifications (v2.0)

### 6.1 Email Templates

| Template | Trigger | Recipient | Key Content |
|----------|---------|-----------|-------------|
| Welcome Email | After registration | Developer | Welcome message, verification link |
| Email Verification | Registration / Resend | Developer | Verification link (expires 24 hours) |
| Password Reset | Forgot Password request | Developer | Reset link (expires 1 hour) |
| Password Changed | After password reset | Developer | Confirmation, security tips |
| App Revoked (Admin) | Admin revokes app | Developer | App name, reason, contact info |
| **App Submitted** | **Developer submits for approval** | **Developer** | **App name, submission date, estimated review time (48 hours), tracking link** |
| **App Approved** | **Admin approves app** | **Developer** | **App name, production access details, new rate limit (10,000/day), Client ID reminder** |
| **App Rejected** | **Admin rejects app** | **Developer** | **App name, rejection reason, clear next steps, resubmit link** |
| **App Resubmitted** | **Developer resubmits after rejection** | **Developer** | **App name, submission number, submitted date, estimated review time, tracking link** |

### 6.2 Email Content Specifications (v2.0)

#### App Submitted Email

| Field | Content |
|-------|---------|
| Subject | "App Submitted for Approval - [App Name]" |
| Greeting | "Hi [Developer Name]," |
| Body | "Your app '[App Name]' has been successfully submitted for production approval." |
| Details | Submitted date/time, Estimated review time: 48 hours |
| Call to Action | "Track Approval Status" button linking to app detail page |
| Footer | "Questions? Contact us at support@realfact.ai" |

#### App Approved Email

| Field | Content |
|-------|---------|
| Subject | "Your App is Approved - [App Name]" |
| Greeting | "Hi [Developer Name]," |
| Body | "Great news! Your app '[App Name]' has been approved for production use." |
| Details | Production access enabled, Rate limit: 10,000 API calls/day, Client ID reminder |
| Call to Action | "View App Details" button linking to app detail page |
| Tone | Congratulatory, encouraging |

#### App Rejected Email

| Field | Content |
|-------|---------|
| Subject | "Action Required: App Needs Revision - [App Name]" |
| Greeting | "Hi [Developer Name]," |
| Body | "We've reviewed your app '[App Name]' and it needs some revisions before approval." |
| Rejection Reason | Displayed prominently in a highlighted box |
| Next Steps | 1) Review the feedback, 2) Update information or documents, 3) Resubmit for review |
| Note | "You can resubmit your app as many times as needed." |
| Call to Action | "Revise and Resubmit" button linking to resubmission page |
| Footer | "Questions? Contact us at support@realfact.ai" |

#### App Resubmitted Email

| Field | Content |
|-------|---------|
| Subject | "App Resubmitted for Review - [App Name]" |
| Greeting | "Hi [Developer Name]," |
| Body | "Your app '[App Name]' has been resubmitted for production approval." |
| Details | Submission number (e.g., "#2"), Submitted date/time, Estimated review time: 48 hours |
| Call to Action | "Track Status" button linking to app detail page |

---

## 7. HMAC Signature Authentication

### 7.1 Overview

HMAC (Hash-based Message Authentication Code) is used for authenticating API requests:
- Client creates Signature from request data + Client Secret
- Server verifies Signature to authenticate

### 7.2 Signature Generation

```
Signature = HMAC-SHA256(client_secret, string_to_sign)

string_to_sign = HTTP_METHOD + "\n" +
                 REQUEST_PATH + "\n" +
                 TIMESTAMP + "\n" +
                 REQUEST_BODY_HASH
```

### 7.3 Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `X-Client-ID` | Client ID of the App | `rf_client_abc123...` |
| `X-Timestamp` | Unix timestamp (seconds) | `1704700800` |
| `X-Signature` | HMAC-SHA256 signature (hex) | `a1b2c3d4...` |

### 7.4 Signature Validation Rules

| Rule | Description |
|------|-------------|
| Timestamp Check | Must be within 5 minutes of current time |
| Client ID Check | Must be Active and Valid |
| Signature Check | Must match computed signature |
| Replay Prevention | Timestamp + Signature combination used only once |
| **Status Check (v2.0)** | **App must not be revoked; rate limit applied based on status** |

### 7.5 Rate Limiting by App Status (v2.0)

| App Status | Rate Limit | Reset Window |
|------------|------------|--------------|
| sandbox | 100 requests/day | Daily at midnight UTC |
| pending_approval | 100 requests/day | Daily at midnight UTC |
| approved | 10,000 requests/day | Daily at midnight UTC |
| rejected | 100 requests/day | Daily at midnight UTC |
| revoked | 0 (blocked) | N/A |

**Rate Limit Exceeded Response includes:**
- Current status
- Current limit
- Requests made today
- Reset time
- Upgrade message (for sandbox/pending/rejected apps): "Submit your app for production approval to increase your rate limit to 10,000 requests/day."

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Scenario | Target |
|----------|--------|
| Page Load | < 2 seconds |
| API Response (auth validation) | < 100ms |
| API Documentation Load | < 3 seconds |
| Credential Generation | < 500ms |
| **File Upload (10 MB)** | **< 5 seconds** |
| **Approval Status Check** | **< 200ms** |
| **Rate Limit Check** | **< 10ms overhead** |
| **Document Download** | **< 2 seconds** |

### 8.2 Security

| Requirement | Description |
|-------------|-------------|
| Password Storage | bcrypt with cost factor 12 |
| Client Secret Storage | bcrypt hashed |
| Session Token | HTTP-only, Secure, SameSite=Strict cookies |
| HTTPS | Required for all endpoints |
| HMAC Algorithm | SHA-256 |
| **Document Storage** | **Server-side encryption, access via time-limited signed URLs only** |
| **File Validation** | **Server-side file type validation (not just extension check)** |

### 8.3 Availability

| Requirement | Target |
|-------------|--------|
| Developer Portal | 99.9% uptime |
| API Gateway | 99.9% uptime |
| API Documentation | 99.9% uptime |
| **File Upload Service** | **99.9% uptime** |

---

## 9. Success Metrics

| Metric | Definition | Target | Measurement |
|--------|------------|--------|-------------|
| Developer Registration | New developers per month | Growing | Monthly |
| App Creation Rate | New apps per month | Growing | Monthly |
| API Docs Page Views | Documentation views | Tracking | Weekly |
| Registration to First App | Time from register to first app | < 15 minutes | Continuous |
| API Authentication Success Rate | % of successful auth calls | > 99% | Daily |
| **Approval Turnaround Time** | **Time from submission to decision** | **< 48 hours** | **Continuous** |
| **First-time Approval Rate** | **% of apps approved on first submission** | **Majority approved first time** | **Monthly** |
| **Resubmission Rate** | **% of rejected apps that resubmit** | **Tracking (lower is better)** | **Monthly** |

---

## 10. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Client Secret leaked | Medium | High | Show Secret once, easy Regenerate, enforce HTTPS |
| Replay attacks | Low | Medium | Timestamp validation + nonce tracking |
| Brute force login | Medium | Medium | Account lockout after 5 failed attempts |
| Abuse by developers | Low | Medium | Admin revoke capability, Usage monitoring |
| Email delivery failure | Low | Low | Retry mechanism, status check endpoint |
| HMAC misconfiguration | High | Low | Clear documentation, Code examples |
| **Admin approval bottleneck** | **Medium** | **Medium** | **48-hour SLA target, pending count dashboard, notification badge** |
| **File upload abuse** | **Low** | **Medium** | **Strict file size/count limits, file type validation, monitoring** |
| **Existing apps migration** | **Low** | **High** | **Auto-migrate existing apps to "approved" status, thorough testing** |

---

## 11. Future Phases (Out of Scope)

| Phase | Features |
|-------|----------|
| Phase 2 | Usage Analytics, Webhooks, Admin Management, OAuth 2.0 Integration, Auto-approval rules |
| Phase 3 | Integration with M-BE (Backoffice), Team Management |
| Phase 4 | SDK Generation, Sandbox Environment |

---

## 12. Data Migration (v2.0)

### 12.1 Existing Apps Migration

All existing apps in production at the time of deployment must be migrated to "approved" status to maintain continuity:

- All existing apps receive "approved" status automatically
- No existing apps will lose access or experience downtime
- Only new apps created after deployment will start in "sandbox" status
- Migration must be verified to ensure zero disruption

---

## 13. Open Questions

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | Should we support social login (Google/GitHub)? | Open | Consider for Phase 2 |
| 2 | Maximum apps per user? | Resolved | 10 apps |
| 3 | Session duration? | Resolved | 24 hours |
| 4 | HMAC timestamp tolerance? | Resolved | 5 minutes |
| 5 | Should Admin be able to delete Developers? | Resolved | Super Admin only, Phase 2 |
| 6 | **Should there be auto-approval rules?** | **Resolved** | **No auto-approve in v1, consider for Phase 2** |
| 7 | **Should rate limits be configurable per app?** | **Open** | **Consider for Phase 2** |
| 8 | **Should admin be notified of new approval requests?** | **Resolved** | **Yes, via pending count badge on dashboard** |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| HMAC | Hash-based Message Authentication Code |
| Client ID | Public identifier for an application |
| Client Secret | Confidential credential for signature generation |
| Scalar | Modern API documentation tool |
| OpenAPI | Specification for describing REST APIs |
| Audit Log | Immutable record of system activities |
| Revoke | Temporarily disable an application (recoverable) |
| **Sandbox** | **Default app mode with limited rate (100 calls/day) for testing** |
| **Production** | **Full access mode (10,000 calls/day) after admin approval** |
| **Approval Request** | **A submission from a developer requesting production access for their app** |
| **Submission Number** | **Sequential counter for resubmissions (1, 2, 3...)** |

---

## Appendix A: HMAC Signature Code Examples

### JavaScript/Node.js

```javascript
const crypto = require('crypto');

function generateSignature(method, path, timestamp, body, clientSecret) {
  const bodyHash = body
    ? crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex')
    : '';

  const stringToSign = [method, path, timestamp, bodyHash].join('\n');

  return crypto
    .createHmac('sha256', clientSecret)
    .update(stringToSign)
    .digest('hex');
}
```

### Python

```python
import hmac
import hashlib
import time
import json

def generate_signature(method, path, timestamp, body, client_secret):
    body_hash = ''
    if body:
        body_hash = hashlib.sha256(json.dumps(body).encode()).hexdigest()

    string_to_sign = f"{method}\n{path}\n{timestamp}\n{body_hash}"

    return hmac.new(
        client_secret.encode(),
        string_to_sign.encode(),
        hashlib.sha256
    ).hexdigest()
```

---

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-16 | BA-Agent | Initial baseline - Standalone Developer Portal |
| 2.0.0 | 2026-02-17 | BA-Agent | Added App Approval Flow - Sandbox/Production two-tier system |

---

## Appendix: Multi-Tenancy and Sub-Platform Alignment

> **Reference:** [X-MT-01 Multi-Tenancy Platform PRD](../X-MT-01-Multi-Tenancy/PRD-X-MT-01-Multi-Tenancy-Platform.md)
> **Impact Level:** Major

### MT-DP01.1 Overview

Developer Portal must expand from single-portal experience to **per-Sub-Platform experience** supporting different branding (logo, theme, favicon) per Sub-Platform domain (e.g., avatar.realfact.ai, booking.realfact.ai). SSO login must redirect Developer to the correct Sub-Platform based on domain. Additionally, **Tenant Admin features** for self-service: plan upgrade/downgrade, token top-up, billing history, team management, and branding customization (White-label V1: Logo + Theme + Favicon).

**Supported Sub-Platforms:** Avatar, Booking, Social Listening, AI Live Commerce, MRP

> **Note:** Multi-Tenancy features are documented separately in X-MT-01. The App Approval Flow (v2.0) is independent of Multi-Tenancy and applies to all Sub-Platforms equally.
