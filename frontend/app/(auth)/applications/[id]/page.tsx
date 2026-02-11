"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Application } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

            // Also mark as opened (redundant if refresh-link records it? 
            // but requirement says 'Ao clicar Abrir WhatsApp -> register WHATSAPP_ABERTO_PARA_ENVIO')
            // refresh-link records REENVIO_LINK.
            // Let's keep both for clarity or just rely on refresh-link?
            // The requirement says specifically WHATSAPP_ABERTO_PARA_ENVIO.
            // So we call it.
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

    if (loading) return <div>Carregando...</div>;
    if (!application) return <div>Candidatura não encontrada</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Detalhes</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Candidato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome</p>
                            <p className="text-lg">{application.candidate.name || "Não informado"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                            <p className="text-lg font-mono">{application.candidate.phone_normalizado}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Protocolo</p>
                            <p className="text-lg font-mono font-bold">{application.protocol}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">CPF</p>
                            <p>{application.candidate.cpf || "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Vaga</p>
                            <p>{application.company.nome_interno} - {application.sector.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge className="mt-1" variant="secondary">
                                {application.status}
                            </Badge>
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
    );
}
