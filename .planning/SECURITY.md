## ESCALATE

**Phase:** 5 — UI/UX Polish and Final Testing
**Closed:** 0/4

### Details
| Threat ID | Reason Blocked | Suggested Action |
|-----------|----------------|------------------|
| STRIDE-01 | Spoofing: `isLoggedIn` state in `Dashboard.jsx` relies purely on the existence of `access_token` in `localStorage` (`!!localStorage.getItem('access_token')`). | Validate token with a backend `/me` endpoint or use HttpOnly cookies. |
| STRIDE-02 | Tampering/DoS: `FloatingPanel.jsx` calls `JSON.parse()` on `localStorage` items (`ff_current`, etc.) without `try/catch`. Tampered/invalid JSON will crash the app. | Wrap `JSON.parse` in `try/catch` blocks and provide safe fallback arrays. |
| STRIDE-03 | Info Disclosure: Sensitive location history (`ff_pickup`, etc.) and `access_token` are stored in plaintext `localStorage`, which is vulnerable to XSS. | Move authentication tokens to HttpOnly cookies and clear location history on logout. |
| STRIDE-04 | Tampering: `Dashboard.jsx` calls `/api/routes/calculate/` via native `fetch` without authorization headers, bypassing the `client` interceptors. | Use the configured `client.post` instance to ensure authentication and interceptors are applied. |
