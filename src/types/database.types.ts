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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          workspace_id: string
          project_id: string | null
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
          project_id?: string | null
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
          project_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          workspace_id: string
          email: string
          role: 'admin' | 'manager' | 'member'
          token: string
          invited_by: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          role: 'admin' | 'manager' | 'member'
          token?: string
          invited_by?: string | null
          expires_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          role?: 'admin' | 'manager' | 'member'
          token?: string
          invited_by?: string | null
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          workspace_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_workspace_with_member: {
        Args: {
          p_name: string
          p_owner_id: string
        }
        Returns: Json
      }
      remove_workspace_member: {
        Args: {
          p_workspace_id: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
  }
}
