/**
 * Wishlist API
 * 찜하기 관련 API 함수들
 */

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * 찜하기 토글 (찜 추가/제거)
 */
export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<ApiResponse<{ isWishlisted: boolean }>> {
  try {
    // 현재 찜 상태 확인 (maybeSingle: 결과 없어도 에러 안남)
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      // 찜 제거
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", existing.id);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: { isWishlisted: false }, error: null, success: true };
    } else {
      // 찜 추가
      const { error } = await supabase.from("wishlists").insert({
        user_id: userId,
        product_id: productId,
      });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: { isWishlisted: true }, error: null, success: true };
    }
  } catch (error) {
    console.error("Error in toggleWishlist:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 찜 상태 확인
 */
export async function checkWishlistStatus(
  userId: string,
  productId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: !!data, error: null, success: true };
  } catch (error) {
    console.error("Error in checkWishlistStatus:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 상품의 찜 개수 조회
 */
export async function getWishlistCount(
  productId: string
): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: count || 0, error: null, success: true };
  } catch (error) {
    console.error("Error in getWishlistCount:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 사용자의 찜 목록 조회
 */
export async function getUserWishlist(
  userId: string
): Promise<ApiResponse<ProductWithDetails[]>> {
  try {
    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        product:products(
          *,
          images:product_images(id, image_url, display_order),
          profile:profiles(id, display_name, photo_url, location),
          category:categories(id, name, emoji)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlist:", error);
      return { data: null, error: error.message, success: false };
    }

    // 데이터 형태 변환
    const products = data
      ?.map((item: any) => item.product)
      .filter((product: any) => product !== null) as ProductWithDetails[];

    return { data: products || [], error: null, success: true };
  } catch (error) {
    console.error("Error in getUserWishlist:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}

/**
 * 여러 상품의 찜 상태 일괄 확인
 */
export async function checkMultipleWishlistStatus(
  userId: string,
  productIds: string[]
): Promise<ApiResponse<Record<string, boolean>>> {
  try {
    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId)
      .in("product_id", productIds);

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    const wishlistMap: Record<string, boolean> = {};
    productIds.forEach((id) => {
      wishlistMap[id] = false;
    });
    data?.forEach((item) => {
      wishlistMap[item.product_id] = true;
    });

    return { data: wishlistMap, error: null, success: true };
  } catch (error) {
    console.error("Error in checkMultipleWishlistStatus:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      success: false,
    };
  }
}
