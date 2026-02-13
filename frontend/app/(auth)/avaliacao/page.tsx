"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    TrendingUp,
    TrendingDown,
    Users,
    CheckCircle2,
    XCircle,
    UserX,
    Target,
    Building2,
    UserCog,
    Filter,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
    PRE_CADASTRO: "Pré-cadastro",
    LINK_GERADO: "Link gerado",
    WHATSAPP_ABERTO: "WhatsApp aberto",
    LINK_ENVIADO: "Link enviado",
    CADASTRO_PREENCHIDO: "Cadastro preenchido",
    EM_CONTATO: "Em contato",
    ENTREVISTA_MARCADA: "Entrevista marcada",
    ENCAMINHADO: "Encaminhado",
    APROVADO: "Aprovado",
    REPROVADO: "Reprovado",
    DESISTIU: "Desistiu",
};

type AnalyticsData = {
    total: number;
    aprovado: number;
    reprovado: number;
    desistiu: number;
    finalizados: number;
    taxa_efetividade_percent: number;
    by_status: { status: string; total: number }[];
    by_company: { company_id: string; company_name: string; total: number }[];
    by_collaborator: { user_id: string; user_name: string; total: number }[];
    funnel: { status: string; total: number }[];
    etapa_mais_desistencias: string;
    etapa_mais_reprovacoes: string;
    total_desistencias: number;
    total_reprovacoes: number;
};

