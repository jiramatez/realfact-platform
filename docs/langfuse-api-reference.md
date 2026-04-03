# Langfuse API Reference สำหรับ Admin Dashboard

> เอกสารนี้สรุปวิธีดึงข้อมูลจาก Langfuse API สำหรับสร้าง Admin Dashboard
> ทดสอบจริงกับ Langfuse local dev (`localhost:3002`) เมื่อ 2026-03-03 — ผ่านทุก endpoint

---

## 1. Data Flow Overview

```
HTTP Request (Headers: X-RF-Developer-Id, X-RF-App-Id, X-RF-Key-Type)
  │
  ▼
Gateway Middleware (gateway_auth.go)
  │  ดึง developer_id, app_id, key_type จาก headers
  ▼
Invoke Handler (invoke_handler.go)
  │  เพิ่ม session_id, service_name, flow_id เข้า context
  ▼
Flow Executor (executor.go)
  │  เพิ่ม node_type (agent/llm/router/form_field)
  ▼
AI Client (anthropic.go / openai.go)
  │  สร้าง OTel span + set attributes:
  │  - gen_ai.usage.input_tokens / output_tokens (จาก LLM API response)
  │  - langfuse.session.id, langfuse.trace.tags
  │  - langfuse.trace.metadata.* (flow_id, app_id, service_slug, node_type)
  │  - langfuse.environment, langfuse.release
  ▼
OTel Collector (otel-collector-config.yaml)
  │  1. PII Masking (email, api_key, auth headers)
  │  2. Langfuse Enrichment: developer_id → langfuse.user.id
  │  3. Langfuse Filter: เฉพาะ spans ที่มี gen_ai.system
  │
  ├──→ ClickHouse (ALL spans)
  └──→ Langfuse (เฉพาะ LLM spans ผ่าน OTLP HTTP)
```

---

## 2. Authentication

```bash
# Basic Auth: PUBLIC_KEY:SECRET_KEY
# Local dev credentials:
-u "pk-lf-realfact-dev:sk-lf-realfact-dev"

# หรือใช้ header:
AUTH=$(echo -n 'pk-lf-realfact-dev:sk-lf-realfact-dev' | base64)
-H "Authorization: Basic $AUTH"
```

**Base URL:** `http://localhost:3002/api/public`

---

## 3. ข้อมูลสำคัญที่ดึงได้

### 3.1 ระดับ Trace (1 trace = 1 API request)

| Field | ตัวอย่างจริง | อธิบาย | ใช้ทำอะไรใน Dashboard |
|-------|-------------|--------|---------------------|
| `userId` | `dev-test-001` | developer_id (map จาก `langfuse.user.id`) | Per-developer usage tracking |
| `sessionId` | `e2e-session-001` | กลุ่ม conversation | Session history view |
| `tags` | `["gpt-4", "sandbox", "student"]` | keyType + serviceName + model | Filter/grouping |
| `totalCost` | `0.00435` | USD — Langfuse คำนวณอัตโนมัติ | Cost dashboard |
| `latency` | `4.011` | วินาที | Performance monitoring |
| `metadata.flow_id` | `3cc37904-...` | Service UUID | Service-level analytics |
| `metadata.service_slug` | `student` | ชื่อ AI Service | Service-level analytics |
| `metadata.node_type` | `llm` | ประเภท node | Node analysis |
| `metadata.app_id` | `app-test-001` | App ของ developer | Per-app usage tracking |
| `environment` | `development` | deployment environment | Env filtering |
| `release` | `0.1.0` | BUILDER_VERSION | Release tracking |

### 3.2 ระดับ Observation (1 observation = 1 LLM call)

| Field | ตัวอย่างจริง | อธิบาย |
|-------|-------------|--------|
| `model` | `gpt-4` | LLM model ที่ใช้ |
| `usageDetails.input` | `70` | input tokens |
| `usageDetails.output` | `49` | output tokens |
| `usageDetails.total` | `119` | total tokens |
| `costDetails.input` | `0.0021` | USD input cost |
| `costDetails.output` | `0.00294` | USD output cost |
| `costDetails.total` | `0.00504` | USD total cost |
| `latency` | `1.92` | วินาที |
| `input` | `[{role, content}...]` | prompt messages (JSON array) |
| `output` | `[{role, content}...]` | completion (JSON array) |

