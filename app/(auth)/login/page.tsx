"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, error, login } = useAuthStore();

  useEffect(() => {
    // 이미 로그인된 경우 메인 페이지로 리다이렉트
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    console.log("🎯 [LoginPage] Google 로그인 버튼 클릭");
    try {
      console.log("📲 [LoginPage] login() 호출");
      await login();
      console.log("✅ [LoginPage] OAuth 프로세스 시작 - 리디렉션 대기");
      // Supabase OAuth는 자동으로 리디렉션되므로 router.push 불필요
    } catch (error) {
      console.error("❌ [LoginPage] 로그인 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">픽템</h1>
          <p className="text-gray-600">우리 동네 중고거래 플랫폼</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">로그인</h2>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mb-4"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-semibold text-gray-700">Google</span>
          </button>

          {/* 카카오 로그인 버튼 (추후 구현) */}
          {/* <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#000000"
                d="M12 3c-5.799 0-10.5 3.664-10.5 8.185 0 2.824 1.816 5.32 4.548 6.792l-1.179 4.288a.423.423 0 0 0 .619.491l5.159-3.299a12.93 12.93 0 0 0 1.353.071c5.799 0 10.5-3.664 10.5-8.185C22.5 6.664 17.799 3 12 3z"
              />
            </svg>
            <span className="font-medium text-gray-900">
              카카오로 시작하기 (준비중)
            </span>
          </button> */}

          {/* 안내 문구 */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            로그인 시 픽템의{" "}
            <a href="#" className="text-primary underline">
              이용약관
            </a>
            과{" "}
            <a href="#" className="text-primary underline">
              개인정보 처리방침
            </a>
            에 동의하게 됩니다.
          </p>
        </div>

        {/* 둘러보기 버튼 */}
        <div className="mt-6 text-center">
          <button onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900 font-medium">
            로그인 없이 둘러보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
