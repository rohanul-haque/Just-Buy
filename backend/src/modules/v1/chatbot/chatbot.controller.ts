import chatbotService from "@/modules/v1/chatbot/chatbot.service";
import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const sendMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await chatbotService.sendMessage(req.body, {
      userId: req.user?.userId,
      role: req.user?.role,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Chatbot response generated successfully",
      data: result,
    });
  },
);

const chatbotController = {
  sendMessage,
};

export default chatbotController;
