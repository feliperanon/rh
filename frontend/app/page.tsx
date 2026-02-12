"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";

const STORAGE_KEY = "rh-login-credentials";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const payload = JSON.parse(stored);
        if (payload?.email) setEmail(payload.email);
        if (payload?.password) setPassword(payload.password);
        if (payload?.email || payload?.password) setRemember(true);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Falha no login", {
          description: "Verifique suas credenciais e tente novamente.",
        });
      } else {
        if (typeof window !== "undefined") {
          remember
            ? window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }))
            : window.localStorage.removeItem(STORAGE_KEY);
        }
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado", {
        description: "Ocorreu um problema ao tentar logar.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-8">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold text-slate-900">RH Admin</CardTitle>
          <p className="text-sm text-slate-600">
            Faça login para gerenciar o painel
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="administrador@rh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-slate-300 bg-white pr-12 text-slate-900"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                <Label htmlFor="remember" className="text-sm font-medium text-slate-600">
                  Salvar usuário e senha
                </Label>
              </div>
              <Link
                href="/recuperar-senha"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
              >
                Recuperar senha
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
              type="submit"
              disabled={loading}
            >
              {loading ? "Validando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>

        <div className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-600">
          <p>
            Não consegue acessar?{" "}
            <Link href="/recuperar-senha" className="font-medium text-slate-900 hover:underline">
              Solicite ajuda rápida
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
