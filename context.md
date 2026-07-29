# BitHuB Workspace Context & Guide

Welcome, future agents! This document serves as the ultimate map for understanding the architecture, repositories, and workflows for the BitHuB project, specifically for the **BitHuB Jaipur** campus. 

Read this carefully before making architectural changes or pushing code.

---

## 1. Directory Structure & Repository Roles

The local environment consists of three distinct side-by-side directories, each mapping perfectly to a single environment and GitHub repository. 

### `NEW BITHUB\BitHub-Frontend-Official` (The Upstream Fork)
- **Role:** This repository hosts the final production frontends for both the Mesra and Jaipur campuses via GitHub Pages. It is a fork of the official project, used exclusively to track the frontend and submit PRs.
- **Key Folders:**
  - `bit-jaipur-src/`: The uncompiled React+Vite source code for the Jaipur frontend.
  - `bit-jaipur/`: The compiled, optimized static assets (HTML/CSS/JS) for the Jaipur frontend. GitHub Pages serves the live site directly from this folder.
- **Remotes:**
  - `origin`: `https://github.com/Suraj766325/BitHuB` (Upstream, no direct write access).
  - `fork`: `https://github.com/ananttheacharya/BitHubv2.git` (Personal fork used to submit Pull Requests).

### `NEW BITHUB\BitHub-Jaipur-Development` (The Dev Environment)
- **Role:** This is the primary sandbox for prototyping, fixing bugs, and testing new changes to both the backend and frontend. It connects to the Render dev environments. It is completely isolated from production.
- **Key Folders:**
  - `Front-End New/`: The active development folder for the React frontend (deploys to static site).
  - `Backend/`: The Node/Express backend codebase.
- **Remote:**
  - `origin`: `https://github.com/ananttheacharya/BitHuB-Jaipur-backup.git`

### `NEW BITHUB\BitHub-Jaipur-Production` (The Prod Backend Environment)
- **Role:** This represents the stable production backend that powers the live production frontend. Changes merged into `main` here instantly affect the live production systems.
- **Remote:**
  - `origin`: `https://github.com/ananttheacharya/BitHub-Jaipur.git`

---

## 2. Environment & Infrastructure

### Production Systems
- **Live Website (Frontend):** `https://bithub.co.in` (served from `Suraj766325/BitHuB`)
- **Live Backend API:** `https://bithub-jaipur.onrender.com`

### Development Systems
- **Dev Frontend Site:** `https://bithub-jaipur-development-front.onrender.com/`
- **Dev Backend API:** `https://bithub-jaipur-development.onrender.com`

### Databases
- The project uses MySQL databases hosted on cloud providers (Aiven, Railway).
- Database scripts sometimes require SSH tunneling (e.g., using `megahacker@100.125.3.111`).
- **CRITICAL RULE:** *Never hardcode passwords or secrets in the codebase.* Always read them from `.env` files.

---

## 3. Workflows and Execution Commands

### Workflow A: Everyday Dev & Testing (BitHub-Jaipur-Development)
When writing new features, modifying the backend, or fixing the frontend:
1. Work inside the `BitHub-Jaipur-Development` folder.
2. Commit your changes and push to `origin`.
   - **Mid-Development**: Push to a branch like `bit_jaipur`.
   - **Ready for Dev Deploy**: Merge or push to `main`. This triggers the Render dev environment to auto-deploy the frontend and backend within 50-120 seconds.

### Workflow B: Pushing to Production Backend (BitHub-Jaipur-Production)
When the backend code is stable and tested in Dev:
1. Sync or copy your changes from Development into `BitHub-Jaipur-Production/Backend`.
2. Commit and push to `origin` (`main` branch). This triggers Render to update the live production backend.

### Workflow C: Publishing Frontend Changes to the Main Website (BitHub-Frontend-Official)
When the frontend features are complete in Dev and you want to publish them to `bithub.co.in`:
1. Copy the source code: Copy `BitHub-Jaipur-Development/Front-End New` into `BitHub-Frontend-Official/bit-jaipur-src`.
2. Navigate to `BitHub-Frontend-Official/bit-jaipur-src` and compile the frontend:
   ```bash
   npm install
   npm run build
   ```
   *(This outputs the compiled UI directly into `../bit-jaipur/`).*
3. Check out the `bit_jaipur` branch, stage, commit, and push to the **FORK**:
   ```bash
   cd ..
   git checkout bit_jaipur
   git add bit-jaipur-src/ bit-jaipur/
   git commit -m "feat(jaipur): update frontend"
   git push -f fork bit_jaipur
   ```
4. Open a Pull Request on GitHub from `ananttheacharya/BitHubv2` to `Suraj766325/BitHuB`.

