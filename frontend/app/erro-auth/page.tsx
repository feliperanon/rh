"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ErroAuthPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error") ?? "Configuration";

    const messages: Record<string, { title: string; description: string }> = {
        Configuration: {
            title: "Problema de configuração no servidor",
            description:
                "O login não está configurado corretamente em produção. No Render, no serviço rh-gppm, vá em Environment e defina NEXTAUTH_SECRET (gere uma chave) e NEXTAUTH_URL = https://rh-gppm.onrender.com. Depois faça um novo deploy. Veja o arquivo CONFIGURAR_NEXTAUTH_RENDER.md na raiz do projeto.",
        },
        Default: {
            title: "Erro de autenticação",
            description: "Algo deu errado. Tente fazer login novamente ou entre em contato com o suporte.",
        },
    };

    const { title, description } = messages[error] ?? messages.Default;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
            <Card className="w-full max-w-md border-amber-500/50 bg-amber-500/5">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h1>
                </CardHeader>
                <CardContent className="space-y-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    <p>{description}</p>
                    <Button asChild className="w-full">
                        <Link href="/">Voltar para o login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
