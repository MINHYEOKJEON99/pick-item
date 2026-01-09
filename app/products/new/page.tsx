"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/products/ProductForm";
import { createProduct } from "@/lib/api/products/productsApi";
import { getCurrentUser } from "@/lib/api/auth/authApi";

export default function NewProductPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로드 및 로그인 확인
  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    }
    checkAuth();
  }, [router]);

  // 폼 제출 처리
  const handleSubmit = async (formData: ProductFormData, imageUrls: string[]) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    try {
      // userId 추가
      const productData = {
        ...formData,
        userId: user.id,
      };

      const result = await createProduct(productData, imageUrls);

      if (result.success && result.data) {
        alert("상품이 등록되었습니다!");
        router.push(`/products/${result.data.id}`);
      } else {
        alert(`상품 등록에 실패했습니다: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">상품 등록</h1>
          <p className="mt-2 text-gray-600">판매하실 상품의 정보를 입력해주세요.</p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ProductForm onSubmit={handleSubmit} submitButtonText="상품 등록" />
        </div>

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">상품 등록 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 상품 이미지는 최소 1장, 최대 10장까지 등록 가능합니다.</li>
            <li>• 첫 번째 이미지가 대표 이미지로 설정됩니다.</li>
            <li>• 정확한 상품 정보를 입력해주시면 빠른 거래에 도움이 됩니다.</li>
            <li>• 거래 금지 품목은 등록이 제한될 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
