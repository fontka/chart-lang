import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "primereact/button";
import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

import Input from "../../components/Input";
import AuthRedirectNotice from "../../components/AuthRedirectNotice";
import { RegisterSchema } from "../../Schemas/Auth";
import { createUser, getUserByEmail } from "../../actions/prisma.server";
import bcrypt from "bcryptjs";
import {
  accessTokenCookie,
  refreshTokenCookie,
} from "../../actions/cookies.server";
import { generateTokens } from "../../actions/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  console.log("action");
  const formData = await request.formData();
  const result = parseWithZod(formData, { schema: RegisterSchema });

  if (result.status === "success") {
    const existingUser = await getUserByEmail(result.value.email);

    if (existingUser) {
      console.log("usuario ja existe", existingUser);
      return null;
    }

    const hashedPassword = await bcrypt.hash(result.value.password, 10);
    const data = {
      name: result.value.name,
      email: result.value.email,
      password: hashedPassword,
    };

    const user = await createUser(data);
    const { accessToken, refreshToken } = generateTokens(user.id);

    return redirect("/", {
      headers: {
        "Set-Cookie": `${await accessTokenCookie.serialize(
          accessToken
        )}, ${await refreshTokenCookie.serialize(refreshToken)}`,
      },
    });
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    url,
  };
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  console.log("actionData", actionData);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RegisterSchema });
    },
    shouldRevalidate: "onBlur",
  });
  const formProps = getFormProps(form);

  return (
    <div className="flex flex-col w-full justify-content-center align-items-center h-screen">
      <div className="flex flex-column align-items-center w-25rem box-container">
        <h1 className="w-full text-center">Registre-se</h1>
        <Form method="post" className="flex w-full" {...formProps}>
          <div className="flex flex-column gap-3 w-11 mx-auto">
            <Input
              name="name"
              label="Nome completo"
              placeholder="Digite seu nome"
              labelClassName="text-center"
              errorMessage={fields?.name.errors}
            />
            <Input
              name="email"
              label="E-mail"
              placeholder="Digite seu e-mail"
              labelClassName="text-center"
              errorMessage={fields?.email.errors}
            />
            <Input
              name="password"
              label="Senha"
              placeholder="Digite sua senha"
              labelClassName="text-center"
              type="password"
              errorMessage={fields?.password.errors}
            />
            <Input
              name="repeat-password"
              label="Repita a senha"
              placeholder="Confirme sua senha"
              labelClassName="text-center"
              type="password"
              errorMessage={fields?.["repeat-password"].errors}
            />
            <Button label="Cadastrar" type="submit" className="mt-2" />
            <AuthRedirectNotice
              message="Já tem conta?"
              linkText="Faça o login"
              to="/auth/login"
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
