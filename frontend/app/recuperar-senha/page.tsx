"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function RecuperarSenhaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle>Recuperar Senha</CardTitle>
          <p className="text-sm text-muted-foreground">
            Informe o email utilizado no cadastro para receber o link de recuperação.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email</Label>
            <Input id="recovery-email" type="email" placeholder="nome@empresa.com" />
          </div>
          <p className="text-sm text-muted-foreground">
            Caso não receba o link, entre em contato com a psicóloga responsável ou envie
            um email para <span className="font-medium text-primary">suporte@rh-gppm.com</span>.
          </p>
        </CardContent>
        <div className="flex flex-col gap-2 px-6 pb-6">
          <Button className="w-full">Enviar link de recuperação</Button>
          <Link href="/" className="text-sm text-center text-muted-foreground hover:text-primary">
            Voltar para o login
          </Link>
        </div>
      </Card>
    </div>
  );
}
