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
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          phone: string | null
          state: string
          street: string
          updated_at: string | null
          user_id: string
          zipcode: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          phone?: string | null
          state: string
          street: string
          updated_at?: string | null
          user_id: string
          zipcode: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string | null
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
          id: string
          permissions: Json | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          permissions?: Json | null
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
      checkout_data: {
        Row: {
          created_at: string
          current_cart: Json | null
          deleted_at: string | null
          id: string
          is_deleted: boolean
          last_modified_by: string | null
          last_order_id: string | null
          last_order_number: string | null
          shipping_address: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_cart?: Json | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          last_modified_by?: string | null
          last_order_id?: string | null
          last_order_number?: string | null
          shipping_address: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_cart?: Json | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          last_modified_by?: string | null
          last_order_id?: string | null
          last_order_number?: string | null
          shipping_address?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_data_last_order_id_fkey"
            columns: ["last_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          user_email: string | null
          user_id: string | null
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
          user_email?: string | null
          user_id?: string | null
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
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          reward_points: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          reward_points?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          reward_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings?: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_designs: {
        Row: {
          created_at: string
          deleted_at: string | null
          design_data: Json
          id: string
          is_deleted: boolean
          last_modified_by: string | null
          name: string
          product_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          design_data: Json
          id?: string
          is_deleted?: boolean
          last_modified_by?: string | null
          name: string
          product_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          design_data?: Json
          id?: string
          is_deleted?: boolean
          last_modified_by?: string | null
          name?: string
          product_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
