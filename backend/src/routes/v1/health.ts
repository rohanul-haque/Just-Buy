/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import express from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Express Router Initialization
 */
const router = express.Router();

/**
 * API Health Check
 * @access - public
 * @method - GET
 * @route - /api/v1/health
 */
router.get("/", (_, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    version: "1.0.0",
    message: "API is healthy",
    timeStamp: new Date().toLocaleTimeString(),
  });
});

export default router;
