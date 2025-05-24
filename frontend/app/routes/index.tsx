import { redirect, LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "../actions/requireUser";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (user) {
    return redirect("/chat");
  } else {
    return redirect("/auth/login");
  }
}
