"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Application } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";

export default function ApplicationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchApplication = async () => {
        try {
            const data = await api.getApplication(params.id as string);
            setApplication(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar candidatura");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchApplication();
        }
    }, [params.id]);

    const handleWhatsApp = async () => {
        if (!application) return;

        try {
            const { whatsapp_link } = await api.refreshInviteLink(application.id);
            window.open(whatsapp_link, "_blank");
            await api.whatsappOpened(application.id);
            fetchApplication();
        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar link do WhatsApp");
        }
    };

    const handleMarkSent = async () => {
        if (!application) return;
        try {
            await api.markSent(application.id);
            toast.success("Marcado como enviado!");
            fetchApplication();
        } catch (e: any) {
            toast.error("Erro ao marcar", { description: e.message });
        }
    };

    const actions = useMemo(() => (
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4 text-white" />
        </Button>
    ), [router]);

    if (loading) return <div className="flex h-60 items-center justify-center">Carregando...</div>;
    if (!application) return <div className="flex h-60 items-center justify-center">Candidatura não encontrada</div>;

    return (
        <MainLayout title="Detalhes da Candidatura" description="Controle o protocolo, status e ações rápidas" actions={actions}>
            <div className="space-y-6 max-w-4xl">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="glass-panel border border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">Candidato</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-white/70">Nome</p>
                                <p className="text-lg text-white">{application.candidate.name || "Não informado"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/70">Telefone</p>
                                <p className="text-lg font-mono text-white">{application.candidate.phone_normalizado}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/70">Protocolo</p>
                                <p className="text-lg font-mono font-bold text-white">{application.protocol}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/70">CPF</p>
                                <p className="text-white">{application.candidate.cpf || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/70">Data de nascimento</p>
                                <p className="text-white">
                                    {application.candidate.birth_date
                                        ? format(new Date(application.candidate.birth_date), "dd/MM/yyyy")
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/70">Já trabalhou na empresa?</p>
                                <p className="text-white">
                                    {application.candidate.worked_here_before === true
                                        ? "Sim"
                                        : application.candidate.worked_here_before === false
                                            ? "Não"
                                            : "-"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-white/70">Vaga</p>
                                <p className="text-white">{application.company.nome_interno} - {application.sector.nome}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/70">Status</p>
                                <Badge className="mt-1">{application.status}</Badge>
                            </div>

                            <div className="flex flex-col gap-2 pt-4">
                                <Button onClick={handleWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                                </Button>
                                <Button onClick={handleMarkSent} variant="secondary" className="w-full">
                                    <Check className="mr-2 h-4 w-4" /> Marcar Enviado
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
