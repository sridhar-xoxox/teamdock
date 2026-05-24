import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "TeamDock — Collaborative Task Management",
  description: "Real-time collaborative to-do app with priorities, due dates, and team sync.",
};
export const viewport: Viewport = { themeColor: "#6366f1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `
    (function() {
      try {
        var theme = localStorage.getItem('qt_theme');
        var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
        if (!theme && supportDarkMode) theme = 'dark';
        if (!theme) theme = 'light';
        document.documentElement.classList.add(theme);
        document.documentElement.style.colorScheme = theme;
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
