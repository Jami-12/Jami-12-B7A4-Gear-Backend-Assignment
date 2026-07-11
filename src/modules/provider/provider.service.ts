import { prisma } from "../../lib/prisma";
import {
  GearStatus,
  RentalStatus,
} from "../../../generated/prisma/enums";

const getProviderRentalOrders = async (providerId: string) => {
  const orders = await prisma.rentalOrder.findMany({
    where: {
      gearItem: {
        providerId,
      },
    },
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

  return orders;
};

const updateProviderRentalOrderStatus = async (
  orderId: string,
  providerId: string,
  status: RentalStatus,
) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: {
      id: orderId,
    },
    include: {
      gearItem: true,
    },
  });

  if (!rentalOrder) {
    throw new Error("Rental order not found.");
  }

  if (rentalOrder.gearItem.providerId !== providerId) {
    throw new Error("You are not authorized to update this rental order.");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.update({
      where: {
        id: orderId,
      },
      data: {
        rentalStatus: status,
      },
      include: {
        gearItem: true,
        customer: {
          omit: {
            password: true,
          },
        },
      },
    });

    // Return হলে stock আবার available হবে
    if (status === RentalStatus.RETURNED) {
      await tx.gearItem.update({
        where: {
          id: rentalOrder.gearItemId,
        },
        data: {
          availableStock: {
            increment: 1,
          },
          status: GearStatus.AVAILABLE,
        },
      });
    }

    return order;
  });

  return updatedOrder;
};

export const providerServices = {
  getProviderRentalOrders,
  updateProviderRentalOrderStatus,
};