### 3.3 ระดับ Daily Metrics (aggregated)

| Field | ตัวอย่างจริง | อธิบาย |
|-------|-------------|--------|
| `date` | `2026-03-03` | วันที่ |
| `countTraces` | `14` | จำนวน traces ทั้งวัน |
| `countObservations` | `14` | จำนวน LLM calls ทั้งวัน |
| `totalCost` | `0.2293` | USD รวมทั้งวัน |
| `usage[].model` | `gpt-4` | แยกตาม model |
| `usage[].inputUsage` | `1273` | input tokens รวม |
| `usage[].outputUsage` | `3185` | output tokens รวม |
| `usage[].totalUsage` | `4458` | total tokens รวม |
| `usage[].totalCost` | `0.2293` | USD รวมต่อ model |

---

## 4. Curl Commands (ทดสอบแล้ว ✅)

### 4.1 ดู Traces ล่าสุด

```bash
curl -s "http://localhost:3002/api/public/traces?limit=5" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

<details>
<summary>ตัวอย่างผลลัพธ์</summary>

```json
{
  "data": [{
    "id": "9e464f47e08d8fbd...",
    "userId": "0598b2aa-2e64-4300-98d0-9b5b3c7c25d8",
    "sessionId": null,
    "tags": ["gpt-4", "student"],
    "totalCost": 0.00504,
    "latency": 1.92,
    "environment": "development",
    "release": "0.1.0",
    "metadata": {
      "flow_id": "3cc37904-...",
      "service_slug": "student",
      "node_type": "llm",
      "app_id": "04cc44dd-..."
    }
  }],
  "meta": { "page": 1, "limit": 5, "totalItems": 14, "totalPages": 3 }
}
```

</details>

### 4.2 Filter Traces ตาม Developer ID

```bash
curl -s "http://localhost:3002/api/public/traces?userId=dev-test-001&limit=10" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

> `userId` ใน Langfuse = `developer_id` ของระบบ RealFact
> (ถูก map โดย OTel Collector: `developer_id` → `langfuse.user.id`)

<details>
<summary>ตัวอย่างผลลัพธ์</summary>

```json
{
  "data": [{
    "id": "3a278227afa2accb...",
    "userId": "dev-test-001",
    "sessionId": "e2e-session-001",
    "tags": ["gpt-4", "sandbox", "student"],
    "totalCost": 0.00435,
    "latency": 4.011,
    "metadata": {
      "flow_id": "3cc37904-...",
      "service_slug": "student",
      "node_type": "llm",
      "app_id": "app-test-001"
    }
  }],
  "meta": { "totalItems": 8 }
}
```

</details>

### 4.3 Filter Traces ตาม Tag

```bash
# ดู traces ที่มี tag "sandbox" (keyType = sandbox)
curl -s "http://localhost:3002/api/public/traces?tags=sandbox&limit=10" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

<details>
<summary>ตัวอย่างผลลัพธ์</summary>

```
7 traces with tag "sandbox":
  user=dev-test-001 | tags=[gpt-4, sandbox, student] | cost=$0.00435 | session=e2e-session-001
  user=dev-test-001 | tags=[gpt-4, sandbox, student] | cost=$0.04527 | session=none
  user=dev-test-001 | tags=[gpt-4, sandbox, student] | cost=$0.00738 | session=none
  ...
```

</details>

### 4.4 ดู Observations (LLM Generations) พร้อม Token Usage + Cost

```bash
curl -s "http://localhost:3002/api/public/observations?type=GENERATION&limit=5" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

<details>
<summary>ตัวอย่างผลลัพธ์</summary>

```json
{
  "data": [{
    "id": "dc17f29b0d1d0f70",
    "name": "chat gpt-4",
    "model": "gpt-4",
    "type": "GENERATION",
    "latency": 1.92,
    "usageDetails": { "input": 70, "output": 49, "total": 119 },
    "costDetails": { "input": 0.0021, "output": 0.00294, "total": 0.00504 },
    "metadata": {
      "attributes": {
        "developer_id": "0598b2aa-...",
        "langfuse.trace.metadata.app_id": "04cc44dd-...",
        "langfuse.trace.metadata.node_type": "llm",
        "langfuse.trace.metadata.service_slug": "student",
        "gen_ai.usage.input_tokens": "70",
        "gen_ai.usage.output_tokens": "49"
      }
    },
    "input": [{"role": "system", "content": "..."}],
    "output": [{"role": "assistant", "content": "..."}]
  }]
}
```

