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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Company, Sector } from "@/types";
import { SectorForm } from "@/components/forms/SectorForm";
import { format, isValid } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";

const formatSectorDate = (value?: string | Date | null) => {
    if (value == null) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (!isValid(date)) return "—";
    return format(date, "dd/MM/yyyy");
};

export default function SectorsPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const data = await api.getCompanies();
                setCompanies(data);
                if (data.length > 0) {
                    setSelectedCompanyId(data[0].id);
                }
            } catch (error) {
                console.error(error);
            }
        };
        loadCompanies();
    }, []);

    useEffect(() => {
        if (!selectedCompanyId) return;

        const loadSectors = async () => {
            setLoading(true);
            try {
                const data = await api.getSectors(selectedCompanyId);
                setSectors(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadSectors();
    }, [selectedCompanyId]);

    const onSuccess = () => {
        setDialogOpen(false);
        if (selectedCompanyId) {
            api.getSectors(selectedCompanyId).then(setSectors);
        }
    };

    const headerActions = useMemo(() => (
        <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="h-9 w-[200px] border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800/50 sm:w-[220px]">
                    <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                    {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                            {company.nome_interno}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="sm"
                        disabled={!selectedCompanyId}
                        className="h-9 bg-white text-slate-900 hover:bg-slate-100"
                    >
                        <Plus className="h-4 w-4" />
                        Novo setor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Novo Setor</DialogTitle>
                        <DialogDescription>
                            Adicione um setor ou vaga para a empresa selecionada.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCompanyId && (
                        <SectorForm companyId={selectedCompanyId} onSuccess={onSuccess} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    ), [companies, dialogOpen, onSuccess, selectedCompanyId]);

    return (
        <MainLayout
            title="Setores"
            description="Vagas e sub-áreas por empresa."
            actions={headerActions}
        >
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/30">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800/80 hover:bg-transparent">
                            <TableHead className="h-11 text-xs font-medium text-slate-400">
                                Nome
                            </TableHead>
                            <TableHead className="h-11 text-xs font-medium text-slate-400">
                                Status
                            </TableHead>
                            <TableHead className="h-11 text-right text-xs font-medium text-slate-400">
                                Criado em
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow className="border-slate-800/80">
                                <TableCell
                                    colSpan={3}
                                    className="h-32 text-center text-sm text-slate-500"
                                >
                                    Carregando…
                                </TableCell>
                            </TableRow>
                        ) : sectors.length === 0 ? (
                            <TableRow className="border-slate-800/80">
                                <TableCell
                                    colSpan={3}
                                    className="h-32 text-center text-sm text-slate-500"
                                >
                                    Nenhum setor para esta empresa.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sectors.map((sector) => (
                                <TableRow
                                    key={sector.id}
                                    className="border-slate-800/80 text-slate-200 transition-colors hover:bg-slate-800/30"
                                >
                                    <TableCell className="font-medium">
                                        {sector.nome}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                                sector.ativo
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-slate-700/50 text-slate-500"
                                            }`}
                                        >
                                            {sector.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-slate-500">
                                        {formatSectorDate(
                                            sector.createdAt ??
                                            (sector as Sector & { created_at?: string }).created_at
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </MainLayout>
    );
}
