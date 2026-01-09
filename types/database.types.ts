// Supabase Database Types
// Auto-generated types from Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          photo_url: string | null;
          provider: string;
          location: string | null;
          posts_count: number;
          sales_count: number;
          purchase_count: number;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          photo_url?: string | null;
          provider?: string;
          location?: string | null;
          posts_count?: number;
          sales_count?: number;
          purchase_count?: number;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          photo_url?: string | null;
          provider?: string;
          location?: string | null;
          posts_count?: number;
          sales_count?: number;
          purchase_count?: number;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          emoji: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          emoji: string;
          display_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          emoji?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          description: string | null;
          price: number;
          location: string;
          status: "available" | "reserved" | "sold";
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          description?: string | null;
          price: number;
          location: string;
          status?: "available" | "reserved" | "sold";
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          location?: string;
          status?: "available" | "reserved" | "sold";
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          product_id: string;
          seller_id: string;
          buyer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          seller_id: string;
          buyer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          seller_id?: string;
          buyer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          chat_room_id: string;
          sender_id: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_room_id: string;
          sender_id: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_room_id?: string;
          sender_id?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: "view" | "search" | "wishlist" | "chat";
          product_id: string | null;
          search_keyword: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: "view" | "search" | "wishlist" | "chat";
          product_id?: string | null;
          search_keyword?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: "view" | "search" | "wishlist" | "chat";
          product_id?: string | null;
          search_keyword?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updateable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Specific type exports
export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductImage = Tables<"product_images">;
export type Wishlist = Tables<"wishlists">;
export type ChatRoom = Tables<"chat_rooms">;
export type ChatMessage = Tables<"chat_messages">;
export type UserActivity = Tables<"user_activities">;

// Extended types with relations
export type ProductWithImages = Product & {
  images: ProductImage[];
};

export type ProductWithDetails = Product & {
  images: ProductImage[];
  profile: Profile;
  category: Category;
  wishlist_count?: number;
  is_wishlist?: boolean;
};

export type ChatRoomWithDetails = ChatRoom & {
  product: Product;
  seller: Profile;
  buyer: Profile;
  last_message?: ChatMessage;
  unread_count?: number;
};

export type ChatMessageWithSender = ChatMessage & {
  sender: Profile;
};
