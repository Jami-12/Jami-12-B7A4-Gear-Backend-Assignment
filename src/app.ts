import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import config from "./config";

import { runningServer } from "./middleware/runningServer";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

import { authRouter } from "./modules/auth/auth.route";
import { gearRouter } from "./modules/gear/gear.route";
import { categoryRouter } from "./modules/category/category.route";
import { rentalRouter } from "./modules/rental/rental.route";
import { providerRouter } from "./modules/provider/provider.route";
import { adminRouter } from "./modules/admin/admin.route";
import { paymentRouter } from "./modules/payment/payment.route";
import { reviewRouter } from "./modules/review/review.route";

const app: Application = express();

// CORS
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// Stripe Webhook
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", runningServer);

app.use("/api/auth", authRouter);

app.use("/api/gear", gearRouter);

app.use("/api/categories", categoryRouter);

app.use("/api/rentals", rentalRouter);

app.use("/api/payments", paymentRouter);

app.use("/api/reviews", reviewRouter);

app.use("/api/provider", gearRouter);

app.use("/api/provider", providerRouter);

app.use("/api/admin", adminRouter);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
