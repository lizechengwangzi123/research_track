# 🔬 ResearchTrack
[English] | [简体中文](./README_ZH.md)

### The Clinical Editorial & Laboratory Collaboration Suite

**ResearchTrack** is a high-performance, full-stack collaboration platform designed specifically for research laboratories and clinical editorial teams. It streamlines the lifecycle of scientific manuscripts—from initial ideation to final publication—while facilitating real-time communication and network-wide discovery.

---

## 🚀 Live Demo
**Frontend:** [research-track.vercel.app](https://research-track.vercel.app)  
**Backend API:** [research-track.onrender.com](https://research-track.onrender.com/health)

---

## ✨ Key Features

### 📈 Manuscript Intelligence
- **Active Pipeline Management:** Track research progress through stages: *Ideation, Drafting, Submitted, Under Review, and Published*.
- **Scientific Visualization:** Real-time statistics featuring custom SVG-based **Submission Funnels** and **Allocation Heatmaps**.
- **Dynamic Prioritization:** Drag-and-drop style ordering system to manage project importance.

### 💬 Real-time Laboratory Sync
- **Advanced Chat:** Instant messaging powered by Socket.io with smooth automatic scrolling to the latest updates.
- **Multimedia Support:** Seamlessly share files and paste images directly from your clipboard into the discussion.
- **Smart Notifications:** Real-time unread message counts with audible "Ding" alerts for new collaboration requests.

### 🌐 Network & Discovery
- **Expert Search:** Find colleagues by email to expand your research network.
- **Progress Tracking:** Follow your friends' research summaries, including journal names, submission dates, and time-in-review metrics.
- **Nature Journal Feed:** A live, automated RSS feed fetching the latest breakthroughs directly from the official Nature Journal.

### 🔐 Security & Reliability
- **Email Verification:** Secure 6-digit code verification system for new laboratory accounts.
- **Recovery Flow:** Full password reset functionality via secure email links.
- **High Availability:** Automated "Heartbeat" system using GitHub Actions to prevent server sleep.

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 (TypeScript)
- Vite
- Tailwind CSS 4
- Socket.io Client
- Framer Motion (Animations)

**Backend:**
- Node.js (Express)
- TypeScript
- Prisma ORM
- PostgreSQL (via Supabase)
- Socket.io (WebSockets)
- Nodemailer (SMTP Integration)
- RSS Parser

---

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Clone the repository
```bash
git clone https://github.com/lizechengwangzi123/research_track.git
cd research_track
```

### 2. Backend Setup
```bash
cd server
npm install
# Create .env file and add your DATABASE_URL, JWT_SECRET, and SMTP credentials
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install --legacy-peer-deps
# Create .env file and add VITE_API_URL=http://localhost:3001/api
npm run dev
```

---

## 📋 Environment Variables

| Key | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for token generation |
| `CLIENT_URL` | URL of the frontend (for CORS) |
| `SMTP_USER` | Gmail/SMTP email address |
| `SMTP_PASS` | App-specific password |
| `VITE_API_URL` | Backend API root (Client-side) |

---

## 📄 License
This project is licensed under the ISC License.

---
*Created with ❤️ for the global scientific community.*
