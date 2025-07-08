export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_keys: {
        Row: {
          created_at: string | null
          encryption_key: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          encryption_key: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          encryption_key?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      conversation_settings: {
        Row: {
          archived: boolean | null
          background_image: string | null
          created_at: string | null
          id: string
          muted: boolean | null
          nickname: string | null
          notifications_enabled: boolean | null
          other_user_id: string
          pinned: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          background_image?: string | null
          created_at?: string | null
          id?: string
          muted?: boolean | null
          nickname?: string | null
          notifications_enabled?: boolean | null
          other_user_id: string
          pinned?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          background_image?: string | null
          created_at?: string | null
          id?: string
          muted?: boolean | null
          nickname?: string | null
          notifications_enabled?: boolean | null
          other_user_id?: string
          pinned?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          active: boolean
          amount: number
          category: string | null
          created_at: string
          current_amount: number | null
          description: string | null
          end_date: string | null
          goal_icon: string | null
          goal_type: string
          id: string
          monthly_contribution: number | null
          period: string
          start_date: string
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          category?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          goal_icon?: string | null
          goal_type: string
          id?: string
          monthly_contribution?: number | null
          period?: string
          start_date?: string
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          category?: string | null
          created_at?: string
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          goal_icon?: string | null
          goal_type?: string
          id?: string
          monthly_contribution?: number | null
          period?: string
          start_date?: string
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
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
      message_link_previews: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          message_id: string
          site_name: string | null
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          message_id: string
          site_name?: string | null
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          message_id?: string
          site_name?: string | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_link_previews_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by_recipient: boolean | null
          delivered_at: string | null
          duration: number | null
          edit_history: Json | null
          edited_at: string | null
          encrypted_content: string | null
          encryption_key_id: string | null
          file_name: string | null
          file_size: number | null
          id: string
          is_pinned: boolean | null
          is_soft_deleted: boolean | null
          message_status: string | null
          mime_type: string | null
          read: boolean
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by_recipient?: boolean | null
          delivered_at?: string | null
          duration?: number | null
          edit_history?: Json | null
          edited_at?: string | null
          encrypted_content?: string | null
          encryption_key_id?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_pinned?: boolean | null
          is_soft_deleted?: boolean | null
          message_status?: string | null
          mime_type?: string | null
          read?: boolean
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by_recipient?: boolean | null
          delivered_at?: string | null
          duration?: number | null
          edit_history?: Json | null
          edited_at?: string | null
          encrypted_content?: string | null
          encryption_key_id?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_pinned?: boolean | null
          is_soft_deleted?: boolean | null
          message_status?: string | null
          mime_type?: string | null
          read?: boolean
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
      pinned_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message_id: string
          pinned_by: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message_id: string
          pinned_by: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_id?: string
          pinned_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
      typing_status: {
        Row: {
          conversation_with_user_id: string
          created_at: string
          id: string
          is_typing: boolean
          last_typed: string
          user_id: string
        }
        Insert: {
          conversation_with_user_id: string
          created_at?: string
          id?: string
          is_typing?: boolean
          last_typed?: string
          user_id: string
        }
        Update: {
          conversation_with_user_id?: string
          created_at?: string
          id?: string
          is_typing?: boolean
          last_typed?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string
          current_conversation: string | null
          id: string
          last_seen: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_conversation?: string | null
          id?: string
          last_seen?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_conversation?: string | null
          id?: string
          last_seen?: string
          status?: string
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
      accept_friend_request: {
        Args: { p_request_id: string }
        Returns: Json
      }
      are_friends: {
        Args: { p_user1_id: string; p_user2_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_attempt_type: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_conversation: {
        Args: { p_user_id: string; p_other_user_id: string }
        Returns: undefined
      }
      edit_message: {
        Args: { p_message_id: string; p_user_id: string; p_new_content: string }
        Returns: undefined
      }
      extract_message_links: {
        Args: { p_message_id: string; p_content: string }
        Returns: undefined
      }
      get_chat_users: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          username: string
          avatar_url: string
          last_message: string
          last_message_at: string
          unread_count: number
          is_online: boolean
        }[]
      }
      get_conversation_settings: {
        Args: { p_user_id: string; p_other_user_id: string }
        Returns: Json
      }
      get_or_create_conversation_key: {
        Args: { p_other_user_id: string }
        Returns: string
      }
      get_reaction_counts_by_post: {
        Args: { post_id: string }
        Returns: {
          type: string
          count: number
        }[]
      }
      get_total_reactions_count: {
        Args: Record<PropertyKey, never> | { post_id: string }
        Returns: number
      }
      get_user_reaction: {
        Args: { post_id: string; user_id: string }
        Returns: Json
      }
      manage_user_sessions: {
        Args: {
          p_user_id: string
          p_session_token: string
          p_device_info?: string
          p_ip_address?: unknown
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
      reject_friend_request: {
        Args: { p_request_id: string }
        Returns: Json
      }
      remove_friendship: {
        Args: { p_friend_id: string }
        Returns: Json
      }
      send_friend_request: {
        Args: { p_receiver_id: string }
        Returns: Json
      }
      soft_delete_message: {
        Args: { p_message_id: string; p_user_id: string }
        Returns: undefined
      }
      toggle_message_reaction: {
        Args: {
          p_message_id: string
          p_user_id: string
          p_reaction_type: string
        }
        Returns: Json
      }
      toggle_reaction: {
        Args: { p_post_id: string; p_user_id: string; p_reaction_type: string }
        Returns: Json
      }
      update_conversation_settings: {
        Args: { p_user_id: string; p_other_user_id: string; p_settings: Json }
        Returns: undefined
      }
      update_typing_status: {
        Args: {
          p_user_id: string
          p_conversation_with_user_id: string
          p_is_typing: boolean
        }
        Returns: undefined
      }
      update_user_presence: {
        Args: {
          p_user_id: string
          p_status: string
          p_conversation_id?: string
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
