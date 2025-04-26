import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "../actions/prisma.server";

export async function action({ request }: ActionFunctionArgs) {
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  return null;
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to Remix</h1>
    </div>
  );
}
