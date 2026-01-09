"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/products/SearchBar";
import CategoryFilter from "@/components/products/CategoryFilter";
import ProductCard, { MockProduct } from "@/components/products/ProductCard";
import { searchProducts, getProducts } from "@/lib/api/products/productsApi";
import { createClient } from "@/lib/supabase/client";

// 임시 상품 데이터 (API 실패 시 fallback)
const mockProducts: MockProduct[] = [
  {
    id: 1,
    title: "아이폰 14 프로 맥스 256GB",
    price: "1,200,000원",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=400&fit=crop",
    seller: "김민수",
    likes: 23,
    location: "강남구",
    timeAgo: "1시간 전",
  },
  {
    id: 2,
    title: "나이키 에어맥스 270 (275mm)",
    price: "85,000원",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    seller: "이서연",
    likes: 15,
    location: "서초구",
    timeAgo: "2시간 전",
  },
  {
    id: 3,
    title: "다이슨 V15 무선청소기",
    price: "450,000원",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop",
    seller: "박지훈",
    likes: 42,
    location: "송파구",
    timeAgo: "3시간 전",
  },
  {
    id: 4,
    title: "스타벅스 텀블러 새상품",
    price: "25,000원",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    seller: "최유진",
    likes: 8,
    location: "마포구",
    timeAgo: "5시간 전",
  },
  {
    id: 5,
    title: "아이패드 프로 11인치 3세대",
    price: "900,000원",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    seller: "정호석",
    likes: 31,
    location: "강남구",
    timeAgo: "1일 전",
  },
  {
    id: 6,
    title: "르쿠르제 냄비 세트",
    price: "180,000원",
    image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop",
    seller: "김태연",
    likes: 19,
    location: "용산구",
    timeAgo: "1일 전",
  },
  {
    id: 7,
    title: "맥북 프로 M2 14인치",
    price: "2,400,000원",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    seller: "이민호",
    likes: 56,
    location: "서초구",
    timeAgo: "2시간 전",
  },
  {
    id: 8,
    title: "조던 1 레트로 하이 (270mm)",
    price: "250,000원",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=400&fit=crop",
    seller: "박서준",
    likes: 34,
    location: "강남구",
    timeAgo: "4시간 전",
  },
  {
    id: 9,
    title: "이케아 3인용 소파 베이지",
    price: "120,000원",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    seller: "김지은",
    likes: 28,
    location: "마포구",
    timeAgo: "6시간 전",
  },
  {
    id: 10,
    title: "캐논 EOS R6 풀프레임",
    price: "3,200,000원",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
    seller: "최동욱",
    likes: 41,
    location: "송파구",
    timeAgo: "7시간 전",
  },
  {
    id: 11,
    title: "애플 워치 시리즈 8 GPS",
    price: "450,000원",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
    seller: "정수아",
    likes: 19,
    location: "강남구",
    timeAgo: "8시간 전",
  },
  {
    id: 12,
    title: "닌텐도 스위치 OLED 화이트",
    price: "350,000원",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop",
    seller: "윤태호",
    likes: 45,
    location: "용산구",
    timeAgo: "9시간 전",
  },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<(ProductWithDetails | MockProduct)[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(mockProducts.length);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  // URL에서 검색어 가져오기
  const searchQuery = searchParams.get("search") || "";

  // 현재 사용자 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    fetchUser();
  }, []);

  // 검색어나 카테고리 변경 시 상품 목록 로드
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        if (searchQuery) {
          // 검색어가 있으면 검색 API 호출
          const result = await searchProducts(searchQuery, {
            categoryId: selectedCategory,
            currentUserId,
          });
          if (result.success && result.data) {
            setProducts(result.data.data);
            setTotalCount(result.data.total);
          } else {
            // API 실패 시 mockProducts에서 필터링
            const filtered = mockProducts.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
            setProducts(filtered);
            setTotalCount(filtered.length);
          }
        } else {
          // 검색어가 없으면 전체 상품 목록 조회
          const result = await getProducts({
            categoryId: selectedCategory,
            currentUserId,
          });
          if (result.success && result.data) {
            setProducts(result.data.data);
            setTotalCount(result.data.total);
          } else {
            setProducts(mockProducts);
            setTotalCount(mockProducts.length);
          }
        }
      } catch (error) {
        console.error("상품 로드 실패:", error);
        setProducts(mockProducts);
        setTotalCount(mockProducts.length);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, selectedCategory, currentUserId]);

  const handleSearch = (query: string) => {
    // URL 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleProductClick = (product: ProductWithDetails | MockProduct) => {
    const id = "user_id" in product ? product.id : product.id;
    router.push(`/products/${id}`);
  };

  const handleLike = (productId: string | number, isLiked: boolean) => {
    console.log("찜하기:", productId, isLiked ? "추가" : "제거");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 영역 */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar onSearch={handleSearch} showPopularTags={false} initialValue={searchQuery} />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* 왼쪽 카테고리 필터 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-lg shadow-sm p-4">
              <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            </div>
          </aside>

          {/* 오른쪽 상품 목록 */}
          <main className="flex-1">
            {/* 모바일 카테고리 필터 */}
            <div className="lg:hidden mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">전체 카테고리</option>
                <option value="popular">🔥 인기매물</option>
                <option value="clothes">👕 의류</option>
                <option value="electronics">📱 전자제품</option>
                <option value="furniture">🪑 가구</option>
                <option value="books">📚 도서</option>
                <option value="sports">⚽ 스포츠</option>
                <option value="beauty">💄 뷰티</option>
                <option value="toys">🧸 완구</option>
                <option value="food">🍔 식품</option>
                <option value="pets">🐕 반려동물</option>
              </select>
            </div>

            {/* 검색 결과 표시 */}
            {searchQuery && (
              <div className="mb-4 pt-3 rounded-lg">
                <p className="text-sm text-[#00A1FF]">&quot;{searchQuery}&quot; 검색 결과</p>
              </div>
            )}

            {/* 상품 개수 및 정렬 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold text-gray-900">{totalCount}</span>개의 상품
              </p>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="recent">최신순</option>
                <option value="price-low">낮은 가격순</option>
                <option value="price-high">높은 가격순</option>
                <option value="popular">인기순</option>
              </select>
            </div>

            {/* 상품 그리드 */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={"user_id" in product ? product.id : product.id}
                    product={product}
                    onClick={handleProductClick}
                    onLike={handleLike}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
                <p className="text-sm">다른 검색어로 다시 시도해보세요</p>
              </div>
            )}

            {/* 더보기 버튼 */}
            {!isLoading && products.length > 0 && (
              <div className="flex justify-center mt-8">
                <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">
                  더 많은 상품 보기
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
