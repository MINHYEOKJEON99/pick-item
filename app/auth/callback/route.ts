import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseConfig";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인 후 메인 페이지로 리디렉션
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
