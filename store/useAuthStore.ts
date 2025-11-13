import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import {
  signInWithGoogle,
  signOut,
  onAuthStateChange,
  getUserData,
  upsertUserData,
} from "@/lib/api/auth/authApi";

interface UserData {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  provider: "google" | "kakao";
  wishlist: string[];
  recent_views: string[];
  search_history: string[];
  posts_count: number;
  sales_count: number;
  purchase_count: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchUserData: (userId: string) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  isLoading: true,
  error: null,

  // 구글 로그인
  login: async () => {
    console.log("🔐 [Store] 로그인 액션 시작");
    try {
      set({ isLoading: true, error: null });
      console.log("⏳ [Store] 로딩 상태 설정");

      // Supabase OAuth는 리디렉션 방식이므로 여기서는 OAuth 프로세스만 시작
      await signInWithGoogle();
      console.log("✅ [Store] OAuth 프로세스 시작됨");

      // 실제 로그인 완료는 onAuthStateChange에서 처리됨
    } catch (error: any) {
      console.error("❌ [Store] 로그인 에러:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    console.log("🚪 [Store] 로그아웃 액션 시작");
    try {
      set({ isLoading: true, error: null });
      await signOut();
      console.log("✅ [Store] 상태 초기화 완료");
      set({ user: null, userData: null, isLoading: false });
    } catch (error: any) {
      console.error("❌ [Store] 로그아웃 에러:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 사용자 설정
  setUser: (user) => {
    set({ user });
  },

  // 사용자 데이터 가져오기
  fetchUserData: async (userId: string) => {
    try {
      const userData = await getUserData(userId);
      set({ userData: userData as unknown as UserData });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // 인증 상태 초기화 (앱 시작 시 실행)
  initializeAuth: () => {
    console.log("🔄 [Store] 인증 상태 초기화 시작");
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log("📡 [Store] 인증 상태 변경 감지:", user ? user.email : "로그아웃 상태");
      set({ user, isLoading: false });

      if (user) {
        console.log("👤 [Store] 로그인 상태 - 사용자 데이터 처리");

        // 사용자 데이터 upsert (생성 또는 업데이트)
        const userData = await upsertUserData(user);

        if (userData) {
          set({ userData: userData as unknown as UserData });
        } else {
          console.warn("⚠️ [Store] Database 데이터 없음 - Auth 정보만 사용");
          // Database에 데이터가 없어도 Auth 정보로 기본 userData 생성
          set({
            userData: {
              id: user.id,
              email: user.email,
              display_name: user.user_metadata?.full_name || user.email?.split("@")[0],
              photo_url: user.user_metadata?.avatar_url,
              provider: "google",
              wishlist: [],
              recent_views: [],
              search_history: [],
              posts_count: 0,
              sales_count: 0,
              purchase_count: 0,
              is_premium: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login_at: new Date().toISOString(),
            } as unknown as UserData,
          });
        }
      } else {
        console.log("👋 [Store] 로그아웃 상태 - 데이터 초기화");
        set({ userData: null });
      }
    });

    return unsubscribe;
  },
}));
