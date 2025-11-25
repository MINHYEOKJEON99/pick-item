"use client";

import { useState, useEffect } from "react";
import { X, ImagePlus } from "lucide-react";
import { getCategories } from "@/lib/api/products/productsApi";

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData, imageUrls: string[]) => Promise<void>;
  submitButtonText?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  submitButtonText = "등록하기",
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      userId: "",
      title: "",
      description: "",
      price: 0,
      categoryId: "",
      location: "배곧동",
    }
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 카테고리 목록 로드
  useEffect(() => {
    async function loadCategories() {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    }
    loadCategories();
  }, []);

  // 입력 값 변경 처리
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value) || 0 : value,
    }));
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 이미지 URL 추가
  const handleAddImage = () => {
    if (newImageUrl.trim() && imageUrls.length < 10) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  // 이미지 삭제
  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 유효성 검증
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    } else if (formData.title.length < 2) {
      newErrors.title = "제목은 2자 이상 입력해주세요";
    }

    if (!formData.description.trim()) {
      newErrors.description = "상품 설명을 입력해주세요";
    } else if (formData.description.length < 10) {
      newErrors.description = "상품 설명은 10자 이상 입력해주세요";
    }

    if (formData.price <= 0) {
      newErrors.price = "가격을 입력해주세요";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "카테고리를 선택해주세요";
    }

    if (!formData.location.trim()) {
      newErrors.location = "거래 희망 장소를 입력해주세요";
    }

    if (imageUrls.length === 0) {
      newErrors.images = "최소 1개의 이미지를 추가해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, imageUrls);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상품 이미지 <span className="text-red-500">*</span>
          <span className="text-gray-500 text-xs ml-2">({imageUrls.length}/10)</span>
        </label>

        {/* 이미지 미리보기 */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={url}
                  alt={`상품 이미지 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-white text-xs rounded">
                    대표
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 이미지 URL 입력 */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="이미지 URL을 입력하세요"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={imageUrls.length >= 10}
          />
          <button
            type="button"
            onClick={handleAddImage}
            disabled={!newImageUrl.trim() || imageUrls.length >= 10}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            추가
          </button>
        </div>
        {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
        <p className="mt-1 text-xs text-gray-500">
          * 임시로 이미지 URL을 직접 입력합니다. Storage 설정 후 파일 업로드 기능이 추가될
          예정입니다.
        </p>
      </div>

      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="상품 제목을 입력하세요"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          maxLength={100}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* 카테고리 */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.categoryId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
      </div>

      {/* 가격 */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          가격 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            placeholder="0"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            min="0"
            step="1000"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
        </div>
        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
      </div>

      {/* 설명 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          상품 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="상품에 대한 자세한 설명을 입력하세요"
          rows={8}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          <p className="text-xs text-gray-500 ml-auto">{formData.description.length}/2000</p>
        </div>
      </div>

      {/* 거래 희망 장소 */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          거래 희망 장소 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="예: 강남역, 홍대입구역"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.location ? "border-red-500" : "border-gray-300"
          }`}
          maxLength={50}
        />
        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "등록 중..." : submitButtonText}
        </button>
      </div>
    </form>
  );
}
