"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ApplicationPublicForm } from "@/components/forms/ApplicationPublicForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { CheckCircle2 } from "lucide-react";

export default function PublicRegistrationPage() {
    const params = useParams();
    const token = params.token as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            api.getApplicationByToken(token)
                .then(setData)
                .catch((err) => {
                    console.error(err);
                    setError(err.message || "Link inválido ou expirado.");
                })
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <Logo height={140} showSlogan={true} lightBackground className="mb-6" />
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-gray-600">Carregando informações...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
                <Logo height={110} showSlogan={true} lightBackground className="mb-6" />
                <Card className="w-full max-w-md border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive text-center">Link Inválido</CardTitle>
                        <CardDescription className="text-center">
                            {error}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
                <Logo height={110} showSlogan={true} lightBackground className="mb-6" />
                <Card className="w-full max-w-md border-green-500/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-green-700">Cadastro Recebido!</CardTitle>
                        <CardDescription>
                            Suas informações foram salvas com sucesso.<br />
                            Em breve entraremos em contato.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <Logo height={150} showSlogan={true} lightBackground className="mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900">Finalizar Cadastro</h1>
                    <p className="text-gray-500">
                        {data.company.sigilosa ? "Processo Seletivo Confidencial" : data.company.nome}
                    </p>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        Protocolo: {data.protocol}
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <ApplicationPublicForm
                            token={token}
                            initialData={data}
                            onSuccess={() => setSuccess(true)}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
