---
phase: 07
slug: make-it-on-cloud-backend-and-frontend
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-24T01:31:00Z
---

# Phase 07 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Hosting Environment | Vercel and Render dashboards where environment variables are stored securely. | API keys and Database credentials |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-07-01 | Information Disclosure | `render.yaml` | mitigate | The `render.yaml` configuration links the database URL dynamically using `fromDatabase` rather than hardcoding passwords. All sensitive keys like `ORS_API_KEY` must be configured securely in the hosting provider's dashboard via environment variables, not in code. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

*Accepted risks do not resurface in future audit runs.*

*If none: "No accepted risks."*
No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-24 | 1 | 1 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-24
