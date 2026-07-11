import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import {
  PaymentProvider,
  PaymentStatus,
  RentalStatus,
} from "../../../generated/prisma/enums";
import { handleCheckoutCompleted } from "./payment.utils";

type CreatePaymentPayload = {
  rentalOrderId: string;
};

const createCheckoutSession = async (
  customerId: string,
  payload: CreatePaymentPayload,
) => {
  if (!payload?.rentalOrderId) {
    throw new Error("Rental order ID is required.");
  }

  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: {
      id: payload.rentalOrderId,
    },
    include: {
      gearItem: true,
    },
  });

  if (!rentalOrder) {
    throw new Error("Rental order not found.");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new Error("You are not authorized to pay for this rental order.");
  }

  if (rentalOrder.rentalStatus !== RentalStatus.CONFIRMED) {
    throw new Error("Only confirmed rental orders can be paid.");
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      rentalOrderId: rentalOrder.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (
    existingPayment &&
    (existingPayment.status === PaymentStatus.PENDING ||
      existingPayment.status === PaymentStatus.COMPLETED)
  ) {
    if (existingPayment.status === PaymentStatus.COMPLETED) {
      throw new Error("This rental order has already been paid.");
    }

    return {
      paymentUrl: null,
      paymentId: existingPayment.id,
      message: "Payment is already in progress.",
    };
  }

  const amount = Number(rentalOrder.totalAmount);

  if (!amount || amount <= 0) {
    throw new Error("Invalid rental amount.");
  }

  const customer = await prisma.user.findUnique({
    where: {
      id: customerId,
    },
    select: {
      email: true,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      amount,
      method: "card",
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
      customerId,
      rentalOrderId: rentalOrder.id,
      transactionId: "",
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customer?.email ?? undefined,

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: rentalOrder.gearItem.name,
          },
        },
      },
    ],

    success_url: `${config.app_url}/api/payments/success=true`,
    cancel_url: `${config.app_url}/api/payments/cancel`,

    metadata: {
      customerId,
      rentalOrderId: rentalOrder.id,
      paymentId: payment.id,
    },
  });

  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      transactionId: session.id,
    },
  });

  return {
    paymentUrl: session.url,
    paymentId: payment.id,
    amount: payment.amount,
    sessionId: session.id,
  };
};

const handleWebhook = async (
  payload: Buffer,
  signature: string,
) => {
  const endpointSecret = config.stripe_webhook_secret;

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

export const paymentService = {
  createCheckoutSession,
  handleWebhook,
};