"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/api/auth/authApi";
import * as Avatar from "@radix-ui/react-avatar";

interface HeaderProps {
  user: User | null;
  userData: Profile | null;
}

export default function Header({ user, userData }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      router.refresh(); // 페이지 새로고침하여 서버 컴포넌트 다시 렌더링
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="bg-white  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => router.push("/")} className="flex items-center cursor-pointer">
            <span className="text-2xl font-bold text-primary">&#127919; 픽템</span>
          </button>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar.Root className="w-8 h-8">
                  <Avatar.Image
                    src={userData?.photo_url || undefined}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <Avatar.Fallback className="w-full h-full text-white rounded-full bg-primary flex items-center justify-center">
                    {userData?.display_name ? userData?.display_name[0] : <UserIcon className="w-5 h-5 text-white" />}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span className="text-sm font-medium hidden sm:block">{userData?.display_name || "사용자"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push("/mypage");
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    마이 페이지
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              )}
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
