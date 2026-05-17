<div align="center">
  <img src="public/icon.svg" alt="TeamDock Logo" width="120" height="120" />
  <h1>TeamDock</h1>
  <p><strong>A Premium, Real-Time Collaborative Workspace & Agile Task Manager</strong></p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA Ready" />
  </p>
</div>

<br />

TeamDock is an enterprise-grade project management application built for modern teams. It features a stunning glassmorphic UI, robust Role-Based Access Control (RBAC), and is fully powered by a **Supabase PostgreSQL backend**. With built-in **Progressive Web App (PWA)** capabilities, your team can manage sprint objectives securely, lightning-fast, and even while offline.

---

## ✨ Key Features

- 🎨 **Ultra-Premium Glassmorphic UI**: Beautiful, responsive layout with deep Dark/Light mode integration, Apple-style avatars, and fluid micro-animations.
- 🔐 **Supabase Authentication**: Secure login, account creation, and encrypted session management.
- 🚀 **Progressive Web App (PWA)**: Installable directly to your Desktop or Mobile home screen with Service Worker caching for instant offline loads.
- 🛡️ **Role-Based Access Control (RBAC)**: Enforced workspace security with structured roles (Admin, Manager, Member) and remote Row Level Security (RLS).
- 📋 **Agile Kanban Boards**: Drag-and-drop task management perfectly synchronized across your team.
- ✉️ **Smart Workspace Invitations**: Invite collaborators via email. New users are seamlessly onboarded and instantly injected into their assigned workspace.

---

## 🛠 Tech Stack

- **Frontend Core**: [Next.js 14](https://nextjs.org/) (App Router), React, TypeScript
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/teamdock.git
cd teamdock
```

### 2. Install dependencies
```bash
pnpm install
# or npm install
```

### 3. Setup Supabase Backend
1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase Dashboard.
3. Copy the contents of `/supabase/schema.sql` and run it to instantly generate all required tables and RLS security policies.

### 4. Configure Environment Variables
Create a `.env.local` file in the root of your project and add your Supabase connection keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Start the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application!

---

## 📱 PWA & Offline Support
TeamDock is fully configured as a Progressive Web App. 
- **Desktop**: Click the "Install" icon in the right side of the Chrome/Edge address bar.
- **Mobile (iOS)**: Open in Safari, tap "Share", and select "Add to Home Screen".
- **Mobile (Android)**: Open in Chrome and tap the "Add to Home screen" banner.

*The app utilizes advanced Cache-First and Network-First service worker strategies to ensure your dashboard loads instantly even if you lose your internet connection.*

---

## 🚢 Deployment

TeamDock is heavily optimized for deployment on [Vercel](https://vercel.com/new). 
**Important**: When deploying, do not commit your `.env.local` file. Instead, manually add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel project's Environment Variables dashboard.

---

<div align="center">
  <p>Built with ❤️ by the TeamDock Engineering Team.</p>
</div>
