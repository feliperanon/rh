"use client";

import { useEffect, useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { MainLayout } from "@/components/layout/MainLayout";
import { api } from "@/lib/api";
import { Application, ApplicationStatus, Company, Sector } from "@/types";
import { STATUS_LABELS } from "@/lib/status-labels";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, User, Building2, Briefcase, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

const ALL_VALUE = "__all__";

/** Colunas do board: mesmo rótulo de STATUS_LABELS (Kanban = Avaliação = select de status). */
const COLUMNS = [
    { id: ApplicationStatus.CADASTRO_PREENCHIDO, color: "bg-blue-500" },
    { id: ApplicationStatus.EM_CONTATO, color: "bg-yellow-500" },
    { id: ApplicationStatus.ENTREVISTA_MARCADA, color: "bg-purple-500" },
    { id: ApplicationStatus.ENCAMINHADO, color: "bg-indigo-500" },
    { id: ApplicationStatus.APROVADO, color: "bg-emerald-500" },
    { id: ApplicationStatus.REPROVADO, color: "bg-rose-500" },
    { id: ApplicationStatus.DESISTIU, color: "bg-slate-500" },
];

export default function KanbanPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [filters, setFilters] = useState({
        companyId: ALL_VALUE,
        sectorId: ALL_VALUE,
    });

    const fetchInitialData = async () => {
        try {
            const co = await api.getCompanies();
            setCompanies(co);
            fetchApplications();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados iniciais");
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await api.getApplications({
                companyId: filters.companyId && filters.companyId !== ALL_VALUE ? filters.companyId : undefined,
                sectorId: filters.sectorId && filters.sectorId !== ALL_VALUE ? filters.sectorId : undefined,
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
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (filters.companyId && filters.companyId !== ALL_VALUE) {
            api.getSectors(filters.companyId).then(setSectors).catch(() => setSectors([]));
        } else {
            setSectors([]);
        }
        fetchApplications();
    }, [filters.companyId, filters.sectorId]);

    const boardData = useMemo(() => {
        const groups: Record<string, Application[]> = {};

        COLUMNS.forEach(col => {
            groups[col.id] = [];
        });

        applications.forEach(app => {
            const columnId = app.status as string;
            if (groups[columnId]) {
                groups[columnId].push(app);
            }
        });

        return groups;
    }, [applications]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const applicationId = draggableId;
        const newStatus = destination.droppableId as ApplicationStatus;

        // Atualização Otimista
        const oldApps = [...applications];
        setApplications(prev => prev.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
        ));

        try {
            await api.updateApplicationStatus(applicationId, newStatus);
            toast.success("Status atualizado!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar status");
            setApplications(oldApps); // Rollback
        }
    };

    return (
        <MainLayout
            title="Funil de Seleção"
            description="Arraste os candidatos para mudar o status do processo."
        >
            <div className="space-y-6">
                {/* Filtros */}
                <div className="rounded-xl border app-border-color glass-panel p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium app-text-muted">
                        <Filter className="h-4 w-4" /> Filtros do Board
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs app-text-muted">Empresa</Label>
                            <Select
                                value={filters.companyId}
                                onValueChange={(v) => setFilters(p => ({ ...p, companyId: v, sectorId: ALL_VALUE }))}
                            >
                                <SelectTrigger className="h-9 app-border-color bg-[hsl(var(--app-input-bg))]">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>Todas</SelectItem>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.nome_interno}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs app-text-muted">Setor</Label>
                            <Select
                                value={filters.sectorId}
                                onValueChange={(v) => setFilters(p => ({ ...p, sectorId: v }))}
                                disabled={!filters.companyId || filters.companyId === ALL_VALUE}
                            >
                                <SelectTrigger className="h-9 app-border-color bg-[hsl(var(--app-input-bg))]">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                                    {sectors.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Kanban Board — grid que quebra em várias linhas, sem scroll horizontal */}
                <div className="w-full">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                            {COLUMNS.map(column => (
                                <div key={column.id} className="flex min-w-0 flex-col">
                                    <div className="mb-3 flex items-center justify-between px-1">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <div className={`h-2 w-2 shrink-0 rounded-full ${column.color}`} />
                                            <h3 className="truncate text-sm font-semibold app-text">{STATUS_LABELS[column.id] ?? column.id}</h3>
                                            <span className="rounded bg-[hsl(var(--app-border))] px-1.5 py-0.5 text-xs app-text-muted shrink-0">
                                                {boardData[column.id]?.length || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`min-h-[320px] flex-1 rounded-xl border border-dashed p-2 transition-colors ${snapshot.isDraggingOver
                                                        ? "border-primary/50 bg-primary/5"
                                                        : "app-border-color opacity-90"
                                                    }`}
                                            >
                                                {boardData[column.id].map((app, index) => (
                                                    <Draggable key={app.id} draggableId={app.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`mb-3 select-none rounded-lg border app-border-color glass-panel p-3 shadow-sm transition-all hover:app-border-color ${snapshot.isDragging ? "rotate-2 scale-105 shadow-xl border-primary" : ""
                                                                    }`}
                                                                onClick={() => router.push(`/applications/${app.id}`)}
                                                            >
                                                                <div className="space-y-2">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <p className="font-medium app-text text-sm">
                                                                            {app.candidate.name || "Sem Nome"}
                                                                        </p>
                                                                        <span className="text-[10px] font-mono app-text-muted uppercase">
                                                                            {app.protocol}
                                                                        </span>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-1.5 text-xs app-text-muted">
                                                                            <Building2 className="h-3 w-3" />
                                                                            <span className="truncate">{app.company.nome_interno}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-xs app-text-muted">
                                                                            <Briefcase className="h-3 w-3" />
                                                                            <span className="truncate">{app.sector.nome}</span>
                                                                        </div>
                                                                        {app.candidate.phone_normalizado && (
                                                                            <div className="flex items-center gap-1.5 text-xs app-text-muted">
                                                                                <Phone className="h-3 w-3" />
                                                                                <span className="font-mono">{app.candidate.phone_normalizado}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>
        </MainLayout>
    );
}
