import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { gearController } from "./gear.controller";

const router = Router();

// Provider Routes
router.post(
  "/",
  auth(Role.PROVIDER),
  gearController.createGear,
);

router.put(
  "/:id",
  auth(Role.PROVIDER),
  gearController.updateGear,
);

router.delete(
  "/:id",
  auth(Role.PROVIDER),
  gearController.deleteGear,
);

// Public Routes
router.get(
  "/",
  gearController.getAllGear,
);

router.get(
  "/:id",
  gearController.getGearById,
);

export const gearRouter = router;