import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { rentalOrderController } from "./rental.controller";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  rentalOrderController.createRentalOrder,
);

router.get(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN),
  rentalOrderController.getAllRentalOrders,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER),
  rentalOrderController.getRentalOrderById,
);

// export const rentalRouter = router;