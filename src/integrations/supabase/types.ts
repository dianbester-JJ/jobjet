export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          created_at: string
          customer_id: string
          hours_requested: number
          id: string
          listing_id: string
          notes: string | null
          provider_id: string
          service_date: string
          service_time: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_id: string
          hours_requested?: number
          id?: string
          listing_id: string
          notes?: string | null
          provider_id: string
          service_date: string
          service_time: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_id?: string
          hours_requested?: number
          id?: string
          listing_id?: string
          notes?: string | null
          provider_id?: string
          service_date?: string
          service_time?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "provider_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          booking_id: string | null
          content: string
          created_at: string
          id: string
          is_quick_response: boolean
          listing_id: string | null
          message_type: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_quick_response?: boolean
          listing_id?: string | null
          message_type?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_quick_response?: boolean
          listing_id?: string | null
          message_type?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "provider_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_role: string
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          roles: string[]
          updated_at: string
        }
        Insert: {
          active_role?: string
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          roles?: string[]
          updated_at?: string
        }
        Update: {
          active_role?: string
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          roles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      provider_calendar_entries: {
        Row: {
          booking_id: string | null
          created_at: string
          end_time: string | null
          entry_date: string
          id: string
          notes: string | null
          provider_id: string
          start_time: string
          title: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          end_time?: string | null
          entry_date: string
          id?: string
          notes?: string | null
          provider_id: string
          start_time: string
          title: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          end_time?: string | null
          entry_date?: string
          id?: string
          notes?: string | null
          provider_id?: string
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_calendar_entries_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_listings: {
        Row: {
          admin_notes: string | null
          approved: boolean | null
          category_id: string
          cover_photo_url: string | null
          created_at: string
          description: string | null
          hourly_rate: number
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          rate_type: string
          rate_unit: string | null
          service_radius: number | null
          title: string
          updated_at: string
          user_id: string
          verified: boolean | null
          working_hours_per_day: number | null
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          approved?: boolean | null
          category_id: string
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          hourly_rate: number
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          rate_type?: string
          rate_unit?: string | null
          service_radius?: number | null
          title: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
          working_hours_per_day?: number | null
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          approved?: boolean | null
          category_id?: string
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          hourly_rate?: number
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          rate_type?: string
          rate_unit?: string | null
          service_radius?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          working_hours_per_day?: number | null
          years_experience?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          provider_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          provider_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          provider_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vetting_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          criminal_offence: string | null
          full_name: string
          has_criminal_history: boolean
          id: string
          id_number: string
          id_photo_url: string | null
          job_photo_urls: string[] | null
          other_service: string | null
          referral_numbers: string[] | null
          services: string[]
          status: string
          updated_at: string
          user_id: string
          verification_method: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          criminal_offence?: string | null
          full_name: string
          has_criminal_history?: boolean
          id?: string
          id_number: string
          id_photo_url?: string | null
          job_photo_urls?: string[] | null
          other_service?: string | null
          referral_numbers?: string[] | null
          services: string[]
          status?: string
          updated_at?: string
          user_id: string
          verification_method: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          criminal_offence?: string | null
          full_name?: string
          has_criminal_history?: boolean
          id?: string
          id_number?: string
          id_photo_url?: string | null
          job_photo_urls?: string[] | null
          other_service?: string | null
          referral_numbers?: string[] | null
          services?: string[]
          status?: string
          updated_at?: string
          user_id?: string
          verification_method?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "provider" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "provider", "customer"],
    },
  },
} as const
