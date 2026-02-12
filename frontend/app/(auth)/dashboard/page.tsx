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
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => router.push("/applications")}
            >
                Ver candidaturas
            </Button>
            <Button
                size="sm"
                className="h-9 bg-white text-slate-900 hover:bg-slate-100"
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
                    <Card className="card-panel rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-400">Aguardando Envio</CardTitle>
                            <Clock className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-white">{stats.counts.aguardando_envio}</div>
                            <p className="text-xs text-slate-500">Protocolos gerados</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-400">Aguardando Preenchimento</CardTitle>
                            <Send className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-white">{stats.counts.aguardando_preenchimento}</div>
                            <p className="text-xs text-slate-500">Links enviados</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-400">Cadastros Completos</CardTitle>
                            <FileText className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-white">{stats.counts.cadastro_completo}</div>
                            <p className="text-xs text-slate-500">Prontos para triagem</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-400">Total Candidatos</CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-white">{stats.counts.total}</div>
                            <p className="text-xs text-slate-500">Em todas as etapas</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-7">
                    <Card className="card-panel rounded-xl lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-white">Inscrições Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.recent.map((app: any) => (
                                    <div
                                        key={app.id}
                                        className="flex items-center justify-between border-b border-slate-800/80 pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-200">
                                                {app.candidate.name || "Pré-cadastro"}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {app.company.nome_interno} · {app.sector.nome}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2 pl-3">
                                            <span className="rounded px-2 py-0.5 text-xs text-slate-400">
                                                {app.status}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {format(new Date(app.created_at), "dd/MM")}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                className="mt-4 w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
                            <CardTitle className="text-sm font-medium text-white">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                size="sm"
                                className="w-full justify-start bg-white text-slate-900 hover:bg-slate-100"
                                onClick={() => router.push("/applications/new")}
                            >
                                <Send className="mr-2 h-4 w-4" /> Nova Candidatura
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
