import { LoaderFunctionArgs, ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { Button } from "primereact/button";
import { z } from "zod";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import Input from "../components/Input";

// Validação
const RegisterSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    lastname: z.string().min(1, "Sobrenome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    "repeat-password": z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
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
    return json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { email, password } = result.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return redirect("/login");
  } catch (error: any) {
    let message = "Erro ao registrar usuário.";
    if (error.code === "auth/email-already-in-use") {
      message = "E-mail já está em uso.";
    } else if (error.code === "auth/invalid-email") {
      message = "E-mail inválido.";
    } else if (error.code === "auth/weak-password") {
      message = "Senha fraca. Use uma senha mais segura.";
    }

    return json(
      {
        errors: {},
        firebaseError: message,
      },
      { status: 400 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    url,
  };
}

export default function Register() {
  const { url } = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    errors?: Record<string, string[]>;
    firebaseError?: string;
  }>();

  return (
    <div className="flex flex-col w-full justify-content-center align-items-center h-screen">
      <div className="flex flex-column align-items-center w-25rem box-container">
        <h1 className="w-full text-center">Registre-se</h1>

        {actionData?.firebaseError && (
          <div className="text-red-500 text-sm mb-3 text-center">
            {actionData.firebaseError}
          </div>
        )}

        <Form action={url.pathname} method="post" className="flex w-full">
          <div className="flex flex-column gap-3 w-11 mx-auto">
            <Input 
              name="name" 
              label="Nome" 
              placeholder="Digite seu nome"
              labelClassName="text-center"
            />
            {actionData?.errors?.name && (
              <p className="text-red-500 text-sm">{actionData.errors.name[0]}</p>
            )}

            <Input 
              name="lastname" 
              label="Sobrenome" 
              placeholder="Digite seu sobrenome"
              labelClassName="text-center"
            />
            {actionData?.errors?.lastname && (
              <p className="text-red-500 text-sm">{actionData.errors.lastname[0]}</p>
            )}

            <Input 
              name="email" 
              label="E-mail" 
              placeholder="Digite seu e-mail"
              labelClassName="text-center"
            />
            {actionData?.errors?.email && (
              <p className="text-red-500 text-sm">{actionData.errors.email[0]}</p>
            )}

            <Input 
              name="password" 
              label="Senha" 
              placeholder="Digite sua senha"
              labelClassName="text-center"
              type="password"
            />
            {actionData?.errors?.password && (
              <p className="text-red-500 text-sm">{actionData.errors.password[0]}</p>
            )}

            <Input 
              name="repeat-password" 
              label="Repita a senha" 
              placeholder="Confirme sua senha"
              labelClassName="text-center"
              type="password"
            />
            {actionData?.errors?.["repeat-password"] && (
              <p className="text-red-500 text-sm">{actionData.errors["repeat-password"][0]}</p>
            )}

            <Button label="Cadastrar" type="submit" className="mt-2" />
          </div>
        </Form>
      </div>
    </div>
  );
}
