export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          plant_id: string;
          severity: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          plant_id: string;
          severity?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          plant_id?: string;
          severity?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          context_mode: string | null;
          created_at: string;
          id: string;
          image_path: string | null;
          role: string;
          thread_id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          context_mode?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          role: string;
          thread_id: string;
          user_id?: string;
        };
        Update: {
          content?: string;
          context_mode?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          role?: string;
          thread_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "chat_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_threads: {
        Row: {
          created_at: string;
          id: string;
          plant_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          plant_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          plant_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_threads_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      device_actions: {
        Row: {
          action_type: string;
          created_at: string;
          id: string;
          params: Json;
          plant_id: string;
          reason: string | null;
          resolved_at: string | null;
          result_note: string | null;
          status: string;
          thread_id: string | null;
          user_id: string;
          validation_note: string | null;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          id?: string;
          params?: Json;
          plant_id: string;
          reason?: string | null;
          resolved_at?: string | null;
          result_note?: string | null;
          status?: string;
          thread_id?: string | null;
          user_id?: string;
          validation_note?: string | null;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          id?: string;
          params?: Json;
          plant_id?: string;
          reason?: string | null;
          resolved_at?: string | null;
          result_note?: string | null;
          status?: string;
          thread_id?: string | null;
          user_id?: string;
          validation_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "device_actions_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "device_actions_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "chat_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      devices: {
        Row: {
          connection: string;
          created_at: string;
          id: string;
          last_seen_at: string;
          name: string;
          plant_id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          connection?: string;
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          name?: string;
          plant_id: string;
          status?: string;
          user_id?: string;
        };
        Update: {
          connection?: string;
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          name?: string;
          plant_id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "devices_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: true;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      health_assessments: {
        Row: {
          created_at: string;
          id: string;
          plant_id: string;
          status: string;
          summary: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          plant_id: string;
          status?: string;
          summary: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          plant_id?: string;
          status?: string;
          summary?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_assessments_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      plants: {
        Row: {
          auto_watering: boolean;
          created_at: string;
          humidity_max: number;
          humidity_min: number;
          id: string;
          last_watered_at: string | null;
          light_max: number;
          light_min: number;
          location: string | null;
          moisture_max: number;
          moisture_min: number;
          name: string;
          photo_path: string | null;
          reminder_every_days: number;
          species: string;
          temp_max: number;
          temp_min: number;
          user_id: string;
          watering_paused_until: string | null;
          watering_threshold: number;
        };
        Insert: {
          auto_watering?: boolean;
          created_at?: string;
          humidity_max?: number;
          humidity_min?: number;
          id?: string;
          last_watered_at?: string | null;
          light_max?: number;
          light_min?: number;
          location?: string | null;
          moisture_max?: number;
          moisture_min?: number;
          name: string;
          photo_path?: string | null;
          reminder_every_days?: number;
          species?: string;
          temp_max?: number;
          temp_min?: number;
          user_id?: string;
          watering_paused_until?: string | null;
          watering_threshold?: number;
        };
        Update: {
          auto_watering?: boolean;
          created_at?: string;
          humidity_max?: number;
          humidity_min?: number;
          id?: string;
          last_watered_at?: string | null;
          light_max?: number;
          light_min?: number;
          location?: string | null;
          moisture_max?: number;
          moisture_min?: number;
          name?: string;
          photo_path?: string | null;
          reminder_every_days?: number;
          species?: string;
          temp_max?: number;
          temp_min?: number;
          user_id?: string;
          watering_paused_until?: string | null;
          watering_threshold?: number;
        };
        Relationships: [];
      };
      sensor_readings: {
        Row: {
          device_id: string;
          humidity: number | null;
          id: number;
          light: number | null;
          plant_id: string;
          recorded_at: string;
          soil_moisture: number | null;
          tank_level: number | null;
          temperature: number | null;
          user_id: string;
        };
        Insert: {
          device_id: string;
          humidity?: number | null;
          id?: never;
          light?: number | null;
          plant_id: string;
          recorded_at?: string;
          soil_moisture?: number | null;
          tank_level?: number | null;
          temperature?: number | null;
          user_id?: string;
        };
        Update: {
          device_id?: string;
          humidity?: number | null;
          id?: never;
          light?: number | null;
          plant_id?: string;
          recorded_at?: string;
          soil_moisture?: number | null;
          tank_level?: number | null;
          temperature?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sensor_readings_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sensor_readings_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
      watering_events: {
        Row: {
          amount_ml: number;
          id: string;
          occurred_at: string;
          plant_id: string;
          source: string;
          user_id: string;
        };
        Insert: {
          amount_ml?: number;
          id?: string;
          occurred_at?: string;
          plant_id: string;
          source?: string;
          user_id?: string;
        };
        Update: {
          amount_ml?: number;
          id?: string;
          occurred_at?: string;
          plant_id?: string;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watering_events_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "plants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      simulate_device_history: {
        Args: { _device: string; _scenario?: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
