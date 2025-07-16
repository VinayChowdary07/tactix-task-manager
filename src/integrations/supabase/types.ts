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
      goal_milestones: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          goal_id: string
          id: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_tasks: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          color: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          goal_type: string | null
          id: string
          notes: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          priority: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          priority?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          priority?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_time_logs: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          started_at: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          started_at: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          color: string | null
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_recurring_parent: boolean | null
          parent_recurring_task_id: string | null
          priority: string
          project_id: string | null
          recurring: boolean | null
          reminder_time: string | null
          repeat_interval: number | null
          repeat_type: string | null
          repeat_until: string | null
          start_date: string | null
          status: string
          subtasks: Json | null
          time_estimate: number | null
          time_spent: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring_parent?: boolean | null
          parent_recurring_task_id?: string | null
          priority?: string
          project_id?: string | null
          recurring?: boolean | null
          reminder_time?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
          repeat_until?: string | null
          start_date?: string | null
          status?: string
          subtasks?: Json | null
          time_estimate?: number | null
          time_spent?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring_parent?: boolean | null
          parent_recurring_task_id?: string | null
          priority?: string
          project_id?: string | null
          recurring?: boolean | null
          reminder_time?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
          repeat_until?: string | null
          start_date?: string | null
          status?: string
          subtasks?: Json | null
          time_estimate?: number | null
          time_spent?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_recurring_task_id_fkey"
            columns: ["parent_recurring_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          accent_color: string | null
          activity_status: boolean | null
          analytics_tracking: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          mobile_push_notifications: boolean | null
          profile_visibility: boolean | null
          project_milestones: boolean | null
          task_reminders: boolean | null
          task_sharing: boolean | null
          team_updates: boolean | null
          theme: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
          weekly_summary: boolean | null
        }
        Insert: {
          accent_color?: string | null
          activity_status?: boolean | null
          analytics_tracking?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          mobile_push_notifications?: boolean | null
          profile_visibility?: boolean | null
          project_milestones?: boolean | null
          task_reminders?: boolean | null
          task_sharing?: boolean | null
          team_updates?: boolean | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_summary?: boolean | null
        }
        Update: {
          accent_color?: string | null
          activity_status?: boolean | null
          analytics_tracking?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          mobile_push_notifications?: boolean | null
          profile_visibility?: boolean | null
          project_milestones?: boolean | null
          task_reminders?: boolean | null
          task_sharing?: boolean | null
          team_updates?: boolean | null
          theme?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_recurring_task_instance: {
        Args: { task_id: string }
        Returns: string
      }
      process_recurring_tasks: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          created_tasks: string[]
        }[]
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
