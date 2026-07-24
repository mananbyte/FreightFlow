# FreightFlow

> **A full-stack trucking compliance platform built with Django + React**

FreightFlow helps drivers and dispatchers plan routes that stay compliant with **Hours of Service (HOS)** rules, visualize **ELD paper-log style sheets**, and make better operational decisions with interactive trip planning tools.

---

## ✨ Overview

FreightFlow is designed to modernize trucking compliance workflows by combining:

- **Regulatory logic** (HOS-aware planning)
- **Operational visibility** (route and trip visualization)
- **User-friendly interfaces** (dispatcher + driver oriented UI)

It bridges the gap between compliance-heavy backend processing and intuitive, map-driven frontend experiences.

---

## 🧱 Tech Stack

### Backend
- **Python / Django**
- REST-oriented service architecture for trip planning and compliance logic

### Frontend
- **React (JavaScript)**
- **CSS / HTML** for responsive interface components

### DevOps / Tooling
- **Dockerfile** support for containerized workflows
- **Shell scripts** for setup/automation tasks (where applicable)

---

## 📊 Language Composition

- JavaScript — **54.3%**
- CSS — **24.2%**
- Python — **19.8%**
- HTML — **1.4%**
- Dockerfile — **0.2%**
- Shell — **0.1%**

---

## 🚚 Core Features

- **Route Planning with Compliance Awareness**
  - Build trips with HOS constraints in mind
  - Reduce planning risk before dispatch

- **Hours of Service (HOS) Logic**
  - Compliance-focused time window handling
  - Driving/on-duty/rest pattern support

- **ELD Log Sheet Visualization**
  - Dynamic paper-log style rendering
  - Helpful for audits, review, and operations checks

- **Interactive Map Experience**
  - Visual trip context for dispatch and drivers
  - Better decision-making through map-based planning

---

## 🏗️ High-Level Architecture

```text
React Frontend (UI, Maps, Logs)
        ↓
Django API Layer (Auth, Routing, HOS Rules)
        ↓
Compliance + Planning Services
        ↓
Data Storage / Trip & Log Records
```

---

## ⚙️ Getting Started

> The exact commands may vary slightly based on your local project structure. Use the repo’s existing scripts/config where available.

### 1) Clone the repository
```bash
git clone https://github.com/mananbyte/FreightFlow.git
cd FreightFlow
```

### 2) Backend setup (Django)
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3) Frontend setup (React)
```bash
cd frontend
npm install
```

### 4) Run the app (development)

Backend (from backend root):
```bash
python manage.py runserver
```

Frontend (from frontend root):
```bash
npm start
```

---

## 🧪 Suggested Environment Variables

Create a `.env` (or framework-specific env file) and configure values such as:

```env
DEBUG=true
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

> Replace with your production-safe values in deployed environments.

---

## 📁 Suggested Project Structure

```text
FreightFlow/
├─ backend/              # Django app(s), APIs, business logic
├─ frontend/             # React application
├─ docker/ or Dockerfile # Containerization assets
├─ scripts/              # Utility/setup scripts
└─ README.md
```

---

## 🗺️ Product Roadmap

Planned and potential next steps:

- Enhanced real-time dispatch workflows
- Expanded compliance rule coverage
- Better analytics and operational reporting
- Improved collaboration features for teams

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`feature/your-feature-name`)
3. Commit your changes
4. Push and open a Pull Request

Please keep commits focused and include clear descriptions for behavior changes.

---

## 📄 License

Add your project license here (e.g., MIT, Apache-2.0).

If no license is currently defined, all rights remain with the repository owner by default.

---

## 🙌 Acknowledgments

Built for modern freight operations where compliance and usability must work together.
