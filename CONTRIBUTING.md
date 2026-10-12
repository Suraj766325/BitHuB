# Contributing to BitHub 🚀

Welcome to the **BitHub** project! This repository contains student resources for Birla Institute of Technology campuses (Mesra and Jaipur). 

This guide details the contribution procedures and protocols specifically for working on the **BIT Jaipur** portion of the project. Please follow these protocols to ensure a smooth, clean, and effective collaboration.

---

## 🛠️ Step-by-Step Contribution Workflow

### 1. Clone the Repository
Start by cloning the repository to your local system and navigating into the project directory:
```bash
git clone https://github.com/Suraj766325/BitHuB.git
cd BitHuB
```

### 2. Create the Branch
Always create a branch named `bit_jaipur` for your contributions related to the Jaipur campus. Do not work directly on the `master` or `main` branch.
```bash
git checkout -b bit_jaipur
```
> [!IMPORTANT]
> To keep the commit history clean and prevent conflicts, all BIT Jaipur-related updates must be developed on the `bit_jaipur` branch.

### 3. Local Setup & Development
The source code for the Jaipur campus is a **React + Vite** application located in the `bit-jaipur-src` directory.

1. Navigate to the source directory:
   ```bash
   cd bit-jaipur-src
   ```
2. Install the project dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open the local address (typically `http://localhost:3000`) in your browser to test and make edits.

### 4. Build the Project
After making your changes and verifying them on the development server, you **must compile the project**:
```bash
npm run build
```
This build command compiles your React source files into optimized, production-ready static assets and places them directly into the root `bit-jaipur/` directory.

---

## 📦 Why is a Build Necessary? (Vercel Static Deployment)

The live site `bithub.co.in` is deployed on **Vercel** from the repository root.
- **Static Serving from Root:** Vercel serves the root Campus Selector (`index.html`), `bit-mesra/`, and the pre-compiled `bit-jaipur/` folder directly as static assets.
- **Serving Path:** The Jaipur campus website is served directly from the `bit-jaipur/` folder at the root of this repository.
- **The Compilation Step:** Running `npm run build` inside `bit-jaipur-src/` compiles the React project and outputs the files directly into `bit-jaipur/`. 
- **Mandatory Commits:** If you only modify files in the `bit-jaipur-src/` directory but do not compile them, your changes will **not** appear on the live site. You must run `npm run build` and commit the updated files in both directories:
  1. `bit-jaipur-src/` (your source code updates)
  2. `bit-jaipur/` (the compiled production assets)

---

## 🤝 Protocols for Working Effectively

To maintain code quality and avoid development bottlenecks, all contributors must adhere to these standards:

### 🔄 Keep Your Branch Up to Date
Before starting any new work, pull the latest changes from the upstream repository to avoid git conflicts:
```bash
# Fetch and merge updates from the main upstream branch
git checkout master
git pull upstream master
git checkout bit_jaipur
git merge master
```

### 🚫 Never Manually Modify the Build Folder
**Do not** edit files inside the `bit-jaipur/` directory directly. Any manual changes in `bit-jaipur/` will be permanently overwritten the next time the project is built. Always make your modifications inside `bit-jaipur-src/` and run `npm run build`.

### 🧪 Verify the Build Locally
Before staging your changes, run `npm run build` to ensure the compilation completes without syntax or compiler errors. Use the local server or preview (`npm run preview`) to verify the production build runs cleanly.

### 📝 Write Clean Commits & PRs
1. **Stage both the source and build output:**
   ```bash
   git add bit-jaipur/ bit-jaipur-src/
   ```
2. **Commit with clear messages:** Use conventional prefixes like `feat(jaipur):` or `fix(jaipur):` to describe your changes.
   ```bash
   git commit -m "feat(jaipur): add dynamic search filter to previous year papers"
   ```
3. **Submit a Pull Request (PR):** Push your branch to your fork and submit a PR from your `bit_jaipur` branch into the upstream `master`/`main` branch.

---

## ⚠️ Common Pitfalls & Code Quality Standards

To prevent production build failures and runtime bugs, all contributors must check their changes against these guidelines before submitting a pull request:

### 1. File Encoding Requirements
* **UTF-8 Only:** All source files and configuration files (including `.env`, `.env.production`, `.json`, `.js`, `.jsx`, `.css`) **must** be saved using **UTF-8 encoding**. 
* Do **not** commit files in UTF-16LE or other encodings. Node.js environment loaders and dotenv parsers do not support UTF-16, which causes environment variables to resolve to `undefined` during compilation.

### 2. Run Local Build Tests
* Always run `npm run build` inside `bit-jaipur-src/` to verify that your changes compile without parser warnings, duplicate variable declarations, unclosed JSX elements, or syntax errors. If the local build fails, the deployment on GitHub Pages will fail.

### 3. Avoid Duplicate Network Calls & Side Effects
* When updating base URLs or routing paths, verify that you have cleaned up and deleted legacy code lines. 
* Do not leave redundant fetch calls or `window.open` statements running sequentially. This triggers multiple parallel requests (causing console 404s) and opens duplicate browser tabs.
* Centralize all API routing modifications in `bit-jaipur-src/src/config.js` via the `API_BASE` variable.

### 4. Check for Duplicate Object Keys
* Double-check JavaScript object literals for duplicate keys (e.g. duplicating key definitions in database maps or layouts). JavaScript will silently overwrite preceding values with the last key, which can hide files or render components incorrectly.

### 5. Environment Variables, Apps Script Security & Fallbacks (BIT Mesra & Vercel)
* **Never Hardcode Keys or URLs:** Do not hardcode Google Apps Script `/exec` URLs or API keys inside `bit-mesra/index.html`, `bit-mesra/event.html`, `bit-mesra/feedback.html`, or any committed file.
* **Use `.env.local` and `generate-env.js`:**
  1. Copy `.env.example` to `.env.local` (which is git-ignored) and fill in `APPS_SCRIPT_ANALYTICS_URL`, `APPS_SCRIPT_FEEDBACK_URL`, and `APPS_SCRIPT_PAUSED=false`.
  2. Run `node generate-env.js` at the repository root to generate the git-ignored `bit-mesra/env-config.js` runtime file.
  3. On **Vercel**, select **`BitHuB (root)`** as the Root Directory and configure those environment variables in the Vercel Dashboard; `vercel.json` runs `node generate-env.js` automatically during deployment.
* **Preserve Maintenance Fallbacks:** When the API is paused, unconfigured, or unreachable, the UI must gracefully display:
  - Analytics (`index.html`, `event.html`): `"Live analytics is temporarily paused for maintenance."`
  - Feedback (`feedback.html`): `"Feedback submissions are temporarily paused for scheduled maintenance and security updates. Please check back later."`

---

Thank you for contributing to BitHub! Your efforts help make campus resources more accessible for everyone. If you run into issues, please open an issue or reach out to the project maintainer.
