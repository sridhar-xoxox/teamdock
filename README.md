<div align="center">
  <img src="./public/icon.svg" alt="TeamDock Logo" width="120" height="120" />
  <h1>TeamDock</h1>
  <p><strong>A fast and simple way to manage your team's projects.</strong></p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA Ready" />
  </p>
</div>

<br />

TeamDock is a modern project management app designed to make teamwork incredibly easy. It gives you a beautiful, easy-to-use interface to drag and drop tasks, invite team members, and track your progress. Built with Next.js and powered by Supabase, it works lightning fast and securely saves your data in real-time. Plus, you can install it directly to your phone or computer and use it even when you are offline!

---

## ✨ Key Features

- 🎨 **Beautiful Design**: A clean, responsive interface that looks stunning in both Dark and Light modes.
- 🔐 **Secure Login**: Safe and reliable account creation powered by Supabase.
- 🚀 **Works Offline**: Install the app directly to your device. It loads instantly and works perfectly even without an internet connection.
- 🛡️ **Total Privacy**: You have full control over your data. Easily assign Admin or Member roles to secure your workspaces.
- 📋 **Simple Task Boards**: Easily drag and drop your tasks to organize your day and see what your team is working on at a glance.
- ✉️ **Easy Invites**: Simply type an email address to invite new members to your team.

---

## 📂 Project Architecture

```text
teamdock/
├── public/                 # Static assets and PWA configuration
│   ├── icon.svg            # App logo
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Offline service worker strategies
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (dashboard)/    # Authenticated app routes (Board, Team, Tasks)
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── layout.tsx      # Root layout & PWA registration
│   │   └── page.tsx        # Landing page
│   ├── components/         # Reusable React components
│   │   ├── dashboard/      # Specific UI parts for the app (Cards, Boards)
│   │   ├── layout/         # Shared layouts (Sidebar, Navigation)
│   │   └── ui/             # Core design system components
│   ├── lib/                # Utilities and Global State
│   │   ├── store.tsx       # Zustand global state management
│   │   └── supabase/       # Supabase database client configs
│   └── services/           # Backend API interaction logic
├── supabase/               
│   └── schema.sql          # Database table definitions and security policies
├── .env.local              # Local environment variables (Not committed)
├── tailwind.config.ts      # CSS and styling configuration
└── package.json            # Project dependencies
```

---

## 🛠 Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), React, TypeScript
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL Database & Authentication)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/)

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
```

### 3. Setup Supabase Database
1. Create a free project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy all the text from the `supabase/schema.sql` file in this repository and run it. This will automatically set up your database securely.

### 4. Configure Environment Variables
Create a file named `.env.local` in the main folder and add your Supabase keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Start the App
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see your app running!

---

## 📱 How to Install the App
TeamDock is a fully functional Progressive Web App (PWA). 
- **On a Computer**: Click the "Install" icon on the right side of your Chrome or Edge address bar.
- **On an iPhone/iPad**: Open the site in Safari, tap the "Share" button, and select "Add to Home Screen".
- **On an Android Phone**: Open the site in Chrome and tap the "Add to Home screen" popup.

---

## 🚢 Deployment

The easiest way to deploy this app is on [Vercel](https://vercel.com/new). 
**Important**: When you deploy, make sure you manually add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Environment Variables settings! Do not upload your `.env.local` file for security reasons.
