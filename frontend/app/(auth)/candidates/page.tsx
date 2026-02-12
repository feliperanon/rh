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

    const formatCPF = (cpf?: string) => {
        if (!cpf) return "—";
        const d = cpf.replace(/\D/g, "");
        if (d.length !== 11) return cpf;
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
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
                            className="h-9 flex-1 border-slate-700 bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                        />
                        <Input
                            type="text"
                            placeholder="Protocolo (RH-...)"
                            value={protocolSearch}
                            onChange={(e) => setProtocolSearch(e.target.value)}
                            className="h-9 flex-1 border-slate-700 bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={loading}
                        className="h-9 shrink-0 bg-white text-slate-900 hover:bg-slate-100"
                    >
                        <Search className="h-4 w-4" />
                        Buscar
                    </Button>
                </form>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/30">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800/80 hover:bg-transparent">
                                <TableHead className="h-11 text-xs font-medium text-slate-400">
                                    Nome
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium text-slate-400">
                                    Telefone
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium text-slate-400">
                                    CPF
                                </TableHead>
                                <TableHead className="h-11 text-xs font-medium text-slate-400">
                                    Processos
                                </TableHead>
                                <TableHead className="h-11 w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="border-slate-800/80">
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-sm text-slate-500"
                                    >
                                        Carregando…
                                    </TableCell>
                                </TableRow>
                            ) : candidates.length === 0 ? (
                                <TableRow className="border-slate-800/80">
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-sm text-slate-500"
                                    >
                                        Nenhum candidato encontrado. Use a busca acima.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                candidates.map((candidate) => (
                                    <TableRow
                                        key={candidate.id}
                                        className="group cursor-pointer border-slate-800/80 text-slate-200 transition-colors hover:bg-slate-800/30"
                                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                </div>
                                                {candidate.name || "Sem nome"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {formatPhone(candidate.phone_normalizado)}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {formatCPF(candidate.cpf)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
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
                                                        className="h-8 w-8 text-slate-500 opacity-60 hover:opacity-100"
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
