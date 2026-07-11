import { prisma } from "../../lib/prisma";
import { ICreateGearCategory } from "./category.interface";

const createCategory = async (payload: ICreateGearCategory) => {
  const { name, description } = payload;

  const existingCategory = await prisma.category.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new Error("Gear category already exists.");
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
};

export const categoryService = {
  createCategory,
  getAllCategories,
};