# CHAPTER 3  
## System Development and Implementation

### Sections Covered in This Chapter
**3.2 Front-End Development**  
**3.4 Data Security Considerations**

---

## 3.2 Front-End Development

### 3.2.1 Introduction to the Front-End Component
The front-end component of the Noura AI platform is the primary interaction layer through which all user roles access the system.  
Within the scope of this project, the platform supports early detection workflows for four cancer types: **brain, lung, breast, and skin**.

The implemented interface is designed for four user roles:
- Admin
- Doctor
- Nurse
- Patient

This part focuses on the author’s contribution in front-end engineering and security-oriented client-side implementation.

**Figure 3.1:** Conceptual front-end interface connected to AI-based cancer detection.

### 3.2.2 Objectives of the Front-End Development
The front-end development aimed to achieve the following:
1. Build an intuitive role-based interface for all user categories.
2. Provide clear workflows for authentication, navigation, and role dashboards.
3. Support medical image upload and display analysis-related outputs.
4. Integrate with backend APIs and AI service flows from the client side.
5. Apply security-aware front-end behavior for safer user interaction.

**Figure 3.2:** Front-end development objectives overview.

### 3.2.3 Technology Stack and Justification

| Tool / Library | Purpose in the Implemented Front-End |
|---|---|
| React 19 | Core component-based UI development |
| React Router v7 | Route management and role-aware navigation |
| Tailwind CSS | Fast, consistent, responsive styling |
| Recharts | Dashboard analytics visualization |
| React Dropzone | Drag-and-drop upload UX |
| Lucide React | Unified icon system |
| CryptoJS | Security utility usage on client-side flows |
| jsPDF + html2canvas | Exporting report-like outputs |
| Fetch API (custom utility layer) | API communication and request standardization |

### 3.2.4 Front-End Architecture and Project Structure
The implementation follows a modular architecture that separates concerns:

| Folder | Responsibility |
|---|---|
| `src/pages/` | Feature pages and role dashboards |
| `src/components/` | Reusable UI elements |
| `src/contexts/` | Shared auth/session state behavior |
| `src/hooks/` | Reusable logic |
| `src/utils/` | API, helpers, and security utilities |

**Figure 3.3:** Front-end project structure and component organization.

### 3.2.5 User Roles and Role-Based Dashboards

| Role | Dashboard Focus |
|---|---|
| Admin | System-level visibility, management and analytics views |
| Doctor | Patient follow-up, scan-related workflows, role operations |
| Nurse | Assigned clinical support workflows |
| Patient | Personal dashboard and follow-up interactions |

Role-based navigation is enforced through protected routes and controlled redirects.

**Screenshot 3.1:** Role-based dashboard examples.

### 3.2.6 Key Implemented Pages
The implemented front-end pages include:
- Login Page
- Admin Dashboard
- Doctor Dashboard
- Nurse Dashboard
- Patient Dashboard
- Team Management
- Analytics pages
- AI Chat page
- Settings and Security page

**Screenshot 3.2:** Login page.  
**Screenshot 3.3:** Team management / operational page.  
**Screenshot 3.4:** Analytics and reporting views.

### 3.2.7 User Interface Design and Responsiveness
The UI was designed for a healthcare-oriented visual style with attention to:
- readability,
- clear hierarchy,
- reduced interaction complexity,
- responsive behavior across common screen sizes.

### 3.2.8 State Handling and Performance Considerations
The implemented front-end uses:
- component-level state for local behavior,
- context-based handling for authentication and session lifecycle,
- organized utility abstractions for API interactions.

Performance and usability were improved through:
- clear loading states,
- reduced unnecessary renders in critical views,
- scoped logic reuse.

### 3.2.9 Integration with Backend and AI Services (Front-End Scope)
From the front-end perspective, integration supports:
1. Authentication and session endpoints.
2. User and workflow endpoints.
3. Scan upload and result retrieval flow.
4. AI-related user interfaces through backend-connected endpoints.

