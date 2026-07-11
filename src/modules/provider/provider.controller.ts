import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { RentalStatus } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { providerServices } from "./provider.service";

const getProviderRentalOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;

    const result =
      await providerServices.getProviderRentalOrders(providerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider rental orders fetched successfully",
      data: result,
    });
  },
);

const updateProviderRentalOrderStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const orderId = req.params.id as string;
    const { rentalStatus } = req.body;

    if (!providerId || !orderId) {
      throw new Error("Provider ID and Order ID are required.");
    }

    if (
      rentalStatus !== RentalStatus.CONFIRMED &&
      rentalStatus !== RentalStatus.PICKED_UP &&
      rentalStatus !== RentalStatus.RETURNED
    ) {
      throw new Error(
        "Status must be CONFIRMED, PICKED_UP or RETURNED.",
      );
    }

    const result =
      await providerServices.updateProviderRentalOrderStatus(
        orderId,
        providerId,
        rentalStatus,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order status updated successfully",
      data: result,
    });
  },
);

export const providerController = {
  getProviderRentalOrders,
  updateProviderRentalOrderStatus,
};