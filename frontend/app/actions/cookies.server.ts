import { createCookie } from "@remix-run/node";

export const accessTokenCookie = createCookie("access_token", {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 15, // 15 min
});

export const refreshTokenCookie = createCookie("refresh_token", {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 dias
});
