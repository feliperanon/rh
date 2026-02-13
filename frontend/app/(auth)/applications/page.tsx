"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Trash2, Filter, ChevronRight, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Application, Company, Sector } from "@/types";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import { ExportButton } from "@/components/ExportButton";
import { MainLayout } from "@/components/layout/MainLayout";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ALL_VALUE = "__all__";

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: "PRE_CADASTRO", label: "Pré-cadastro" },
    { value: "LINK_GERADO", label: "Link gerado" },
    { value: "LINK_ENVIADO", label: "Link enviado" },
    { value: "CADASTRO_PREENCHIDO", label: "Cadastro preenchido" },
    { value: "EM_CONTATO", label: "Em contato" },
    { value: "ENTREVISTA_MARCADA", label: "Entrevista marcada" },
    { value: "ENCAMINHADO", label: "Encaminhado" },
    { value: "APROVADO", label: "Aprovado" },
    { value: "REPROVADO", label: "Reprovado" },
    { value: "DESISTIU", label: "Desistiu" },
];

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [filters, setFilters] = useState({
        status: ALL_VALUE,
        companyId: ALL_VALUE,
        sectorId: ALL_VALUE,
        startDate: "",
        endDate: "",
    });

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await api.getApplications({
                status: filters.status && filters.status !== ALL_VALUE ? filters.status : undefined,
                companyId: filters.companyId && filters.companyId !== ALL_VALUE ? filters.companyId : undefined,
                sectorId: filters.sectorId && filters.sectorId !== ALL_VALUE ? filters.sectorId : undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            });
            setApplications(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar candidaturas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.getCompanies().then(setCompanies).catch(console.error);
    }, []);

    useEffect(() => {
        if (filters.companyId && filters.companyId !== ALL_VALUE) {
            api.getSectors(filters.companyId).then(setSectors).catch(() => setSectors([]));
        } else {
            setSectors([]);
        }
    }, [filters.companyId]);

    useEffect(() => {
        fetchApplications();
    }, [filters.status, filters.companyId, filters.sectorId, filters.startDate, filters.endDate]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Excluir esta candidatura? O histórico será removido.")) return;
        try {
            await api.deleteApplication(id);
            toast.success("Candidatura excluída");
            fetchApplications();
        } catch (error: any) {
            toast.error(error.message || "Erro ao excluir");
        }
    };

    const getStatusBadge = (status: string) => {
        const style =
            status === "APROVADO"
                ? "bg-emerald-500/20 text-emerald-400"
                : status === "REPROVADO" || status === "DESISTIU"
                  ? "bg-[hsl(var(--app-border))] app-text-muted"
                  : "bg-[hsl(var(--app-border))] app-text-muted";
        const label = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
        return (
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${style}`}>{label}</span>
        );
    };

    const formatAppDate = (app: Application) => {
        const raw =
            (app as { createdAt?: string }).createdAt ??
            (app as { created_at?: string }).created_at;
        if (!raw) return "—";
        const d = new Date(raw);
        return isValid(d) ? format(d, "dd/MM/yyyy") : "—";
    };

    const hasActiveFilters =
        (filters.status && filters.status !== ALL_VALUE) ||
        (filters.companyId && filters.companyId !== ALL_VALUE) ||
        (filters.sectorId && filters.sectorId !== ALL_VALUE) ||
        filters.startDate ||
        filters.endDate;

    const clearFilters = () => {
        setFilters({
            status: ALL_VALUE,
            companyId: ALL_VALUE,
            sectorId: ALL_VALUE,
            startDate: "",
            endDate: "",
        });
    };

    const actions = useMemo(
        () => (
            <div className="flex flex-wrap items-center gap-2">
                <ExportButton
                    filters={{
                        status: filters.status && filters.status !== ALL_VALUE ? filters.status : undefined,
                        companyId: filters.companyId && filters.companyId !== ALL_VALUE ? filters.companyId : undefined,
                        sectorId: filters.sectorId && filters.sectorId !== ALL_VALUE ? filters.sectorId : undefined,
                        startDate: filters.startDate || undefined,
                        endDate: filters.endDate || undefined,
                    }}
                />
                <Button
                    size="sm"
                    className="h-9 btn-primary"
                    onClick={() => router.push("/applications/new")}
                >
                    <Plus className="h-4 w-4" />
                    Nova Candidatura
                </Button>
            </div>
        ),
        [router, filters]
    );

    return (
        <MainLayout
            title="Candidaturas"
            description="Acompanhe cada candidatura e o status atual."
            actions={actions}
        >
            <div className="space-y-4">
                <div className="rounded-xl border app-border-color glass-panel p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-medium app-text-muted">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </h3>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="app-text-muted hover:text-[hsl(var(--app-text))]"
                                onClick={clearFilters}
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-1.5">
                            <Label className="text-xs app-text-muted">Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(v) => setFilters((p) => ({ ...p, status: v }))}
                            >
                                <SelectTrigger className="h-9 app-border-color bg-[hsl(var(--app-input-bg))]">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                                    {STATUS_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs app-text-muted">Empresa</Label>
                            <Select
                                value={filters.companyId}
                                onValueChange={(v) =>
                                    setFilters((p) => ({ ...p, companyId: v, sectorId: ALL_VALUE }))
                                }
                            >
                                <SelectTrigger className="h-9 app-border-color bg-[hsl(var(--app-input-bg))]">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>Todas</SelectItem>
                                    {companies.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.nome_interno}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs app-text-muted">Setor</Label>
                            <Select
                                value={filters.sectorId}
                                onValueChange={(v) => setFilters((p) => ({ ...p, sectorId: v }))}
                                disabled={!filters.companyId || filters.companyId === ALL_VALUE}
                            >
                                <SelectTrigger className="h-9 app-border-color bg-[hsl(var(--app-input-bg))]">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                                    {sectors.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs app-text-muted">Data inicial</Label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters((p) => ({ ...p, startDate: e.target.value }))
                                }
                                className="h-9 app-border-color bg-[hsl(var(--app-input-bg))]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs app-text-muted">Data final</Label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters((p) => ({ ...p, endDate: e.target.value }))
                                }
                                className="h-9 app-border-color bg-[hsl(var(--app-input-bg))]"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border app-border-color glass-panel">
                    <Table>
                        <TableHeader>
                            <TableRow className="app-border-color hover:bg-transparent">
                                <TableHead className="h-11 text-xs font-medium app-text-muted">
                                    Protocolo
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium app-text-muted">
                                    Candidato
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium app-text-muted">
                                    Telefone
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium app-text-muted">
                                    Empresa
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium app-text-muted">
                                    Setor
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium app-text-muted">
                                    Status
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium app-text-muted">
                                    Data
                                </TableHead>
                                <TableHead className="h-11 w-[70px] text-xs font-medium app-text-muted">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="app-border-color">
                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center text-sm app-text-muted"
                                    >
                                        Carregando…
                                    </TableCell>
                                </TableRow>
                            ) : applications.length === 0 ? (
                                <TableRow className="app-border-color">
                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center text-sm app-text-muted"
                                    >
                                        Nenhuma candidatura encontrada.
                                        {hasActiveFilters && " Tente ajustar os filtros."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map((app) => (
                                    <TableRow
                                        key={app.id}
                                        className="group cursor-pointer app-border-color app-text transition-colors hover:bg-[hsl(214_32%_94%)]"
                                        onClick={() => router.push(`/applications/${app.id}`)}
                                    >
                                        <TableCell className="font-mono text-sm">
                                            {(app as { protocol?: string }).protocol ?? "—"}
                                        </TableCell>
                                        <TableCell>{app.candidate?.name || "—"}</TableCell>
                                        <TableCell>{app.candidate?.phone_normalizado}</TableCell>
                                        <TableCell>{app.company?.nome_interno}</TableCell>
                                        <TableCell>{app.sector?.nome}</TableCell>
                                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                                        <TableCell className="text-sm app-text-muted">
                                            {formatAppDate(app)}
                                        </TableCell>
                                        <TableCell
                                            className="w-[70px]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 app-text-muted opacity-60 hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/applications/${app.id}`)}
                                                    >
                                                        <ChevronRight className="mr-2 h-4 w-4" />
                                                        Ver detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/applications/${app.id}?openWhatsApp=1`)}
                                                    >
                                                        <MessageCircle className="mr-2 h-4 w-4" />
                                                        Editar WhatsApp
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-400 focus:text-red-400"
                                                        onClick={() => handleDelete(app.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir candidatura
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </MainLayout>
    );
}
