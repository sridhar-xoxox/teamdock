import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "TeamDock — Collaborative Task Management",
  description: "Real-time collaborative to-do app with priorities, due dates, and team sync.",
};
export const viewport: Viewport = { themeColor: "#6366f1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
