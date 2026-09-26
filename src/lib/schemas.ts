import { z } from "zod";

export const CreateRequestSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(4000),
});

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;

export const AnalysisSchema = z.object({
  priority: z.enum(["низький", "середній", "високий"]),
  category: z.enum([
    "оплата",
    "доставка",
    "скарга",
    "технічне",
    "акаунт",
    "інше",
  ]),
  summary: z.string().trim().min(1).max(300),
  draftReply: z.string().trim().min(1).max(1500),
}).strict();

export type Analysis = z.infer<typeof AnalysisSchema>;
