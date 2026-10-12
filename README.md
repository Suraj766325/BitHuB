# BitHub

Welcome to the official repository for **BitHub** (available at [bithub.co.in](https://bithub.co.in)). BitHub is a student-run resource hub providing notes, previous year question papers, syllabus resources, and dashboards for Birla Institute of Technology (BIT) campuses.

---

## Repository Map

This repository is structured as a unified multi-directory site served from the root Campus Selector portal via **Vercel**. Below is an overview of the key folders and files:

```
BitHuB/
├── index.html            # Main campus selection portal (Mesra, Jaipur, and Partner Banner)
├── HungryBirds.html      # BitHub x HungryBirds.food student venture collaboration portal
├── vercel.json           # Root Vercel configuration (env build and /HungryBirds route)
├── .vercelignore         # Excludes uncompiled source/dev folders from static bundle
├── generate-env.js       # Build script: injects env vars into bit-mesra/env-config.js
├── .env.example          # Template for required Google Apps Script environment variables
├── .env.local            # Local secret environment variables (GIT-IGNORED)
├── assets/
│   └── hungrybirds/      # Promotional banner and brand emblem assets for HungryBirds
│
├── bit-mesra/            # BIT Mesra static site
│   ├── index.html        # Mesra homepage (courses, wellness poll, live trends chart)
│   ├── event.html        # Live Analytics dashboard for subject demand
│   ├── feedback.html     # Student feedback portal with maintenance fallback
│   ├── env-config.js     # Auto-generated runtime config (GIT-IGNORED)
│   ├── styles.css        # Stylesheet for Mesra resources
│   └── (modules/assets)  # Notes, PDFs, and curriculum resources
│
├── bit-jaipur/           # BIT Jaipur production build (DO NOT EDIT DIRECTLY)
│   ├── index.html        # Compiled dashboard entrypoint
│   ├── assets/           # Compiled and hashed JS/CSS assets
│   └── favicon.svg       # Jaipur icon assets
│
└── bit-jaipur-src/       # BIT Jaipur React + Vite source code (EDIT HERE)
    ├── src/              # React components, fonts, and assets
    ├── public/           # Static files copied to build directory
    ├── package.json      # Node scripts and dependencies
    └── vite.config.js    # Bundler and build pipeline configuration
```

---

## System Architecture

### 1. Unified Multi-Campus Routing (Root Entrypoint)
- **Entrypoint (`/index.html`):** All traffic starts at the root Campus Selector page, which links to `bit-mesra/index.html`, `bit-jaipur/index.html`, and the student venture spotlight (`/HungryBirds`).
- **Vercel Root Configuration (`vercel.json`):** Explicitly sets `"framework": null`, `"outputDirectory": "."`, and a URL rewrite from `/HungryBirds` to `/HungryBirds.html` at the repository root so Vercel does not misidentify `bit-jaipur-src/` as the sole project root.

### 2. Zero-Hardcoded Environment Pipeline (`generate-env.js`)
- **No Hardcoded Keys:** Google Apps Script URLs and deployment keys are **never** hardcoded in HTML or committed to Git.
- **Build-Time Injection:** Running `node generate-env.js` reads variables from `.env.local` (locally) or `process.env` (on Vercel) and generates `bit-mesra/env-config.js` (`window.__BITHUB_ENV__`), which is strictly git-ignored.
- **Endpoints Configured:**
  - `APPS_SCRIPT_ANALYTICS_URL`: Powers course card click tracking (`POST`) and live subject trends charts (`GET`) in `bit-mesra/index.html` and `bit-mesra/event.html`.
  - `APPS_SCRIPT_FEEDBACK_URL`: Powers the student feedback form (`POST`) in `bit-mesra/feedback.html` and the Wellness Check popup poll (`POST`) in `bit-mesra/index.html`.
  - `APPS_SCRIPT_PAUSED`: Boolean toggle (`true` / `false`) to pause all Apps Script integrations globally.

### 3. Graceful Maintenance Fallbacks
When an Apps Script endpoint is paused (`APPS_SCRIPT_PAUSED=true`), unconfigured (`env-config.js` missing), or unreachable (network/HTTP/payload error):
- **Live Analytics Fallback (`bit-mesra/index.html` & `bit-mesra/event.html`):**
  Displays: *"Live analytics is temporarily paused for maintenance."*
- **Feedback Form Fallback (`bit-mesra/feedback.html`):**
  Displays an amber status banner: *"Feedback submissions are temporarily paused for scheduled maintenance and security updates. Please check back later."* and disables the submit button (`Service Temporarily Paused`).

### 4. Campus Venture Collaboration (`BitHub x HungryBirds.food`)
- **Overview & Route (`/HungryBirds` / `HungryBirds.html`):** A dedicated partner redirect portal linked from the root Campus Selector (`index.html`), showcasing the student food venture collaboration (`BitHub x HungryBirds.food`) with an external launch dock pointing to `http://hungrybirds.food`.
- **Promotion Timeline:** This promotion is scheduled to run until **15th Nov, 2026**.
- **Campus Availability & Network Requirement:** Available exclusively for **BIT Mesra Campus** and accessible via mobile cellular data only (users connected to campus Wi-Fi must switch to mobile data to access the external site).
- **Non-Ownership Disclosure:** BitHub does not own or operate HungryBirds (`hungrybirds.food`). This placement is an independent, free-of-cost promotion conducted to encourage student entrepreneurial vigor on campus.

---

## Contribution Guidelines

We welcome contributions to improve student resources for both campuses! 

- If you are contributing to the **BIT Jaipur** dashboard (React + Vite), please consult the detailed instructions in [CONTRIBUTING.md](file:///c:/Superceed_vscode/OPEN%20Source%20Contribution/BitHuB/CONTRIBUTING.md).
- **Core Contribution Rule for Jaipur:** 
  Always branch off and name your branch `bit_jaipur`. You must edit the files in `bit-jaipur-src/` and run `npm run build` so that the compiled production files in `bit-jaipur/` are updated. Commit both directories before submitting your pull request.
- **Core Contribution Rule for Mesra Analytics/Feedback:**
  Copy `.env.example` to `.env.local`, populate your Apps Script URLs, and run `node generate-env.js`. Never hardcode Apps Script URLs in HTML files.

---

## Technical Requirements & Deployment

- **Node.js**: v16.0 or higher (for running `node generate-env.js` and compiling Jaipur assets)
- **File Encoding**: UTF-8 encoding is strictly required for all code and configuration files. Do not commit files in UTF-16LE.
- **Vercel Deployment**:
  1. Select **`BitHuB (root)`** as the Root Directory when importing the project.
  2. In **Project Settings -> Environment Variables**, configure:
     - `APPS_SCRIPT_ANALYTICS_URL`
     - `APPS_SCRIPT_FEEDBACK_URL`
     - `APPS_SCRIPT_PAUSED` (`false`)
  3. Vercel automatically runs `node generate-env.js` via `vercel.json` and serves the site starting from the root Campus Selector page at [bithub.co.in](https://bithub.co.in).

---

*Designed and Developed by Team BitHub.*
