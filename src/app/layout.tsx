'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { NhostProvider } from "@nhost/nextjs";
import { nhost } from "@/utils/nhost";
import { Toaster } from "react-hot-toast";
import { DarkModeProvider } from "@/context/DarkModeContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>NewsHub - Personalized News Digest</title>
        <meta name="description" content="Get personalized news with AI-powered summarization and sentiment analysis" />
      </head>
      <body className={inter.className}>
        <NhostProvider nhost={nhost}>
          <DarkModeProvider>
            <Toaster position="top-center" />
            {children}
          </DarkModeProvider>
        </NhostProvider>
      </body>
    </html>
  );
}
