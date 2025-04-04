import jwt from "jsonwebtoken";
import { accessTokenCookie, refreshTokenCookie } from "./cookies.server";
import { redirect } from "@remix-run/node";

const JWT_SECRET =
  "cdcba3566b64f5233fe43e333e63784b2e4d02ec0a122bb326184c8cd135da868383616bacf4fc866eb7cbec219fcd314c2060ed21712065931343ef62de816dd9f49a851f36542a15ef3aa8d412533357a60d7d126481e1d1cae1c1a5dc52b1c6f5080d7ee44889afe3640955c169233340d14ab5d3d9f95dc90940d4ca698f5bb98780aea9a6f9696b2003873f529e2b9c1b3cc1e889f822f95c02d77f0970ee487badebf38d3bed58b871268609e11d7a6d0661f196260c12f920fe1408bb49af8be02730de98adb10501f7fd5545b0e7d63befb2cc7e85a471b48ca8c9655d16038a2f7d8b604e53dc93d68f40c71e321a42dde1b4b3b81bfbfff720b2a1"; // igual ao do backend

export async function requireUser(request: Request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const accessToken = await accessTokenCookie.parse(cookieHeader);
  const refreshToken = await refreshTokenCookie.parse(cookieHeader);

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      return decoded;
    } catch (err) {
      // token expirado, tentaremos usar o refresh
    }
  }

  // tenta renovar usando refresh token
  if (refreshToken) {
    const res = await fetch("http://localhost:8765/api/refreshToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (res.ok) {
      const { access_token } = await res.json();

      return {
        token: jwt.decode(access_token),
        newAccessTokenCookie: await accessTokenCookie.serialize(access_token),
      };
    }
  }

  throw redirect("/login");
}
