# Contributing to Task Management App

Thank you for your interest in contributing to the Task Management App! We welcome contributions from the community to help improve this project.

---

## 🛠️ Development Setup

### 1. Fork and Clone
```bash
# Clone your fork
git clone https://github.com/<your-username>/management-app.git
cd management-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your local or Atlas MongoDB credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Ensure VITE_API_URL points to your running backend (e.g., http://localhost:5000/api)
npm run dev
```

---

## 🌿 Branching & Commit Guidelines

- **Branch Naming**:
  - `feat/feature-name` for new features
  - `fix/bug-name` for bug fixes
  - `docs/update-readme` for documentation updates
- **Commit Messages**: Follow conventional commits:
  - `feat: add task drag-and-drop support`
  - `fix: resolve auth token refresh issue`
  - `docs: update setup guide`

---

## 🧪 Testing Your Changes

- Ensure TypeScript compiles cleanly without errors:
  ```bash
  cd frontend && npm run build
  cd ../backend && npm run build # if applicable
  ```
- Test all API endpoints locally before submitting your Pull Request.

---

## 📬 Submitting a Pull Request

1. Push your branch to your forked repository.
2. Open a Pull Request against the `main` branch.
3. Provide a clear description of the changes and link any related issues.
4. Ensure code formatting and styles remain consistent with the codebase.
