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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      event_parking_suggestions: {
        Row: {
          created_at: string
          distance_miles: number | null
          estimated_walk_minutes: number | null
          event_id: string
          id: string
          parking_lot_id: string
        }
        Insert: {
          created_at?: string
          distance_miles?: number | null
          estimated_walk_minutes?: number | null
          event_id: string
          id?: string
          parking_lot_id: string
        }
        Update: {
          created_at?: string
          distance_miles?: number | null
          estimated_walk_minutes?: number | null
          event_id?: string
          id?: string
          parking_lot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_parking_suggestions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_parking_suggestions_parking_lot_id_fkey"
            columns: ["parking_lot_id"]
            isOneToOne: false
            referencedRelation: "parking_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number
          category: string
          coordinates: number[]
          cost_usd: number | null
          created_at: string
          date: string
          description: string
          end_at: string | null
          external_event_id: string | null
          id: string
          image_url: string
          location: string
          registered: number
          source_url: string | null
          start_at: string | null
          tags: string[]
          time: string
          title: string
        }
        Insert: {
          capacity: number
          category: string
          coordinates: number[]
          cost_usd?: number | null
          created_at?: string
          date: string
          description: string
          end_at?: string | null
          external_event_id?: string | null
          id?: string
          image_url: string
          location: string
          registered?: number
          source_url?: string | null
          start_at?: string | null
          tags?: string[]
          time: string
          title: string
        }
        Update: {
          capacity?: number
          category?: string
          coordinates?: number[]
          cost_usd?: number | null
          created_at?: string
          date?: string
          description?: string
          end_at?: string | null
          external_event_id?: string | null
          id?: string
          image_url?: string
          location?: string
          registered?: number
          source_url?: string | null
          start_at?: string | null
          tags?: string[]
          time?: string
          title?: string
        }
        Relationships: []
      }
      parking_lots: {
        Row: {
          address: string
          available_spots: number | null
          campus: string
          created_at: string
          hourly_rate_usd: number | null
          id: string
          lat_2: number | null
          latitude: number
          lng_2: number | null
          longitude: number
          name: string
          total_spots: number | null
        }
        Insert: {
          address: string
          available_spots?: number | null
          campus: string
          created_at?: string
          hourly_rate_usd?: number | null
          id?: string
          lat_2?: number | null
          latitude: number
          lng_2?: number | null
          longitude: number
          name: string
          total_spots?: number | null
        }
        Update: {
          address?: string
          available_spots?: number | null
          campus?: string
          created_at?: string
          hourly_rate_usd?: number | null
          id?: string
          lat_2?: number | null
          latitude?: number
          lng_2?: number | null
          longitude?: number
          name?: string
          total_spots?: number | null
        }
        Relationships: []
      }
      pending_admin_invites: {
        Row: {
          created_at: string
          email: string
          invited_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          invited_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          event_id: string
          first_name: string
          id: string
          last_name: string
          middle_name: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          first_name: string
          id?: string
          last_name: string
          middle_name?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          first_name?: string
          id?: string
          last_name?: string
          middle_name?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      route_queries: {
        Row: {
          created_at: string
          destination_address: string
          distance_miles: number | null
          duration_minutes: number | null
          event_id: string | null
          id: string
          origin_address: string
          provider: string
          raw_response: Json | null
          toll_fee_usd: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          destination_address: string
          distance_miles?: number | null
          duration_minutes?: number | null
          event_id?: string | null
          id?: string
          origin_address: string
          provider?: string
          raw_response?: Json | null
          toll_fee_usd?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          destination_address?: string
          distance_miles?: number | null
          duration_minutes?: number | null
          event_id?: string | null
          id?: string
          origin_address?: string
          provider?: string
          raw_response?: Json | null
          toll_fee_usd?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_queries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_address_inputs: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          input_address: string
          input_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          input_address: string
          input_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          input_address?: string
          input_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_address_inputs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          default_address: string | null
          default_city: string | null
          student_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          default_address?: string | null
          default_city?: string | null
          student_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          default_address?: string | null
          default_city?: string | null
          student_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      queue_admin_invite: {
        Args: { p_email: string; p_invited_by?: string }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          p_invited_by?: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "student" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["student", "admin"],
    },
  },
} as const



