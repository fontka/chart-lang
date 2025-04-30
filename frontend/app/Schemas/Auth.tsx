import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z
      .string({ required_error: "Campo obrigatório" })
      .min(3, "Nome deve ter no mínimo 3 caracteres"),
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

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Campo obrigatório" })
    .email("E-mail inválido"),
  password: z
    .string({ required_error: "Campo obrigatório" })
    .min(8, "A senha deve ter no mínimo 8 caracteres"),
});
