import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/api-error";
import type {
  SendChatMessagePayload,
  SendChatMessageResponse,
} from "@/features/chatbot/types";

export const chatbotService = {
  async sendMessage(
    payload: SendChatMessagePayload,
  ): Promise<SendChatMessageResponse> {
    const response = await api.post<ApiResponse<SendChatMessageResponse>>(
      "/chatbot/message",
      payload,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to get AI response");
    }
    return response.data.data;
  },
};
