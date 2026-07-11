import { prisma } from "../../lib/prisma";

const getAllUser = async () => {
  const allUsers = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    omit: {
      password: true,
    },
  });

  return allUsers;
};

const updateUserStatus = async (
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
) => {
  const userExists = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userExists) {
    throw new Error("User not found.");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      activeStatus: status,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  const userExists = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userExists) {
    throw new Error("User not found.");
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    message: "User deleted successfully.",
  };
};

export const adminService = {
  getAllUser,
  updateUserStatus,
  deleteUser,
};