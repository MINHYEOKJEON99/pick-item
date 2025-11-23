-- ============================================
-- 기존 데이터베이스 정리 (Clean Up)
-- ============================================
-- 이 파일을 먼저 실행하여 기존 트리거, 함수, 정책을 정리합니다.

-- ============================================
-- 1. 기존 트리거 삭제
-- ============================================

DROP TRIGGER IF EXISTS trigger_create_profile_on_signup ON auth.users;
DROP TRIGGER IF EXISTS trigger_update_last_login ON auth.users;
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS trigger_chat_rooms_updated_at ON public.chat_rooms;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- ============================================
-- 2. 기존 함수 삭제
-- ============================================

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_login();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.get_wishlist_count(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================
-- 3. 기존 RLS 정책 삭제
-- ============================================

-- profiles 정책
DROP POLICY IF EXISTS "프로필은 누구나 조회 가능" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필만 수정 가능" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필만 삽입 가능" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own data" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own data" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own data" ON public.profiles;

-- categories 정책
DROP POLICY IF EXISTS "카테고리는 누구나 조회 가능" ON public.categories;

-- products 정책
DROP POLICY IF EXISTS "상품은 누구나 조회 가능" ON public.products;
DROP POLICY IF EXISTS "로그인한 사용자는 상품 등록 가능" ON public.products;
DROP POLICY IF EXISTS "본인 상품만 수정 가능" ON public.products;
DROP POLICY IF EXISTS "본인 상품만 삭제 가능" ON public.products;

-- product_images 정책
DROP POLICY IF EXISTS "상품 이미지는 누구나 조회 가능" ON public.product_images;
DROP POLICY IF EXISTS "상품 소유자만 이미지 추가 가능" ON public.product_images;
DROP POLICY IF EXISTS "상품 소유자만 이미지 삭제 가능" ON public.product_images;

-- wishlists 정책
DROP POLICY IF EXISTS "본인 찜 목록만 조회 가능" ON public.wishlists;
DROP POLICY IF EXISTS "로그인한 사용자는 찜하기 가능" ON public.wishlists;
DROP POLICY IF EXISTS "본인 찜만 삭제 가능" ON public.wishlists;

-- chat_rooms 정책
DROP POLICY IF EXISTS "채팅방 참여자만 조회 가능" ON public.chat_rooms;
DROP POLICY IF EXISTS "구매자만 채팅방 생성 가능" ON public.chat_rooms;

-- chat_messages 정책
DROP POLICY IF EXISTS "채팅방 참여자만 메시지 조회 가능" ON public.chat_messages;
DROP POLICY IF EXISTS "채팅방 참여자만 메시지 전송 가능" ON public.chat_messages;

-- user_activities 정책
DROP POLICY IF EXISTS "본인 활동만 조회 가능" ON public.user_activities;
DROP POLICY IF EXISTS "로그인한 사용자는 활동 기록 가능" ON public.user_activities;

-- storage.objects 정책
DROP POLICY IF EXISTS "누구나 이미지 조회 가능" ON storage.objects;
DROP POLICY IF EXISTS "로그인한 사용자는 이미지 업로드 가능" ON storage.objects;
DROP POLICY IF EXISTS "본인이 업로드한 이미지만 삭제 가능" ON storage.objects;

-- ============================================
-- 4. 기존 테이블 삭제 (선택적 - 주석 처리됨)
-- ============================================
-- 데이터를 보존하려면 이 섹션은 실행하지 마세요!

-- DROP TABLE IF EXISTS public.user_activities CASCADE;
-- DROP TABLE IF EXISTS public.chat_messages CASCADE;
-- DROP TABLE IF EXISTS public.chat_rooms CASCADE;
-- DROP TABLE IF EXISTS public.wishlists CASCADE;
-- DROP TABLE IF EXISTS public.product_images CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- 완료
-- ============================================
-- 이제 001_initial_schema.sql을 실행할 수 있습니다.
