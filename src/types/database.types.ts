export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          created_at: string
          updated_at: string
          points: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          created_at?: string
          updated_at?: string
          points?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
          points?: number
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          achieved_at: string
          points_at_achievement: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          achieved_at?: string
          points_at_achievement: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          achieved_at?: string
          points_at_achievement?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 