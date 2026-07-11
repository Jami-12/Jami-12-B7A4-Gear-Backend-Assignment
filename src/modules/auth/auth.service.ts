import bcrypt from "bcryptjs";
import validator from "validator";
import { SignOptions } from "jsonwebtoken";

import { prisma } from "../../lib/prisma";
import config from "../../config";
import { jwtUtils } from "../../lib/jsonWebToken";
import { ILoginPayload, IRegisterUser, IUpdateProfile } from "./auth.interface";




const registerUser = async (payload: IRegisterUser) => {
  const {
    name,
    email,
    password,
    phone,
    profileImage,
    role,
  } = payload;


  // Admin registration disabled
  if (role === "ADMIN") {
    throw new Error("Admin registration is not allowed");
  }


  // Email validation
  if (!validator.isEmail(email)) {
    throw new Error("Please provide a valid email address");
  }


  // Check user exists
  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });


  if (userExists) {
    throw new Error("User already exists");
  }


  // Password hashing
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );


  // Create user
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      profileImage,
      role: role ?? "CUSTOMER",
      activeStatus: "ACTIVE",
    },
  });


  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
    },
    omit: {
      password: true,
    },
  });


  return user;
};



const loginUser = async (payload: ILoginPayload) => {
  const {
    email,
    password
  } = payload;


  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });


  if (!user) {
    throw new Error("User not found");
  }


  const passwordMatched = await bcrypt.compare(
    password,
    user.password,
  );


  if (!passwordMatched) {
    throw new Error("Invalid password");
  }


  // Blocked user check
  if (user.activeStatus === "SUSPENDED") {
    throw new Error(
      "Your account has been suspend. Please contact support.",
    );
  }


  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };


  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );


  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    status: user.activeStatus,
  };


  return {
    accessToken,
    userData,
  };
};



const getMyProfile = async (userId: string) => {

  const userProfile = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });


  return userProfile;
};



const updateMyProfile = async (
  userId: string,
  payload: IUpdateProfile,
) => {

  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });


  if (!existingUser) {
    throw new Error("User not found");
  }


  const updateData: any = {
    ...payload,
  };


  // Password update
  if (payload.password) {

    updateData.password = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds),
    );

  }


  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
    omit: {
      password: true,
    },
  });


  return updatedUser;
};



export const authService = {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
};