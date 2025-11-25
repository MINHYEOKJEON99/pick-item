// Global Type Definitions
// 전역에서 import 없이 사용 가능한 타입들

import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// ============================================
// Database Table Types (전역 선언)
// ============================================

declare global {
  // Supabase Auth User
  type User = SupabaseUser;

  // Database Tables
  type Profile = Database["public"]["Tables"]["profiles"]["Row"];
  type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
  type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

  type Category = Database["public"]["Tables"]["categories"]["Row"];

  type Product = Database["public"]["Tables"]["products"]["Row"];
  type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
  type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

  type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
  type ProductImageInsert = Database["public"]["Tables"]["product_images"]["Insert"];

  type Wishlist = Database["public"]["Tables"]["wishlists"]["Row"];
  type WishlistInsert = Database["public"]["Tables"]["wishlists"]["Insert"];

  type ChatRoom = Database["public"]["Tables"]["chat_rooms"]["Row"];
  type ChatRoomInsert = Database["public"]["Tables"]["chat_rooms"]["Insert"];

  type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
  type ChatMessageInsert = Database["public"]["Tables"]["chat_messages"]["Insert"];

  type UserActivity = Database["public"]["Tables"]["user_activities"]["Row"];
  type UserActivityInsert = Database["public"]["Tables"]["user_activities"]["Insert"];

  // ============================================
  // Extended Types (관계형 데이터 포함)
  // ============================================

  // 상품 + 이미지
  type ProductWithImages = Product & {
    images: ProductImage[];
  };

  // 상품 + 모든 상세 정보
  type ProductWithDetails = Product & {
    images: ProductImage[];
    profile: Profile;
    category: Category;
    wishlist_count?: number;
    is_wishlist?: boolean;
  };

  // 채팅방 + 상세 정보
  type ChatRoomWithDetails = ChatRoom & {
    product: Product;
    seller: Profile;
    buyer: Profile;
    last_message?: ChatMessage;
    unread_count?: number;
  };

  // 채팅 메시지 + 발신자 정보
  type ChatMessageWithSender = ChatMessage & {
    sender: Profile;
  };

  // ============================================
  // API Response Types
  // ============================================

  // API 공통 응답 타입
  type ApiResponse<T = any> = {
    data: T | null;
    error: string | null;
    success: boolean;
  };

  // 페이지네이션 응답
  type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };

  // ============================================
  // Form Types
  // ============================================

  // 상품 등록 폼
  type ProductFormData = {
    userId: string;
    title: string;
    description: string;
    price: number;
    categoryId: string;
    location: string;
  };

  // 프로필 수정 폼
  type ProfileFormData = {
    display_name: string;
    photo_url?: string;
    location?: string;
  };

  // ============================================
  // Enum Types
  // ============================================

  // 상품 상태
  type ProductStatus = "available" | "reserved" | "sold";

  // 활동 타입
  type ActivityType = "view" | "search" | "wishlist" | "chat";

  // 제공자
  type AuthProvider = "google" | "kakao";

  // ============================================
  // Utility Types
  // ============================================

  // 검색 필터
  type SearchFilters = {
    keyword?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
    status?: ProductStatus;
  };

  // 정렬 옵션
  type SortOption = "recent" | "price-low" | "price-high" | "popular";

  // 페이지네이션 파라미터
  type PaginationParams = {
    page: number;
    pageSize: number;
  };
}

// 이 파일이 모듈로 인식되도록 export 추가
export {};
