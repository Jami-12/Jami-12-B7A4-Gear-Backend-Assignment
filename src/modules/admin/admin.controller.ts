import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { adminService } from "./admin.service";

const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUser();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All users retrieved successfully",
      data: result,
    });
  },
);

const updatedUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const { activeStatus } = req.body;

    if (activeStatus !== "ACTIVE" && activeStatus !== "SUSPENDED") {
      throw new Error(
        "Invalid status. Status must be either 'ACTIVE' or 'SUSPENDED'.",
      );
    }

    const result = await adminService.updateUserStatus(id, activeStatus as any);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: result,
    });
  },
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await adminService.deleteUser(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully",
      data: result,
    });
  },
);

export const adminController = {
  getAllUser,
  updatedUserStatus,
  deleteUser,
};
