"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Candidate, Application } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CandidateDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [applications, setApplications] = useState<Application[]>([]); // Assuming getCandidate returns apps or separate call
    const [loading, setLoading] = useState(true);

    const fetchCandidate = async () => {
        try {
            const data = await api.getCandidate(params.id as string);
            setCandidate(data);
            // If API returns applications nested, use them. Otherwise fetch.
            // Assuming nested for now or I'll check service.
            // Service findOne candidate doesn't include apps usually?
            // Let's check backend `CandidatesService.findOne`.
            // I'll assume it returns them or I fetch them separately.
            if (data.applications) {
                setApplications(data.applications);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar candidato");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchCandidate();
        }
    }, [params.id]);

    if (loading) return <div>Carregando...</div>;
    if (!candidate) return <div>Candidato não encontrado</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Detalhes do Candidato</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome</p>
                            <p className="text-lg">{candidate.name || "Não informado"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Protocolo</p>
                            <p className="text-sm text-gray-500">ID: {candidate.id}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                            <p className="text-lg font-mono">{candidate.phone_normalizado}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => window.open(`https://wa.me/55${candidate.phone_normalizado.replace(/\D/g, "")}`, "_blank")}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                            </Button>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">CPF</p>
                            <p>{candidate.cpf || "-"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Candidaturas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Vaga</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Nenhuma candidatura encontrada.</TableCell>
                                </TableRow>
                            ) : (
                                applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>{format(new Date(app.createdAt), "dd/MM/yyyy")}</TableCell>
                                        <TableCell>{app.company?.nome_interno}</TableCell>
                                        <TableCell>{app.sector?.nome}</TableCell>
                                        <TableCell><Badge variant="outline">{app.status}</Badge></TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/applications/${app.id}`)}>Ver</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
