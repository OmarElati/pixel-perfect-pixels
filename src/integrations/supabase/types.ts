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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor: string | null
          client_id: string | null
          created_at: string
          detail: string | null
          firm_id: string
          id: string
          is_demo: boolean
        }
        Insert: {
          action: string
          actor?: string | null
          client_id?: string | null
          created_at?: string
          detail?: string | null
          firm_id: string
          id?: string
          is_demo?: boolean
        }
        Update: {
          action?: string
          actor?: string | null
          client_id?: string | null
          created_at?: string
          detail?: string | null
          firm_id?: string
          id?: string
          is_demo?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          assigned_to: string | null
          cnss_id: string | null
          created_at: string
          email: string | null
          firm_id: string
          id: string
          is_demo: boolean
          legal_form: string | null
          name: string
          notes: string | null
          phone: string | null
          sector: string | null
          status: Database["public"]["Enums"]["client_status"]
          tax_id: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          cnss_id?: string | null
          created_at?: string
          email?: string | null
          firm_id: string
          id?: string
          is_demo?: boolean
          legal_form?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          sector?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          tax_id?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          cnss_id?: string | null
          created_at?: string
          email?: string | null
          firm_id?: string
          id?: string
          is_demo?: boolean
          legal_form?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          sector?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          client_id: string | null
          created_at: string
          done: boolean
          due_date: string
          firm_id: string
          id: string
          is_demo: boolean
          kind: string | null
          title: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          done?: boolean
          due_date: string
          firm_id: string
          id?: string
          is_demo?: boolean
          kind?: string | null
          title: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          done?: boolean
          due_date?: string
          firm_id?: string
          id?: string
          is_demo?: boolean
          kind?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requests: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          due_date: string | null
          firm_id: string
          id: string
          is_demo: boolean
          label: string
          status: Database["public"]["Enums"]["doc_status"]
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          firm_id: string
          id?: string
          is_demo?: boolean
          label: string
          status?: Database["public"]["Enums"]["doc_status"]
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          firm_id?: string
          id?: string
          is_demo?: boolean
          label?: string
          status?: Database["public"]["Enums"]["doc_status"]
        }
        Relationships: [
          {
            foreignKeyName: "document_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          client_id: string | null
          created_at: string
          firm_id: string
          id: string
          is_demo: boolean
          month: number | null
          name: string
          status: Database["public"]["Enums"]["doc_status"]
          storage_path: string | null
          uploaded_by: string | null
          year: number | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          firm_id: string
          id?: string
          is_demo?: boolean
          month?: number | null
          name: string
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path?: string | null
          uploaded_by?: string | null
          year?: number | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          firm_id?: string
          id?: string
          is_demo?: boolean
          month?: number | null
          name?: string
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path?: string | null
          uploaded_by?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      firm_members: {
        Row: {
          created_at: string
          firm_id: string
          id: string
          role: Database["public"]["Enums"]["firm_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
          role?: Database["public"]["Enums"]["firm_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
          role?: Database["public"]["Enums"]["firm_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "firm_members_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          client_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          firm_id: string
          id: string
          is_demo: boolean
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Insert: {
          assignee?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          firm_id: string
          id?: string
          is_demo?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Update: {
          assignee?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          firm_id?: string
          id?: string
          is_demo?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_firm: { Args: { _name: string }; Returns: string }
      seed_demo_data: { Args: { _firm_id: string }; Returns: undefined }
    }
    Enums: {
      client_status: "ACTIF" | "INACTIF" | "ARCHIVE" | "PROSPECT"
      doc_status:
        | "DEMANDE"
        | "DEPOSE"
        | "EN_REVUE"
        | "VALIDE"
        | "REJETE"
        | "ARCHIVE"
      firm_role: "admin" | "comptable" | "assistant"
      task_priority: "BASSE" | "NORMALE" | "HAUTE" | "URGENTE"
      task_status: "A_FAIRE" | "EN_COURS" | "EN_VALIDATION" | "TERMINE"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      client_status: ["ACTIF", "INACTIF", "ARCHIVE", "PROSPECT"],
      doc_status: [
        "DEMANDE",
        "DEPOSE",
        "EN_REVUE",
        "VALIDE",
        "REJETE",
        "ARCHIVE",
      ],
      firm_role: ["admin", "comptable", "assistant"],
      task_priority: ["BASSE", "NORMALE", "HAUTE", "URGENTE"],
      task_status: ["A_FAIRE", "EN_COURS", "EN_VALIDATION", "TERMINE"],
    },
  },
} as const
