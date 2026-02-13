"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { FileText, Send, CheckCircle2, Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ExportModal } from "@/components/ExportModal";
import { MainLayout } from "@/components/layout/MainLayout";

import { STATUS_LABELS } from "@/lib/status-labels";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        api.getDashboardStats()
            .then(setStats)
            .catch((err) => {
                console.error(err);
                toast.error("Erro ao carregar estatísticas");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-60 items-center justify-center">Carregando dashboard...</div>;
    if (!stats) return <div className="flex h-60 items-center justify-center">Erro ao carregar dados.</div>;

    const actions = (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="btn-outline-app"
                onClick={() => router.push("/applications")}
            >
                Ver candidaturas
            </Button>
            <Button
                size="sm"
                className="h-9 btn-primary"
                onClick={() => router.push("/applications/new")}
            >
                <Send className="h-4 w-4" />
                Nova Candidatura
            </Button>
        </div>
    );

    return (
        <MainLayout title="Dashboard" description="Visão geral do processo seletivo" actions={actions}>
            <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card
                        className="card-panel cursor-pointer rounded-xl transition-colors hover:bg-[hsl(214_32%_96%)]"
                        onClick={() => router.push("/applications")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Aguardando Envio</CardTitle>
                            <Clock className="h-4 w-4 app-text-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold app-text">{stats.counts.aguardando_envio}</div>
                            <p className="text-xs app-text-muted">Protocolos gerados</p>
                        </CardContent>
                    </Card>
                    <Card
                        className="card-panel cursor-pointer rounded-xl transition-colors hover:bg-[hsl(214_32%_96%)]"
                        onClick={() => router.push("/applications")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Aguardando Preenchimento</CardTitle>
                            <Send className="h-4 w-4 app-text-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold app-text">{stats.counts.aguardando_preenchimento}</div>
                            <p className="text-xs app-text-muted">Links enviados</p>
                        </CardContent>
                    </Card>
                    <Card
                        className="card-panel cursor-pointer rounded-xl transition-colors hover:bg-[hsl(214_32%_96%)]"
                        onClick={() => router.push("/applications")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Cadastros Completos</CardTitle>
                            <FileText className="h-4 w-4 app-text-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold app-text">{stats.counts.cadastro_completo}</div>
                            <p className="text-xs app-text-muted">Prontos para triagem</p>
                        </CardContent>
                    </Card>
                    <Card
                        className="card-panel cursor-pointer rounded-xl transition-colors hover:bg-[hsl(214_32%_96%)]"
                        onClick={() => router.push("/candidates")}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Total Candidatos</CardTitle>
                            <Users className="h-4 w-4 app-text-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold app-text">{stats.counts.total}</div>
                            <p className="text-xs app-text-muted">Em todas as etapas</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-7">
                    <Card className="card-panel rounded-xl lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium app-text">Inscrições Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.recent.map((app: any) => (
                                    <button
                                        key={app.id}
                                        type="button"
                                        onClick={() => router.push(`/applications/${app.id}`)}
                                        className="flex w-full cursor-pointer items-center justify-between rounded-lg border-b app-border-color pb-3 text-left transition-colors hover:bg-[hsl(214_32%_96%)] last:border-0 last:pb-0"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium app-text">
                                                {app.candidate.name || "Pré-cadastro"}
                                            </p>
                                            <p className="truncate text-xs app-text-muted">
                                                {app.company.nome_interno} · {app.sector.nome}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2 pl-3">
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs font-medium ${
                                                    app.status === "APROVADO"
                                                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                                        : app.status === "REPROVADO" || app.status === "DESISTIU"
                                                          ? "bg-rose-500/20 text-rose-700 dark:text-rose-400"
                                                          : app.status === "ENTREVISTA_MARCADA" || app.status === "ENCAMINHADO"
                                                            ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                                            : app.status === "LINK_ENVIADO" || app.status === "CADASTRO_PREENCHIDO" || app.status === "EM_CONTATO"
                                                              ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                                                              : app.status === "WHATSAPP_ABERTO"
                                                                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                                                : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                                                }`}
                                            >
                                                {STATUS_LABELS[app.status] ?? app.status}
                                            </span>
                                            <span className="text-xs app-text-muted">
                                                {format(new Date(app.created_at), "dd/MM")}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <Button
                                className="mt-4 w-full btn-outline-app"
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/applications")}
                            >
                                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="card-panel rounded-xl lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium app-text">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                size="sm"
                                className="w-full justify-start btn-primary"
                                onClick={() => router.push("/applications/new")}
                            >
                                <Send className="mr-2 h-4 w-4" /> Nova Candidatura
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full justify-start btn-outline-app"
                                onClick={() => router.push("/candidates")}
                            >
                                <Users className="mr-2 h-4 w-4" /> Buscar Candidato
                            </Button>
                            <ExportModal />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
