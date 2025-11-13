"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    console.log("🚀 [Layout] 앱 시작 - 인증 초기화");
    // 앱 시작 시 인증 상태 초기화
    const unsubscribe = initializeAuth();
    return () => {
      console.log("🔌 [Layout] 앱 종료 - 인증 리스너 해제");
      if (unsubscribe) unsubscribe();
    };
  }, [initializeAuth]);

  return (
    <html lang="ko">
      <head>
        <title>픽템 - 우리 동네 중고거래</title>
        <meta
          name="description"
          content="우리 동네 중고 거래 플랫폼, 픽템에서 안전하고 편리하게 거래하세요"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
