"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import SearchBar from "@/components/products/SearchBar";
import ProductCard, { Product } from "@/components/products/ProductCard";
import { categories } from "@/components/products/CategoryFilter";
import Link from "next/link";

// 임시 상품 데이터
const products: Product[] = [
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
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("popular");

  const handleSearch = (query: string) => {
    console.log("검색어:", query);
    // TODO: 검색 로직 구현
  };

  const handleProductClick = (product: Product) => {
    console.log("상품 클릭:", product);
    // TODO: 상품 상세 페이지로 이동
  };

  const handleLike = (productId: number) => {
    console.log("좋아요:", productId);
    // TODO: 좋아요 로직 구현
  };

  return (
    <>
      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <MapPin className="inline-block w-8 h-8 mr-2" />
            배곧동에서 중고 거래하기
          </h1>
        </div>

        {/* 검색창 컴포넌트 */}
        <SearchBar onSearch={handleSearch} />

        {/* 카테고리 섹션 */}
        <div className="mb-8">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
            {categories.slice(1).map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all hover:bg-primary/10 ${
                  selectedCategory === category.id ? "bg-primary/10" : "bg-white"
                }`}
              >
                <div className="text-3xl mb-2">{category.emoji}</div>
                <span className="text-xs text-gray-700">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 상품 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={handleProductClick} onLike={handleLike} />
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="flex justify-center mt-8">
          <Link
            href="/products"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            더 많은 상품 보기
          </Link>
        </div>
      </main>
    </>
  );
}
