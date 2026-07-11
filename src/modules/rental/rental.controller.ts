import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { rentalOrderServices } from "./rental.service";

const createRentalOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const payload = {
      ...req.body,
      customerId,
    };

    const result = await rentalOrderServices.createRentalOrder(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental order created successfully",
      data: result,
    });
  },
);

const getAllRentalOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const role = req.user?.role;

    const result = await rentalOrderServices.getAllRentalOrders({
      customerId,
      role,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message:
        role === Role.ADMIN
          ? "All rental orders retrieved successfully"
          : "My rental orders retrieved successfully",
      data: result,
    });
  },
);

const getRentalOrderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const { id: orderId } = req.params as { id: string };
    const result = await rentalOrderServices.getRentalOrderById(
      customerId,
      orderId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental order retrieved successfully",
      data: result,
    });
  },
);

export const rentalOrderController = {
  createRentalOrder,
  getAllRentalOrders,
  getRentalOrderById,
};
