export type Priority = "низький" | "середній" | "високий";

export type Category =
  | "оплата"
  | "доставка"
  | "скарга"
  | "технічне"
  | "акаунт"
  | "інше";

export type RequestAnalysis = {
  priority: Priority;
  category: Category;
  summary: string;
  draftReply: string;
};

export type SupportRequest = {
  id: string;
  customer_name: string;
  message: string;
  priority: Priority | null;
  category: Category | null;
  summary: string | null;
  draft_reply: string | null;
  created_at: string;
  analyzed_at: string | null;
};

export type RequestInsert = {
  id?: string;
  customer_name: string;
  message: string;
  priority?: Priority | null;
  category?: Category | null;
  summary?: string | null;
  draft_reply?: string | null;
  created_at?: string;
  analyzed_at?: string | null;
};

export type RequestUpdate = Partial<Omit<SupportRequest, "id">>;

export type Database = {
  public: {
    Tables: {
      requests: {
        Row: SupportRequest;
        Insert: RequestInsert;
        Update: RequestUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