</details>

### 4.5 Filter Observations ตาม Developer ID

```bash
curl -s "http://localhost:3002/api/public/observations?userId=0598b2aa-2e64-4300-98d0-9b5b3c7c25d8&limit=10" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

### 4.6 Daily Metrics (Aggregated Token Usage + Cost รายวัน)

```bash
curl -s "http://localhost:3002/api/public/metrics/daily?page=1" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

<details>
<summary>ตัวอย่างผลลัพธ์</summary>

```json
{
  "data": [{
    "date": "2026-03-03",
    "countTraces": 14,
    "countObservations": 14,
    "totalCost": 0.229289999999,
    "usage": [{
      "model": "gpt-4",
      "inputUsage": 1273,
      "outputUsage": 3185,
      "totalUsage": 4458,
      "totalCost": 0.229289999999,
      "countObservations": 14,
      "countTraces": 14
    }]
  }],
  "meta": { "page": 1, "limit": 50, "totalItems": 1, "totalPages": 1 }
}
```

</details>

### 4.7 List Sessions

```bash
curl -s "http://localhost:3002/api/public/sessions?limit=10" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

<details>
<summary>ตัวอย่างผลลัพธ์</summary>

```json
{
  "data": [
    { "id": "e2e-session-001", "createdAt": "2026-03-03T04:38:26Z", "environment": "development" },
    { "id": "test-session-001", "createdAt": "2026-03-03T04:34:36Z", "environment": "development" }
  ],
  "meta": { "totalItems": 2, "totalPages": 1 }
}
```

</details>

### 4.8 Filter Sessions ตาม Date Range

```bash
curl -s "http://localhost:3002/api/public/sessions?fromTimestamp=2026-03-03T00:00:00Z&limit=10" \
  -u "pk-lf-realfact-dev:sk-lf-realfact-dev"
