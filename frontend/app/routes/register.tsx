import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { Button } from "primereact/button";
import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import Input from "../components/Input";
import AuthRedirectNotice from "../components/AuthRedirectNotice";

// Validação
const RegisterSchema = z
  .object({
    name: z
      .string({ required_error: "Campo obrigatório" })
      .min(3, "Nome deve ter no mínimo 3 caracteres"),
    lastname: z
      .string({ required_error: "Campo obrigatório" })
      .min(3, "Sobrenome deve ter no mínimo 3 caracteres"),
    email: z
      .string({ required_error: "Campo obrigatório" })
      .email("E-mail inválido"),
    password: z
      .string({ required_error: "Campo obrigatório" })
      .min(8, "A senha deve ter no mínimo 8 caracteres"),
    "repeat-password": z
      .string({ required_error: "Campo obrigatório" })
      .min(8, "A senha deve ter no mínimo 8 caracteres"),
  })
  .refine((data) => data.password === data["repeat-password"], {
    message: "As senhas não coincidem",
    path: ["repeat-password"],
  });

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);

  const result = RegisterSchema.safeParse(values);

  if (!result.success) {
    const error = result.error.flatten();
    return {
      formErrors: error.formErrors,
      fieldErrors: error.fieldErrors,
    };
  }

  const { email, password } = result.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!userCredential.user) {
      return {
        firebaseError: "Erro ao criar usuário",
        success: false,
        error: userCredential,
      };
    }

    return redirect("/login", {
      headers: {
        "Set-Cookie": `user=${userCredential.user.uid}; HttpOnly; Path=/; Max-Age=31536000; SameSite=Lax`,
      },
    });
  } catch (error) {
    console.error("erro no firebase", error);
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    url,
  };
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const { url } = useLoaderData<typeof loader>();

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

        {actionData?.firebaseError && (
          <div className="text-red-500 text-sm mb-3 text-center">
            {actionData.firebaseError}
          </div>
        )}

        <Form
          action={url.pathname}
          method="post"
          className="flex w-full"
          {...formProps}
        >
          <div className="flex flex-column gap-3 w-11 mx-auto">
            <Input
              name="name"
              label="Nome"
              placeholder="Digite seu nome"
              labelClassName="text-center"
              errorMessage={fields?.name.errors}
            />
            <Input
              name="lastname"
              label="Sobrenome"
              placeholder="Digite seu sobrenome"
              labelClassName="text-center"
              errorMessage={fields?.lastname.errors}
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
              to="/login"
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
