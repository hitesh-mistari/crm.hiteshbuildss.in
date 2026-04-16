# FounderOS Dashboard

A premium, full-stack management dashboard designed for founders to track finances, manage projects, and organize ideas with high precision and real-time feedback.

![Project Preview](https://via.placeholder.com/1200x600?text=FounderOS+Dashboard+Preview)

## 🚀 Key Features

### 💰 Finance Module
- **Transaction Tracking**: Real-time income and expense logging with categorized views.
- **Unified cashflow**: Automatic balance and burn rate calculation (Monthly Burn & Runway).
- **Subscription Management**: 
  - Precise **Calendar Month** tracking (e.g., March 20 to April 20).
  - High-urgency **Time Bomb** alerts for expiring services with ticking countdowns.
  - Auto-renewal logic for seamless tracking.

### 🏗️ Project Management
- **Centralized Dashboard**: Manage active, paused, and archived projects.
- **Deep Linking**: Access project-specific tasks, notes, links, and team members.
- **Idea Pipeline**: Convert brainstorming ideas into active projects with a single click.

### 🧠 Strategic Tools
- **Idea Board**: Kanban-style organization for ideas from 'Planning' to 'Launched'.
- **Focus Mode**: Streak tracking and dedicated focus blocks to maximize productivity.
- **Weekly Reviews**: Reflect on progress and set goals for the next sprint.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Zustand (State Management).
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Hosted on remote server).
- **Icons & UI**: Lucide-React, custom 3D renders.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `/backend`:
   ```env
   PORT=3001
   DATABASE_URL=your_postgres_url
   ```
   Run development server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in `/frontend`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```
   Run development server:
   ```bash
   npm run dev
   ```

---

## 🎨 Design Aesthetics
FounderOS emphasizes a **Premium Aesthetic**:
- **LCD-Style Gadgets**: High-contrast, glowing UI elements for urgency.
- **Glassmorphism**: Sleek, transparent containers with refined shadows.
- **Micro-animations**: Smooth transitions using Framer Motion for a "live" feel.

## 📄 License
This project is private and intended for internal founder operations.
