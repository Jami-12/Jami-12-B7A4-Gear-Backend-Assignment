import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const result = await paymentService.createCheckoutSession(
      customerId,
      {
        rentalOrderId: req.body.rentalOrderId,
      },
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment session created successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    await paymentService.handleWebhook(event, signature);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment verified successfully",
      data: null,
    });
  },
);

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
};