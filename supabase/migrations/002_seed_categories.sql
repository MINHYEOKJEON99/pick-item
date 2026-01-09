-- ============================================
-- 초기 카테고리 데이터 삽입
-- ============================================

INSERT INTO public.categories (id, name, emoji, display_order) VALUES
  ('clothes', '의류', '👕', 1),
  ('electronics', '전자제품', '📱', 2),
  ('furniture', '가구', '🪑', 3),
  ('books', '도서', '📚', 4),
  ('sports', '스포츠', '⚽', 5),
  ('beauty', '뷰티', '💄', 6),
  ('toys', '완구', '🧸', 7),
  ('food', '식품', '🍔', 8),
  ('pets', '반려동물', '🐕', 9)
ON CONFLICT (id) DO NOTHING;
