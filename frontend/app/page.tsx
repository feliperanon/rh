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
        if (payload?.email) {
          setEmail(payload.email);
        }
        if (payload?.password) {
          setPassword(payload.password);
        }
        setRemember(true);
      } catch (error) {
        window.localStorage.removeItem(STORAGE_KEY);
        console.error("Erro ao ler credenciais salvas", error);
      }
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          if (remember) {
            window.localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ email, password })
            );
          } else {
            window.localStorage.removeItem(STORAGE_KEY);
          }
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-primary/40 bg-primary/10">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold">RH Admin</CardTitle>
          <p className="text-sm text-muted-foreground">
            Faça login para gerenciar o painel
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="administrador@rh.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 mr-3 flex items-center text-sm text-muted-foreground"
                  onClick={() => setShowPassword((state) => !state)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(value) => setRemember(Boolean(value))}
                />
                <Label htmlFor="remember" className="text-sm font-medium">
                  Salvar usuário e senha
                </Label>
              </div>
              <Link href="/recuperar-senha" className="text-sm font-medium text-primary hover:underline">
                Recuperar senha
              </Link>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Validando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>

        <div className="border-t border-muted/40 px-6 py-4 text-center text-sm text-muted-foreground">
          <p>
            Não consegue acessar?{" "}
            <Link href="/recuperar-senha" className="text-primary font-medium hover:underline">
              Solicite ajuda rápida
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
