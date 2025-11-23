"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export interface Product {
  id: number;
  title: string;
  price: string;
  image: string;
  seller: string;
  likes: number;
  location: string;
  timeAgo: string;
}

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onLike?: (productId: number) => void;
}

export default function ProductCard({ product, onClick, onLike }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(product.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-square bg-gray-200">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        {/* 좋아요 버튼 */}
        <button
          onClick={handleLikeClick}
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
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
  );
}
