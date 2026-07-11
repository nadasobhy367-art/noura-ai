# Noura AI - Graduation Defense Demo Guide

This quick guide helps you present the core security story in 5-7 minutes.

## 1) Role-Based Access Control (RBAC) Demo

### Goal
Show that each role can only access its allowed dashboard and workflows.

### Steps
1. Login as `AD-2026-001` (Admin) and open admin-only screens.
2. Logout, then login as doctor (`DR-2026-001`) and verify doctor dashboard access.
3. Try opening an admin route while logged in as doctor.
4. Repeat quickly for nurse and patient.

### Expected Result
- Each user is redirected to the correct dashboard for their role.
- Unauthorized role routes are blocked and redirected safely.

---

## 2) Session Timeout Demo (5 Minutes)

### Goal
Show automatic logout after inactivity.

### Current Config
- Frontend timeout: `REACT_APP_SESSION_TIMEOUT=300000`
- Backend session TTL: `SESSION_TTL_MS=300000`
- Effective timeout: **5 minutes**

### Steps
1. Login with any role.
2. Stop interacting with the app for 5 minutes.
3. Attempt any action after timeout.

### Expected Result
- Session expires automatically.
- User is redirected to login and needs re-authentication.

---

## 3) What Is Implemented vs Future Production Hardening

Use this table in your slides/report:

| Area | Implemented Now | Future Hardening |
|---|---|---|
| Authentication | Login + session-based access | MFA/2FA enforcement per role |
| Authorization | Role-based route protection | Fine-grained policy engine |
| Session Security | 5-minute inactivity timeout | Device/session management dashboard |
| Password Security | Server-side hashing | Rotation policy + breach checks |
| API Security | CORS allowlist + security headers | Advanced WAF rules + stricter API gateway |
| Data Layer | Local persistent JSON DB | PostgreSQL + backups + encryption at rest |
| Monitoring | Basic logs | Centralized SIEM + alerts |

---

## Suggested Defense Script (Short)

"Our system enforces role-based access so each actor sees only permitted workflows.  
We also enforce automatic session expiration after 5 minutes of inactivity for security.  
Finally, we documented a clear hardening roadmap from our current working secure prototype to production-grade deployment."

---

## Notes for Smooth Demo

- Keep backend and frontend running before presentation.
- Use prepared test accounts for all four roles.
- If needed, clear browser cache/session before starting.
