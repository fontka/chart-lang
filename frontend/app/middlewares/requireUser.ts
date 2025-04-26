import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
} from "../actions/auth.server";
import {
  accessTokenCookie,
  refreshTokenCookie,
} from "../actions/cookies.server";
import { redirect } from "@remix-run/node";

export async function requireUser(request: Request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const accessTokenVerify = await accessTokenCookie.parse(cookieHeader);

  const data = verifyAccessToken(accessTokenVerify);
  if (data) return data.userId;

  // Tenta usar o refresh token
  const refreshTokenVerify = await refreshTokenCookie.parse(cookieHeader);
  const refreshData = verifyRefreshToken(refreshTokenVerify);

  if (!refreshData) throw redirect("/login");

  // Gera novos tokens
  const { accessToken, refreshToken } = generateTokens(refreshData.userId);
  const headers = new Headers({
    "Set-Cookie": `${await accessTokenCookie.serialize(
      accessToken
    )}, ${await refreshTokenCookie.serialize(refreshToken)}`,
  });

  throw redirect(request.url, { headers });
}
