import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const body = new URLSearchParams(await request.text());
  const data = Object.fromEntries(body);

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {

  return null;
}

export default function Home() {
  return null;
}
