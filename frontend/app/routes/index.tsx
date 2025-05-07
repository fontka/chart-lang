import { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "../actions/requireUser";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function Dashboard() {
  return <div>Dashboard</div>;
}
