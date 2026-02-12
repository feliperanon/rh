"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function RecuperarSenhaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-lg border-slate-200 bg-white shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-slate-900">Recuperar Senha</CardTitle>
          <p className="text-sm text-slate-600">
            Informe o email utilizado no cadastro para receber o link de recuperação.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email" className="text-slate-700">Email</Label>
            <Input
              id="recovery-email"
              type="email"
              placeholder="nome@empresa.com"
              className="border-slate-300 bg-white text-slate-900"
            />
          </div>
          <p className="text-sm text-slate-600">
            Caso não receba o link, entre em contato com a psicóloga responsável ou envie
            um email para <span className="font-medium text-slate-900">suporte@rh-gppm.com</span>.
          </p>
        </CardContent>
        <div className="flex flex-col gap-2 px-6 pb-6">
          <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
            Enviar link de recuperação
          </Button>
          <Link
            href="/"
            className="text-center text-sm text-slate-600 hover:text-slate-900 hover:underline"
          >
            Voltar para o login
          </Link>
        </div>
      </Card>
    </div>
  );
}
