# Noura AI Frontend (Cybersecurity Scope)

This repository contains the **frontend-only** version of Noura AI.

It is focused on:

- Role-based interfaces (Admin, Doctor, Nurse, Patient)
- UI/UX workflows for scan upload, results, analytics, and messaging
- Frontend security-oriented behaviors (session timeout, route protection, secure storage wrappers, input sanitization)

## Deploy AI demo on Hugging Face Spaces (optional)

If you want to present the AI detection demo in your viva/discussion, Hugging Face Spaces (Gradio) is a quick option for Python-based models.

- Ensure `app.py` and `requirements.txt` exist at the repository root (this repo now includes them).
- Do NOT commit large model weight files into Git — use `scripts/download_models.py` or host models in a HF repo/dataset and fetch at deploy time.

Quick example to fetch models before running locally:

```bash
# Download model files from a Hugging Face repo (recommended)
python3 scripts/download_models.py --hf-repo your-username/your-model-repo --files brain_best.pt breast_best.pt lung_best.pt skin_best.pt

# Or download direct URLs
python3 scripts/download_models.py --urls https://example.com/brain_best.pt
```

To create a Space:

1. Push your repository to GitHub.
2. Create a new Space on Hugging Face, choose the `Gradio` SDK, and connect it to this GitHub repo.
3. The Space will run `app.py` and install `requirements.txt` automatically.

Notes:
- For demo use this is fine; for stable production, consider Render or a cloud VM for the Python API and models.


## Important Scope Note

This version keeps the main product logic in the frontend, with a lightweight local API for analytics and secure AI proxying.
There is still no model training or full production backend in this repository.

## Quick Start

Recommended: open two terminals so the API and frontend run concurrently.

```bash
# from project root
npm install
# terminal 1 — start local API on port 8000
# Option A - run locally for development
npm run start:api
# Option B - run as a managed background service (pm2)
# npm install -g pm2
# npm run pm2-start
# terminal 2 — start frontend dev server (CRA) on port 3000
npm start
```

Open http://localhost:3000 in your browser.

The local API runs on http://127.0.0.1:8000 by default. If you need the frontend to target the local API explicitly when starting the dev server, set the env var and start like:

```bash
REACT_APP_API_URL=http://127.0.0.1:8000/api PORT=3000 npm start
```

## Local Backend

This repo now includes a lightweight backend server in [server/index.js](/home/nada-sobhy/Desktop/noura-ai/server/index.js) with persistent JSON storage in `server/data/app-db.json`.

Current backend capabilities:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/users`
- `GET /api/doctors`
- `GET /api/patients`
- `GET /api/patients/:id/scans`
- `POST /api/scans/upload`
- `POST /api/ai/analyze`
- `GET /api/messages`
- `POST /api/messages`
- analytics endpoints
- secure AI proxy endpoint `POST /api/chat`

This is a real local backend with persistence, but it is still a development backend. If you later want a stronger team-ready stack, the next upgrade path is `Express + SQLite/PostgreSQL`.

## Environment Variables

Start from [.env.example](/home/nada-sobhy/Desktop/noura-ai/.env.example) and copy the values you need into `.env`.

Key settings:

```bash
REACT_APP_API_URL=http://127.0.0.1:8000/api
CLIENT_ORIGIN=http://127.0.0.1:3000,http://localhost:3000
SESSION_TTL_MS=300000
OPENROUTER_API_KEY=your_secret_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://127.0.0.1:3000
OPENROUTER_APP_NAME=Noura AI
AI_SERVICE_URL=
AI_SERVICE_TOKEN=
AI_SERVICE_TIMEOUT_MS=45000
AI_SERVICE_UPLOAD_FIELD=file
SEED_ADMIN_PASSWORD=Admin@2026Secure
SEED_DOCTOR_PASSWORD=Doctor@2026Secure
SEED_NURSE_PASSWORD=Nurse@2026Secure
SEED_PATIENT_PASSWORD=Patient@2026Secure
```

Authentication now supports a server-managed `httpOnly` session cookie in addition to the temporary frontend token compatibility path used during migration.

If `OPENROUTER_API_KEY` is not configured, the chat endpoint falls back to a safe demo response from the server instead of exposing a key in the frontend bundle.
Note: the server now refuses to start unless `OPENROUTER_API_KEY` is present in the environment, unless you explicitly opt into demo mode by setting `FORCE_DEMO=true`.
If `AI_SERVICE_URL` is not configured, `/api/ai/analyze` falls back to a local demo response and still stores the AI result on the related scan.

## Local Credentials

The development backend now supports stronger seed passwords through environment variables.
For a fresh local setup:

1. Set the `SEED_*_PASSWORD` values in `.env` (defaults shown above). These are used when the seed database is created.
2. Remove `server/data/app-db.json` only if you want to regenerate the seed data from scratch.
3. Start the API again (`npm run start:api` or `npm run pm2-start`).

If `server/data/app-db.json` already exists, current accounts will continue using the stored hashed passwords until you rotate them manually or recreate the seed database.

## Security Features (Implemented)

This project includes a number of frontend and backend security-focused protections implemented for the development/local API. Key measures in place:

- **HttpOnly session cookie**: server sets an `HttpOnly` cookie (`noura_session`) for session tokens to mitigate XSS-based token theft. The cookie uses `SameSite=Lax` and `Secure` in production.
- **Content Security Policy (CSP)**: server responses include a baseline `Content-Security-Policy` header limiting `default-src` to 'self', allowing images from `data:` and `blob:`, and restricting `script-src` to 'self'.
- **Security response headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`, and `Permissions-Policy` are set to reduce attack surface.
- **Input sanitization**: server sanitizes text inputs (`sanitizeText`) by stripping angle brackets and trimming lengths; client also sanitizes user inputs before submission via utility wrappers.
- **Rate limiting for sensitive endpoints**: login and other endpoints use an in-memory rate limiter to reduce brute-force attempts.
- **Body payload validation**: server validates the shape and maximum number of body fields to avoid excessively large or malformed payloads.
- **Role-based access control**: API implements `requireRoles` and permission checks (`canAccessPatient`, `canManageScan`, etc.) to enforce per-role restrictions.
- **Safe AI fallbacks**: AI endpoints fall back to safe demo responses when API keys are not configured to avoid leaking secrets in the frontend.
- **Secure local persistence guidance**: seed passwords are injected via environment variables and the README documents how to rotate/remove `server/data/app-db.json` for reseeding.

Notes and limitations:

- The local API is a development backend and uses in-memory or file-based persistence. For production, migrate to a hardened database (Postgres/SQLite) and a secure session store.
- Some Node APIs in the development server assume Web APIs for convenience (e.g., lightweight `FormData`/`File` handling). Review and replace with Node-native implementations when moving to a production server.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

## Changelog (recent edits)

- Fixed theme integration: `ThemeToggle.jsx` now imports the shared `ThemeContext` and `LoginPage.jsx` uses `useTheme()` to avoid duplicate state.
- Prevented FOUC by adding a small inline script that applies the stored theme class before React mounts (`public/index.html`).
- Set the local API default port to `8000` and updated `.env.example` and local `.env` guidance to point `REACT_APP_API_URL` at `http://127.0.0.1:8000/api`.
- Documentation: updated `README.md` and `TESTING_GUIDE.md` with run steps, health-checks, and security testing guidance.
- Misc: minor typos and clarity edits across docs; tests and lint commands documented.


You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
