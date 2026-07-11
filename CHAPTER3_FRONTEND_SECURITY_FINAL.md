# CHAPTER 3
## System Development and Implementation

### Scope of This Chapter
This chapter documents the implemented work related to:
- `3.2 Front-End Development`
- `3.4 Data Security Considerations`

The chapter intentionally focuses on the author’s contribution in front-end engineering and front-end security integration within the Noura AI platform for early cancer detection (brain, lung, breast, and skin).  
Detailed internal development of AI models and backend internals is outside the scope of this part and is covered by the corresponding team tracks.

---

## 3.2 Front-End Development

### 3.2.1 Introduction to the Front-End Component
The front-end is the primary interaction layer of Noura AI. It enables different users (Admin, Doctor, Nurse, Patient) to access role-specific workflows through a unified, responsive medical interface.  
The interface was designed to support clear navigation, practical day-to-day usage, and smooth communication with integrated services for authentication, data retrieval, scan handling, analytics, and AI-related user flows.

### 3.2.2 Front-End Objectives
The front-end development aimed to:
- Provide role-specific dashboards and pages with clear separation of responsibilities.
- Deliver a professional and responsive user experience for healthcare scenarios.
- Support secure session handling and protected navigation.
- Enable core workflows (authentication, scans, messaging, analytics, and settings).
- Offer maintainable modular code using reusable React components and utilities.

### 3.2.3 Technology Stack and Justification
The implemented front-end stack includes:

| Library / Tool | Usage in Project |
|---|---|
| React 19 | Core UI development with reusable component architecture |
| React Router v7 | Route management and role-aware navigation |
| Tailwind CSS | Consistent, fast, responsive styling |
| Recharts | Analytics and dashboard visualization |
| React Dropzone | Medical image upload UI and drag-and-drop UX |
| Lucide React | Unified icon system |
| CryptoJS | Client-side encryption utility functions (where required) |
| jsPDF + html2canvas | PDF export for report-like outputs |
| Fetch API (custom wrapper) | API communication through centralized utility logic |

### 3.2.4 Front-End Architecture and Project Structure
The project follows a modular React structure:

| Directory | Purpose |
|---|---|
| `src/pages/` | Role-based pages and main feature screens |
| `src/components/` | Reusable UI blocks |
| `src/contexts/` | Global state and auth lifecycle handling |
| `src/hooks/` | Reusable behavioral logic |
| `src/utils/` | API wrappers, security utilities, data helpers |

This structure improved maintainability and allowed clean separation between UI concerns, business logic, and security logic.

### 3.2.5 User Roles and Role-Oriented Experience
The implemented UI supports four roles:

| Role | Main Front-End Responsibilities |
|---|---|
| Admin | System overview, user visibility, team/management features, analytics access |
| Doctor | Patient-oriented workflow, scans/results follow-up, communication features |
| Nurse | Assigned patient support workflow and operational tasks |
| Patient | Personal dashboard, upload/results view, communication and follow-up |

Each role receives an appropriate dashboard and is redirected safely if attempting unauthorized routes.

### 3.2.6 Key Implemented Pages (Front-End Track)
- Login page with role-aware flow and safe error messaging.
- Role dashboards (Admin, Doctor, Nurse, Patient).
- Team management UI and assignment visualization.
- AI chatbot UI integration page.
- Analytics dashboard pages with charts.
- Messaging and operational support pages.
- Settings and security page (session-related settings and controls).

### 3.2.7 UI Design and Responsiveness
The interface was implemented using responsive design principles for desktop and smaller viewports.  
Layout consistency, readable spacing, visual hierarchy, and accessible controls were prioritized to suit healthcare usage and reduce interaction friction during demonstrations and testing.

### 3.2.8 State Handling and Front-End Performance
State is managed through React state patterns and context-based auth/session handling.  
Performance-oriented practices used in this track include:
- Component-level state isolation
- Avoiding unnecessary re-renders in core flows
- Organized API utility layer
- Progressive UI feedback during asynchronous calls (loading and fallback states)

### 3.2.9 Integration Readiness with Backend and AI Services
The front-end is integration-ready through API utilities and environment-driven endpoints.  
From the front-end perspective, the integration flow supports:
- Authentication and user/session endpoints
- Scan upload and analysis result workflows
- AI-related interfaces through backend-proxied endpoints
- Fallback behavior for service unavailability in selected flows

### 3.2.10 Front-End Challenges and Solutions

