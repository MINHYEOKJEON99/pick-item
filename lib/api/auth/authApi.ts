import { createClient } from "@/lib/supabase/client";

// 클라이언트 사이드에서만 사용되는 Supabase 클라이언트
const supabase = createClient();

// 구글 로그인
export const signInWithGoogle = async () => {
  try {
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

    return data;
  } catch (error) {
    console.error("❌ [Auth] Google 로그인 실패:", error);
    throw error;
  }
};

// 로그아웃
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return () => {
    subscription.unsubscribe();
  };
};

// 사용자 정보 가져오기 (Database)
export const getUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // 사용자 데이터가 없으면 null 반환 (에러 아님)
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("❌ [Auth] 사용자 데이터 조회 실패:", error);
    return null;
  }
};

// 사용자 데이터 생성 또는 업데이트
// 참고: 신규 사용자는 Supabase Trigger로 자동 생성되므로 이 함수는 업데이트용으로만 사용
export const upsertUserData = async (user: User) => {
  try {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      // 신규 사용자 생성 (Trigger가 실패한 경우의 fallback)
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        photo_url: user.user_metadata?.avatar_url,
        provider: "google",
        posts_count: 0,
        sales_count: 0,
        purchase_count: 0,
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      });

      if (error) throw error;
    } else {
      // 기존 사용자 업데이트 (last_login_at은 Trigger로 자동 업데이트)
      const { error } = await supabase
        .from("profiles")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
    }

    return await getUserData(user.id);
  } catch (error) {
    console.error("❌ [Auth] 사용자 데이터 저장 실패:", error);
    throw error;
  }
};
