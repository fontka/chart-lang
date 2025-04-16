import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { InputText } from "primereact/inputtext";
import { Form } from "@remix-run/react";
import { Button } from "primereact/button";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import AuthRedirectNotice from "../components/AuthRedirectNotice";
import Input from "@components/Input";

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
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Usuário logado:", user);
      alert("Login realizado com sucesso!");
      window.location.href = "/chat";
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <div className="flex flex-col w-full justify-content-center align-items-center h-screen">
      <div className="flex flex-column align-items-center w-25rem box-container">
        <h1 className="w-full text-center">Login</h1>
        <Form onSubmit={handleLogin} className="flex w-full">
          <div className="flex flex-column gap-3 w-11 mx-auto">
            <Input
              name="email"
              label="E-mail"
              placeholder="Digite seu nome"
              labelClassName="text-center"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <Input
              name="password"
              label="Senha"
              placeholder="Digite seu nome"
              labelClassName="text-center"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <Button label="Entrar" type="submit" className="w-full" />
            <AuthRedirectNotice
              message="Não tem conta?"
              linkText="Registrar-se"
              to="/register"
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
