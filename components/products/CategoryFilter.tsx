"use client";

import { useState } from "react";

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export const categories: Category[] = [
  { id: "all", name: "전체", emoji: "📦" },
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

interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export default function CategoryFilter({
  selectedCategory = "all",
  onCategoryChange,
}: CategoryFilterProps) {
  const [selected, setSelected] = useState(selectedCategory);

  const handleCategoryClick = (categoryId: string) => {
    setSelected(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4 px-4">카테고리</h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all rounded-lg ${
              selected === category.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-2xl">{category.emoji}</span>
            <span className="text-sm">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