export default function AvaliacaoPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.getAnalytics({
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            });
            setData(res as AnalyticsData);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar indicadores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const applyFilter = () => fetchAnalytics();

    if (loading && !data) {
        return (
            <MainLayout title="Avaliação de Processos" description="Indicadores por colaborador, empresa e status">
                <div className="flex h-64 items-center justify-center app-text-muted">Carregando...</div>
            </MainLayout>
        );
    }

    if (!data) {
        return (
            <MainLayout title="Avaliação de Processos" description="Indicadores por colaborador, empresa e status">
                <div className="flex h-64 items-center justify-center app-text-muted">Nenhum dado disponível.</div>
            </MainLayout>
        );
    }

    const maxFunnel = Math.max(...data.funnel.map((f) => f.total), 1);

    return (
        <MainLayout
            title="Avaliação de Processos"
            description="Taxa de efetividade, funil desde o primeiro contato, desistências e reprovações por etapa."
        >
            <div className="space-y-8">
                {/* Filtro por período */}
                <Card className="card-panel app-border-color">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium app-text">
                            <Filter className="h-4 w-4" /> Período
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs app-text-muted">Data inicial</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 w-40 app-border-color bg-[hsl(var(--app-input-bg))]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs app-text-muted">Data final</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 w-40 app-border-color bg-[hsl(var(--app-input-bg))]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={applyFilter}
                            className="h-9 rounded-md bg-[hsl(var(--app-primary))] px-4 text-sm font-medium text-white hover:opacity-90"
                        >
                            Aplicar
                        </button>
                    </CardContent>
                </Card>

                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    <Card className="card-panel app-border-color">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Total</CardTitle>
                            <Users className="h-4 w-4 app-text-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold app-text">{data.total}</div>
                            <p className="text-xs app-text-muted">Inscrições no período</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel app-border-color">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Aprovados</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{data.aprovado}</div>
                            <p className="text-xs app-text-muted">Contratações</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel app-border-color">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Reprovados</CardTitle>
                            <XCircle className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{data.reprovado}</div>
                            <p className="text-xs app-text-muted">Não aprovados</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel app-border-color">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Desistências</CardTitle>
                            <UserX className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{data.desistiu}</div>
                            <p className="text-xs app-text-muted">Candidatos que desistiram</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel app-border-color">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Taxa de Efetividade</CardTitle>
                            <Target className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{data.taxa_efetividade_percent}%</div>
                            <p className="text-xs app-text-muted">Aprovados / finalizados</p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel app-border-color">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium app-text-muted">Finalizados</CardTitle>
                            <TrendingUp className="h-4 w-4 app-text-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold app-text">{data.finalizados}</div>
                            <p className="text-xs app-text-muted">Aprovado + Reprovado + Desistiu</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Destaques: etapas com mais desistências e reprovações */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="card-panel app-border-color border-amber-500/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium app-text">
                                <UserX className="h-4 w-4 text-amber-500" /> Desistências
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{data.total_desistencias}</p>
                            <p className="text-xs app-text-muted mt-1">
                                Status de encerramento: <strong>{STATUS_LABELS[data.etapa_mais_desistencias] ?? data.etapa_mais_desistencias}</strong>
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="card-panel app-border-color border-rose-500/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium app-text">
                                <XCircle className="h-4 w-4 text-rose-500" /> Reprovações
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{data.total_reprovacoes}</p>
                            <p className="text-xs app-text-muted mt-1">
                                Status de encerramento: <strong>{STATUS_LABELS[data.etapa_mais_reprovacoes] ?? data.etapa_mais_reprovacoes}</strong>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Funil desde o primeiro contato */}
                <Card className="card-panel app-border-color">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-medium app-text">
                            <TrendingDown className="h-4 w-4" /> Funil por etapa (desde o primeiro contato)
                        </CardTitle>
                        <p className="text-xs app-text-muted">Quantidade em cada etapa do processo</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.funnel.map((item) => (
                            <div key={item.status} className="flex items-center gap-3">
                                <span className="w-40 shrink-0 text-xs font-medium app-text">
                                    {STATUS_LABELS[item.status] ?? item.status}
                                </span>
                                <div className="flex-1 h-6 rounded-md bg-[hsl(var(--app-border))] overflow-hidden">
                                    <div
                                        className="h-full rounded-md bg-[hsl(var(--app-primary))] transition-all"
                                        style={{ width: `${(item.total / maxFunnel) * 100}%`, minWidth: item.total ? "4px" : 0 }}
                                    />
                                </div>
                                <span className="w-12 shrink-0 text-right text-sm font-medium app-text">{item.total}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Por status */}
                <Card className="card-panel app-border-color">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium app-text">Por status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="app-border-color hover:bg-transparent">
                                    <TableHead className="app-text-muted">Status</TableHead>
                                    <TableHead className="text-right app-text-muted">Quantidade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.by_status.map((row) => (
                                    <TableRow key={row.status} className="app-border-color">
                                        <TableCell className="font-medium app-text">
                                            {STATUS_LABELS[row.status] ?? row.status}
                                        </TableCell>
                                        <TableCell className="text-right app-text">{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Por empresa */}
                    <Card className="card-panel app-border-color">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium app-text">
                                <Building2 className="h-4 w-4" /> Por empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="app-border-color hover:bg-transparent">
                                        <TableHead className="app-text-muted">Empresa</TableHead>
                                        <TableHead className="text-right app-text-muted">Inscrições</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.by_company.length === 0 ? (
                                        <TableRow className="app-border-color">
                                            <TableCell colSpan={2} className="text-center text-sm app-text-muted">
                                                Nenhum dado no período
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.by_company.map((row) => (
                                            <TableRow key={row.company_id} className="app-border-color">
                                                <TableCell className="font-medium app-text">{row.company_name}</TableCell>
                                                <TableCell className="text-right app-text">{row.total}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Por colaborador */}
                    <Card className="card-panel app-border-color">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium app-text">
                                <UserCog className="h-4 w-4" /> Por colaborador
                            </CardTitle>
                            <p className="text-xs app-text-muted">Candidaturas em que o colaborador atuou (eventos registrados)</p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="app-border-color hover:bg-transparent">
                                        <TableHead className="app-text-muted">Colaborador</TableHead>
                                        <TableHead className="text-right app-text-muted">Candidaturas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.by_collaborator.length === 0 ? (
                                        <TableRow className="app-border-color">
                                            <TableCell colSpan={2} className="text-center text-sm app-text-muted">
                                                Nenhum dado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.by_collaborator.map((row) => (
                                            <TableRow key={row.user_id} className="app-border-color">
                                                <TableCell className="font-medium app-text">{row.user_name}</TableCell>
                                                <TableCell className="text-right app-text">{row.total}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
