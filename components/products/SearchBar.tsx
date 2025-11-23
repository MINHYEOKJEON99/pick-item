"use client";

import { useState } from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  showLocationSelector?: boolean;
  showPopularTags?: boolean;
}

const popularTags = [
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
];

export default function SearchBar({
  onSearch,
  showLocationSelector = true,
  showPopularTags = true,
}: SearchBarProps) {
  const [selectedLocation, setSelectedLocation] = useState("배곧동");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      {/* 검색창 섹션 */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2 w-full max-w-2xl">
          {/* 위치 선택 드롭다운 */}
          {showLocationSelector && (
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <MapPin className="w-4 h-4" />
              <span>{selectedLocation}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* 검색 입력창 */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 인기 검색어 */}
      {showPopularTags && (
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {popularTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => setSearchQuery(tag === "인기 검색어" ? "" : tag)}
              className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                index === 0
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
