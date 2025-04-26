import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "primereact/button";
import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

import Input from "../../components/Input";
import AuthRedirectNotice from "../../components/AuthRedirectNotice";
import { RegisterSchema } from "../../Schemas/Auth";

export async function action({ request }: ActionFunctionArgs) {
  console.log("values");

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return {
    url,
  };
}

export default function Register() {
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
              to="/login"
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
