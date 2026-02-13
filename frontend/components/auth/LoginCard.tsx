"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { loginSchema, type LoginFormValues } from "@/lib/validators/login";
import { loginAction } from "@/lib/actions/login";
import { Button } from "@/components/ui/button";

export type LoginResult =
  | { success: true }
  | { success: false; message: string };

export type LoginCardProps = {
  /** Se informado, usa este callback em vez do mock (ex.: NextAuth signIn). */
  onLogin?: (
    email: string,
    password: string
  ) => Promise<LoginResult>;
  /** Chamado quando o login é bem-sucedido (ex.: redirect + salvar "lembrar"). */
  onSuccess?: (values: LoginFormValues) => void;
  /** Valores iniciais (ex.: email/senha salvos em "lembrar de mim"). */
  defaultValues?: Partial<LoginFormValues>;
};
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function LoginCard({
  onLogin,
  onSuccess,
  defaultValues,
}: LoginCardProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: defaultValues?.email ?? "",
      password: defaultValues?.password ?? "",
      remember: defaultValues?.remember ?? false,
    },
  });

  useEffect(() => {
    if (defaultValues && (defaultValues.email || defaultValues.password)) {
      form.reset({
        email: defaultValues.email ?? "",
        password: defaultValues.password ?? "",
        remember: defaultValues.remember ?? false,
      });
    }
  }, [defaultValues?.email, defaultValues?.password, defaultValues?.remember]);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    const result = onLogin
      ? await onLogin(values.email, values.password)
      : await loginAction({
          email: values.email,
          password: values.password,
        });

    if (result.success) {
      if (onSuccess) onSuccess(values);
      else form.reset();
      return;
    }
    setServerError(result.message);
  }

  return (
    <Card
      className={cn(
        "w-full max-w-[400px] border-[hsl(var(--login-border))] bg-[hsl(var(--login-surface))] shadow-[var(--login-shadow)] rounded-[var(--login-radius-lg)] transition-shadow focus-within:shadow-[var(--login-shadow-focus)]"
      )}
    >
      <CardHeader className="space-y-2 text-center pb-2">
        <div className="mx-auto flex justify-center" aria-hidden>
          <Logo height={64} showSlogan={true} />
        </div>
        <CardTitle className="text-xl font-semibold text-[hsl(var(--login-text))]">
          Painel Administrativo
        </CardTitle>
        <CardDescription className="text-[hsl(var(--login-text-muted))]">
          Faça login para gerenciar o painel
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <CardContent className="space-y-4 pt-2">
            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--login-text))]">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="administrador@rh.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className={cn(
                        "h-[var(--login-input-height)] border-[hsl(var(--login-border))] bg-[hsl(var(--login-input-bg))] rounded-[var(--login-radius)] transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-[hsl(var(--login-primary))] focus-visible:ring-offset-2",
                        "hover:border-[hsl(var(--login-text-muted))]/50",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--login-text))]">
                    Senha
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        className={cn(
                          "h-[var(--login-input-height)] pr-11 border-[hsl(var(--login-border))] bg-[hsl(var(--login-input-bg))] rounded-[var(--login-radius)] transition-colors",
                          "focus-visible:ring-2 focus-visible:ring-[hsl(var(--login-primary))] focus-visible:ring-offset-2",
                          "hover:border-[hsl(var(--login-text-muted))]/50",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        disabled={isSubmitting}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[hsl(var(--login-text-muted))] hover:text-[hsl(var(--login-text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--login-primary))] focus-visible:ring-offset-2 rounded-r-[var(--login-radius)] disabled:opacity-50"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        tabIndex={0}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        className="border-[hsl(var(--login-border))] data-[state=checked]:bg-[hsl(var(--login-primary))] data-[state=checked]:border-[hsl(var(--login-primary))] focus-visible:ring-[hsl(var(--login-primary))]"
                        aria-describedby="remember-label"
                      />
                    </FormControl>
                    <Label
                      id="remember-label"
                      htmlFor="remember"
                      className="text-sm font-medium text-[hsl(var(--login-text-muted))] cursor-pointer"
                    >
                      Salvar usuário e senha
                    </Label>
                  </FormItem>
                )}
              />
              <Link
                href="/recuperar-senha"
                className="text-sm font-medium text-[hsl(var(--login-primary))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--login-primary))] focus-visible:ring-offset-2 rounded"
              >
                Recuperar senha
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full h-[var(--login-input-height)] rounded-[var(--login-radius)] font-medium",
                "bg-[hsl(var(--login-primary))] text-white hover:bg-[hsl(var(--login-primary-hover))]",
                "focus-visible:ring-2 focus-visible:ring-[hsl(var(--login-primary))] focus-visible:ring-offset-2",
                "active:scale-[0.99] transition-transform",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Validando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

      <div className="border-t border-[hsl(var(--login-border))] px-6 py-4 text-center text-sm text-[hsl(var(--login-text-muted))]">
        <p>
          Não consegue acessar?{" "}
          <Link
            href="/recuperar-senha"
            className="font-medium text-[hsl(var(--login-primary))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--login-primary))] focus-visible:ring-offset-2 rounded"
          >
            Solicite ajuda rápida
          </Link>
        </p>
      </div>
    </Card>
  );
}
