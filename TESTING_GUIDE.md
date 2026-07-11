# 🧪 Noura AI System - Testing Guide

## 📋 Prerequisites
- Node.js installed
- npm/yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🚀 Step 1: Start the Frontend Development Server

```bash
cd /home/nada-sobhy/Desktop/noura-ai
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view noura-ai in the browser.

Open http://localhost:3000 to view it in the browser.
```

---

## 🎯 Test Credentials

The development backend seeds a set of users. By default the seed passwords are set via environment variables. If you didn't override them, the repository uses the following defaults:

| Role | User ID | Default password (changeable via `.env`) |
|------|---------|-----------------------------------------|
| Admin | AD-2026-001 | Admin@2026Secure |
| Doctor | DR-2026-001 | Doctor@2026Secure |
| Nurse | NU-2026-001 | Nurse@2026Secure |
| Patient | PT-2026-001 | Patient@2026Secure |

If you change `SEED_*_PASSWORD` values in `.env`, delete `server/data/app-db.json` before starting the API to regenerate seeded accounts with the new passwords.

---

## 🧪 Testing the Application

### 1. **Login Page**
- Open http://localhost:3000
- Enter credentials from the table above
- Click "Sign In"
- Verify you're redirected to the appropriate dashboard

### 2. **Navigation**
- Test sidebar navigation between different sections
- Verify role-based access (e.g., Admin can access admin dashboard)
- Test mobile responsive menu

### 3. **Dashboard Features**
- View dashboard content for your role
- Check animations and transitions
- Verify real-time data updates (simulated)

### 4. **Pages to Test**
- **AdminDashboard**: Analytics, system overview
- **DoctorDashboard**: Patient management, appointment scheduling
- **NurseDashboard**: Patient vitals, medical records
- **PatientDashboard**: Personal health records, appointments
- **AnalyticsDashboard**: System analytics and reports
- **AIChatbot**: AI-powered chatbot interface
- **MessagesPage**: Internal messaging system
- **SettingsPage**: User preferences and settings

### 5. **Features to Verify**
- ✅ Theme toggle (light/dark mode)
- ✅ Toast notifications
- ✅ Form validation
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Loading spinners and animations
- ✅ Modal dialogs

---

## 🎨 UI Testing

### Theme Switching
- Click the theme toggle button (sun/moon icon)
- Verify the entire app switches between light and dark themes
- Check that preference is persisted

### Responsive Design
- Open DevTools (F12)
- Test on multiple viewport sizes:
  - Mobile (320px)
  - Tablet (768px)
  - Desktop (1024px+)
- Verify layouts adapt properly

### Animations
- Logo animation should be smooth and continuous
- Transitions between pages should be smooth
- Loading spinners should animate correctly

---

## 🧩 Component Testing

### NouraLogo Component
- Verify the animated logo displays correctly
- Check both `NouraLogo` (default size) and `NouraLogoHero` (160px) variants
- Canvas animations should run smoothly

### Loading Spinner
- Trigger any loading state to see the spinner
- Verify smooth rotation animation

### Toast Notifications
- Perform actions that trigger notifications
- Verify notifications appear/disappear correctly
- Check different notification types (success, error, info)

---

## 📱 Browser Compatibility
Test on:
- Chrome/Chromium
- Firefox
- Safari
- Edge

---

## 🚀 Performance Tips
- Use Chrome DevTools to monitor performance
- Check Network tab for bundle sizes
- Verify animations run at 60fps

---

## 📝 Notes
- The repository includes a lightweight local backend stored in `server/`. The backend persists data to `server/data/app-db.json`.
- If you want a frontend-only experience without the local backend, you can run the frontend alone, but some features (auth, AI chat, scans) will be limited or use front-end mocks.
- Mock data resets only when you delete `server/data/app-db.json` or regenerate the seed database.

---

## 🖥️ API / Backend (local) - Quick Start

The repository includes a lightweight local API for development. To run it alongside the frontend:

```bash
# from project root
npm install
# terminal 1: start local API (option A - foreground)
npm run start:api
# or run as a managed background process with pm2 (option B)
# npm install -g pm2
# npm run pm2-start
# terminal 2: start frontend
npm start
```

The local API runs by default on `http://127.0.0.1:8000` and the frontend on `http://localhost:3000`.

Quick API health check (returns JSON when healthy):

```bash
curl -sS http://127.0.0.1:8000/api/health | jq || echo "API health endpoint did not return JSON"
```

If you need to change seeded passwords or reseed user data, update `.env` (see `SEED_*_PASSWORD`) and remove `server/data/app-db.json` before restarting the API. Ensure your `.env` contains the updated API URL and port, for example:

```bash
REACT_APP_API_URL=http://127.0.0.1:8000/api
PORT=8000
```

## 🔁 Automated Tests & Linting

Run the unit/test runner and linters:

```bash
npm install
npm test        # Run test suite (interactive/watch)
npm run lint    # Run ESLint
npm run lint:fix
npm run format  # Prettier formatting
```

If tests fail, open the failing test file listed by the runner and run the single test with the test runner pattern.

## 🔐 Security Testing Checklist

Manual checks you can perform to verify security controls:

- **Cookie & session behavior**: After login, inspect browser cookies and confirm `noura_session` is present and `HttpOnly` is set (visible only via server-set header in the Network tab).
- **CSP & headers**: In DevTools Network → inspect API responses for `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- **Rate limiting**: Use `curl` to simulate rapid failed logins and observe HTTP 429 responses. Example:

```bash
for i in {1..12}; do \
  curl -s -X POST http://127.0.0.1:8000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"identifier":"BAD","password":"wrong"}' -w "%{http_code}\n"; \
done
```

- **Input sanitization**: Submit payloads containing `<script>` or angle brackets and verify server strips them from stored values (or returns sanitized values).
- **CORS / Allowed Origins**: Confirm `CLIENT_ORIGIN` in `.env` matches your frontend host; requests from disallowed origins should be rejected with 403.

## 🔄 Resetting Local Data

- To reseed user data: stop the API, delete `server/data/app-db.json`, set any `SEED_*_PASSWORD` env vars in `.env`, then restart `npm run start:api`.

## 🧾 Where to look for logs

- API console logs are printed where `npm run start:api` runs (terminal 1).
- Frontend console and network logs are accessible via browser DevTools (F12).
