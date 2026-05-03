export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          category: "orange" | "green" | "blue";
          image_url: string;
          coordinates: number[];
          capacity: number;
          registered: number;
          tags: string[];
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["events"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["events"]["Insert"]
        >;
      };
      registrations: {
        Row: {
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          student_id: string;
          event_id: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["registrations"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["registrations"]["Insert"]
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
