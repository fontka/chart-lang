import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Button } from "primereact/button";
import AuthRedirectNotice from "../../components/AuthRedirectNotice";
import Input from "../../components/Input";
import { login } from "../../actions/auth.server";
import { useToast } from "../../Contexts/ToastContext";
import {
  accessTokenCookie,
  refreshTokenCookie,
} from "../../actions/cookies.server";
import { Form, useActionData } from "@remix-run/react";
import { LoginSchema } from "../../Schemas/Auth";
import { parseWithZod } from "@conform-to/zod";
import { getFormProps, useForm } from "@conform-to/react";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);

  const result = parseWithZod(formData, { schema: LoginSchema });

  if (result.status === "success") {
    const { email, password } = credentials as {
      email: string;
      password: string;
    };

    try {
      const { accessToken, refreshToken } = await login({ email, password });
      if (!accessToken && !refreshToken) {
        return {
          success: false,
          message: "E-mail ou senha inválidos",
        };
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
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    url,
    data: {},
  };
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const toast = useToast();

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    },
    shouldRevalidate: "onBlur",
  });
  const formProps = getFormProps(form);

  useEffect(() => {
    if (actionData?.success === false) {
      toast.showToast({
        severity: "error",
        summary: "Erro",
        detail: actionData.message,
        life: 3000,
      });
    }
  }, [actionData]);

  return (
    <div className="flex flex-col w-full justify-content-center align-items-center h-screen">
      <div className="flex flex-column align-items-center w-25rem box-container">
        <h1 className="w-full text-center">Login</h1>
        <Form
          method="post"
          className="flex flex-column gap-5 w-11 mx-auto"
          {...formProps}
        >
          <Input
            name="email"
            label="E-mail"
            placeholder="Digite seu nome"
            labelClassName="text-center"
            errorMessage={fields?.email.errors}
          />
          <Input
            name="password"
            label="Senha"
            type="password"
            placeholder="Digite seu nome"
            labelClassName="text-center"
            errorMessage={fields?.password.errors}
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
