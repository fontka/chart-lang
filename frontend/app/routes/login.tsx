import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { InputText } from "primereact/inputtext";
import { Form } from "@remix-run/react";
import { Button } from "primereact/button";
import { useState } from "react";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig'; 

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
    e.preventDefault(); // evita o submit tradicional
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
        <Form method="post" onSubmit={handleLogin} className="flex w-full">
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
            <Button label="Entrar" type="submit" className="mt-3" />
          </div>
        </Form>
      </div>
    </div>
  );
}
