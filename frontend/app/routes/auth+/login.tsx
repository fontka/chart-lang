import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Button } from "primereact/button";
import AuthRedirectNotice from "../../components/AuthRedirectNotice";
import Input from "../../components/Input";
import { login } from "../../actions/auth.server";
import {
  accessTokenCookie,
  refreshTokenCookie,
} from "../../actions/cookies.server";
import { Form } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  const { email, password } = credentials as {
    email: string;
    password: string;
  };

  try {
    const { accessToken, refreshToken } = await login({ email, password });
    if (!accessToken && !refreshToken) {
      console.log("Invalid credentials or user not found");
      return null;
    }

    return redirect("/", {
      headers: {
        "Set-Cookie": `${await accessTokenCookie.serialize(
          accessToken
        )}, ${await refreshTokenCookie.serialize(refreshToken)}`,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    url,
    data: {},
  };
}

export default function Login() {
  return (
    <div className="flex flex-col w-full justify-content-center align-items-center h-screen">
      <div className="flex flex-column align-items-center w-25rem box-container">
        <h1 className="w-full text-center">Login</h1>
        <Form method="post" className="flex flex-column gap-3 w-11 mx-auto">
          <Input
            name="email"
            label="E-mail"
            placeholder="Digite seu nome"
            labelClassName="text-center"
          />
          <Input
            name="password"
            label="Senha"
            placeholder="Digite sua senha"
            labelClassName="text-center"
            type="password"
          />
          <Button label="Entrar" type="submit" className="w-full" />
          <AuthRedirectNotice
            message="Não tem conta?"
            linkText="Registrar-se"
            to="/auth/register"
          />
        </Form>
      </div>
    </div>
  );
}
