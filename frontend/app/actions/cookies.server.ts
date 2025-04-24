import { createCookie } from "@remix-run/node";

export const accessTokenCookie = createCookie("chartlang_at", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  maxAge: 60 * 15, // 15 minutos
});

export const refreshTokenCookie = createCookie("chartlang_rt", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 dias
});
