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
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/applications")}>
                Ver candidaturas
            </Button>
            <Button onClick={() => router.push("/applications/new")}>
                <Send className="mr-2 h-4 w-4" />
                Nova Candidatura
            </Button>
        </div>
    );

    return (
        <MainLayout title="Dashboard" description="Visão geral do processo seletivo" actions={actions}>
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-panel border border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Aguardando Envio</CardTitle>
                            <Clock className="h-4 w-4 text-white/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.counts.aguardando_envio}</div>
                            <p className="text-xs text-white/60">Protocolos gerados, não enviados</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Aguardando Preenchimento</CardTitle>
                            <Send className="h-4 w-4 text-white/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.counts.aguardando_preenchimento}</div>
                            <p className="text-xs text-white/60">Links enviados</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Cadastros Completos</CardTitle>
                            <FileText className="h-4 w-4 text-white/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.counts.cadastro_completo}</div>
                            <p className="text-xs text-white/60">Prontos para triagem</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Candidatos</CardTitle>
                            <Users className="h-4 w-4 text-white/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.counts.total}</div>
                            <p className="text-xs text-white/60">Em todas as etapas</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 glass-panel border border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">Inscrições Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.recent.map((app: any) => (
                                    <div key={app.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none text-white">{app.candidate.name || "Pré-cadastro"}</p>
                                            <p className="text-sm text-white/60">
                                                {app.company.nome_interno} - {app.sector.nome}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{app.status}</Badge>
                                            <p className="text-xs text-white/60">{format(new Date(app.created_at), "dd/MM")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full mt-4" variant="outline" onClick={() => router.push('/applications')}>
                                Ver todas as inscrições <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 glass-panel border border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Button onClick={() => router.push('/applications/new')} className="w-full justify-start" size="lg">
                                <Send className="mr-2 h-4 w-4" /> Nova Candidatura
                            </Button>
                            <Button onClick={() => router.push('/candidates')} variant="outline" className="w-full justify-start" size="lg">
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
