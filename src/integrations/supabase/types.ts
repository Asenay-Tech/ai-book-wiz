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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          payload_json: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          payload_json?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          payload_json?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_statements: {
        Row: {
          file_name: string
          file_url: string
          id: string
          parsed_transactions: Json | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_url: string
          id?: string
          parsed_transactions?: Json | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_url?: string
          id?: string
          parsed_transactions?: Json | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          category: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      budget_limits: {
        Row: {
          alert_threshold: number | null
          category: string
          created_at: string
          id: string
          monthly_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: number | null
          category: string
          created_at?: string
          id?: string
          monthly_limit: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: number | null
          category?: string
          created_at?: string
          id?: string
          monthly_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_analysis: {
        Row: {
          analysis_notes: string | null
          confidence_score: number | null
          created_at: string
          id: string
          is_duplicate: boolean | null
          is_unusual: boolean | null
          suggested_category: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          analysis_notes?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_duplicate?: boolean | null
          is_unusual?: boolean | null
          suggested_category?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          analysis_notes?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_duplicate?: boolean | null
          is_unusual?: boolean | null
          suggested_category?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_analysis_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          price: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          price?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          price?: number | null
          user_id?: string
        }
        Relationships: []
      }
      pos_days: {
        Row: {
          comps: number
          created_at: string
          date: string
          id: string
          net_sales: number
          user_id: string
          voids: number
        }
        Insert: {
          comps?: number
          created_at?: string
          date: string
          id?: string
          net_sales?: number
          user_id: string
          voids?: number
        }
        Update: {
          comps?: number
          created_at?: string
          date?: string
          id?: string
          net_sales?: number
          user_id?: string
          voids?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          monthly_uploads_used: number
          subscription_expires_at: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          monthly_uploads_used?: number
          subscription_expires_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          monthly_uploads_used?: number
          subscription_expires_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          file_name: string
          file_type: string
          file_url: string
          id: string
          ocr_text: string | null
          parsed_data: Json | null
          status: Database["public"]["Enums"]["receipt_status"]
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_type: string
          file_url: string
          id?: string
          ocr_text?: string | null
          parsed_data?: Json | null
          status?: Database["public"]["Enums"]["receipt_status"]
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          ocr_text?: string | null
          parsed_data?: Json | null
          status?: Database["public"]["Enums"]["receipt_status"]
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliations: {
        Row: {
          created_at: string
          id: string
          meta_json: Json | null
          receipt_id: string | null
          score: number | null
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_json?: Json | null
          receipt_id?: string | null
          score?: number | null
          status: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_json?: Json | null
          receipt_id?: string | null
          score?: number | null
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliations_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_expenses: {
        Row: {
          amount: number
          category: string
          confidence_score: number | null
          created_at: string
          frequency: string
          id: string
          is_confirmed: boolean | null
          last_detected_date: string | null
          next_expected_date: string | null
          updated_at: string
          user_id: string
          vendor: string
        }
        Insert: {
          amount: number
          category: string
          confidence_score?: number | null
          created_at?: string
          frequency: string
          id?: string
          is_confirmed?: boolean | null
          last_detected_date?: string | null
          next_expected_date?: string | null
          updated_at?: string
          user_id: string
          vendor: string
        }
        Update: {
          amount?: number
          category?: string
          confidence_score?: number | null
          created_at?: string
          frequency?: string
          id?: string
          is_confirmed?: boolean | null
          last_detected_date?: string | null
          next_expected_date?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          ai_insights: string | null
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          file_url: string | null
          format: string | null
          id: string
          report_name: string
          report_type: string
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          report_name: string
          report_type: string
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          report_name?: string
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      skus: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          sku_code: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          sku_code: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          sku_code?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string
          member_email: string
          member_user_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
          workspace_owner_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          member_email: string
          member_user_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          workspace_owner_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          member_email?: string
          member_user_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          workspace_owner_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string
          date: string
          description: string
          id: string
          is_reconciled: boolean
          notes: string | null
          receipt_id: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at?: string
          date: string
          description: string
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          receipt_id?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"]
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          receipt_id?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          license_plate: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          license_plate?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          license_plate?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          created_at: string
          id: string
          name: string
          normalized_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          normalized_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          normalized_name?: string | null
          user_id?: string
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
      reset_monthly_uploads: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      alert_type:
        | "budget_exceeded"
        | "duplicate_expense"
        | "unusual_expense"
        | "recurring_detected"
      app_role: "owner" | "admin" | "member" | "viewer"
      receipt_status: "pending" | "processed" | "error" | "matched"
      subscription_tier: "free" | "starter" | "pro" | "business"
      transaction_category:
        | "food_dining"
        | "transportation"
        | "utilities"
        | "rent_mortgage"
        | "office_supplies"
        | "equipment"
        | "services"
        | "travel"
        | "entertainment"
        | "healthcare"
        | "insurance"
        | "taxes"
        | "other"
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
      alert_type: [
        "budget_exceeded",
        "duplicate_expense",
        "unusual_expense",
        "recurring_detected",
      ],
      app_role: ["owner", "admin", "member", "viewer"],
      receipt_status: ["pending", "processed", "error", "matched"],
      subscription_tier: ["free", "starter", "pro", "business"],
      transaction_category: [
        "food_dining",
        "transportation",
        "utilities",
        "rent_mortgage",
        "office_supplies",
        "equipment",
        "services",
        "travel",
        "entertainment",
        "healthcare",
        "insurance",
        "taxes",
        "other",
      ],
    },
  },
} as const
