export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          state: string
          street: string
          updated_at: string
          user_id: string
          zipcode: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          state: string
          street: string
          updated_at?: string
          user_id: string
          zipcode: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          state?: string
          street?: string
          updated_at?: string
          user_id?: string
          zipcode?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      carts: {
        Row: {
          color: string | null
          created_at: string
          id: string
          image: string | null
          name: string
          price: number
          product_id: string
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name: string
          price: number
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          date: string | null
          delivery_fee: number | null
          id: string
          items: Json
          order_number: string
          payment_method: string
          shipping_address: Json | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          delivery_fee?: number | null
          id?: string
          items: Json
          order_number: string
          payment_method?: string
          shipping_address?: Json | null
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          delivery_fee?: number | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string
          shipping_address?: Json | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_tracking: {
  Row: {
    id: string;
    order_id: string;
    status: string;
    current_location: string | null;
    estimated_delivery: string | null;
    tracking_number: string | null;
    timestamp: string;
    description: string | null;
    // If you have a history JSON column, adjust type as needed, e.g.:
    history?: Json | null;
  };
  Insert: {
    id?: string;
    order_id: string;
    status: string;
    current_location?: string | null;
    estimated_delivery?: string | null;
    tracking_number?: string | null;
    timestamp?: string;
    description?: string | null;
    history?: Json | null;
  };
  Update: {
    id?: string;
    order_id?: string;
    status?: string;
    current_location?: string | null;
    estimated_delivery?: string | null;
    tracking_number?: string | null;
    timestamp?: string;
    description?: string | null;
    history?: Json | null;
  };
  Relationships: [
    {
      foreignKeyName: "order_tracking_order_id_fkey",
      columns: ["order_id"],
      referencedRelation: "orders",
      referencedColumns: ["id"];
    }
  ];
};

      products: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          price: number
          original_price: number
          discount_percentage: number
          image: string | null
          images: Json | null
          rating: number
          category: string
          tags: Json | null
          sizes: Json | null
          stock: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          price: number
          original_price: number
          discount_percentage?: number
          image?: string | null
          images?: Json | null
          rating?: number
          category: string
          tags?: Json | null
          sizes?: Json | null
          stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          price?: number
          original_price?: number
          discount_percentage?: number
          image?: string | null
          images?: Json | null
          rating?: number
          category?: string
          tags?: Json | null
          sizes?: Json | null
          stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          reward_points: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          reward_points?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          reward_points?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings: Json
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_location_preferences: {
        Row: {
          created_at: string
          id: string
          location_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    };
    Views: {};
    Functions: {
            is_admin: {
            Args: {
              user_email: string;
             };
               Returns: boolean;
          };
  // other functions...
};

    Enums: {};
    CompositeTypes: {};
  };
}
