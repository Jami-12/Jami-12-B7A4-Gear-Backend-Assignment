import { prisma } from "../../lib/prisma";
import { RentalStatus } from "../../../generated/prisma/enums";

interface IReviewInput {
  customerId: string;
  gearItemId: string;
  rating: number;
  comment: string;
}

const createReview = async (payload: IReviewInput) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: {
      id: payload.gearItemId,
    },
  });

  if (!gearItem) {
    throw new Error("Gear item not found.");
  }

  const rentalOrder = await prisma.rentalOrder.findFirst({
    where: {
      customerId: payload.customerId,
      gearItemId: payload.gearItemId,
      rentalStatus: RentalStatus.RETURNED,
    },
  });

  if (!rentalOrder) {
    throw new Error(
      "You can review this gear only after returning it.",
    );
  }

  const alreadyReviewed = await prisma.review.findFirst({
    where: {
      customerId: payload.customerId,
      gearItemId: payload.gearItemId,
    },
  });

  if (alreadyReviewed) {
    throw new Error("You have already reviewed this gear.");
  }

  const review = await prisma.review.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      customerId: payload.customerId,
      gearItemId: payload.gearItemId,
    },
  });

  return review;
};

export const reviewService = {
  createReview,
};