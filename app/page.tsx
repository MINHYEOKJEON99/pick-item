"use client";

import { useState } from "react";
import { Search, MapPin, Heart, ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";

// 카테고리 데이터
const categories = [
  { id: "popular", name: "인기매물", emoji: "🔥" },
  { id: "clothes", name: "의류", emoji: "👕" },
  { id: "electronics", name: "전자제품", emoji: "📱" },
  { id: "furniture", name: "가구", emoji: "🪑" },
  { id: "books", name: "도서", emoji: "📚" },
  { id: "sports", name: "스포츠", emoji: "⚽" },
  { id: "beauty", name: "뷰티", emoji: "💄" },
  { id: "toys", name: "완구", emoji: "🧸" },
  { id: "food", name: "식품", emoji: "🍔" },
  { id: "pets", name: "반려동물", emoji: "🐕" },
];

// 임시 상품 데이터
const products = [
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
  const [selectedLocation, setSelectedLocation] = useState("배곧동");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("popular");

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

        {/* 검색창 섹션 */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 w-full max-w-2xl">
            {/* 위치 선택 드롭다운 */}
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <MapPin className="w-4 h-4" />
              <span>{selectedLocation}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* 검색 입력창 */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="검색어를 입력해주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* 인기 검색어 */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            "인기 검색어",
            "에어컨",
            "에어컨청소",
            "노트북",
            "원룸",
            "헬스",
            "이사짐 센터",
            "근처 맛집",
            "투룸",
            "농어친구",
            "배곧동",
          ].map((tag, index) => (
            <span
              key={index}
              className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                index === 0 ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 카테고리 섹션 */}
        <div className="mb-8">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
            {categories.map((category) => (
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
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* 상품 이미지 */}
              <div className="relative aspect-square bg-gray-200">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                {/* 좋아요 버튼 */}
                <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* 상품 정보 */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                <p className="font-bold text-base text-gray-900 mb-2">{product.price}</p>

                {/* 판매자 정보 및 좋아요 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>{product.location}</span>
                    <span>•</span>
                    <span>{product.timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{product.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">
            더 많은 상품 보기
          </button>
        </div>
      </main>
    </>
  );
}
