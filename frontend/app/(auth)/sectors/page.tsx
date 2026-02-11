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
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";

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
        <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Selecione uma empresa" />
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
                    <Button disabled={!selectedCompanyId}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Setor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Novo Setor</DialogTitle>
                        <DialogDescription>
                            Adicione um setor ou vaga para a empresa selecionada.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCompanyId && <SectorForm companyId={selectedCompanyId} onSuccess={onSuccess} />}
                </DialogContent>
            </Dialog>
        </div>
    ), [companies, dialogOpen, onSuccess, selectedCompanyId]);

    return (
        <MainLayout
            title="Setores"
            description="Gerencie vagas e sub-áreas por empresa."
            actions={headerActions}
        >
            <div className="glass-panel border border-white/5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Criado em</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : sectors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    Nenhum setor encontrado para esta empresa.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sectors.map((sector) => (
                                <TableRow key={sector.id}>
                                    <TableCell className="font-medium">
                                        {sector.nome}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sector.ativo ? "default" : "secondary"}>
                                            {sector.ativo ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(sector.createdAt), "dd/MM/yyyy")}
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
