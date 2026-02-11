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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { Company } from "@/types";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { format } from "date-fns";

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const data = await api.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setOpen(true);
    };

    const handleCreate = () => {
        setSelectedCompany(undefined);
        setOpen(true);
    };

    const onSuccess = () => {
        setOpen(false);
        fetchCompanies();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Nova Empresa
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{selectedCompany ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
                            <DialogDescription>
                                Preencha os dados da empresa abaixo.
                            </DialogDescription>
                        </DialogHeader>
                        <CompanyForm company={selectedCompany} onSuccess={onSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome Interno</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sigilosa</TableHead>
                            <TableHead>Modo Recontratação</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Nenhuma empresa encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">
                                        {company.nome_interno}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={company.ativo ? "default" : "secondary"}>
                                            {company.ativo ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {company.sigilosa ? (
                                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">Sim</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Não</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {company.perguntar_recontratacao ? (
                                            company.modo_pergunta_recontratacao === "GENERICO" ? "Genérico" : "Com Nome"
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(company.createdAt), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(company)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
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
    );
}
