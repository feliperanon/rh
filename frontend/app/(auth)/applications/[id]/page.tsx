"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Application } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ApplicationDetailsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const didAutoOpenWhatsApp = useRef(false);
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [whatsappDialog, setWhatsappDialog] = useState<{
        open: boolean;
        message: string;
        phone_e164: string;
    } | null>(null);
    const [whatsappLinkLoading, setWhatsappLinkLoading] = useState(false);

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

    // Abrir automaticamente o diálogo de edição do WhatsApp quando a URL tiver ?openWhatsApp=1
    useEffect(() => {
        if (
            searchParams.get("openWhatsApp") !== "1" ||
            !application ||
            didAutoOpenWhatsApp.current
        ) return;

        didAutoOpenWhatsApp.current = true;
        setWhatsappLinkLoading(true);
        api.refreshInviteLink(application.id)
            .then((res) => {
                const message = res.message ?? res.whatsapp_link ?? "";
                const phone_e164 = res.phone_e164 ?? "";
                if (!phone_e164) {
                    toast.error("Telefone não disponível para WhatsApp");
                    return;
                }
                setWhatsappDialog({
                    open: true,
                    message: typeof message === "string" ? message : "",
                    phone_e164,
                });
            })
            .catch((e) => {
                console.error(e);
                toast.error("Erro ao gerar link do WhatsApp");
            })
            .finally(() => setWhatsappLinkLoading(false));
    }, [application, searchParams]);

    const handleOpenWhatsAppDialog = async () => {
        if (!application) return;
        setWhatsappLinkLoading(true);
        try {
            const res = await api.refreshInviteLink(application.id);
            const message = res.message ?? res.whatsapp_link;
            const phone_e164 = res.phone_e164 ?? "";
            if (!phone_e164) {
                toast.error("Telefone não disponível para WhatsApp");
                return;
            }
            setWhatsappDialog({
                open: true,
                message: typeof message === "string" ? message : "",
                phone_e164,
            });
        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar link do WhatsApp");
        } finally {
            setWhatsappLinkLoading(false);
        }
    };

    const handleWhatsAppOpen = async () => {
        if (!application || !whatsappDialog) return;
        const text = whatsappDialog.message.trim();
        const link = `https://wa.me/${whatsappDialog.phone_e164}?text=${encodeURIComponent(text)}`;
        window.open(link, "_blank");
        try {
            await api.whatsappOpened(application.id);
        } catch (e) {
            console.error("Falha ao registrar abertura do WhatsApp", e);
        }
        setWhatsappDialog(null);
        fetchApplication();
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
            <ArrowLeft className="h-4 w-4 app-text" />
        </Button>
    ), [router]);

    if (loading) return <div className="flex h-60 items-center justify-center">Carregando...</div>;
    if (!application) return <div className="flex h-60 items-center justify-center">Candidatura não encontrada</div>;

    return (
        <MainLayout title="Detalhes da Candidatura" description="Controle o protocolo, status e ações rápidas" actions={actions}>
            <div className="space-y-6 max-w-4xl">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="glass-panel app-border-color">
                        <CardHeader>
                            <CardTitle className="app-text">Candidato</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium app-text-muted">Nome</p>
                                <p className="text-lg app-text">{application.candidate.name || "Não informado"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium app-text-muted">Telefone</p>
                                <p className="text-lg font-mono app-text">{application.candidate.phone_normalizado}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium app-text-muted">Protocolo</p>
                                <p className="text-lg font-mono font-bold app-text">{application.protocol}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium app-text-muted">CPF</p>
                                <p className="app-text">{application.candidate.cpf || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium app-text-muted">Data de nascimento</p>
                                <p className="app-text">
                                    {application.candidate.birth_date
                                        ? format(new Date(application.candidate.birth_date), "dd/MM/yyyy")
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium app-text-muted">Já trabalhou na empresa?</p>
                                <p className="app-text">
                                    {application.candidate.worked_here_before === true
                                        ? "Sim"
                                        : application.candidate.worked_here_before === false
                                            ? "Não"
                                            : "-"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel app-border-color">
                        <CardHeader>
                            <CardTitle className="app-text">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium app-text-muted">Vaga</p>
                                <p className="app-text">{application.company.nome_interno} - {application.sector.nome}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium app-text-muted">Status</p>
                                <Badge className="mt-1">{application.status}</Badge>
                            </div>

                            <div className="flex flex-col gap-2 pt-4">
                                <Button onClick={handleOpenWhatsAppDialog} disabled={whatsappLinkLoading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <MessageCircle className="mr-2 h-4 w-4" /> {whatsappLinkLoading ? "Gerando link..." : "WhatsApp"}
                                </Button>
                                <Button onClick={handleMarkSent} variant="secondary" className="w-full">
                                    <Check className="mr-2 h-4 w-4" /> Marcar Enviado
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={!!whatsappDialog} onOpenChange={(open) => !open && setWhatsappDialog(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Enviar mensagem no WhatsApp</DialogTitle>
                            <DialogDescription>
                                Edite a mensagem abaixo se quiser. O link de cadastro e o protocolo já estão incluídos.
                            </DialogDescription>
                        </DialogHeader>
                        {whatsappDialog && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="app-text-muted">Mensagem (editável)</Label>
                                    <textarea
                                        className="flex min-h-[140px] w-full rounded-md border px-3 py-2 text-sm app-text placeholder:app-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring app-border-color bg-[hsl(var(--app-input-bg))]"
                                        value={whatsappDialog.message}
                                        onChange={(e) => setWhatsappDialog({ ...whatsappDialog, message: e.target.value })}
                                        placeholder="Mensagem que o candidato verá"
                                    />
                                </div>
                                <DialogFooter className="sm:justify-end">
                                    <Button type="button" variant="outline" onClick={() => setWhatsappDialog(null)}>
                                        Cancelar
                                    </Button>
                                    <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handleWhatsAppOpen}>
                                        <MessageCircle className="mr-2 h-4 w-4" /> Abrir WhatsApp
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
