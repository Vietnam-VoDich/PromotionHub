# 🚀 GitHub Setup Instructions for PromotionHub

**Date:** 2026-01-29
**Project:** PromotionHub - Billboard Marketplace
**Status:** Ready for GitHub

---

## 📋 Setup Steps

### 1️⃣ Create GitHub Repository

**Option A: GitHub Web UI**

1. Go to: https://github.com/new
2. **Repository name:** `promotionhub` (or `PromotionHub`)
3. **Description:** "Marketplace platform for outdoor advertising in Abidjan"
4. **Visibility:** Private (at least until launch)
5. **Skip:** "Initialize this repository with" options (we already have commits)
6. Click **Create repository**

**Option B: GitHub CLI (If installed)**

```bash
gh repo create promotionhub \
  --private \
  --description "Marketplace platform for outdoor advertising in Abidjan" \
  --source=/Users/AaronBesnainou/Projects/PromotionHub \
  --remote=origin \
  --push
```

---

### 2️⃣ Push Local Repository to GitHub

After creating the repo on GitHub, run:

```bash
cd /Users/AaronBesnainou/Projects/PromotionHub

# Add remote (replace YOURUSERNAME)
git remote add origin https://github.com/YOURUSERNAME/promotionhub.git

# Rename branch to main (if needed)
git branch -M main

# Push main branch
git push -u origin main

# Push develop branch
git push -u origin develop
```

---

### 3️⃣ Configure GitHub Repository Settings

**Go to:** https://github.com/YOURUSERNAME/promotionhub/settings

#### Protection Rules

**For `main` branch:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require code reviews before merging (2 approvals)
- ✅ Dismiss stale pull request approvals when new commits are pushed

**For `develop` branch:**
- ✅ Require a pull request before merging
- ⚠️ Code reviews: 1 approval minimum

#### Collaborators

Add team members:
- Backend leads
- Frontend lead
- Mobile lead
- Product manager
- DevOps engineer

---

### 4️⃣ Setup Branch Strategy (Git Flow)

```
main (production)
  ↑
  ├─ release/v1.0.0 (release candidates)
  ├─ develop (integration branch)
  │   ├─ feature/backend-setup (from Sprint 1)
  │   ├─ feature/listings-api (from Sprint 2)
  │   ├─ feature/payments (from Sprint 3)
  │   ├─ feature/web-frontend (from Sprint 5)
  │   ├─ bugfix/auth-validation
  │   └─ ...more feature branches...
  └─ hotfix/security-patch (emergency fixes)
```

**Branch naming conventions:**
- Feature: `feature/short-description` (e.g., `feature/auth-system`)
- Bugfix: `bugfix/short-description` (e.g., `bugfix/password-reset`)
- Release: `release/v1.0.0`
- Hotfix: `hotfix/security-issue`

---

### 5️⃣ GitHub Projects Setup (For Task Tracking)

**Go to:** https://github.com/YOURUSERNAME/promotionhub/projects

Create **Board:** "PromotionHub Sprint Board"

**Columns:**
- Todo (default)
- In Progress
- Review
- Done

**Link sprints:**
- Sprint 1 (Week 3)
- Sprint 2 (Week 4)
- Sprint 3 (Week 5)
- Sprint 4 (Week 5-6)
- Sprint 5 (Week 6)
- Sprint 6 (Week 6)
- Sprint 7 (Week 7)
- Sprint 8 (Week 8)
- Sprint 9 (Week 9)

---

### 6️⃣ GitHub Actions Setup (CI/CD)

Create `.github/workflows/` directory with these files:

#### `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Build
        run: npm run build
```

#### `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Deploy to production
        run: |
          # Add deployment scripts here
          echo "Deploying to AWS..."
```

---

### 7️⃣ Issues & Pull Request Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug report
about: Report a bug
title: '[BUG] '
labels: bug
---

## Description
Brief description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- Browser/App:
- OS:
- Version:

## Screenshots
If applicable, add screenshots.
```

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Testing
How was this tested?

## Screenshots
If applicable, add screenshots.

## Checklist
- [ ] Tests pass
- [ ] Code review completed
- [ ] Documentation updated
```

---

### 8️⃣ Add .gitignore for Different Languages

**Already done!** But verify it includes:

```
# Node.js
node_modules/
npm-debug.log
yarn-error.log

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Testing
coverage/
```

---

### 9️⃣ Add Repository Secrets (for CI/CD)

**Go to:** Settings → Secrets and variables → Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID` (for deployment)
- `AWS_SECRET_ACCESS_KEY` (for deployment)
- `DATABASE_URL` (for testing)
- `SENDGRID_API_KEY` (if needed in CI)

---

### 🔟 Documentation Setup

**README.md:** ✅ Already created
**CONTRIBUTING.md:** Create guidelines for contributors

```markdown
# Contributing to PromotionHub

## Development Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Make changes and commit
5. Push and create pull request

## Code Style

- Use ESLint + Prettier
- Follow existing patterns
- Add tests for new features

## Pull Request Process

1. Update documentation
2. Add tests
3. Ensure all tests pass
4. Get code review approval
5. Merge to develop
```

---

## 📊 Current Git Status

```
✅ Local repo initialized
✅ All files committed
✅ Main branch created
✅ Develop branch created
✅ .gitignore configured
⏭️ Remote origin (GitHub) - needs setup
⏭️ Branch protection rules - needs setup
⏭️ GitHub Actions - needs setup
```

---

## 🚀 Quick Commands

### Clone for team members

```bash
git clone https://github.com/YOURUSERNAME/promotionhub.git
cd promotionhub
npm install
npm run dev
```

### Create a feature branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "Description of changes"
git push -u origin feature/your-feature-name
# Create Pull Request on GitHub
```

### Merge to main (release)

```bash
git checkout main
git pull origin main
git merge --no-ff develop
git tag v1.0.0
git push origin main --tags
```

---

## 📋 Checklist for Setup

Before Sprint 1 starts:

- [ ] GitHub repo created
- [ ] Remote origin added locally
- [ ] Main + develop branches pushed
- [ ] Branch protection rules configured
- [ ] Team members added as collaborators
- [ ] GitHub Projects board created
- [ ] GitHub Actions workflows setup
- [ ] Issue templates created
- [ ] PR template created
- [ ] README reviewed and updated
- [ ] All team members can clone and run locally

---

## 💬 Team Communication Setup

Also setup on GitHub:
- [ ] Team discussions enabled (GitHub Discussions)
- [ ] Notifications configured
- [ ] Discord/Slack webhook for commits (optional)
- [ ] Auto-linking issues in PRs

---

## 🔐 Security Best Practices

- ✅ Use SSH keys instead of HTTPS (if possible)
- ✅ Enable 2FA on GitHub account
- ✅ Use deploy keys for CI/CD (not personal tokens)
- ✅ Keep secrets in GitHub Secrets, not in code
- ✅ Regularly rotate access tokens

---

## 📞 Quick Reference

**GitHub Repo URL:** https://github.com/YOURUSERNAME/promotionhub

**Local Path:** `/Users/AaronBesnainou/Projects/PromotionHub`

**Current Status:** Ready for team setup (awaiting GitHub repo creation)

---

**Next Step:** Create GitHub repo and complete setup above! 🚀
