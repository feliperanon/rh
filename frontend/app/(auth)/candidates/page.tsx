"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, User, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Candidate } from "@/types";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { toast } from "sonner";
import { format, isValid } from "date-fns";

const EDUCATION_LABELS: Record<string, string> = {
    FUNDAMENTAL: "Ensino Fundamental",
    MEDIO: "Ensino Médio",
    SUPERIOR: "Ensino Superior",
    POS_GRADUACAO: "Pós-Graduação",
};

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [search, setSearch] = useState("");
    const [protocolSearch, setProtocolSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const data = await api.getCandidates({
                search: search.trim() || undefined,
                protocol: protocolSearch.trim() || undefined,
            });
            setCandidates(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar candidatos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCandidates();
    };

    const handleDelete = async (candidateId: string) => {
        if (!window.confirm("Deseja apagar este candidato e todos os dados relacionados?")) return;

        try {
            await api.deleteCandidate(candidateId);
            toast.success("Candidato removido");
            fetchCandidates();
        } catch (error: any) {
            toast.error(error.message || "Erro ao remover candidato");
        }
    };

    const formatPhone = (phone: string) => {
        const d = phone.replace(/\D/g, "");
        if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        return phone;
    };

    const formatBirthDate = (date?: string | null) => {
        if (!date) return "—";
        const d = new Date(date);
        return isValid(d) ? format(d, "dd/MM/yyyy") : "—";
    };

    const getAge = (birthDate?: string | null): string => {
        if (!birthDate) return "—";
        const d = new Date(birthDate);
        if (!isValid(d)) return "—";
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age >= 0 ? `${age} anos` : "—";
    };

    return (
        <MainLayout
            title="Candidatos"
            description="Busque por nome, CPF, telefone ou protocolo."
        >
            <div className="space-y-4">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                        <Input
                            type="text"
                            placeholder="Nome, CPF ou telefone"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 flex-1 app-border-color bg-[hsl(var(--app-input-bg))] app-text placeholder:app-text-muted"
                        />
                        <Input
                            type="text"
                            placeholder="Protocolo (RH-...)"
                            value={protocolSearch}
                            onChange={(e) => setProtocolSearch(e.target.value)}
                            className="h-9 flex-1 app-border-color bg-[hsl(var(--app-input-bg))] app-text placeholder:app-text-muted"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={loading}
                        className="h-9 shrink-0 btn-primary"
                    >
                        <Search className="h-4 w-4" />
                        Buscar
                    </Button>
                </form>

                <div className="rounded-xl border app-border-color glass-panel overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="app-border-color border-b-2 bg-[hsl(214_32%_96%)] hover:bg-[hsl(214_32%_96%)]">
                                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider app-text">
                                    Nome
                                </TableHead>
                                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider app-text">
                                    Telefone
                                </TableHead>
                                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider app-text">
                                    Escolaridade
                                </TableHead>
                                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider app-text">
                                    Data nasc.
                                </TableHead>
                                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider app-text">
                                    Idade
                                </TableHead>
                                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider app-text">
                                    Processos
                                </TableHead>
                                <TableHead className="h-11 w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="app-border-color">
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center text-sm app-text-muted"
                                    >
                                        Carregando…
                                    </TableCell>
                                </TableRow>
                            ) : candidates.length === 0 ? (
                                <TableRow className="app-border-color">
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center text-sm app-text-muted"
                                    >
                                        Nenhum candidato encontrado. Use a busca acima.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                candidates.map((candidate) => (
                                    <TableRow
                                        key={candidate.id}
                                        className="group cursor-pointer app-border-color app-text transition-colors hover:bg-[hsl(214_32%_97%)]"
                                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--app-primary))] text-white">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span className="app-text">{candidate.name || "Sem nome"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm app-text">
                                            {formatPhone(candidate.phone_normalizado)}
                                        </TableCell>
                                        <TableCell className="text-sm app-text-muted">
                                            {EDUCATION_LABELS[candidate.education ?? ""] ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-sm app-text-muted">
                                            {formatBirthDate(candidate.birth_date)}
                                        </TableCell>
                                        <TableCell className="text-sm app-text-muted">
                                            {getAge(candidate.birth_date)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md border border-[hsl(var(--app-border))] bg-[hsl(214_32%_98%)] px-2 py-0.5 text-xs font-medium app-text">
                                                {candidate._count?.applications ?? 0} processo(s)
                                            </span>
                                        </TableCell>
                                        <TableCell
                                            className="w-[60px]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 app-text-muted hover:bg-[hsl(214_32%_94%)] hover:text-[hsl(var(--app-text))]"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.push(`/candidates/${candidate.id}`)
                                                        }
                                                    >
                                                        <User className="mr-2 h-4 w-4" />
                                                        Ver detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-400 focus:text-red-400"
                                                        onClick={() => handleDelete(candidate.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
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
