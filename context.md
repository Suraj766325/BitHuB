# BitHuB Workspace Context & System Architecture Guide

Welcome, future agents! This document serves as the ultimate map for understanding the architecture, repositories, security model, and workflows for the **BitHuB** project across both **BIT Mesra** and **BIT Jaipur** campuses.

Read this carefully before making architectural changes or pushing code.

---

## 1. Unified Repository & Multi-Directory Architecture

The root repository (`BitHuB/`) hosts the unified production frontend served at `bithub.co.in` via **Vercel**:

- **`index.html` (Root Entrypoint):** The main **Campus Selector** landing page where users choose between **BIT Mesra** (`bit-mesra/index.html`) and **BIT Jaipur** (`bit-jaipur/index.html`), and view the active campus venture promotion banner linking to `HungryBirds.html` (`/HungryBirds`).
- **`HungryBirds.html` (`/HungryBirds`):** Dedicated campus venture collaboration page (`BitHub x HungryBirds.food`) redirecting users to `http://hungrybirds.food`.
  - **Promotion Validity:** Active until **15th Nov, 2026**.
  - **Scope & Network Note:** Exclusive to **BIT Mesra Campus**; accessible via mobile cellular data only (users on campus Wi-Fi must switch to mobile data to access the site).
  - **Disclosure:** BitHub does not own or operate HungryBirds (`hungrybirds.food`); this is an independent, free-of-cost promotion to encourage student entrepreneurial vigor on campus.
- **`assets/hungrybirds/`:** Static image assets (`bithub-x-hungrybirds-deal.png` and `hungrybirds-logo.jpeg`) used by `index.html` and `HungryBirds.html`.
- **`bit-mesra/`:** Static HTML/CSS/JS portal for the BIT Mesra campus, including syllabus pages, course modules, the **Live Analytics** subject demand tracker (`event.html` & `index.html`), the **Wellness Check Poll** (`index.html`), and the **Feedback Portal** (`feedback.html`).
- **`bit-jaipur/`:** Compiled, optimized static assets (HTML/CSS/JS) for the BIT Jaipur React dashboard. **Do not edit directly.**
- **`bit-jaipur-src/`:** Uncompiled React + Vite source code for the Jaipur frontend (`npm run build` outputs directly to `../bit-jaipur`).

### Vercel Multi-Directory Deployment (`vercel.json` & `.vercelignore`)
- Because `bit-jaipur-src/` contains a `package.json` with Vite, Vercel's auto-detector will mistakenly try to deploy `bit-jaipur-src` as a standalone root if unconfigured.
- **Root `vercel.json`:** Forces `"framework": null`, `"buildCommand": "node generate-env.js"`, `"outputDirectory": "."`, and rewrites `/HungryBirds` to `/HungryBirds.html` so Vercel always deploys from `BitHuB (root)` starting at the Campus Selector page (`index.html`).
- **Root `.vercelignore`:** Excludes `bit-jaipur-src/`, `ref/`, `BitHuB Jaipur/`, and `.env*` from the static upload bundle.

---

## 2. Environment Variable Pipeline & Fallback Architecture (BIT Mesra)

### Zero-Hardcoded Keys Policy
- **CRITICAL SECURITY RULE:** Never hardcode Google Apps Script `/exec` URLs, deployment IDs, or API keys in `bit-mesra/*.html` or any Git-tracked file.
- **`.env.local` (Git-Ignored):** Stores the live credentials locally:
  - `APPS_SCRIPT_FEEDBACK_KEY` / `APPS_SCRIPT_FEEDBACK_URL` (Feedback form & Wellness Check poll `POST` endpoint)
  - `APPS_SCRIPT_ANALYTICS_KEY` / `APPS_SCRIPT_ANALYTICS_URL` (Course click tracker `POST` & Live Trends chart `GET` endpoint)
  - `APPS_SCRIPT_PAUSED` (`false` when active, `true` to force maintenance mode)
- **`.env.example` (Tracked):** Committed template documenting the required variables without exposing real keys.
- **`generate-env.js`:** Zero-dependency Node script run locally (`node generate-env.js`) and during Vercel builds. It reads `.env.local` (or `process.env` on Vercel) and writes `bit-mesra/env-config.js` (`window.__BITHUB_ENV__`), which is git-ignored.

### Graceful API Fallbacks
When `APPS_SCRIPT_PAUSED=true`, `env-config.js` is missing, or `fetch()` encounters a network/HTTP/JSON failure:
1. **Live Analytics (`bit-mesra/index.html` & `bit-mesra/event.html`):**
   Renders: `"Live analytics is temporarily paused for maintenance."`
2. **Feedback Form (`bit-mesra/feedback.html`):**
   Renders the amber maintenance banner: `"Feedback submissions are temporarily paused for scheduled maintenance and security updates. Please check back later."` and disables `#submitBtn` (`Service Temporarily Paused`).

---

## 3. Side-by-Side Jaipur Environments (External Repos)

### `NEW BITHUB\BitHub-Frontend-Official` (The Upstream Fork)
- **Role:** Tracks the official frontend and submits PRs.
- **Remotes:**
  - `origin`: `https://github.com/MichaelSpeaksTruth/BitHuB.git`
  - `upstream`: `https://github.com/Suraj766325/BitHuB.git`

### `NEW BITHUB\BitHub-Jaipur-Development` (The Dev Environment)
- **Role:** Primary sandbox for prototyping, fixing bugs, and testing new changes to both the backend (`Backend/`) and frontend (`Front-End New/`). Connects to Render dev environments.
- **Remote:** `https://github.com/ananttheacharya/BitHuB-Jaipur-backup.git`

### `NEW BITHUB\BitHub-Jaipur-Production` (The Prod Backend Environment)
- **Role:** Stable production backend powering the live production frontend.
- **Remote:** `https://github.com/ananttheacharya/BitHub-Jaipur.git`

---

## 4. Environment & Infrastructure URLs

### Production Systems
- **Live Website (Frontend):** `https://bithub.co.in`
- **Live Backend API (Jaipur):** `https://bithub-jaipur.onrender.com` / `https://13.63.62.68.nip.io`

### Development Systems
- **Dev Frontend Site:** `https://bithub-jaipur-development-front.onrender.com/`
- **Dev Backend API:** `https://bithub-jaipur-development.onrender.com`

---

## 5. Workflows and Execution Commands

### Workflow A: Updating BIT Mesra Analytics / Feedback / Static Pages
1. Copy `.env.example` to `.env.local` (if not already present) and set your Apps Script URLs.
2. Run `node generate-env.js` to generate `bit-mesra/env-config.js` for local testing.
3. Verify that `git status` does **not** include `.env.local` or `bit-mesra/env-config.js`, and commit your changes.

### Workflow B: Publishing BIT Jaipur Frontend Changes
1. Edit React source files inside `bit-jaipur-src/`.
2. Compile the frontend into `../bit-jaipur/`:
   ```bash
   cd bit-jaipur-src
   npm install
   npm run build
   ```
3. Stage both `bit-jaipur-src/` and `bit-jaipur/`, commit, and push.
