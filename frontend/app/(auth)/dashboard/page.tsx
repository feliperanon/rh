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

    if (loading) return <div>Carregando dashboard...</div>;
    if (!stats) return <div>Erro ao carregar dados.</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Visão geral do processo seletivo.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aguardando Envio</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.aguardando_envio}</div>
                        <p className="text-xs text-muted-foreground">Protocolos gerados, não enviados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aguardando Preenchimento</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.aguardando_preenchimento}</div>
                        <p className="text-xs text-muted-foreground">Links enviados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cadastros Completos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.cadastro_completo}</div>
                        <p className="text-xs text-muted-foreground">Prontos para triagem</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Candidatos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.counts.total}</div>
                        <p className="text-xs text-muted-foreground">Em todas as etapas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Inscrições Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recent.map((app: any) => (
                                <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{app.candidate.name || "Pré-cadastro"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {app.company.nome_interno} - {app.sector.nome}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{app.status}</Badge>
                                        <p className="text-xs text-muted-foreground">{format(new Date(app.created_at), "dd/MM")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline" onClick={() => router.push('/applications')}>
                            Ver todas as inscrições <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
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
    );
}
