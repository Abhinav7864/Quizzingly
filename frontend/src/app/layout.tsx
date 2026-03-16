import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Quizzingly",
  description: "Live AI-powered multiplayer quizzes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Geist:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{fontFamily: "Geist, sans-serif"}}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-[var(--bg-base)]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
