import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
} from "./auth.server";
import { redirect } from "@remix-run/node";
import { accessTokenCookie, refreshTokenCookie } from "./cookies.server";

export async function requireUser(request: Request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const accessToken = await accessTokenCookie.parse(cookieHeader);

  const data = verifyAccessToken(accessToken);
  if (data) return data.userId;

  // Tenta usar o refresh token
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);
  const refreshData = verifyRefreshToken(refreshToken);

  if (!refreshData) throw redirect("/auth/login");

  // Gera novos tokens
  const newTokens = generateTokens(refreshData.userId);
  const headers = new Headers({
    "Set-Cookie": `${await accessTokenCookie.serialize(
      newTokens.accessToken
    )}, ${await refreshTokenCookie.serialize(newTokens.refreshToken)}`,
  });

  throw redirect(request.url, { headers });
}
