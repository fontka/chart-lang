import { LoaderFunction, redirect } from "@remix-run/node";
import {
  accessTokenCookie,
  refreshTokenCookie,
} from "../../actions/cookies.server";

export const loader: LoaderFunction = async () => {
  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": `${await accessTokenCookie.serialize("", {
        maxAge: 0,
      })}, ${await refreshTokenCookie.serialize("", { maxAge: 0 })}`,
    },
  });
};
