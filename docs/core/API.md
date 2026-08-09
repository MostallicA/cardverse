# CardVerse API

**Document ID:** CV-10001
**Version:** 0.3.0
**Status:** Frozen
**Classification:** Technical
**Owner:** Mostafa
**Created:** 2026-06-27
**Last Updated:** 2026-08-09

---

## Table of Contents

1. API Overview
2. API Design Principles
3. Authentication
4. Endpoint Standards
5. Request Standards
6. Response Standards
7. Error Handling
8. Versioning Strategy
9. Security
10. Rate Limiting
11. Relationship to Real-Time Communication
12. Future Evolution
13. References
14. Version History

---

## 1. API Overview

### Purpose

This document defines the public REST API standards for the CardVerse platform. Clients never communicate directly with the database or internal modules.

### Scope

API architecture, Authentication, Endpoint conventions, Request/Response standards, Error handling, Security, Versioning. Implementation details of individual endpoints are documented separately.

### Responsibilities

Authentication, Authorization, Request Validation, Response Formatting, Rate Limiting, Routing, Error Handling. Business logic belongs to Platform, Engine and Game modules.

### Design Goals

Consistency, Simplicity, Predictability, Security, Performance, Scalability, Backward Compatibility.

---

## 2. API Design Principles

API First. Contract Before Implementation. Stateless Communication. RESTful Design. Consistent Responses. Backward Compatibility. Predictability.

---

## 3. Authentication

Version 1.0 supports Guest Authentication and Google Authentication. Bearer Tokens via the Authorization header. Future providers may be added without changing existing contracts. Token refresh mechanisms may be introduced later without changing endpoint behavior.

---

## 4. Endpoint Standards

Resources as nouns (`/users`, `/profiles`, `/matches`, `/rooms`, `/friends`). URI structure: `/api/v1/users`, nested as `/api/v1/users/{id}/inventory`. Standard HTTP methods (GET/POST/PUT/PATCH/DELETE) and status codes (200/201/204/400/401/403/404/409/422/429/500).

---

## 5. Request Standards

JSON by default with appropriate `Content-Type`. Standard headers: Authorization, Content-Type, Accept. Query parameters for filtering/sorting/pagination/searching (`/matches?status=active`). Pagination via `page`/`limit`. Sorting via `?sort=created_at&order=desc`. All requests validated before reaching business logic.

---

## 6. Response Standards

Success responses: `success`, `data`, `metadata` (+ optional `request_id`, `timestamp`). Error responses: `success`, `error`, `code`, `message` (+ optional validation details). Metadata may include pagination info, total records, processing time, API version. Equivalent operations produce equivalent response structures.

---

## 7. Error Handling

Error categories: Validation, Authentication, Authorization, Business Rule, Server. Each business error exposes a stable internal error code. Unexpected server errors never expose internal implementation details.

---

## 8. Versioning Strategy

URL versioning (`/api/v1/`, `/api/v2/`). Existing versions remain functional until officially deprecated. Lifecycle: Active → Deprecated → Retired.

---

## 9. Security

HTTPS only. Server is the authoritative source of truth — clients request actions but never determine game state (see PROJECT_DNA.md — Server Authoritative). All input validated; no client input trusted by default. Output sanitized — only requested data returned, nothing sensitive. Authorization verified on every protected request. Security-relevant events logged (auth failures, permission violations, rate limit violations).

---

## 10. Rate Limiting

Limits vary by endpoint type and authentication status. Guest users face stricter limits than authenticated users. Repeated abuse may result in throttling, temporary blocking, or permanent suspension (thresholds documented separately).

---

## 11. Relationship to Real-Time Communication

This document (API.md) governs the **stateless REST API only** — account management, social features, shop, matchmaking queue entry, and any request/response interaction that does not need to happen inside a live Match.

**In-match gameplay (turn notifications, card plays, timers, opponent actions) requires a separate real-time channel**, which has been decided: **Socket.IO** (see DASHBOARD.md CV-DEC-0017).

---

## 12. Future Evolution

WebSocket APIs, Server-Sent Events (both candidates for Section 11's open decision), GraphQL Gateway (evaluation only), Public Developer APIs, SDKs, API Documentation Portal. Must remain compatible with the principles in this document.

---

## 13. References

- CARDVERSE_INDEX.md
- DASHBOARD.md
- README.md
- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- DATABASE.md
- RULEBOOK.md
- PROJECT_RULES.md
- PROJECT_DNA.md

---

## 14. Version History

| Version | Date       | Description                                                                                                                                                                  |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-06-30 | Enterprise API foundation                                                                                                                                                    |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                                                                                                               |
| 0.2.0   | 2026-07-12 | Removed "& ChatGPT" from Owner; added Section 11 clarifying this document covers REST only, with real-time gameplay communication tracked as an open item in ARCHITECTURE.md |
| 0.3.0   | 2026-08-09 | Updated Section 11 to reflect Socket.IO decision; fixed References to use DASHBOARD.md instead of deleted files; improved formatting                                         |

---

**Document Status:** Frozen

This document defines the official API standards for the CardVerse platform. All API endpoints, request/response contracts and communication rules must remain consistent with this document.

Changes to this document require updating the Version History.
