/**
 * Products API
 * 상품 CRUD 및 관련 기능을 위한 API 함수들
 */

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 상품 목록에 wishlist 정보 추가
 */
async function addWishlistInfo(
  products: any[],
  currentUserId?: string
): Promise<ProductWithDetails[]> {
  if (products.length === 0) return [];

  const productIds = products.map((p) => p.id);

  // 각 상품의 찜 개수 가져오기
  const { data: wishlistCounts } = await supabase
    .from("wishlists")
    .select("product_id")
    .in("product_id", productIds);

  // 찜 개수 계산
  const countMap: Record<string, number> = {};
  wishlistCounts?.forEach((w) => {
    countMap[w.product_id] = (countMap[w.product_id] || 0) + 1;
  });

  // 현재 사용자의 찜 상태 확인
  let userWishlistSet = new Set<string>();
  if (currentUserId) {
    const { data: userWishlists } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", currentUserId)
      .in("product_id", productIds);

    userWishlists?.forEach((w) => userWishlistSet.add(w.product_id));
  }

  // 상품 데이터에 wishlist 정보 추가
  return products.map((product) => ({
    ...product,
    wishlist_count: countMap[product.id] || 0,
    is_wishlist: userWishlistSet.has(product.id),
  }));
}

// ============================================
// 상품 조회 (Read)
// ============================================

/**
 * 상품 목록 조회 (페이지네이션)
 */
export async function getProducts(params?: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: "available" | "reserved" | "sold";
  sortBy?: "created_at" | "price" | "view_count";
  sortOrder?: "asc" | "desc";
  currentUserId?: string;
}): Promise<ApiResponse<PaginatedResponse<ProductWithDetails>>> {
  try {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 12;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("products")
      .select(
        `
        *,
        images:product_images(id, image_url, display_order),
        profile:profiles(id, display_name, photo_url, location),
        category:categories(id, name, emoji)
      `,
        { count: "exact" }
      )
      .range(offset, offset + pageSize - 1);

    // 필터링
    if (params?.categoryId && params.categoryId !== "all") {
      query = query.eq("category_id", params.categoryId);
    }
    if (params?.status) {
      query = query.eq("status", params.status);
    }

    // 정렬
    const sortBy = params?.sortBy || "created_at";
    const sortOrder = params?.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return { data: null, error: error.message, success: false };
    }

    // wishlist 정보 추가
    const productsWithWishlist = await addWishlistInfo(data || [], params?.currentUserId);

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data: {
        data: productsWithWishlist,
        total: count || 0,
        page,
        pageSize,
        totalPages,
      },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Error in getProducts:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 상품 상세 조회
 */
export async function getProductById(
  productId: string,
  currentUserId?: string
): Promise<ApiResponse<ProductWithDetails>> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        images:product_images(id, image_url, display_order),
        profile:profiles(id, display_name, photo_url, location, posts_count, sales_count),
        category:categories(id, name, emoji)
      `
      )
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return { data: null, error: error.message, success: false };
    }

    // wishlist 정보 추가
    const [productWithWishlist] = await addWishlistInfo([data], currentUserId);

    // 조회수 증가
    await incrementViewCount(productId);

    return { data: productWithWishlist, error: null, success: true };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 사용자별 상품 목록 조회
 */
export async function getProductsByUserId(
  userId: string
): Promise<ApiResponse<ProductWithImages[]>> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        images:product_images(id, image_url, display_order)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user products:", error);
      return { data: null, error: error.message, success: false };
    }

    return { data: data || [], error: null, success: true };
  } catch (error) {
    console.error("Error in getProductsByUserId:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 상품 검색
 */
export async function searchProducts(
  keyword: string,
  params?: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    currentUserId?: string;
  }
): Promise<ApiResponse<PaginatedResponse<ProductWithDetails>>> {
  try {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 12;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("products")
      .select(
        `
        *,
        images:product_images(id, image_url, display_order),
        profile:profiles(id, display_name, photo_url, location),
        category:categories(id, name, emoji)
      `,
        { count: "exact" }
      )
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .range(offset, offset + pageSize - 1)
      .order("created_at", { ascending: false });

    if (params?.categoryId && params.categoryId !== "all") {
      query = query.eq("category_id", params.categoryId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error searching products:", error);
      return { data: null, error: error.message, success: false };
    }

    // wishlist 정보 추가
    const productsWithWishlist = await addWishlistInfo(data || [], params?.currentUserId);

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data: {
        data: productsWithWishlist,
        total: count || 0,
        page,
        pageSize,
        totalPages,
      },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

// ============================================
// 상품 등록 (Create)
// ============================================

/**
 * 상품 등록
 */
export async function createProduct(
  productData: ProductFormData,
  imageUrls: string[]
): Promise<ApiResponse<Product>> {
  try {
    // 1. 상품 기본 정보 등록
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        user_id: productData.userId,
        category_id: productData.categoryId,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        location: productData.location,
        status: "available",
      })
      .select()
      .single();

    if (productError) {
      console.error("Error creating product:", productError);
      return { data: null, error: productError.message, success: false };
    }

    // 2. 이미지 URL 저장
    if (imageUrls.length > 0) {
      const imageData = imageUrls.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        display_order: index,
      }));

      const { error: imageError } = await supabase
        .from("product_images")
        .insert(imageData);

      if (imageError) {
        console.error("Error creating product images:", imageError);
        // 상품은 생성되었지만 이미지 저장 실패
        // 이미지 없이 상품 반환
      }
    }

    // 3. 사용자의 posts_count 증가
    const { data: profile } = await supabase
      .from("profiles")
      .select("posts_count")
      .eq("id", productData.userId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ posts_count: (profile.posts_count || 0) + 1 })
        .eq("id", productData.userId);
    }

    return { data: product, error: null, success: true };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

// ============================================
// 상품 수정 (Update)
// ============================================

/**
 * 상품 정보 수정
 */
export async function updateProduct(
  productId: string,
  updates: Partial<ProductFormData>
): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.categoryId && { category_id: updates.categoryId }),
        ...(updates.location && { location: updates.location }),
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 상품 상태 변경
 */
export async function updateProductStatus(
  productId: string,
  status: "available" | "reserved" | "sold"
): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ status })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating product status:", error);
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  } catch (error) {
    console.error("Error in updateProductStatus:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

// ============================================
// 상품 삭제 (Delete)
// ============================================

/**
 * 상품 삭제
 */
export async function deleteProduct(productId: string): Promise<ApiResponse<null>> {
  try {
    // product_images는 ON DELETE CASCADE로 자동 삭제됨
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 조회수 증가
 */
async function incrementViewCount(productId: string): Promise<void> {
  try {
    // 현재 조회수 가져오기
    const { data: product } = await supabase
      .from("products")
      .select("view_count")
      .eq("id", productId)
      .single();

    if (product) {
      // 조회수 +1 업데이트
      await supabase
        .from("products")
        .update({ view_count: (product.view_count || 0) + 1 })
        .eq("id", productId);
    }
  } catch (error) {
    console.error("Error in incrementViewCount:", error);
  }
}

/**
 * 카테고리 목록 조회
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return { data: null, error: error.message, success: false };
    }

    return { data: data || [], error: null, success: true };
  } catch (error) {
    console.error("Error in getCategories:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}
