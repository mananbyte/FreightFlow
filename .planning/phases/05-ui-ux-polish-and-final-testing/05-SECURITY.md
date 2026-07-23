---
phase: 05
slug: ui-ux-polish-and-final-testing
status: draft
threats_open: 4
asvs_level: 1
created: 2026-07-24
---

# Phase 05 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client to Server | Frontend React App communicating with Backend API | Auth tokens, location data, routing calculations |
| Local Storage | Client-side browser storage | Auth token (access_token), location history (ff_pickup, etc) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| STRIDE-01 | Spoofing | Dashboard.jsx | mitigate | Validate token with a backend `/me` endpoint or use HttpOnly cookies. | open |
| STRIDE-02 | Tampering / DoS | FloatingPanel.jsx | mitigate | Wrap `JSON.parse` in `try/catch` blocks and provide safe fallback arrays. | open |
| STRIDE-03 | Info Disclosure | Local Storage | mitigate | Move authentication tokens to HttpOnly cookies and clear location history on logout. | open |
| STRIDE-04 | Tampering | Dashboard.jsx | mitigate | Use the configured `client.post` instance to ensure authentication and interceptors are applied. | open |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| - | - | No accepted risks. | - | - |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-24 | 4 | 0 | 4 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [ ] Accepted risks documented in Accepted Risks Log
- [ ] `threats_open: 0` confirmed
- [ ] `status: verified` set in frontmatter

**Approval:** pending
