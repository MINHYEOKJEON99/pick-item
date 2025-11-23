"use client";

import { useState } from "react";
import SearchBar from "@/components/products/SearchBar";
import CategoryFilter from "@/components/products/CategoryFilter";
import ProductCard, { MockProduct } from "@/components/products/ProductCard";

// 임시 상품 데이터
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("검색어:", query);
    // TODO: 실제 검색 로직 구현
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log("선택된 카테고리:", categoryId);
    // TODO: 카테고리별 필터링 로직 구현
  };

  const handleProductClick = (product: MockProduct) => {
    console.log("상품 클릭:", product);
    // TODO: 상품 상세 페이지로 이동
  };

  const handleLike = (productId: number) => {
    console.log("좋아요:", productId);
    // TODO: 좋아요 로직 구현
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 영역 */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar onSearch={handleSearch} showPopularTags={false} />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* 왼쪽 카테고리 필터 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-lg shadow-sm p-4">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
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

            {/* 상품 개수 및 정렬 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold text-gray-900">{mockProducts.length}</span>개의
                상품
              </p>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="recent">최신순</option>
                <option value="price-low">낮은 가격순</option>
                <option value="price-high">높은 가격순</option>
                <option value="popular">인기순</option>
              </select>
            </div>

            {/* 상품 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                  onLike={handleLike}
                />
              ))}
            </div>

            {/* 더보기 버튼 */}
            <div className="flex justify-center mt-8">
              <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">
                더 많은 상품 보기
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
