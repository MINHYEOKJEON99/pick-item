import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import FloatingActionButton from "@/components/layout/FloatingActionButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 서버에서 사용자 정보 가져오기
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 사용자 데이터 가져오기 (있을 경우)
  let userData = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    userData = data;
  }

  return (
    <html lang="ko">
      <head>
        <title>픽템 - 우리 동네 중고거래</title>
        <meta name="description" content="우리 동네 중고 거래 플랫폼, 픽템에서 안전하고 편리하게 거래하세요" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-white">
          {/* 헤더 - 서버에서 가져온 사용자 정보 전달 */}
          <Header user={user} userData={userData} />
          {children}
          {/* FAB - 로그인 시에만 표시 */}
          <FloatingActionButton isLoggedIn={!!user} />
        </div>
      </body>
    </html>
  );
}