```

---

## 5. Endpoint Summary

| # | Endpoint | Method | สถานะ | ใช้ทำอะไร |
|---|----------|--------|-------|----------|
| 1 | `/api/public/traces` | GET | ✅ | List/filter traces ตาม userId, tags, session |
| 2 | `/api/public/observations` | GET | ✅ | List/filter LLM generations พร้อม token+cost |
| 3 | `/api/public/sessions` | GET | ✅ | List sessions (conversation groups) |
| 4 | `/api/public/metrics/daily` | GET | ✅ | Aggregated daily token usage + cost แยกตาม model |
| 5 | `/api/public/health` | GET | ✅ | Health check |

---

## 6. Query Parameters

### `/api/public/traces`

| Parameter | Type | อธิบาย |
|-----------|------|--------|
| `userId` | string | filter by developer_id (e.g., `dev-test-001`) |
| `tags` | string | filter by tag (e.g., `sandbox`, `gpt-4`) |
| `sessionId` | string | filter by session |
| `environment` | string | filter by environment |
| `fromTimestamp` | ISO 8601 | traces after this time |
| `toTimestamp` | ISO 8601 | traces before this time |
| `limit` | number | max results (default 10, max 100) |
| `page` | number | page number |

### `/api/public/observations`

| Parameter | Type | อธิบาย |
|-----------|------|--------|
| `userId` | string | filter by developer_id |
| `type` | string | filter: `GENERATION`, `SPAN`, `EVENT` |
| `name` | string | filter by span name |
| `traceId` | string | filter by specific trace |
| `fromStartTime` | ISO 8601 | observations after this time |
| `toStartTime` | ISO 8601 | observations before this time |
| `limit` / `page` | number | pagination |

### `/api/public/sessions`

| Parameter | Type | อธิบาย |
|-----------|------|--------|
| `fromTimestamp` | ISO 8601 | sessions created after this date |
| `limit` / `page` | number | pagination |

### `/api/public/metrics/daily`

| Parameter | Type | อธิบาย |
|-----------|------|--------|
| `traceName` | string | filter by trace name |
| `userId` | string | filter by user |
| `tags` | string | filter by tags |
| `fromTimestamp` | ISO 8601 | metrics after this date |
| `toTimestamp` | ISO 8601 | metrics before this date |
| `page` | number | pagination |

---

## 7. Dashboard Widget → API Mapping

| Dashboard Widget | Endpoint | Query |
|-----------------|----------|-------|
| **รวม Token Usage วันนี้** | `GET /metrics/daily` | ดู `usage[].totalUsage` |
| **Total Cost วันนี้** | `GET /metrics/daily` | ดู `totalCost` |
| **Usage แยกตาม Model** | `GET /metrics/daily` | ดู `usage[]` array (แต่ละ model เป็น 1 entry) |
| **Traces per Developer** | `GET /traces?userId={id}` | ดู `meta.totalItems` |
| **Cost per Developer** | `GET /traces?userId={id}` | sum `totalCost` จากทุก traces |
| **Recent Traces** | `GET /traces?limit=20` | แสดง list |
| **Session History** | `GET /sessions` → `GET /traces?sessionId={id}` | 2-step query |
| **Filter by Tag/keyType** | `GET /traces?tags=sandbox` | filter |
| **LLM Call Detail** | `GET /observations?type=GENERATION&traceId={id}` | ดู input/output/tokens |
| **Per-App Usage** | `GET /observations` → filter client-side | filter `metadata.attributes.langfuse.trace.metadata.app_id` |

---

## 8. ข้อสังเกตจากการทดสอบ

1. **Cost คำนวณอัตโนมัติ** — Langfuse มี built-in pricing table สำหรับ models ที่รู้จัก
   - gpt-4: $0.03/1K input tokens, $0.06/1K output tokens
   - ไม่ต้องคำนวณเอง ดู `costDetails.total` หรือ `totalCost` ได้เลย

2. **`app_id` ไม่มี query param โดยตรง** — ต้องดึง observations แล้ว filter ฝั่ง client ตาม `metadata.attributes.langfuse.trace.metadata.app_id`

3. **Tags เป็น array** — filter ด้วย `?tags=sandbox` จะ match traces ที่มี tag `sandbox` อยู่ใน array ใดตำแหน่งก็ได้

4. **Metadata structure** — Langfuse v3 เก็บ OTel attributes ใน `metadata.attributes` (ไม่ใช่ top-level)
   - ตัวอย่าง: `metadata.attributes.langfuse.trace.metadata.app_id`

5. **Pagination** — ทุก endpoint ใช้ page-based (`page` + `limit`) พร้อม `meta` object ที่มี `totalItems` และ `totalPages`

6. **Langfuse user.id = developer_id** — OTel Collector transform ใน `otel-collector-config.yaml` จะ copy `developer_id` → `langfuse.user.id` ก่อนส่งเข้า Langfuse

7. **เฉพาะ LLM spans เข้า Langfuse** — Filter ใน OTel Collector (`filter/langfuse_only`) จะ drop spans ที่ไม่มี `gen_ai.system` attribute ดังนั้น Langfuse จะมีเฉพาะ LLM generation data เท่านั้น (spans อื่นๆ เช่น HTTP, business logic อยู่ใน ClickHouse)

---

## 9. Source Code Reference

| Component | File | หน้าที่ |
|-----------|------|--------|
| Gateway Middleware | `services/agentic-builder/backend/internal/middleware/gateway_auth.go` | ดึง developer_id, app_id จาก HTTP headers |
| Context Utils | `services/agentic-builder/backend/internal/ctxutil/ctxutil.go` | Store/retrieve context values (developer_id, session_id, app_id, etc.) |
| Invoke Handler | `services/agentic-builder/backend/internal/handlers/invoke_handler.go` | Entry point — enrich context with Langfuse attributes |
| Flow Executor | `services/agentic-builder/backend/internal/flow/executor.go` | Add node_type context per flow node |
| AI Tracing | `services/agentic-builder/backend/internal/ai/tracing.go` | Set OTel span attributes (identity, langfuse.*, gen_ai.*) |
| Anthropic Client | `services/agentic-builder/backend/internal/ai/anthropic.go` | Capture Anthropic token usage |
| OpenAI Client | `services/agentic-builder/backend/internal/ai/openai.go` | Capture OpenAI token usage |
| OTel Tracer | `libs/go/otel/tracer.go` | OTLP gRPC exporter to collector |
| OTel Resource | `libs/go/otel/resource.go` | Service name, version, deployment env |
| OTel Collector | `deploy/otel-collector-config.yaml` | PII masking, Langfuse enrichment, dual export |
