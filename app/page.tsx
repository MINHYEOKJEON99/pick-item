"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/products/SearchBar";
import ProductCard, { MockProduct } from "@/components/products/ProductCard";
import { categories } from "@/components/products/CategoryFilter";
import { getProducts } from "@/lib/api/products/productsApi";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("popular");
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 상품 목록 로드
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const result = await getProducts({
          page: 1,
          pageSize: 12,
          categoryId: selectedCategory === "popular" ? undefined : selectedCategory,
          sortBy: selectedCategory === "popular" ? "view_count" : "created_at",
          sortOrder: "desc",
        });

        if (result.success && result.data) {
          setProducts(result.data.data);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleProductClick = (product: ProductWithDetails | MockProduct) => {
    const id = "user_id" in product ? product.id : product.id;
    router.push(`/products/${id}`);
  };

  const handleLike = (productId: string | number) => {
    console.log("좋아요:", productId);
    // TODO: 찜하기 API 연동
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">상품을 불러오는 중...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">첫 번째 상품을 등록해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
                onLike={handleLike}
              />
            ))}
          </div>
        )}

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
