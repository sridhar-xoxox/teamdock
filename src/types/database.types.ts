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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'admin' | 'manager' | 'member'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: 'admin' | 'manager' | 'member'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'member'
          invited_by?: string | null
          joined_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string | null
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          status: 'TODO' | 'IN_PROGRESS' | 'DONE'
          assigned_to: string | null
          created_by: string
          due_date: string | null
          attachments: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          attachments?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          description?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
          assigned_to?: string | null
          created_by?: string
          due_date?: string | null
          attachments?: string[] | null
          created_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          workspace_id: string
          email: string
          role: 'admin' | 'manager' | 'member'
          token: string
          expires_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          role: 'admin' | 'manager' | 'member'
          token: string
          expires_at: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          role?: 'admin' | 'manager' | 'member'
          token?: string
          expires_at?: string
        }
      }
    }
  }
}
