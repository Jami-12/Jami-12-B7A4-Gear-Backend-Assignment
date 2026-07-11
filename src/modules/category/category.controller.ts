import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { categoryService } from "./category.service";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await categoryService.createCategory(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Gear category created successfully",
      data: result,
    });
  },
);

const getCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear categories retrieved successfully",
      data: result,
    });
  },
);

export const categoryController = {
  createCategory,
  getCategories,
};