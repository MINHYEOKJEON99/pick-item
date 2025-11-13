import { supabase } from "@/lib/supabaseConfig";
import type { User } from "@supabase/supabase-js";

// 구글 로그인
export const signInWithGoogle = async () => {
  console.log("🚀 [Auth] Google 로그인 시작");

  try {
    console.log("📝 [Auth] Supabase 팝업 열기...");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("❌ [Auth] Google 로그인 실패:", error);
      throw error;
    }

    console.log("✅ [Auth] OAuth 프로세스 시작됨");
    return data;
  } catch (error) {
    console.error("❌ [Auth] Google 로그인 실패:", error);
    throw error;
  }
};

// 로그아웃
export const signOut = async () => {
  console.log("👋 [Auth] 로그아웃 시작");
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("✅ [Auth] 로그아웃 완료");
  } catch (error) {
    console.error("❌ [Auth] 로그아웃 실패:", error);
    throw error;
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// 인증 상태 변경 감지
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  console.log("🔄 [Auth] 인증 상태 변경 리스너 등록");

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log("📡 [Auth] 인증 상태 변경 감지:", session?.user?.email || "로그아웃 상태");
    callback(session?.user || null);
  });

  return () => {
    console.log("🔌 [Auth] 인증 리스너 해제");
    subscription.unsubscribe();
  };
};

// 사용자 정보 가져오기 (Database)
export const getUserData = async (userId: string) => {
  console.log("📊 [Auth] 사용자 데이터 조회 시작:", userId);
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // 사용자 데이터가 없으면 null 반환 (에러 아님)
      if (error.code === "PGRST116") {
        console.log("⚠️ [Auth] 사용자 데이터 없음 - 신규 사용자");
        return null;
      }
      throw error;
    }

    console.log("✅ [Auth] 사용자 데이터 조회 성공");
    return data;
  } catch (error) {
    console.error("❌ [Auth] 사용자 데이터 조회 실패:", error);
    return null;
  }
};

// 사용자 데이터 생성 또는 업데이트
export const upsertUserData = async (user: User) => {
  console.log("💾 [Auth] 사용자 데이터 저장 시작:", user.email);

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      // 신규 사용자 생성
      console.log("👤 [Auth] 신규 사용자 - Database에 정보 저장 중...");
      const { error } = await supabase.from("users").insert({
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
      });

      if (error) throw error;
      console.log("✅ [Auth] 신규 사용자 정보 저장 완료");
    } else {
      // 기존 사용자 업데이트
      console.log("👤 [Auth] 기존 사용자 - 로그인 시간 업데이트 중...");
      const { error } = await supabase
        .from("users")
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      console.log("✅ [Auth] 로그인 시간 업데이트 완료");
    }

    return await getUserData(user.id);
  } catch (error) {
    console.error("❌ [Auth] 사용자 데이터 저장 실패:", error);
    // Database 에러가 발생해도 로그인은 성공으로 처리
    return null;
  }
};
