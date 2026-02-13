"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { LoginCard } from "@/components/auth/LoginCard";
import type { LoginFormValues } from "@/lib/validators/login";

const STORAGE_KEY = "rh-login-credentials";

export default function Home() {
  const router = useRouter();
  const [defaultValues, setDefaultValues] = useState<Partial<LoginFormValues>>({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const payload = JSON.parse(stored);
        if (payload?.email || payload?.password) {
          setDefaultValues({
            email: payload.email ?? "",
            password: payload.password ?? "",
            remember: true,
          });
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  async function handleLogin(email: string, password: string) {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false as const, message: "E-mail ou senha inválidos. Tente novamente." };
    }
    return { success: true as const };
  }

  function handleSuccess(values: LoginFormValues) {
    if (typeof window !== "undefined") {
      if (values.remember) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ email: values.email, password: values.password })
        );
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    toast.success("Login realizado com sucesso!");
    router.push("/dashboard");
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{ background: "hsl(var(--login-bg))" }}
    >
      <LoginCard
        onLogin={handleLogin}
        onSuccess={handleSuccess}
        defaultValues={defaultValues}
      />
    </div>
  );
}
