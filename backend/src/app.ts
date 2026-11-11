import config from "@/config";
import corsOptions from "@/lib/corsOptions";
import limiter from "@/lib/expressRateLimit";
import globalErrorHandler from "@/middlewares/globalErrorHandler";
import notFoundRoute from "@/middlewares/notFoundRoute";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { status } from "http-status";

import v1Routes from "@/routes/v1";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: config.NODE_ENV === "production",
  }),
);
app.use(cors(corsOptions));
app.use(
  compression({
    threshold: 1024,
  }),
);
// Stripe webhook requires raw body parsing for signature verification
app.use(
  "/api/v1/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
);

app.use(
  express.json({
    limit: "5mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  }),
);
app.use(cookieParser());
app.use(limiter);

app.get("/", (_, res) => {
  return res.status(status.OK).json({
    success: true,
    version: "1.0.0",
    message: "API is healthy",
    timeStamp: new Date().toLocaleTimeString(),
  });
});
app.use("/api/v1", v1Routes);

app.use(notFoundRoute);
app.use(globalErrorHandler);

export default app;
