import { optionalAuthenticate } from "@/middlewares/auth.middleware";
import validateRequest from "@/middlewares/validateRequest";
import chatbotController from "@/modules/v1/chatbot/chatbot.controller";
import { sendChatMessageSchema } from "@/modules/v1/chatbot/chatbot.validation";
import express from "express";

const router = express.Router();

router.post(
  "/message",
  optionalAuthenticate,
  validateRequest(sendChatMessageSchema, "body"),
  chatbotController.sendMessage,
);

export default router;
