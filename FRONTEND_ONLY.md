# Frontend-Only Scope (My Part)

This document defines the scope of this repository as a standalone frontend deliverable.

## Included in This Version

- React UI for all roles: Admin, Doctor, Nurse, Patient
- Role-based routing and protected pages
- Frontend security-focused behaviors:
  - Session timeout and auto logout flows
  - Secure storage wrappers
  - Input sanitization utilities
  - Access-control behavior simulation in UI flows
- Mock data and local app logic for:
  - Scan upload and result display
  - Messaging screens
  - Analytics dashboards
  - Access request workflows

## Not Included in This Version

- Backend APIs or database implementation
- AI model training/inference pipeline
- Production authentication/authorization services
- Server-side audit logging or encryption key management

## Why This Split Exists

The project work is distributed across team members:
- This repository: frontend + cybersecurity implementation on client-side flows
- Other team members: backend implementation and AI model training/integration

## Run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

