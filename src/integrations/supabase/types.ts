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
      automation_logs: {
        Row: {
          automation_name: string
          created_at: string
          execution_time_ms: number | null
          id: string
          log_level: Database["public"]["Enums"]["log_level"]
          message: string
          metadata: Json | null
          status: string
        }
        Insert: {
          automation_name: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          log_level?: Database["public"]["Enums"]["log_level"]
          message: string
          metadata?: Json | null
          status?: string
        }
        Update: {
          automation_name?: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          log_level?: Database["public"]["Enums"]["log_level"]
          message?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          automation_name: string
          category: string | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          impact_level: Database["public"]["Enums"]["impact_level"]
          n8n_workflow_name: string | null
          status: Database["public"]["Enums"]["automation_status_type"]
          time_saved_per_execution: number | null
          updated_at: string
          webhook_backup_url: string | null
          webhook_url: string | null
        }
        Insert: {
          automation_name: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          n8n_workflow_name?: string | null
          status?: Database["public"]["Enums"]["automation_status_type"]
          time_saved_per_execution?: number | null
          updated_at?: string
          webhook_backup_url?: string | null
          webhook_url?: string | null
        }
        Update: {
          automation_name?: string
          category?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          n8n_workflow_name?: string | null
          status?: Database["public"]["Enums"]["automation_status_type"]
          time_saved_per_execution?: number | null
          updated_at?: string
          webhook_backup_url?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      automation_status: {
        Row: {
          automation_name: string
          created_at: string
          id: string
          last_run: string | null
          last_updated: string
          status: string
        }
        Insert: {
          automation_name: string
          created_at?: string
          id?: string
          last_run?: string | null
          last_updated?: string
          status: string
        }
        Update: {
          automation_name?: string
          created_at?: string
          id?: string
          last_run?: string | null
          last_updated?: string
          status?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          label: string
          value: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          label: string
          value: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          label?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_schedules: {
        Row: {
          company_id: string
          created_at: string
          day_of_week: number
          enabled: boolean
          frequency: string
          id: string
          interval_unit: string
          interval_value: number
          last_triggered_at: string | null
          next_trigger_at: string | null
          time_of_day: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          day_of_week?: number
          enabled?: boolean
          frequency?: string
          id?: string
          interval_unit?: string
          interval_value?: number
          last_triggered_at?: string | null
          next_trigger_at?: string | null
          time_of_day?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          day_of_week?: number
          enabled?: boolean
          frequency?: string
          id?: string
          interval_unit?: string
          interval_value?: number
          last_triggered_at?: string | null
          next_trigger_at?: string | null
          time_of_day?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_settings: {
        Row: {
          aantal_woorden: string | null
          achtergrond_kleur: string | null
          bedrijfsnaam: string | null
          bedrijfsomschrijving: string | null
          category: string | null
          company_id: string
          created_at: string
          folder_id: string | null
          get_afbeelding_url: string | null
          google_sheet_id: string | null
          google_slides_id: string | null
          hoofdaccent_gradient: string | null
          id: string
          image_type: string | null
          post_blog_url: string | null
          schrijfstijl: string | null
          status: string | null
          taal: string | null
          updated_at: string
        }
        Insert: {
          aantal_woorden?: string | null
          achtergrond_kleur?: string | null
          bedrijfsnaam?: string | null
          bedrijfsomschrijving?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          folder_id?: string | null
          get_afbeelding_url?: string | null
          google_sheet_id?: string | null
          google_slides_id?: string | null
          hoofdaccent_gradient?: string | null
          id?: string
          image_type?: string | null
          post_blog_url?: string | null
          schrijfstijl?: string | null
          status?: string | null
          taal?: string | null
          updated_at?: string
        }
        Update: {
          aantal_woorden?: string | null
          achtergrond_kleur?: string | null
          bedrijfsnaam?: string | null
          bedrijfsomschrijving?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          folder_id?: string | null
          get_afbeelding_url?: string | null
          google_sheet_id?: string | null
          google_slides_id?: string | null
          hoofdaccent_gradient?: string | null
          id?: string
          image_type?: string | null
          post_blog_url?: string | null
          schrijfstijl?: string | null
          status?: string | null
          taal?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          auth_token_secret_name: string | null
          blogs_n8n_name: string | null
          blogs_webhook: string | null
          created_at: string
          id: string
          name: string
          seo_research_n8n_name: string | null
          seo_research_webhook: string | null
          subkeywords_n8n_name: string | null
          subkeywords_webhook: string | null
        }
        Insert: {
          auth_token_secret_name?: string | null
          blogs_n8n_name?: string | null
          blogs_webhook?: string | null
          created_at?: string
          id?: string
          name: string
          seo_research_n8n_name?: string | null
          seo_research_webhook?: string | null
          subkeywords_n8n_name?: string | null
          subkeywords_webhook?: string | null
        }
        Update: {
          auth_token_secret_name?: string | null
          blogs_n8n_name?: string | null
          blogs_webhook?: string | null
          created_at?: string
          id?: string
          name?: string
          seo_research_n8n_name?: string | null
          seo_research_webhook?: string | null
          subkeywords_n8n_name?: string | null
          subkeywords_webhook?: string | null
        }
        Relationships: []
      }
      email_signature_settings: {
        Row: {
          background_color: string
          background_type: string
          company_logo_url: string | null
          created_at: string
          email: string
          first_name: string
          gradient_end_color: string | null
          id: string
          job_title: string
          last_name: string
          location: string | null
          name: string
          phone_number: string | null
          profile_photo_url: string | null
          socials: Json | null
          text_color: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          background_color?: string
          background_type?: string
          company_logo_url?: string | null
          created_at?: string
          email: string
          first_name: string
          gradient_end_color?: string | null
          id?: string
          job_title: string
          last_name: string
          location?: string | null
          name?: string
          phone_number?: string | null
          profile_photo_url?: string | null
          socials?: Json | null
          text_color?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          background_color?: string
          background_type?: string
          company_logo_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          gradient_end_color?: string | null
          id?: string
          job_title?: string
          last_name?: string
          location?: string | null
          name?: string
          phone_number?: string | null
          profile_photo_url?: string | null
          socials?: Json | null
          text_color?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      log_settings: {
        Row: {
          alert_email: string | null
          created_at: string
          dashboard_badge_enabled: boolean
          email_alerts_enabled: boolean
          id: string
          log_level: Database["public"]["Enums"]["log_level"]
          retention_days: number
          slack_alerts_enabled: boolean
          slack_webhook_url: string | null
          updated_at: string
        }
        Insert: {
          alert_email?: string | null
          created_at?: string
          dashboard_badge_enabled?: boolean
          email_alerts_enabled?: boolean
          id?: string
          log_level?: Database["public"]["Enums"]["log_level"]
          retention_days?: number
          slack_alerts_enabled?: boolean
          slack_webhook_url?: string | null
          updated_at?: string
        }
        Update: {
          alert_email?: string | null
          created_at?: string
          dashboard_badge_enabled?: boolean
          email_alerts_enabled?: boolean
          id?: string
          log_level?: Database["public"]["Enums"]["log_level"]
          retention_days?: number
          slack_alerts_enabled?: boolean
          slack_webhook_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_schedules: {
        Row: {
          company_id: string
          created_at: string
          day_of_week: number
          enabled: boolean
          frequency: string
          id: string
          interval_unit: string
          interval_value: number
          last_triggered_at: string | null
          next_trigger_at: string | null
          time_of_day: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          day_of_week?: number
          enabled?: boolean
          frequency?: string
          id?: string
          interval_unit?: string
          interval_value?: number
          last_triggered_at?: string | null
          next_trigger_at?: string | null
          time_of_day?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          day_of_week?: number
          enabled?: boolean
          frequency?: string
          id?: string
          interval_unit?: string
          interval_value?: number
          last_triggered_at?: string | null
          next_trigger_at?: string | null
          time_of_day?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          bedrijfsomschrijving: string | null
          blog_onderwerp: string | null
          company_id: string
          created_at: string
          doelgroep_intentie: string | null
          extra_instructies: string | null
          hoofd_google_sheet_id: string | null
          hoofd_google_slides_id: string | null
          id: string
          nieuw_google_sheet_id: string | null
          nieuw_google_slides_id: string | null
          updated_at: string
        }
        Insert: {
          bedrijfsomschrijving?: string | null
          blog_onderwerp?: string | null
          company_id: string
          created_at?: string
          doelgroep_intentie?: string | null
          extra_instructies?: string | null
          hoofd_google_sheet_id?: string | null
          hoofd_google_slides_id?: string | null
          id?: string
          nieuw_google_sheet_id?: string | null
          nieuw_google_slides_id?: string | null
          updated_at?: string
        }
        Update: {
          bedrijfsomschrijving?: string | null
          blog_onderwerp?: string | null
          company_id?: string
          created_at?: string
          doelgroep_intentie?: string | null
          extra_instructies?: string | null
          hoofd_google_sheet_id?: string | null
          hoofd_google_slides_id?: string | null
          id?: string
          nieuw_google_sheet_id?: string | null
          nieuw_google_slides_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_automation_permissions: {
        Row: {
          automation_name: string
          can_execute: boolean
          can_manage: boolean
          can_view: boolean
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          automation_name: string
          can_execute?: boolean
          can_manage?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          automation_name?: string
          can_execute?: boolean
          can_manage?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard_settings: {
        Row: {
          created_at: string
          custom_labels: Json | null
          custom_tooltips: Json | null
          dashboard_colors: Json | null
          id: string
          impact_colors: Json | null
          theme: string
          tile_order: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_labels?: Json | null
          custom_tooltips?: Json | null
          dashboard_colors?: Json | null
          id?: string
          impact_colors?: Json | null
          theme?: string
          tile_order?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_labels?: Json | null
          custom_tooltips?: Json | null
          dashboard_colors?: Json | null
          id?: string
          impact_colors?: Json | null
          theme?: string
          tile_order?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          company_id: string
          id: string
          success: boolean
          triggered_at: string
          triggered_by: string | null
          workflow_type: string
        }
        Insert: {
          company_id: string
          id?: string
          success?: boolean
          triggered_at?: string
          triggered_by?: string | null
          workflow_type: string
        }
        Update: {
          company_id?: string
          id?: string
          success?: boolean
          triggered_at?: string
          triggered_by?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "viewer" | "operator"
      automation_status_type: "active" | "inactive" | "testmode"
      impact_level: "high" | "medium" | "low"
      log_level: "basic" | "verbose" | "errors_only"
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
      app_role: ["admin", "moderator", "user", "viewer", "operator"],
      automation_status_type: ["active", "inactive", "testmode"],
      impact_level: ["high", "medium", "low"],
      log_level: ["basic", "verbose", "errors_only"],
    },
  },
} as const