This chapter presents integration behavior from the client side only.

**Figure 3.4:** React front-end integration flow with backend/AI services.

### 3.2.10 Challenges and Solutions

| Challenge | Implemented Solution |
|---|---|
| Multi-role route behavior complexity | Protected route flow and role-based redirection |
| Assignment display inconsistency | Sync strategy aligned with backend-driven data |
| Session timeout mismatch in UI/config | Unified timeout configuration to 5 minutes |
| User-facing error clarity | Safer, simpler messages without internal leakage |
| Maintainability across many pages | Modular folder structure and utility centralization |

### 3.2.11 Summary of Front-End Development
The front-end contribution delivered a complete role-aware interface with practical healthcare workflows and integration-ready behavior.  
It provides a usable and secure client layer that supports the broader early-cancer-detection system context.

---

## 3.4 Data Security Considerations

### 3.4.1 Security Context
Noura AI handles sensitive healthcare-related data, so security was implemented as a core requirement in front-end behavior.  
This section documents front-end security controls implemented within the author’s scope.

### 3.4.2 Authentication and Session Handling
The implemented front-end security flow includes:
- authenticated login tied to backend verification,
- protected request flow,
- session lifecycle monitoring,
- inactivity auto-logout.

Session timeout was unified to **5 minutes** of inactivity.

**Figure 3.5:** Authentication and session lifecycle flow.

### 3.4.3 Role-Based Access Control (RBAC)
Role checks are enforced in routing and page access behavior.  
Unauthorized route attempts are redirected safely to the appropriate page.

**Figure 3.6:** RBAC mapping for Admin, Doctor, Nurse, and Patient.

### 3.4.4 Input Validation and Sanitization
Security-aware input handling includes:
1. field validation before API submission,
2. controlled handling for user text,
3. constrained file-upload behavior.

This reduces malformed input risk and improves user feedback quality.

**Figure 3.7:** Input validation/sanitization pipeline.

### 3.4.5 XSS Prevention Practices
The implementation benefits from React’s safe rendering behavior (automatic JSX escaping) and avoids unsafe HTML injection in normal UI flows.  
Sanitization utilities were used for user-controlled text paths when needed.

### 3.4.6 CSRF and Request Behavior (Front-End Perspective)
Requests are centralized in utility logic with controlled headers and consistent credential handling across features.  
CORS and origin policy are enforced at backend boundaries and observed during front-end integration.

### 3.4.7 Session Timeout and Auto Logout
A dedicated inactivity control flow is implemented on the client side.  
On inactivity expiration:
1. session data is cleared,
2. user is logged out,
3. user is redirected to login.

This is important for shared-device and clinical workstation usage.

### 3.4.8 Secure Error Handling and Operational Visibility
Error messages shown to users are kept generic and safe.  
The UI avoids exposing internal stack traces or sensitive technical internals.

### 3.4.9 Security Challenges and Resolutions

| Security Challenge | Resolution |
|---|---|
| Timeout inconsistency between settings and runtime | Unified values and UI controls to 5 minutes |
| Legacy local state causing display confusion | Added backend-sync-first logic in key pages |
| Role leakage risk through route attempts | Strengthened protected-route checks |
| Technical error details exposure risk | Standardized safer user-facing error messages |

### 3.4.10 Summary of Data Security Considerations
Within the front-end scope, the project applies a layered security approach through:
- role-aware protected navigation,
- inactivity session timeout,
- input validation and sanitization,
- safe rendering practices,
- centralized request handling,
- secure error communication.

These controls provide a solid graduation-project security baseline for the client-facing layer.

---

## Recommended Insertions Before Final Submission
Before final thesis export, insert:
- actual screenshots in all screenshot placeholders,
- final diagrams for architecture and security flow,
- figure numbering updates after full thesis merge.

---

## Appendix Note (If Needed by Supervisor)
Detailed user testing steps and operational usage flow can be placed in Appendix, while this chapter remains focused on implementation and security design contribution.
