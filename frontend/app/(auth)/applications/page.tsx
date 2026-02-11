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
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Application } from "@/types";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExportButton } from "@/components/ExportButton";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await api.getApplications();
            setApplications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PRE_CADASTRO": return <Badge variant="secondary">Pré-Cadastro</Badge>;
            case "LINK_ENVIADO": return <Badge className="bg-blue-500">Link Enviado</Badge>;
            case "CADASTRO_PREENCHIDO": return <Badge className="bg-green-500">Preenchido</Badge>;
            case "EM_CONTATO": return <Badge className="bg-yellow-500">Em Contato</Badge>;
            case "APROVADO": return <Badge className="bg-green-700">Aprovado</Badge>;
            case "REPROVADO": return <Badge variant="destructive">Reprovado</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Candidaturas</h1>
                <Button onClick={() => router.push("/applications/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Candidatura
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Protocolo</TableHead>
                            <TableHead>Candidato</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">
                                    Nenhuma candidatura encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-mono text-sm">{app.protocol}</TableCell>
                                    <TableCell>{app.candidate?.name || "-"}</TableCell>
                                    <TableCell>{app.candidate?.phone_normalizado}</TableCell>
                                    <TableCell>{app.company?.nome_interno}</TableCell>
                                    <TableCell>{app.sector?.nome}</TableCell>
                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(app.createdAt), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => router.push(`/applications/${app.id}`)}>
                                            Ver
                                        </Button>
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
