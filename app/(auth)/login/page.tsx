import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  // 서버에서 사용자 정보 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 로그인된 경우 메인 페이지로 리다이렉트
  if (user) {
    redirect("/");
  }

  return <LoginForm />;
}
