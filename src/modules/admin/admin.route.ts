import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

import { adminController } from "./admin.controller";
import { rentalOrderController } from "../rental/rental.controller";
import { gearController } from "../gear/gear.controller";

const router = Router();

// Admin Dashboard
router.get("/users", auth(Role.ADMIN), adminController.getAllUser);

// Manage Gear
router.get(
  "/gear",
  auth(Role.ADMIN),
  gearController.getAllGear,
);

// Manage Rental Orders
router.get(
  "/rentals",
  auth(Role.ADMIN),
  rentalOrderController.getAllRentalOrders,
);

// Manage Users
router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  adminController.updatedUserStatus,
);

router.delete(
  "/users/:id",
  auth(Role.ADMIN),
  adminController.deleteUser,
);

export const adminRouter = router;