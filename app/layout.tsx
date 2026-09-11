import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FZ247 Deploy Hub",
  description: "Client, project and deployment management for FZ247.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
