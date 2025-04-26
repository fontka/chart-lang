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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  const { email, password } = credentials as {
    email: string;
    password: string;
  };

  const { accessToken, refreshToken } = await login({ email, password });

  return redirect("/", {
    headers: {
      "Set-Cookie": `${await accessTokenCookie.serialize(
        accessToken
      )}, ${await refreshTokenCookie.serialize(refreshToken)}`,
    },
  });
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
        <div className="flex flex-column gap-3 w-11 mx-auto">
          <Input
            name="email"
            label="E-mail"
            placeholder="Digite seu nome"
            labelClassName="text-center"
          />
          <Input
            name="password"
            label="Senha"
            placeholder="Digite seu nome"
            labelClassName="text-center"
          />
          <Button label="Entrar" type="submit" className="w-full" />
          <AuthRedirectNotice
            message="Não tem conta?"
            linkText="Registrar-se"
            to="/register"
          />
        </div>
      </div>
    </div>
  );
}
