export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      project_categories: {
        Relationships: [];
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_categories']['Insert']>;
      };
      projects: {
        Relationships: [];
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          description: string;
          case_study: string | null;
          image_url: string | null;
          video_url: string | null;
          technologies: string[];
          results: Json;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          description: string;
          case_study?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          technologies?: string[];
          results?: Json;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      inquiries: {
        Relationships: [];
        Row: {
          id: string;
          email: string;
          company_size: string | null;
          process: string | null;
          message: string | null;
          status: string;
          replied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          company_size?: string | null;
          process?: string | null;
          message?: string | null;
          status?: string;
          replied_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inquiries']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type Project = Database['public']['Tables']['projects']['Row'];
