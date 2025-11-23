-- ============================================
-- 중고거래 플랫폼 최종 스키마 v2 (Storage 제외)
-- 기존 로그인 로직과 완벽 호환
-- ============================================

-- 1. profiles 테이블 (auth.users와 1:1)
CREATE TABLE IF NOT EXISTS public.profiles (
  -- 기본 정보
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,  -- 기존 코드 호환 (username 대신)
  photo_url TEXT,     -- 기존 코드 호환 (avatar_url 대신)

  -- 제공자 정보
  provider TEXT NOT NULL DEFAULT 'google',

  -- 위치 정보
  location TEXT DEFAULT '배곧동',

  -- 통계 (캐시용)
  posts_count INT DEFAULT 0 CHECK (posts_count >= 0),
  sales_count INT DEFAULT 0 CHECK (sales_count >= 0),
  purchase_count INT DEFAULT 0 CHECK (purchase_count >= 0),

  -- 프리미엄 회원 (AI 기능용)
  is_premium BOOLEAN DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. categories 테이블 (카테고리)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. products 테이블 (상품/게시글)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL CHECK (price >= 0),
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  view_count INT DEFAULT 0 CHECK (view_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. product_images 테이블 (상품 이미지)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. wishlists 테이블 (찜하기)
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 6. chat_rooms 테이블 (채팅방)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, seller_id, buyer_id)
);

-- 7. chat_messages 테이블 (채팅 메시지)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. user_activities 테이블 (사용자 활동 로그 - AI 추천용)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'search', 'wishlist', 'chat')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  search_keyword TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================

-- profiles 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- products 인덱스
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_location ON public.products(location);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- product_images 인덱스
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id, display_order);

-- wishlists 인덱스
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);

-- chat_rooms 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_rooms_product_id ON public.chat_rooms(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_id ON public.chat_rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer_id ON public.chat_rooms(buyer_id);

-- chat_messages 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);

-- user_activities 인덱스 (AI 추천용)
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_product_id ON public.user_activities(product_id);

-- ============================================
-- Trigger Functions
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 자동 생성 함수 (회원가입 시 - authApi.ts 로직과 일치)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    photo_url,
    provider,
    posts_count,
    sales_count,
    purchase_count,
    is_premium,
    last_login_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'google',
    0,
    0,
    0,
    false,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 마지막 로그인 시간 업데이트 함수
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    last_login_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 찜하기 수 계산 함수
CREATE OR REPLACE FUNCTION public.get_wishlist_count(product_uuid UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM public.wishlists WHERE product_id = product_uuid;
$$ LANGUAGE sql STABLE;

-- ============================================
-- Triggers
-- ============================================

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 신규 유저 프로필 자동 생성 트리거
CREATE TRIGGER trigger_create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 로그인 시 last_login_at 업데이트 트리거
CREATE TRIGGER trigger_update_last_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_user_login();

-- ============================================
-- Row Level Security (RLS) 활성화
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책 (Row Level Security Policies)
-- ============================================

-- profiles 정책
CREATE POLICY "프로필은 누구나 조회 가능"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "본인 프로필만 수정 가능"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "본인 프로필만 삽입 가능"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- categories 정책
CREATE POLICY "카테고리는 누구나 조회 가능"
  ON public.categories FOR SELECT
  USING (true);

-- products 정책
CREATE POLICY "상품은 누구나 조회 가능"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "로그인한 사용자는 상품 등록 가능"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 상품만 수정 가능"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "본인 상품만 삭제 가능"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- product_images 정책
CREATE POLICY "상품 이미지는 누구나 조회 가능"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "상품 소유자만 이미지 추가 가능"
  ON public.product_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "상품 소유자만 이미지 삭제 가능"
  ON public.product_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND user_id = auth.uid()
    )
  );

-- wishlists 정책
CREATE POLICY "본인 찜 목록만 조회 가능"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "로그인한 사용자는 찜하기 가능"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 찜만 삭제 가능"
  ON public.wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- chat_rooms 정책
CREATE POLICY "채팅방 참여자만 조회 가능"
  ON public.chat_rooms FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "구매자만 채팅방 생성 가능"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- chat_messages 정책
CREATE POLICY "채팅방 참여자만 메시지 조회 가능"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_id
      AND (seller_id = auth.uid() OR buyer_id = auth.uid())
    )
  );

CREATE POLICY "채팅방 참여자만 메시지 전송 가능"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_id
      AND (seller_id = auth.uid() OR buyer_id = auth.uid())
    )
  );

-- user_activities 정책
CREATE POLICY "본인 활동만 조회 가능"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "로그인한 사용자는 활동 기록 가능"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Realtime 활성화 (채팅용)
-- ============================================

-- 채팅 메시지 실시간 구독 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- ============================================
-- 완료! Storage는 나중에 Dashboard에서 설정
-- ============================================
