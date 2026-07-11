# 🚀 Noura AI - Quick Start Guide

> Frontend-only version for UI + cybersecurity implementation scope.

## ⚡ Super Quick Start (2 minutes)

### Start the Application
```bash
npm install
npm start
```
Expected: Automatically opens http://localhost:3000

---

## 👤 Login Credentials

| Role | ID | Password |
|------|-----|----------|
| 👨‍💼 Admin | `AD-2026-001` | `admin123` |
| 👨‍⚕️ Doctor | `DR-2026-001` | `doctor123` |
| 👩‍⚕️ Nurse | `NU-2026-001` | `nurse123` |
| 👤 Patient | `PT-2026-001` | `patient123` |

---

## ✅ What to Test

### 1️⃣ Patient (PT-2026-001)
- ✅ View dashboard
- ✅ Upload medical scan
- ✅ Send message to doctor
- ✅ View scheduled appointments

### 2️⃣ Doctor (DR-2026-001)
- ✅ View patient list
- ✅ Request access to patients
- ✅ View patient scans
- ✅ Reply to patient messages

### 3️⃣ Nurse (NU-2026-001)
- ✅ View patient records
- ✅ Update patient info
- ✅ Manage appointments

### 4️⃣ Admin (AD-2026-001)
- ✅ View all users
- ✅ Check system analytics
- ✅ View audit logs
- ✅ Manage system settings

---

## 🔧 Troubleshooting

### Port Already in Use?
```bash
# Find and kill process
lsof -i :3000  # Frontend
kill -9 <PID>
```

### Clear Frontend Cache
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📚 Documentation

- **Full Testing Guide:** [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Frontend Scope Summary:** [FRONTEND_ONLY.md](FRONTEND_ONLY.md)

---

## 🎯 Test Workflow

```
1. Start Frontend
   ↓
2. Open http://localhost:3000
   ↓
3. Login as any test user
   ↓
4. Explore features
   ↓
5. Send messages between users
   ↓
6. Upload and view scans
   ↓
7. Test admin features
```

---

## 🧬 Key Features to Verify

- [ ] All 4 user roles can login
- [ ] Each role sees their correct dashboard
- [ ] Messages work between users
- [ ] Scans can be uploaded and viewed
- [ ] Patient data is secure (access control)
- [ ] Dark/Light theme toggle works
- [ ] Session expires after 5 min inactivity
- [ ] Logout clears session properly

---

## 🎨 UI Elements to Check

- Header with logo and navigation
- User role badge in top-right
- Sidebar with menu items
- Theme toggle (sun/moon icon)
- Responsive layout (resize browser)
- Dark mode colors
- Arabic text rendering (where applicable)

---

**You're all set! Start testing now! 🚀**
