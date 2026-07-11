import { Request, Response } from "express";

export const runningServer = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Gear Up Backend API ",
    version: "0.0.1",
    status: "Running",
    timestamp: new Date().toISOString(),
  });
};
