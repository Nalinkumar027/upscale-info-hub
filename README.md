# Upscale Info Hub — Responsive Web + Mobile MVP starter

A responsive, installable web app designed to work on desktop and mobile browsers. It includes WorkLink job search/posting, community profiles, a seller directory and enquiry form, Farmer Future information, and an AI-assistant endpoint with browser speech input/output.

## Current scope

**Included**
- Responsive React UI and PWA manifest.
- Express REST API and SQLite storage.
- Sample job and seller listings.
- Create community profiles; post/search jobs.
- Save seller enquiries (does not contact the seller automatically).
- Assistant endpoint with rule-based fallback.
- Optional OpenAI API integration, with key kept server-side.
- Browser speech recognition and speech synthesis when supported by the browser/device.

**Not production-ready yet**
- No login, account recovery, role-based authorization, moderation, verified badges, spam protection, consent workflow, or production privacy/security review.
- Browser speech recognition support varies; some browsers send audio to a browser vendor. Add clear consent and privacy disclosure before real users use microphone features.
- Language model responses are not a substitute for agricultural professionals.
- No real-time messaging, payment processing, booking confirmation, maps, seller notifications, or live market data.
- Sample sellers/jobs are illustrative and should be replaced with verified, consented listings.
- Government scheme eligibility matching is intentionally excluded.

## Requirements
- Node.js 20+ and npm.
- Optional OpenAI API key for AI-generated replies. The app runs in fallback mode without one.

## Run locally
1. Extract the project and open a terminal in its folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`. For real AI replies, add your key to `OPENAI_API_KEY`. Never commit `.env` or expose the key in frontend variables.
4. Start web and API together:
   ```bash
   npm run dev
   ```
5. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). API runs on port 4000.
6. Check API status at `http://localhost:4000/api/health`.

## Build
```bash
npm run build
npm start
```
The Express server serves the built `dist` directory as well as the API. Build first before `npm start`.

## Mobile
The UI is responsive. For an installable PWA, deploy over HTTPS and test **Add to Home Screen** on Android/iOS. Microphone APIs usually require HTTPS or localhost. Native Android/iOS packaging can be added later with Capacitor if app-store distribution is required.

## Suggested next development milestones
1. Add authentication, user consent, profile ownership and role-based permissions.
2. Add job applications/bookings, status transitions and verified customer feedback.
3. Add seller notification delivery, audit logs and report/dispute workflows.
4. Add multilingual UX copy and test speech recognition/TTS on actual target devices.
5. Add rate limiting, validation, CSRF/origin policy, secure headers, logging, backups, migrations and privacy/security review before public launch.
6. Conduct a small, consent-based pilot with a few workers, farmers and sellers.