| Challenge | Implemented Solution |
|---|---|
| Multi-role navigation complexity | Protected-route strategy and role-based redirection |
| Inconsistent team-assignment display | Sync logic improved using live backend data with local override control |
| Session timeout consistency | Unified timeout to 5 minutes across settings and environment values |
| UI clarity for operational roles | Role-focused dashboards and simplified information grouping |
| Error readability | User-friendly error messaging without exposing internals |

### 3.2.11 Front-End Summary
The front-end track delivered a complete, role-aware, and usable interface that operationally supports the platform’s early-cancer-detection scenario.  
It provides a practical user experience, modular architecture, and strong readiness for integrated AI-backed workflows.

---

## 3.4 Data Security Considerations (Front-End Scope)

### 3.4.1 Security Approach
Because the system handles sensitive healthcare-related information, front-end security was treated as a core engineering requirement, not a final-stage enhancement.  
Security controls were integrated directly into authentication flow, navigation guards, session handling, request behavior, and user-input processing.

### 3.4.2 Authentication and Session Handling
The implemented flow combines:
- Backend-authenticated login
- Token-based request continuity
- Session lifecycle checks in front-end context
- Automatic logout on inactivity

A strict inactivity timeout was configured to **5 minutes**, and related settings were aligned across UI and environment configuration for consistency.

### 3.4.3 Role-Based Access Control (RBAC) on the Front-End
Front-end authorization is enforced using protected routes and role checks.  
Users are redirected to the correct dashboard when accessing restricted routes, which reduces accidental privilege exposure in the client navigation layer.

### 3.4.4 Input Validation and Sanitization
The front-end applies validation and sanitization utilities before submitting user-controlled data:
- Format-aware input checks for common fields
- Sanitization helpers for free text
- Restrictive handling of file upload flows

This improves first-line defense and user feedback quality before server-side validation.

### 3.4.5 XSS and Safe Rendering Practices
The implementation relies on safe React rendering behavior (automatic escaping in JSX) and avoids unsafe HTML injection patterns in normal UI flows.  
Combined with sanitization utilities, this lowers XSS risk in user-generated content paths.

### 3.4.6 CSRF and Request Security Context
Authentication requests are handled through explicit API request logic and controlled headers, while CORS policy and credential behavior are enforced at backend boundaries.  
From the front-end side, requests are centralized in utility services to reduce inconsistent security behavior across pages.

### 3.4.7 Security Headers and Backend-Coupled Protections (Observed by Front-End)
During integration and testing, the front-end interacts with backend responses that include key defensive headers and controlled origin policy.  
This complements the front-end security posture in a defense-in-depth setup.

### 3.4.8 Auditability and Secure Error Behavior
The UI avoids exposing stack traces and internal details in normal user-facing messages.  
Operational events can be observed through admin-facing system views and backend-supported logs, improving accountability in demonstrations.

### 3.4.9 Security Challenges Encountered in This Track

| Challenge | Resolution |
|---|---|
| Timeout mismatch between screen text and runtime behavior | Unified all relevant values to 5 minutes |
| Legacy local state affecting role/team views | Added backend-sync-first behavior and explicit sync action |
| Route-access edge cases between roles | Strengthened protected-route redirection handling |
| User confusion with network/auth errors | Clearer, safer, and less technical UI error responses |

### 3.4.10 Security Summary (Front-End Contribution)
The front-end contribution established practical and demonstrable security controls through:
- Role-based protected navigation
- Session timeout and auto-logout behavior
- Input validation and sanitization patterns
- Safe UI rendering principles
- Centralized request handling and safer error communication

Within the graduation-project scope, these controls provide a strong security baseline for the user-facing layer and integrate effectively with backend-enforced protections.

---

## Figures and Screenshots Placement Notes
Use your actual captured screenshots and diagrams in the following suggested positions:
- Figure 3.1: Front-end conceptual overview
- Figure 3.2: Objectives of front-end development
- Figure 3.3: Front-end folder architecture
- Screenshot set: Role dashboards, login, upload, analytics, settings
- Figure set (security): auth flow, RBAC mapping, session-timeout flow, security layers

---

## Writing Note for Final Thesis Compilation
When merging into the final thesis:
- Keep this chapter under `Chapter 3` as your individual contribution section.
- Do not claim internal AI model training/deployment details in this section.
- Keep backend details at integration level only, unless explicitly assigned to your track.
