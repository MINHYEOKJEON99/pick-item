"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 임시 상품 타입 (하위 호환성을 위해 유지)
export interface MockProduct {
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
  product: ProductWithDetails | MockProduct;
  onClick?: (product: ProductWithDetails | MockProduct) => void;
  onLike?: (productId: string | number) => void;
}

export default function ProductCard({ product, onClick, onLike }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  // ProductWithDetails 타입인지 확인
  const isRealProduct = "user_id" in product;

  // 데이터 추출 (타입에 따라)
  const id = isRealProduct ? (product as ProductWithDetails).id : product.id;
  const title = product.title;
  const price = isRealProduct
    ? `${(product as ProductWithDetails).price.toLocaleString()}원`
    : (product as MockProduct).price;
  const image = isRealProduct
    ? (product as ProductWithDetails).images?.[0]?.image_url || "/placeholder.png"
    : (product as MockProduct).image;
  const location = isRealProduct ? (product as ProductWithDetails).location : (product as MockProduct).location;
  const timeAgo = isRealProduct
    ? formatDistanceToNow(new Date((product as ProductWithDetails).created_at), {
        addSuffix: true,
        locale: ko,
      })
    : (product as MockProduct).timeAgo;
  const likes = isRealProduct ? (product as ProductWithDetails).wishlist_count || 0 : (product as MockProduct).likes;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(id);
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
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {/* 좋아요 버튼 */}
        <button
          onClick={handleLikeClick}
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
      </div>

      {/* 상품 정보 */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{title}</h3>
        <p className="font-bold text-base text-gray-900 mb-2">{price}</p>

        {/* 판매자 정보 및 좋아요 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="max-w-20">{location}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" />
            <span>{likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
