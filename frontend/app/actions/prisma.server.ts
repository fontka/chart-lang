import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function getUserById(userId: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Could not fetch user");
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true, 
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Could not fetch user");
  }
}

import { v4 as uuidv4 } from 'uuid';

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const user = await prisma.users.create({
      data: {
        id: uuidv4(), 
        name: data.name,
        email: data.email,
        password: data.password,
        created_at: new Date().toISOString(), 
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user [ERRO REAL]:", error);
    throw new Error("Could not create user");
  }
}

