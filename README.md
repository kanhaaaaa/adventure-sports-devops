# Adventure Sports Store — Full Stack DevOps Implementation

![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

> A production-ready full-stack application with automated CI/CD pipeline, cloud deployment, and containerized backend — built using modern DevOps practices.

---

## Team

| Name | Role |
|------|------|
| Aditya Kapoor | Frontend Engineer |
| Manas Goel | Backend Engineer |
| Prathmesh Sundaram | DevOps Engineer |

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Architecture](#architecture)
- [CI/CD Pipeline](#cicd-pipeline)
- [Git Workflow](#git-workflow)
- [Tools & Technologies](#tools--technologies)
- [Project Structure](#project-structure)
- [GitHub Secrets](#github-secrets)
- [Challenges & Solutions](#challenges--solutions)
- [Live Deployment](#live-deployment)
- [Final Outcome](#final-outcome)

---

## Problem Statement

The objective of this project is to design, build, and deploy a full-stack application using modern DevOps practices.

The system includes:
- A frontend UI for managing products
- A backend REST API built with Spring Boot
- A cloud-hosted MySQL database

Key challenges addressed:
- Automate the software delivery lifecycle
- Ensure seamless frontend-backend-database integration
- Implement CI/CD with secure and scalable deployment

---

## Architecture

```
+--------------------------------+
|  Frontend (HTML/JS - Render)   |
+----------------+---------------+
                 | HTTP Requests
+----------------v---------------+
| Backend (Spring Boot - Render) |
+----------------+---------------+
                 | JDBC / MySQL
+----------------v---------------+
|   Database (MySQL - Railway)   |
+--------------------------------+
                 ^
                 | Automated Deployment
+----------------+---------------+
| CI/CD Pipeline (GitHub Actions)|
+--------------------------------+
```


---

## CI/CD Pipeline

A multi-stage CI/CD pipeline is implemented using GitHub Actions.

### Pipeline Flow

```
Push to main
     |
     v
+---------+    +--------------+    +---------+    +--------+
|  Build  | -> | Docker Build | -> |  Test   | -> | Deploy |
+---------+    +--------------+    +---------+    +--------+
```

### Stage Breakdown

| Stage | Description |
|-------|-------------|
| Build | Checkout code, setup JDK 17, compile with Maven |
| Docker Build | Containerize backend into a Docker image |
| Test | Run `mvn test` against the container — pipeline halts on failure |
| Deploy | Trigger Render Deploy Hook on successful push to `main` |

### Workflow File

```yaml
# .github/workflows/ci-cd.yml
name: Java CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:

  # 🔹 BUILD + SECURITY + DOCKER
  build:
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout code
      - name: Checkout code
        uses: actions/checkout@v3

      # 2. Secret scan (DevOps best practice)
      - name: Scan for Secrets using Gitleaks
        uses: gitleaks/gitleaks-action@v2
        with:
          args: detect --source=. --verbose --redact

      # 3. Setup Java
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      # 4. Build with Maven (creates JAR)
      - name: Build with Maven
        run: |
          cd backend
          mvn clean package -DskipTests

      # 5. Build Docker Image 🐳
      - name: Build Docker Image
        run: docker build -t adventure-sports-app ./backend

  # 🔹 TEST JOB
  test:
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      # Run tests
      - name: Run Tests
        run: |
          cd backend
          mvn test

  # 🔹 DEPLOY JOB (CD)
  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Trigger Render Deploy
        env:
          RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: curl -X POST "$RENDER_DEPLOY_HOOK"
```

---

## Git Workflow

A structured branching strategy was followed throughout the project.

### Branch Strategy

```
main                                    <- Production-ready code
  └── develop                           <- Integration / development
        └── feature/devops-enhancement  <- Feature work
```

### Workflow Practices

- 5+ meaningful commits per feature
- Feature branching strategy enforced
- Pull Requests (PRs) for all merges
- Code review required before merging to `main`

---

## Tools & Technologies

| Tool | Purpose |
|------|---------|
| GitHub | Version Control |
| GitHub Actions | CI/CD Pipeline |
| Render | Backend & Frontend Deployment |
| Railway | MySQL Database Hosting |
| Docker | Containerization |
| Maven | Build & Test Tool |
| Gitleaks | Secret / Credential Scanning |

---

## Project Structure

```
adventure-sports-devops/
├── backend/
│   ├── src/
│   │   └── main/java/...
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── index.html
│   └── app.js
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docs/
│   └── architecture.png
└── README.md
```

---

## GitHub & Render Secrets

Sensitive credentials are securely managed using GitHub Secrets — no hardcoded values in source code.

| Secret | Purpose |
|--------|---------|
| `RENDER_DEPLOY_HOOK` | Triggers deployment on Render |
| `DB_URL` | MySQL connection string from Railway |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Database connection failures (Render to Railway) | Used the public MySQL URL provided by Railway |
| CORS errors between frontend and backend | Added `@CrossOrigin(origins = "*")` on controllers |
| Port binding issues on Render | Set `server.port=${PORT:8080}` and `server.address=0.0.0.0` |
| Cached frontend causing wrong API calls | Cleared browser cache and removed stale `localStorage` data |
| CI/CD deploy hook misconfiguration | Configured GitHub Secrets and verified hook URL |
| Branch mismatch (`develop` vs `main`) | Enforced pipeline trigger only on `main` branch |

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://your-frontend.onrender.com` |
| Backend API | `https://your-backend.onrender.com/products` |

> Replace placeholder URLs with your actual Render deployment links.

---

## Screenshots

| CI/CD Pipeline | Deployment Output |
|----------------|-------------------|
| *(Add screenshot of GitHub Actions: build → test → deploy)* | *(Add screenshot of live frontend/backend)* |

> Place screenshots in the `/docs` folder and update paths here.

---

## Final Outcome

| Deliverable | Status |
|-------------|--------|
| Full-stack application deployed on cloud | Done |
| Multi-stage CI/CD pipeline implemented | Done |
| Automated deployment on push to `main` | Done |
| Secure handling of credentials via GitHub Secrets | Done |
| Production-ready, containerized system | Done |

---

## Conclusion

This project demonstrates a complete end-to-end DevOps implementation — CI/CD automation using GitHub Actions, cloud deployment using Render and Railway, a containerized backend with Docker, and secure credential management. Real-world deployment issues were encountered and resolved, making this a practical demonstration of production DevOps workflows.

---

<p align="center">Built as part of a Full Stack DevOps learning project</p>
