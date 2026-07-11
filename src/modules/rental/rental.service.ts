import { GearStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRentalOrder } from "./rental.interface";

const createRentalOrder = async (payload: IRentalOrder) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: payload.gearItemId,
    },
  });

  if (!gear) {
    throw new Error("Gear not found.");
  }

  if (gear.status !== GearStatus.AVAILABLE || gear.availableStock <= 0) {
    throw new Error("Gear is not available.");
  }

  const customer = await prisma.user.findUnique({
    where: {
      id: payload.customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  const timeDiff = endDate.getTime() - startDate.getTime();
  const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;

  const totalAmount = totalDays * gear.dailyRate;
  const rentalOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.create({
      data: {
        customerId: payload.customerId,
        gearItemId: payload.gearItemId,
        startDate: startDate,
        endDate: endDate,
        totalAmount: totalAmount,
      },
      include: {
        gearItem: true,
      },
    });

    await tx.gearItem.update({
      where: {
        id: payload.gearItemId,
      },
      data: {
        availableStock: {
          decrement: 1,
        },
      },
    });

    return order;
  });

  return rentalOrder;
};
const getAllRentalOrders = async (
  params: {
    customerId?: string;
    role?: Role;
  } = {},
) => {
  const where =
    params.role === Role.ADMIN
      ? {}
      : {
          customerId: params.customerId,
        };

  return await prisma.rentalOrder.findMany({
    where,
    include: {
      gearItem: true,
      customer: {
        omit: {
          password: true,
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getRentalOrderById = async (customerId: string, orderId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: {
      id: orderId,
    },
    include: {
      gearItem: true,
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Rental order not found.");
  }

  if (order.customerId !== customerId) {
    throw new Error("Unauthorized access.");
  }

  return order;
};

export const rentalOrderServices = {
  createRentalOrder,
  getAllRentalOrders,
  getRentalOrderById,
};
