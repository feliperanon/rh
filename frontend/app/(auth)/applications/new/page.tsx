"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Company, Sector, Candidate } from "@/types";
import { toast } from "sonner";
import { Check, Copy, MessageCircle, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MainLayout } from "@/components/layout/MainLayout";

export default function NewApplicationPage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);

    const [phone, setPhone] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [sectorId, setSectorId] = useState("");
    const [loading, setLoading] = useState(false);

    const [successData, setSuccessData] = useState<{
        protocol: string;
        link: string;
        whatsapp_link: string;
        id: string;
    } | null>(null);

    useEffect(() => {
        api.getCompanies().then(setCompanies).catch(console.error);
    }, []);

    useEffect(() => {
        if (companyId) {
            api.getSectors(companyId).then(setSectors).catch(console.error);
            setSectorId("");
        }
    }, [companyId]);

    const normalizePhone = (value: string) => value.replace(/\D/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !companyId || !sectorId) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        const normalizedPhone = normalizePhone(phone);
        if (normalizedPhone.length < 10) {
            toast.error("Telefone inválido");
            return;
        }

        setLoading(true);
        try {
            // Verifica se já existe cadastro com este telefone
            const candidates = await api.getCandidates({ search: normalizedPhone });
            const existing = candidates.find(
                (c: Candidate) => c.phone_normalizado === normalizedPhone || c.phone_normalizado.endsWith(normalizedPhone)
            );
            if (existing) {
                toast.info("Cadastro existente", {
                    description: "Redirecionando para os dados do candidato.",
                });
                router.push(`/candidates/${existing.id}?existent=1`);
                return;
            }

            const result = await api.createApplication({
                phone: normalizedPhone,
                company_id: companyId,
                sector_id: sectorId,
            });

            setSuccessData({
                protocol: result.protocol,
                link: result.cadastro_link,
                whatsapp_link: result.whatsapp_link,
                id: result.id,
            });
            toast.success("Pré-cadastro criado com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao criar pré-cadastro", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = async () => {
        if (!successData?.whatsapp_link) return;

        window.open(successData.whatsapp_link, "_blank");

        try {
            await api.whatsappOpened(successData.id);
        } catch (e) {
            console.error("Failed to register whatsapp open event", e);
        }
    };

    const handleMarkSent = async () => {
        if (!successData) return;
        try {
            await api.markSent(successData.id);
            toast.success("Marcado como enviado!");
            router.push("/applications");
        } catch (e: any) {
            toast.error("Erro ao marcar como enviado", { description: e.message });
        }
    };

    const handleCopyMessage = () => {
        if (!successData) return;
        const message = `Olá! 😊 Tudo bem?\nPara concluir seu cadastro no processo seletivo, preencha este link: ${successData.link}\nProtocolo: ${successData.protocol}\nObrigado!`;
        navigator.clipboard.writeText(message);
        toast.success("Mensagem copiada!");
    };

    const actions = useMemo(() => (
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
        </Button>
    ), [router]);

    return (
        <MainLayout title="Novo Pré-cadastro" description="Gere protocolos e encaminhe o WhatsApp rapidamente." actions={actions}>
            <div className="space-y-6 max-w-2xl">
                <Card className="glass-panel border border-white/5">
                    <CardHeader>
                        <CardTitle>Dados Iniciais</CardTitle>
                        <CardDescription>
                            Informe o telefone do candidato e a vaga para gerar o link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                                <Input
                                    id="phone"
                                    placeholder="(11) 99999-9999"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Empresa</Label>
                                <Select value={companyId} onValueChange={setCompanyId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a empresa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.nome_interno}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Setor / Vaga</Label>
                                <Select value={sectorId} onValueChange={setSectorId} disabled={!companyId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o setor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectors.map((sector) => (
                                            <SelectItem key={sector.id} value={sector.id}>
                                                {sector.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Gerando..." : "Gerar Link de Cadastro"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Dialog open={!!successData} onOpenChange={(open) => !open && router.push("/applications")}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Pré-cadastro Criado!</DialogTitle>
                            <DialogDescription>
                                Protocolo: <span className="font-mono font-bold text-primary">{successData?.protocol}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 py-4">
                            <div className="p-4 bg-muted rounded-md text-sm break-all font-mono">
                                {successData?.link}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button onClick={handleWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <MessageCircle className="mr-2 h-4 w-4" /> Abrir WhatsApp
                                </Button>
                                <Button variant="outline" onClick={handleCopyMessage} className="w-full">
                                    <Copy className="mr-2 h-4 w-4" /> Copiar Msg
                                </Button>
                            </div>

                            <Button onClick={handleMarkSent} variant="secondary" className="w-full">
                                <Check className="mr-2 h-4 w-4" /> Marcar como Enviado
                            </Button>
                        </div>

                        <DialogFooter className="sm:justify-start">
                            <Button type="button" variant="link" onClick={() => router.push("/applications")}>
                                Fechar e voltar para lista
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
