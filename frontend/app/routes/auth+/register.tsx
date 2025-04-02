import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "primereact/button";
import { z } from "zod";

import Input from "../../components/Input";

const RegisterSchema = z.object({
  name: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  "repeat-password": z.string().min(8),
});

export async function action({ request }: ActionFunctionArgs) {
  const body = new URLSearchParams(await request.text());
  const data = Object.fromEntries(body);

  console.log(data);

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  console.log(url);

  return {
    url,
    data: {},
  };
}

export default function Register() {
  const { url } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col w-full justify-content-center align-items-center h-screen">
      <div className="flex flex-column align-items-center w-25rem box-container">
        <h1 className="w-full text-center">Registre-se</h1>
        <Form action={url.pathname} method="post" className="flex w-full">
          <div className="flex flex-column gap-3 w-11 mx-auto">
            <Input name="name" placeholder="Nome" />
            <Input name="lastname" placeholder="sobrenome" />
            <Input name="email" placeholder="E-mail" />
            <Input name="password" placeholder="Senha" />
            <Input name="repeat-password" placeholder="Repita a senha" />
            <Button
              type="submit"
              className="w-8rem mx-auto justify-content-center"
            >
              Enviar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
