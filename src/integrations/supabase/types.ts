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
  public: {
    Tables: {
      answers: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          interview_id: string
          question_id: string
          text: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          interview_id: string
          question_id: string
          text?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          interview_id?: string
          question_id?: string
          text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_reports: {
        Row: {
          created_at: string
          id: string
          interview_id: string
          report: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interview_id: string
          report: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interview_id?: string
          report?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_reports_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          company: string | null
          completed_at: string | null
          created_at: string
          id: string
          jd_id: string | null
          level: string
          overall_score: number | null
          resume_id: string | null
          role: string
          round: string
          status: string
          user_id: string
        }
        Insert: {
          company?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          jd_id?: string | null
          level: string
          overall_score?: number | null
          resume_id?: string | null
          role: string
          round: string
          status?: string
          user_id: string
        }
        Update: {
          company?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          jd_id?: string | null
          level?: string
          overall_score?: number | null
          resume_id?: string | null
          role?: string
          round?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_jd_id_fkey"
            columns: ["jd_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          company: string | null
          created_at: string
          id: string
          match_score: number | null
          missing_keywords: Json | null
          parsed: Json | null
          raw_text: string
          title: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          missing_keywords?: Json | null
          parsed?: Json | null
          raw_text: string
          title?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          missing_keywords?: Json | null
          parsed?: Json | null
          raw_text?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          experience_level: string | null
          full_name: string | null
          id: string
          target_role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          id: string
          target_role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          target_role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string | null
          created_at: string
          id: string
          idx: number
          interview_id: string
          question: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          idx: number
          interview_id: string
          question: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          idx?: number
          interview_id?: string
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_score: number | null
          created_at: string
          file_name: string
          file_path: string | null
          id: string
          parsed: Json | null
          raw_text: string | null
          strengths: Json | null
          suggestions: Json | null
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          file_name: string
          file_path?: string | null
          id?: string
          parsed?: Json | null
          raw_text?: string | null
          strengths?: Json | null
          suggestions?: Json | null
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          file_name?: string
          file_path?: string | null
          id?: string
          parsed?: Json | null
          raw_text?: string | null
          strengths?: Json | null
          suggestions?: Json | null
          user_id?: string
          weaknesses?: Json | null
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          id: string
          interview_id: string | null
          plan: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interview_id?: string | null
          plan: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interview_id?: string | null
          plan?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          answer_id: string
          clarity: number | null
          communication: number | null
          confidence: number | null
          created_at: string
          depth: number | null
          feedback: string | null
          id: string
          industry: number | null
          interview_id: string
          overall: number | null
          problem_solving: number | null
          relevance: number | null
          technical: number | null
          user_id: string
        }
        Insert: {
          answer_id: string
          clarity?: number | null
          communication?: number | null
          confidence?: number | null
          created_at?: string
          depth?: number | null
          feedback?: string | null
          id?: string
          industry?: number | null
          interview_id: string
          overall?: number | null
          problem_solving?: number | null
          relevance?: number | null
          technical?: number | null
          user_id: string
        }
        Update: {
          answer_id?: string
          clarity?: number | null
          communication?: number | null
          confidence?: number | null
          created_at?: string
          depth?: number | null
          feedback?: string | null
          id?: string
          industry?: number | null
          interview_id?: string
          overall?: number | null
          problem_solving?: number | null
          relevance?: number | null
          technical?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
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
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
