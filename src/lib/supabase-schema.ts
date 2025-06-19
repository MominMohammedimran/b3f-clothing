
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
          sizes: Json
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
          sizes?: Json
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
          sizes?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          date: string | null
          delivery_fee: number | null
          id: string
          items: Json
          order_number: string
          order_status: string | null
          payment_details: Json | null
          payment_method: string
          payment_status: string | null
          reward_points: number | null
          shipping_address: Json | null
          status: string
          total: number
          updated_at: string | null
          upi_input: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          delivery_fee?: number | null
          id?: string
          items: Json
          order_number: string
          order_status?: string | null
          payment_details?: Json | null
          payment_method?: string
          payment_status?: string | null
          reward_points?: number | null
          shipping_address?: Json | null
          status?: string
          total: number
          updated_at?: string | null
          upi_input?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          delivery_fee?: number | null
          id?: string
          items?: Json
          order_number?: string
          order_status?: string | null
          payment_details?: Json | null
          payment_method?: string
          payment_status?: string | null
          reward_points?: number | null
          shipping_address?: Json | null
          status?: string
          total?: number
          updated_at?: string | null
          upi_input?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
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
          productId: string | null
          sizes: string[] | null
          stock: number | null
          tags: string[] | null
          updated_at: string | null
          variants: Json | null
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
          productId?: string | null
          sizes?: string[] | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
          variants?: Json | null
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
          productId?: string | null
          sizes?: string[] | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
          variants?: Json | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never