import type { LoginFormValues } from "@/lib/validators/login";

/**
 * Mock login action — pronto para trocar pela API real.
 * Simula delay e retorna sucesso ou erro para demonstrar estados (loading, erro).
 */
export async function loginAction(
  payload: Pick<LoginFormValues, "email" | "password">
): Promise<{ success: true } | { success: false; message: string }> {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));

  const { email, password } = payload;

  if (!email?.trim() || !password?.trim()) {
    return { success: false, message: "E-mail e senha são obrigatórios." };
  }

  if (password.length < 6) {
    return { success: false, message: "Senha deve ter pelo menos 6 caracteres." };
  }

  return { success: true };
}
