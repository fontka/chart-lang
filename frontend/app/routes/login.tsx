import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { InputText } from "primereact/inputtext";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "primereact/button";
import { useState } from "react";

// import { z } from "zod";
// import {
//   accessTokenCookie,
//   refreshTokenCookie,
// } from "~/actions/cookies.server";

// const RegisterSchema = z.object({
//   name: z.string(),
//   lastname: z.string(),
//   email: z.string().email(),
//   password: z.string().min(8),
//   "repeat-password": z.string().min(8),
// });

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);

  console.log("formData", formData);
  console.log("credentials", credentials);
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    url,
    data: {},
  };
}

export default function Login() {
  // const { url } = useLoaderData<typeof loader>();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <div className="flex flex-col w-full justify-content-center align-items-center h-screen">
      <div className="flex flex-column align-items-center w-25rem box-container">
        <h1 className="w-full text-center">Login</h1>
        <Form method="post" className="flex w-full">
          <div className="flex flex-column gap-3 w-11 mx-auto">
            <div className="flex flex-column">
              <label className="mb-1">Email</label>
              <InputText
                name="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Digite seu e-mail"
              />
            </div>
            <div className="flex flex-column">
              <label className="mb-1">Senha</label>
              <InputText
                name="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Digite sua senha"
              />
            </div>
            <Button
              type="submit"
              className="w-8rem mx-auto justify-content-center"
            >
              Entrar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
