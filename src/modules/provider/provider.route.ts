import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { providerController } from "./provider.controller";

const router = Router();

// Provider Rental Orders
router.get(
  "/orders",
  auth(Role.PROVIDER),
  providerController.getProviderRentalOrders,
);

router.patch(
  "/orders/:id",
  auth(Role.PROVIDER),
  providerController.updateProviderRentalOrderStatus,
);

// export const providerRouter = router;