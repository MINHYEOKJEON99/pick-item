"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, ImagePlus, MapPin } from "lucide-react";
import { getCategories } from "@/lib/api/products/productsApi";

// 다음 우편번호 서비스 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => { open: () => void };
    };
  }
}

interface DaumPostcodeData {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  userSelectedType: "R" | "J";
}

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [displayPrice, setDisplayPrice] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: initialData || {
      userId: "",
      title: "",
      description: "",
      price: 0,
      categoryId: "",
      location: "",
    },
  });

  const descriptionLength = watch("description")?.length || 0;

  // 가격 포맷팅 (세자리 콤마)
  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (!numericValue) return "";
    return Number(numericValue).toLocaleString("ko-KR");
  };

  // 가격 입력 핸들러
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = rawValue ? Number(rawValue) : 0;

    setDisplayPrice(formatPrice(rawValue));
    setValue("price", numericValue, { shouldValidate: true });
  };

  // 초기 가격 설정
  useEffect(() => {
    if (initialData?.price) {
      setDisplayPrice(formatPrice(String(initialData.price)));
    }
  }, [initialData]);

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

  // 다음 우편번호 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 우편번호 검색 팝업 열기
  const handleOpenPostcode = () => {
    if (!window.daum) return;

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        // 도로명 주소 우선, 없으면 지번 주소 사용
        let fullAddress = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        // 건물명이 있으면 추가
        if (data.buildingName) {
          fullAddress += ` (${data.buildingName})`;
        }

        setValue("location", fullAddress, { shouldValidate: true });
      },
    }).open();
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

  // 폼 제출
  const onFormSubmit = async (data: ProductFormData) => {
    const finalImageUrls = imageUrls.length > 0 ? imageUrls : ["/no-image.svg"];
    await onSubmit(data, finalImageUrls);
  };

  const inputClassName = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상품 이미지 <span className="text-gray-400 text-xs">(선택)</span>
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
          placeholder="상품 제목을 입력하세요"
          className={inputClassName(!!errors.title)}
          maxLength={100}
          {...register("title", {
            required: "제목을 입력해주세요",
            minLength: { value: 2, message: "제목은 2자 이상 입력해주세요" },
          })}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* 카테고리 */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          className={inputClassName(!!errors.categoryId)}
          {...register("categoryId", { required: "카테고리를 선택해주세요" })}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
        )}
      </div>

      {/* 가격 */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          가격 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="price"
            inputMode="numeric"
            placeholder="0"
            className={inputClassName(!!errors.price)}
            value={displayPrice}
            onChange={handlePriceChange}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
        </div>
        <input type="hidden" {...register("price", { required: "가격을 입력해주세요", min: { value: 1, message: "가격을 입력해주세요" } })} />
        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
      </div>

      {/* 설명 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          상품 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          placeholder="상품에 대한 자세한 설명을 입력하세요"
          rows={8}
          className={`${inputClassName(!!errors.description)} resize-none`}
          maxLength={2000}
          {...register("description", {
            required: "상품 설명을 입력해주세요",
            minLength: { value: 10, message: "상품 설명은 10자 이상 입력해주세요" },
          })}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
          <p className="text-xs text-gray-500 ml-auto">{descriptionLength}/2000</p>
        </div>
      </div>

      {/* 거래 희망 장소 */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          거래 희망 장소 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="location"
            placeholder="주소 검색 버튼을 클릭하세요"
            className={`${inputClassName(!!errors.location)} cursor-pointer`}
            readOnly
            onClick={handleOpenPostcode}
            {...register("location", { required: "거래 희망 장소를 입력해주세요" })}
          />
          <button
            type="button"
            onClick={handleOpenPostcode}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <MapPin className="w-4 h-4" />
            주소 검색
          </button>
        </div>
        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>}
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
