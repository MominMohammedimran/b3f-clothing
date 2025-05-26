export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          state: string
          street: string
          updated_at: string | null
          user_id: string
          zipcode: string
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          state: string
          street: string
          updated_at?: string | null
          user_id: string
          zipcode: string
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          state?: string
          street?: string
          updated_at?: string | null
          user_id?: string
          zipcode?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          hashed_password: string
          id: string
          permissions: string[] | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          hashed_password: string
          id?: string
          permissions?: string[] | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          hashed_password?: string
          id?: string
          permissions?: string[] | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string
          price: number
          product_id: string
          quantity: number
          size: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name: string
          price: number
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      designs: {
        Row: {
          created_at: string | null
          design_data: Json | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          design_data?: Json | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          design_data?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_tracking: {
        Row: {
          created_at: string | null
          current_location: string | null
          estimated_delivery: string | null
          history: Json | null
          id: string
          order_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_location?: string | null
          estimated_delivery?: string | null
          history?: Json | null
          id?: string
          order_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_location?: string | null
          estimated_delivery?: string | null
          history?: Json | null
          id?: string
          order_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_with_user_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          date: string | null
          delivery_fee: number | null
          id: string
          items: Json
          order_number: string
          payment_details: Json | null
          payment_method: string
          shipping_address: Json | null
          status: string
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          delivery_fee?: number | null
          id?: string
          items: Json
          order_number: string
          payment_details?: Json | null
          payment_method?: string
          shipping_address?: Json | null
          status?: string
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          delivery_fee?: number | null
          id?: string
          items?: Json
          order_number?: string
          payment_details?: Json | null
          payment_method?: string
          shipping_address?: Json | null
          status?: string
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_details: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          order_id: string | null
          payment_date: string | null
          payment_method: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_date?: string | null
          payment_method: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_with_user_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_main: boolean | null
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_main?: boolean | null
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_main?: boolean | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          size: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          size: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          size?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          product_id: string
          size: string | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          size?: string | null
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          size?: string | null
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          code: string | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          image: string | null
          images: string[] | null
          name: string
          original_price: number | null
          price: number
          sizes: string[] | null
          stock: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image?: string | null
          images?: string[] | null
          name: string
          original_price?: number | null
          price: number
          sizes?: string[] | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image?: string | null
          images?: string[] | null
          name?: string
          original_price?: number | null
          price?: number
          sizes?: string[] | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          phone_number: string | null
          reward_points: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          phone_number?: string | null
          reward_points?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          phone_number?: string | null
          reward_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_location_preferences: {
        Row: {
          created_at: string | null
          id: string
          location_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_location_preferences_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      order_with_user_email: {
        Row: {
          created_at: string | null
          date: string | null
          delivery_fee: number | null
          email: string | null
          id: string | null
          items: Json | null
          order_number: string | null
          payment_method: string | null
          shipping_address: Json | null
          status: string | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_order: {
        Args: {
          p_user_id: string
          p_order_number: string
          p_total: number
          p_status: string
          p_items: Json
          p_payment_method: string
          p_delivery_fee: number
          p_shipping_address: Json
        }
        Returns: Json
      }
      create_order_tracking: {
        Args:
          | {
              p_order_id: string
              p_status: string
              p_current_location: string
              p_estimated_delivery: string
              p_history: Json
            }
          | {
              p_order_id: string
              p_status: string
              p_current_location: string
              p_estimated_delivery: string
              p_history: Json
            }
        Returns: Json
      }
      get_order_by_id: {
        Args: { order_id: string }
        Returns: Json
      }
      get_order_tracking: {
        Args: { order_id: string }
        Returns: Json
      }
      is_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      verify_admin_login: {
        Args: { input_email: string; input_password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
