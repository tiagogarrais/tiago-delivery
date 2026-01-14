"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
