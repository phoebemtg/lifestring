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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cache: {
        Row: {
          expiration: number
          key: string
          value: string
        }
        Insert: {
          expiration: number
          key: string
          value: string
        }
        Update: {
          expiration?: number
          key?: string
          value?: string
        }
        Relationships: []
      }
      cache_locks: {
        Row: {
          expiration: number
          key: string
          owner: string
        }
        Insert: {
          expiration: number
          key: string
          owner: string
        }
        Update: {
          expiration?: number
          key?: string
          owner?: string
        }
        Relationships: []
      }
      club_join_requests: {
        Row: {
          club_id: string
          created_at: string
          house_id: number
          id: string
          requested_at: string
          responded_at: string | null
          responded_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          house_id: number
          id?: string
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          house_id?: number
          id?: string
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_join_requests_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "house_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      detailed_profiles: {
        Row: {
          age: string | null
          ambitions: string | null
          bio: string | null
          birthday: string | null
          created_at: string
          dreams: string | null
          education: string | null
          email: string | null
          goals: string | null
          hobbies: string[] | null
          id: string
          instagram: string | null
          interests: string[] | null
          linkedin: string | null
          location: string | null
          looking_for: string | null
          passions: string[] | null
          phone: string | null
          profile_photo: string | null
          questions: string[] | null
          relationship_status: string | null
          skills: string[] | null
          twitter: string | null
          updated_at: string
          user_id: string
          vector: string | null
          website: string | null
          work: string | null
        }
        Insert: {
          age?: string | null
          ambitions?: string | null
          bio?: string | null
          birthday?: string | null
          created_at?: string
          dreams?: string | null
          education?: string | null
          email?: string | null
          goals?: string | null
          hobbies?: string[] | null
          id?: string
          instagram?: string | null
          interests?: string[] | null
          linkedin?: string | null
          location?: string | null
          looking_for?: string | null
          passions?: string | null
          phone?: string | null
          profile_photo?: string | null
          questions?: string[] | null
          relationship_status?: string | null
          skills?: string[] | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          vector?: string | null
          website?: string | null
          work?: string | null
        }
        Update: {
          age?: string | null
          ambitions?: string | null
          bio?: string | null
          birthday?: string | null
          created_at?: string
          dreams?: string | null
          education?: string | null
          email?: string | null
          goals?: string | null
          hobbies?: string[] | null
          id?: string
          instagram?: string | null
          interests?: string[] | null
          linkedin?: string | null
          location?: string | null
          looking_for?: string | null
          passions?: string[] | null
          phone?: string | null
          profile_photo?: string | null
          questions?: string[] | null
          relationship_status?: string | null
          skills?: string[] | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          vector?: string | null
          website?: string | null
          work?: string | null
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          rsvp_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          rsvp_status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          rsvp_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "house_events"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_jobs: {
        Row: {
          connection: string
          exception: string
          failed_at: string
          id: number
          payload: string
          queue: string
          uuid: string
        }
        Insert: {
          connection: string
          exception: string
          failed_at?: string
          id?: number
          payload: string
          queue: string
          uuid: string
        }
        Update: {
          connection?: string
          exception?: string
          failed_at?: string
          id?: number
          payload?: string
          queue?: string
          uuid?: string
        }
        Relationships: []
      }
      house_announcements: {
        Row: {
          announcement_type: string | null
          content: string
          created_at: string
          created_by: string
          house_id: number
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          announcement_type?: string | null
          content: string
          created_at?: string
          created_by: string
          house_id: number
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          announcement_type?: string | null
          content?: string
          created_at?: string
          created_by?: string
          house_id?: number
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      house_clubs: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          current_members: number | null
          description: string | null
          house_id: number
          id: string
          location: string | null
          max_members: number | null
          meeting_time: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          current_members?: number | null
          description?: string | null
          house_id: number
          id?: string
          location?: string | null
          max_members?: number | null
          meeting_time?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          current_members?: number | null
          description?: string | null
          house_id?: number
          id?: string
          location?: string | null
          max_members?: number | null
          meeting_time?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      house_competitions: {
        Row: {
          competition_date: string | null
          competition_time: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
        }
        Insert: {
          competition_date?: string | null
          competition_time?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          competition_date?: string | null
          competition_time?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      house_events: {
        Row: {
          created_at: string | null
          house_id: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          house_id?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          house_id?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_events_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      house_heads: {
        Row: {
          house_id: number
          id: number
          user_id: string
        }
        Insert: {
          house_id: number
          id?: number
          user_id: string
        }
        Update: {
          house_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_heads_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      house_member_communications: {
        Row: {
          communication_type: string | null
          created_at: string
          house_id: number
          id: string
          is_broadcast: boolean | null
          message: string
          recipient_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          communication_type?: string | null
          created_at?: string
          house_id: number
          id?: string
          is_broadcast?: boolean | null
          message: string
          recipient_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          communication_type?: string | null
          created_at?: string
          house_id?: number
          id?: string
          is_broadcast?: boolean | null
          message?: string
          recipient_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
      house_points_transactions: {
        Row: {
          admin_id: string
          created_at: string
          house_id: number
          id: string
          points_change: number
          reason: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          house_id: number
          id?: string
          points_change: number
          reason?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          house_id?: number
          id?: string
          points_change?: number
          reason?: string | null
        }
        Relationships: []
      }
      houses: {
        Row: {
          created_at: string | null
          id: number
          name: string
          points: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          points?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      job_batches: {
        Row: {
          cancelled_at: number | null
          created_at: number
          failed_job_ids: string
          failed_jobs: number
          finished_at: number | null
          id: string
          name: string
          options: string | null
          pending_jobs: number
          total_jobs: number
        }
        Insert: {
          cancelled_at?: number | null
          created_at: number
          failed_job_ids: string
          failed_jobs: number
          finished_at?: number | null
          id: string
          name: string
          options?: string | null
          pending_jobs: number
          total_jobs: number
        }
        Update: {
          cancelled_at?: number | null
          created_at?: number
          failed_job_ids?: string
          failed_jobs?: number
          finished_at?: number | null
          id?: string
          name?: string
          options?: string | null
          pending_jobs?: number
          total_jobs?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number
          available_at: number
          created_at: number
          id: number
          payload: string
          queue: string
          reserved_at: number | null
        }
        Insert: {
          attempts: number
          available_at: number
          created_at: number
          id?: number
          payload: string
          queue: string
          reserved_at?: number | null
        }
        Update: {
          attempts?: number
          available_at?: number
          created_at?: number
          id?: number
          payload?: string
          queue?: string
          reserved_at?: number | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          batch: number
          id: number
          migration: string
        }
        Insert: {
          batch: number
          id?: number
          migration: string
        }
        Update: {
          batch?: number
          id?: number
          migration?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          customization_details: Json | null
          id: string
          order_id: string
          printify_print_provider_id: string | null
          printify_variant_id: string | null
          product_id: string
          quantity: number
          size: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          customization_details?: Json | null
          id?: string
          order_id: string
          printify_print_provider_id?: string | null
          printify_variant_id?: string | null
          product_id: string
          quantity?: number
          size?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          color?: string | null
          created_at?: string
          customization_details?: Json | null
          id?: string
          order_id?: string
          printify_print_provider_id?: string | null
          printify_variant_id?: string | null
          product_id?: string
          quantity?: number
          size?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string | null
          customer_email: string
          customer_name: string
          house_id: number
          id: string
          printify_order_id: string | null
          shipping_address: Json
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email: string
          customer_name: string
          house_id: number
          id?: string
          printify_order_id?: string | null
          shipping_address: Json
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email?: string
          customer_name?: string
          house_id?: number
          id?: string
          printify_order_id?: string | null
          shipping_address?: Json
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          email: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          token?: string
        }
        Relationships: []
      }
      post_embeds: {
        Row: {
          created_at: string | null
          data: Json | null
          embed: string | null
          id: number
          metadata: Json | null
          post_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          embed?: string | null
          id?: number
          metadata?: Json | null
          post_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          embed?: string | null
          id?: number
          metadata?: Json | null
          post_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_embeds_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tag: {
        Row: {
          created_at: string | null
          id: number
          post_id: number
          tag_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          post_id: number
          tag_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          post_id?: number
          tag_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_tag_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          created_at: string | null
          data: Json | null
          deleted_at: string | null
          id: number
          is_featured: boolean | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          id?: number
          is_featured?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          id?: number
          is_featured?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number
          colors: Json | null
          created_at: string
          created_by: string
          description: string | null
          house_id: number
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          printify_product_id: string | null
          printify_variant_id: string | null
          product_type: string
          sizes: Json | null
          updated_at: string
        }
        Insert: {
          base_price: number
          colors?: Json | null
          created_at?: string
          created_by: string
          description?: string | null
          house_id: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          printify_product_id?: string | null
          printify_variant_id?: string | null
          product_type: string
          sizes?: Json | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          colors?: Json | null
          created_at?: string
          created_by?: string
          description?: string | null
          house_id?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          printify_product_id?: string | null
          printify_variant_id?: string | null
          product_type?: string
          sizes?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          ip_address: string | null
          last_activity: number
          payload: string
          user_agent: string | null
          user_id: number | null
        }
        Insert: {
          id: string
          ip_address?: string | null
          last_activity: number
          payload: string
          user_agent?: string | null
          user_id?: number | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          last_activity?: number
          payload?: string
          user_agent?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: number
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_embeddings: {
        Row: {
          created_at: string
          embed: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          embed?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          embed?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          background_color: string | null
          created_at: string | null
          enneagram_type: number | null
          full_name: string | null
          house_id: number | null
          id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          background_color?: string | null
          created_at?: string | null
          enneagram_type?: number | null
          full_name?: string | null
          house_id?: number | null
          id: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          background_color?: string | null
          created_at?: string | null
          enneagram_type?: number | null
          full_name?: string | null
          house_id?: number | null
          id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: string
          user_id: string
        }
        Insert: {
          id?: number
          role: string
          user_id: string
        }
        Update: {
          id?: number
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      make_user_admin: {
        Args: { user_email: string }
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
