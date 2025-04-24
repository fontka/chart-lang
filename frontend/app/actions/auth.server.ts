import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../actions/prisma.server";

type ResponseType = {
  error: boolean;
  accessToken?: string;
  refreshToken?: string;
};

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ResponseType> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return {
      error: true,
    };
  }

  const tokens = generateTokens(user.id);
  return {
    error: false,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
}
