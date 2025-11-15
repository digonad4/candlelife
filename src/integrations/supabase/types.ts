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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          last_activity: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          active: boolean
          alert_enabled: boolean | null
          alert_threshold: number | null
          alert_triggered: boolean | null
          category: string | null
          chart_line_color: string | null
          chart_line_type: string | null
          created_at: string
          current_amount: number | null
          description: string | null
          display_on_chart: boolean | null
          goal_type: string
          id: string
          is_recurring: boolean | null
          monthly_contribution: number | null
          period_type: string | null
          priority_level: number | null
          start_date: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          alert_enabled?: boolean | null
          alert_threshold?: number | null
          alert_triggered?: boolean | null
          category?: string | null
          chart_line_color?: string | null
          chart_line_type?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          display_on_chart?: boolean | null
          goal_type: string
          id?: string
          is_recurring?: boolean | null
          monthly_contribution?: number | null
          period_type?: string | null
          priority_level?: number | null
          start_date?: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          alert_enabled?: boolean | null
          alert_threshold?: number | null
          alert_triggered?: boolean | null
          category?: string | null
          chart_line_color?: string | null
          chart_line_type?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          display_on_chart?: boolean | null
          goal_type?: string
          id?: string
          is_recurring?: boolean | null
          monthly_contribution?: number | null
          period_type?: string | null
          priority_level?: number | null
          start_date?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          description: string | null
          goal_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          contribution_date?: string
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          delivery_status: string
          error_message: string | null
          id: string
          sent_at: string
          subscription_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          delivery_status?: string
          error_message?: string | null
          id?: string
          sent_at?: string
          subscription_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          delivery_status?: string
          error_message?: string | null
          id?: string
          sent_at?: string
          subscription_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          do_not_disturb: boolean | null
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          read_receipts: boolean | null
          show_online_status: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          do_not_disturb?: boolean | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          read_receipts?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          do_not_disturb?: boolean | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          read_receipts?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ohlc_data: {
        Row: {
          accumulated_balance: number
          close: number
          created_at: string
          date: string
          high: number
          id: string
          low: number
          open: number
          transaction_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accumulated_balance: number
          close: number
          created_at?: string
          date: string
          high: number
          id?: string
          low: number
          open: number
          transaction_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accumulated_balance?: number
          close?: number
          created_at?: string
          date?: string
          high?: number
          id?: string
          low?: number
          open?: number
          transaction_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_theme: string | null
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string
          view_mode: string | null
        }
        Insert: {
          active_theme?: string | null
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username: string
          view_mode?: string | null
        }
        Update: {
          active_theme?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
          view_mode?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          platform?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          attempt_type: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
        }
        Insert: {
          attempt_type: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
        }
        Update: {
          attempt_type?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
        }
        Relationships: []
      }
      smart_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          expires_at: string | null
          goal_id: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          expires_at?: string | null
          goal_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          expires_at?: string | null
          goal_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_alerts_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          date: string
          description: string
          goal_id: string | null
          id: string
          payment_method: string
          payment_status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          date?: string
          description: string
          goal_id?: string | null
          id?: string
          payment_method?: string
          payment_status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          goal_id?: string | null
          id?: string
          payment_method?: string
          payment_status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_auth: {
        Row: {
          created_at: string
          enabled: boolean
          secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string
          id: string
          last_active: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info: string
          id?: string
          last_active?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string
          id?: string
          last_active?: string
          user_id?: string
        }
        Relationships: []
      }
      user_themes: {
        Row: {
          background_color: string
          created_at: string
          id: string
          primary_color: string
          secondary_color: string
          text_color: string
          theme_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_color?: string
          created_at?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          theme_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_color?: string
          created_at?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          theme_name?: string
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
      accept_friend_request: { Args: { p_request_id: string }; Returns: Json }
      analyze_spending_patterns: {
        Args: { p_days?: number; p_user_id: string }
        Returns: Json
      }
      are_friends: {
        Args: { p_user1_id: string; p_user2_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_attempt_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      clear_conversation: {
        Args: { p_other_user_id: string; p_user_id: string }
        Returns: undefined
      }
      edit_message: {
        Args: { p_message_id: string; p_new_content: string; p_user_id: string }
        Returns: undefined
      }
      extract_message_links: {
        Args: { p_content: string; p_message_id: string }
        Returns: undefined
      }
      get_chat_users: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          id: string
          is_online: boolean
          last_message: string
          last_message_at: string
          unread_count: number
          username: string
        }[]
      }
      get_conversation_settings: {
        Args: { p_other_user_id: string; p_user_id: string }
        Returns: Json
      }
      get_or_create_conversation_key: {
        Args: { p_other_user_id: string }
        Returns: string
      }
      get_reaction_counts_by_post: {
        Args: { post_id: string }
        Returns: {
          count: number
          type: string
        }[]
      }
      get_total_reactions_count:
        | { Args: { post_id: string }; Returns: Json }
        | { Args: never; Returns: number }
      get_user_groups: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          description: string
          id: string
          last_message: string
          last_message_at: string
          member_count: number
          name: string
          unread_count: number
        }[]
      }
      get_user_reaction: {
        Args: { post_id: string; user_id: string }
        Returns: Json
      }
      log_push_notification: {
        Args: {
          p_body: string
          p_data?: Json
          p_subscription_id: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      manage_user_sessions: {
        Args: {
          p_device_info?: string
          p_ip_address?: unknown
          p_session_token: string
          p_user_id: string
        }
        Returns: undefined
      }
      mark_conversation_as_read: {
        Args: { p_recipient_id: string; p_sender_id: string }
        Returns: undefined
      }
      mark_conversation_as_read_v2: {
        Args: { p_recipient_id: string; p_sender_id: string }
        Returns: undefined
      }
      mark_message_as_read: {
        Args: { p_message_id: string; p_user_id: string }
        Returns: undefined
      }
      mark_message_as_read_v2: {
        Args: { p_message_id: string; p_user_id: string }
        Returns: undefined
      }
      recalculate_ohlc_cascade: {
        Args: { p_from_date: string; p_user_id: string }
        Returns: undefined
      }
      recalculate_ohlc_for_date: {
        Args: { p_date: string; p_user_id: string }
        Returns: undefined
      }
      reject_friend_request: { Args: { p_request_id: string }; Returns: Json }
      remove_friendship: { Args: { p_friend_id: string }; Returns: Json }
      search_users: {
        Args: { search_term: string }
        Returns: {
          avatar_url: string
          id: string
          is_friend: boolean
          username: string
        }[]
      }
      send_friend_request: { Args: { p_receiver_id: string }; Returns: Json }
      soft_delete_message: {
        Args: { p_message_id: string; p_user_id: string }
        Returns: undefined
      }
      toggle_message_reaction: {
        Args: {
          p_message_id: string
          p_reaction_type: string
          p_user_id: string
        }
        Returns: Json
      }
      toggle_reaction: {
        Args: { p_post_id: string; p_reaction_type: string; p_user_id: string }
        Returns: Json
      }
      update_conversation_settings: {
        Args: { p_other_user_id: string; p_settings: Json; p_user_id: string }
        Returns: undefined
      }
      update_typing_status: {
        Args: {
          p_conversation_with_user_id: string
          p_is_typing: boolean
          p_user_id: string
        }
        Returns: undefined
      }
      update_user_presence: {
        Args: {
          p_conversation_id?: string
          p_status: string
          p_user_id: string
        }
        Returns: undefined
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
    Enums: {},
  },
} as const
