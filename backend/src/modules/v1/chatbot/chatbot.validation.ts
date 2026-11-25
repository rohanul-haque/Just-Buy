import { z } from "zod";

export const sendChatMessageSchema = z
  .object({
    message: z
      .string({ message: "Message is required" })
      .trim()
      .min(1, { message: "Message cannot be empty" })
      .max(2000, { message: "Message cannot exceed 2000 characters" }),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(4000),
        }),
      )
      .max(20)
      .optional(),
  })
  .strict();

export type TSendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
