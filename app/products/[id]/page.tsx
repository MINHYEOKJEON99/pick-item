"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, MapPin, Eye, MessageCircle, Share2 } from "lucide-react";
import { getProductById } from "@/lib/api/products/productsApi";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import * as Avatar from "@radix-ui/react-avatar";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);

  // 상품 정보 로드
  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const result = await getProductById(productId);
        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          alert("상품을 찾을 수 없습니다.");
          router.push("/");
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        alert("상품을 불러오는 중 오류가 발생했습니다.");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId, router]);

  // 찜하기 토글
  const handleWishlistToggle = () => {
    setIsWishlist(!isWishlist);
    // TODO: 찜하기 API 연동
  };

  // 공유하기
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: `${product?.title} - ${product?.price.toLocaleString()}원`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentImage =
    product.images && product.images[selectedImageIndex]
      ? product.images[selectedImageIndex].image_url
      : "/placeholder.png";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              뒤로가기
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">공유</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 이미지 갤러리 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.status !== "available" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {product.status === "reserved" ? "예약 중" : "판매 완료"}
                  </span>
                </div>
              )}
            </div>

            {/* 썸네일 이미지 */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="space-y-6">
            {/* 판매자 정보 */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar.Root className="w-12 h-12">
                    <Avatar.Image
                      src={product.profile?.photo_url || undefined}
                      alt={product.profile?.display_name || undefined}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <Avatar.Fallback className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white">
                      {product.profile?.display_name?.[0] || "?"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <div>
                    <p className="font-medium text-gray-900">
                      {product.profile?.display_name || "알 수 없음"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.profile?.location || product.location}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/mypage/${product.user_id}`)}
                  className="text-sm text-primary hover:underline"
                >
                  프로필 보기
                </button>
              </div>
            </div>

            {/* 상품 기본 정보 */}
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {product.category?.emoji} {product.category?.name}
                  </span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(product.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h1>
                <p className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString()}원
                </p>
              </div>

              {/* 조회수, 찜 수 */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{product.wishlist_count || 0}</span>
                </div>
              </div>

              {/* 거래 장소 */}
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{product.location}</span>
              </div>
            </div>

            {/* 상품 설명 */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">상품 설명</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-lg flex gap-3">
              <button
                onClick={handleWishlistToggle}
                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-colors ${
                  isWishlist
                    ? "border-red-500 text-red-500"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${isWishlist ? "fill-current" : ""}`}
                />
              </button>
              <button
                onClick={() => alert("채팅 기능은 아직 구현되지 않았습니다.")}
                className="flex-1 h-12 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                판매자와 채팅하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
