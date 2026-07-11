import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { gearServices } from "./gear.service";
import { IGearQuery, IUpdateGearInput } from "./gear.interface";

const createGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const payload = req.body;

    const result = await gearServices.createGearIntoDB(
      providerId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Gear added successfully",
      data: result,
    });
  },
);

const getAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    const result = await gearServices.getAllGear(
      query as IGearQuery,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All gear retrieved successfully",
      data: result,
    });
  },
);

const updateGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const gearId = req.params.id as string;

    const payload = req.body as IUpdateGearInput;

    const result = await gearServices.updateGearIntoDB(
      providerId,
      gearId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear updated successfully",
      data: result,
    });
  },
);

const deleteGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const gearId = req.params.id as string;

    await gearServices.deleteGear(
      providerId,
      gearId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear deleted successfully",
      data: null,
    });
  },
);

const getGearById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.id as string;

    const result = await gearServices.getGearById(gearId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear retrieved successfully",
      data: result,
    });
  },
);

export const gearController = {
  createGear,
  getAllGear,
  updateGear,
  deleteGear,
  getGearById,
};