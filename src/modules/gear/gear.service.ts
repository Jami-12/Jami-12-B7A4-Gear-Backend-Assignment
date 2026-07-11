import { prisma } from "../../lib/prisma";
import {
  ICreateGearInput,
  IGearQuery,
  IUpdateGearInput,
} from "./gear.interface";

const createGearIntoDB = async (
  providerId: string,
  payload: ICreateGearInput,
) => {
  const gear = await prisma.gearItem.create({
    data: {
      name: payload.name,
      description: payload.description,
      brand: payload.brand,
      dailyRate: Number(payload.dailyRate),
      stock: Number(payload.stock),
      availableStock: Number(payload.availableStock),
      condition: payload.condition,
      image: payload.image,
      specifications: payload.specifications,
      status: payload.status,
      categoryId: payload.categoryId,
      providerId,
    },
  });

  return gear;
};

const getAllGear = async (query: IGearQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.searchTerm) {
    where.OR = [
      {
        name: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.brand) {
    where.brand = query.brand;
  }

  if (query.status) {
    where.status = query.status;
  }

  const total = await prisma.gearItem.count({
    where,
  });

  const gear = await prisma.gearItem.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    gear,
  };
};

const updateGearIntoDB = async (
  providerId: string,
  gearId: string,
  payload: IUpdateGearInput,
) => {
  const existingGear = await prisma.gearItem.findFirst({
    where: {
      id: gearId,
      providerId,
    },
  });

  if (!existingGear) {
    throw new Error("Gear not found.");
  }

  const updatedGear = await prisma.gearItem.update({
    where: {
      id: gearId,
    },
    data: payload,
  });

  return updatedGear;
};

const deleteGear = async (
  providerId: string,
  gearId: string,
) => {
  const existingGear = await prisma.gearItem.findFirst({
    where: {
      id: gearId,
      providerId,
    },
  });

  if (!existingGear) {
    throw new Error("Gear not found.");
  }

  await prisma.gearItem.delete({
    where: {
      id: gearId,
    },
  });

  return null;
};

const getGearById = async (gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: gearId,
    },
    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
      reviews: true,
    },
  });

  if (!gear) {
    throw new Error("Gear not found.");
  }

  return gear;
};

export const gearServices = {
  createGearIntoDB,
  getAllGear,
  updateGearIntoDB,
  deleteGear,
  getGearById,
};