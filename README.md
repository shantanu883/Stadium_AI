# 🏟️ Stadium AI — FIFA World Cup 2026 Operations Platform

<div align="center">

![Stadium AI](https://img.shields.io/badge/Stadium-AI-00a3ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNy45M1Y4bDcgNS00Ljk0IDQuMzMtMi4wNiAuNnoiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)

**A real-time, AI-powered stadium operations and fan experience platform built for the FIFA World Cup 2026.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Screenshots](#-screenshots)

</div>

---

## 🌟 Overview

**Stadium AI** is a full-stack web application that combines real-time crowd intelligence, AI-driven insights, interactive navigation, and operational dashboards into a single command center for stadium administrators and fans alike.

Built as a submission for **FIFA World Cup 2026 Innovation Challenge**, this platform demonstrates how modern AI and live data can dramatically improve the matchday experience — from safety to sustainability.

---

## ✨ Features

### 🎯 Core Modules

| Module | Description |
|--------|-------------|
| **📊 Live Dashboard** | Real-time crowd density, stadium capacity meters, AI alerts, and live match countdown |
| **🗺️ Seat Navigator** | Interactive SVG stadium map with animated route pathfinding, ADA wheelchair mode, and audio navigation |
| **🤖 AI Assistant** | Gemini-powered chatbot for fan queries, directions, and stadium info (with fallback simulation) |
| **👥 Crowd Monitor** | Live crowd heatmap, gate congestion levels, and density analytics per section |
| **📋 Incident Reports** | Field staff incident logging with priority dispatch, status tracking, and admin controls |
| **🌿 Sustainability** | Solar grid, water recycling, and waste diversion telemetry with AI eco-advisories |
| **🚌 Transport Hub** | Real-time parking lot ratios, metro/shuttle ETAs, and AI outflow routing advisories |
| **⚙️ Admin Panel** | Staff management, announcements, system health monitoring |

### 🚀 Highlights

- **Role-based access** — Fan, Staff, and Admin roles with different UI views
- **Gemini AI integration** — Real-time AI responses with graceful fallback to simulation
- **Animated SVG map** — Fully clickable stadium map with dashed animated route paths
- **Live data simulation** — Self-updating metrics every 8–15 seconds
- **Accessibility** — ADA wheelchair routing, keyboard navigation, ARIA landmarks, audio narration
- **Dark glassmorphism UI** — Premium dark theme with neon accents and micro-animations

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript 5.6**
- **Vite 5** — ultra-fast dev server & bundler
- **Tailwind CSS 3** — utility-first styling with custom FIFA color palette
- **Recharts** — animated data visualizations
- **Framer Motion** — smooth page transitions
- **Lucide React** — icon library
- **React Router v6** — client-side routing

### Backend
- **Node.js** + **Express 4**
- **TypeScript** (compiled via `tsx` for dev, `tsc` for prod)
- **Google Gemini AI** (`@google/generative-ai`) — AI chat completions
- **In-memory data store** — lightweight simulation database

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **npm** v9+
- A **Google Gemini API key** (free at [aistudio.google.com](https://aistudio.google.com)) — *optional, app works without it*

### 1. Clone the repository

```bash
git clone https://github.com/shantanu883/Stadium_AI.git
cd Stadium_AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here   # Optional — app runs in simulation mode without it
```

### 4. Run the development server

```bash
npm run dev
```

This starts both:
- **Backend API** → `http://localhost:3001`
- **Vite Frontend** → `http://localhost:5173`

### 5. Login

Use any of these demo credentials:

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@stadium.ai` | `admin123` |
| 🧑‍💼 Staff | `staff@stadium.ai` | `staff123` |
| 🎟️ Fan | `fan@stadium.ai` | `fan123` |

---

## 📦 Build for Production

```bash
# Build both client and server
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
Stadium_AI/
├── src/
│   ├── components/
│   │   ├── GlassCard.tsx       # Reusable glassmorphism card
│   │   ├── LiveBadge.tsx       # Animated live status badge
│   │   ├── MapWidget.tsx       # Interactive SVG stadium map
│   │   ├── Sidebar.tsx         # Navigation sidebar with ARIA
│   │   └── ChatBot.tsx         # Floating AI assistant widget
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main operations dashboard
│   │   ├── Navigation.tsx      # Seat navigator with routing
│   │   ├── CrowdMonitor.tsx    # Crowd heatmap & analytics
│   │   ├── Reports.tsx         # Incident reporting desk
│   │   ├── Sustainability.tsx  # Green metrics & charts
│   │   ├── Transport.tsx       # Transit & parking hub
│   │   ├── AIAssistant.tsx     # Gemini AI chat interface
│   │   ├── Admin.tsx           # Admin control panel
│   │   ├── Home.tsx            # Fan landing page
│   │   └── Login.tsx           # Authentication page
│   ├── context/
│   │   └── AuthContext.tsx     # Role-based auth context
│   ├── api/
│   │   └── index.ts            # API client (axios calls)
│   ├── App.tsx                 # Router & layout
│   └── index.css               # Global styles & Tailwind config
├── server/
│   ├── index.ts                # Express server & API routes
│   ├── database.ts             # In-memory data store
│   └── gemini.ts               # Gemini AI integration
├── .env.example                # Environment variable template
├── tailwind.config.js          # Custom FIFA color palette
├── tsconfig.json               # TypeScript config (strict)
└── vite.config.ts              # Vite build config
```

---

## 🎨 Design System

The app uses a custom **FIFA-inspired** color palette:

| Token | Color | Usage |
|-------|-------|-------|
| `fifa-accent` | `#00a3ff` | Primary blue — gates, routes, links |
| `fifa-neonGreen` | `#00ff66` | Success, eco metrics, resolved |
| `fifa-neonPurple` | `#a855f7` | Secondary, blocks, dispatched |
| `fifa-neonYellow` | `#ffea00` | Warning, food stalls, medium priority |
| `fifa-neonRed` | `#ff003c` | Critical alerts, full capacity |
| `fifa-gold` | `#ffd700` | VIP, energy, premium elements |
| `fifa-dark` | `#0a0e1a` | Background |

---

## 🗺️ Stadium Map

The interactive SVG map (`MapWidget.tsx`) features:

- **Clickable hotspots** — Gates, Seating Blocks, Food Stalls, Restrooms, Medical
- **Animated route paths** — Dashed blue polyline with marching ant animation
- **ADA mode** — Alternate wheelchair-accessible corridor routing
- **Hover tooltips** — Live detail overlay on node hover
- **Heatmap mode** — Gate nodes turn red during crowd density visualization

---

## 🤖 AI Features

- **Gemini AI Chat** — Answers fan queries about the stadium, schedule, rules
- **AI Incident Triage** — Priority classification for safety reports  
- **Green AI Advisory** — Eco crew deployment suggestions
- **Transport Outflow** — Post-match exit routing predictions

> The app runs fully in **simulation/fallback mode** with no API key needed — perfect for demos.

---

## 📄 License

This project was created for the **FIFA World Cup 2026 Hackathon**. All rights reserved.

---

<div align="center">

Built with ❤️ for the beautiful game ⚽

**[⭐ Star this repo](https://github.com/shantanu883/Stadium_AI)** if you found it useful!

</div>
