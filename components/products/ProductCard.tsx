"use client";

import { Heart, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { toggleWishlist } from "@/lib/api/wishlist/wishlistApi";

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
  onLike?: (productId: string | number, isLiked: boolean) => void;
  currentUserId?: string;
}

export default function ProductCard({ product, onClick, onLike, currentUserId }: ProductCardProps) {
  // ProductWithDetails 타입인지 확인
  const isRealProduct = "user_id" in product;

  // 찜 상태
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // product가 변경될 때 찜 상태 동기화
  useEffect(() => {
    if (isRealProduct) {
      setIsLiked((product as ProductWithDetails).is_wishlist || false);
      setLikesCount((product as ProductWithDetails).wishlist_count || 0);
    } else {
      setIsLiked(false);
      setLikesCount((product as MockProduct).likes);
    }
  }, [product, isRealProduct]);

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
  const viewCount = isRealProduct ? (product as ProductWithDetails).view_count || 0 : 0;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 로그인하지 않은 경우
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 낙관적 업데이트: API 응답 전에 먼저 UI 변경
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    const newIsLiked = !isLiked;

    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    if (onLike) {
      onLike(id, newIsLiked);
    }

    // MockProduct인 경우 API 호출 없이 종료
    if (!isRealProduct) {
      return;
    }

    // API 호출 (백그라운드)
    try {
      const result = await toggleWishlist(currentUserId, id as string);
      // API 실패 시 롤백
      if (!result.success) {
        setIsLiked(previousIsLiked);
        setLikesCount(previousLikesCount);
        if (onLike) {
          onLike(id, previousIsLiked);
        }
      }
    } catch (error) {
      // 에러 시 롤백
      console.error("찜하기 실패:", error);
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      if (onLike) {
        onLike(id, previousIsLiked);
      }
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
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors active:scale-95"
        >
          <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
      </div>

      {/* 상품 정보 */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{title}</h3>
        <p className="font-bold text-base text-gray-900 mb-2">{price}</p>

        {/* 위치 및 시간 */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <span className="truncate max-w-20">{location}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>

        {/* 조회수 및 찜 */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
