import { LoaderFunctionArgs, ActionFunctionargs } from "@remix-run/node";
import { requireUser } from "../actions/requireUser";

export async function action({ request }: ActionFunctionargs) {
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUser(request);
  return null;
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to Remix</h1>
    </div>
  );
}
