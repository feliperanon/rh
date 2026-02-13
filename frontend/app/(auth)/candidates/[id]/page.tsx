"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInputBR } from "@/components/ui/CurrencyInputBR";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { Candidate, Application, ApplicationStatus } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, UserCheck, Building2, Briefcase, ChevronRight, Pencil } from "lucide-react";
import { format, isValid } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";

const EDUCATION_OPTIONS = [
    { value: "FUNDAMENTAL", label: "Ensino Fundamental" },
    { value: "MEDIO", label: "Ensino Médio" },
    { value: "SUPERIOR", label: "Ensino Superior" },
    { value: "POS_GRADUACAO", label: "Pós-Graduação" },
];

const STATUS_LABELS: Record<string, string> = {
    PRE_CADASTRO: "Pré-cadastro",
    LINK_GERADO: "Link gerado",
    WHATSAPP_ABERTO: "WhatsApp aberto",
    LINK_ENVIADO: "Link enviado",
    CADASTRO_PREENCHIDO: "Cadastro preenchido",
    EM_CONTATO: "Em contato",
    ENTREVISTA_MARCADA: "Entrevista marcada",
    ENCAMINHADO: "Encaminhado",
    APROVADO: "Aprovado",
    REPROVADO: "Reprovado",
    DESISTIU: "Desistiu",
};

export default function CandidateDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isExistentRedirect = searchParams.get("existent") === "1";

    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        cpf: "",
        birth_date: "",
        education: "",
        vt_value_cents: "",
        schedule_prefs: [] as string[],
        worked_here_before: false,
    });

    const fetchCandidate = async () => {
        try {
            const data = await api.getCandidate(params.id as string);
            setCandidate(data);
            setApplications(data.applications || []);
            setFormData({
                name: data.name || "",
                cpf: data.cpf || "",
                birth_date:
                    data.birth_date && isValid(new Date(data.birth_date))
                        ? format(new Date(data.birth_date), "yyyy-MM-dd")
                        : "",
                education: (data as { education?: string }).education || "",
                vt_value_cents:
                    (data as { vt_value_cents?: number }).vt_value_cents != null
                        ? String((data as { vt_value_cents?: number }).vt_value_cents! / 100)
                        : "",
                schedule_prefs: (data as { schedule_prefs?: string[] }).schedule_prefs || [],
                worked_here_before: !!(data as { worked_here_before?: boolean }).worked_here_before,
            });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar candidato");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchCandidate();
    }, [params.id]);

    const formatDate = (value?: string | Date) => {
        if (!value) return "—";
        const d = typeof value === "string" ? new Date(value) : value;
        return isValid(d) ? format(d, "dd/MM/yyyy") : "—";
    };

    const formatPhone = (phone: string) => {
        const d = phone.replace(/\D/g, "");
        if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        return phone;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidate) return;
        try {
            await api.updateCandidate(candidate.id, {
                name: formData.name || undefined,
                cpf: formData.cpf || undefined,
                birth_date: formData.birth_date || undefined,
                education: formData.education || undefined,
                vt_value_cents: formData.vt_value_cents
                    ? Math.round(parseFloat(formData.vt_value_cents) * 100)
                    : undefined,
                schedule_prefs: formData.schedule_prefs.length ? formData.schedule_prefs : undefined,
                worked_here_before: formData.worked_here_before,
            });
            toast.success("Dados atualizados");
            setEditOpen(false);
            fetchCandidate();
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar");
        }
    };

    const getStatusColor = (status: string) => {
        if (status === ApplicationStatus.APROVADO) return "bg-emerald-500/20 text-emerald-400";
        if (status === ApplicationStatus.REPROVADO || status === ApplicationStatus.DESISTIU)
            return "bg-slate-700/50 text-slate-500";
        return "bg-slate-700/50 text-slate-400";
    };

    if (loading) {
        return (
            <MainLayout title="Candidato" description="">
                <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                    Carregando…
                </div>
            </MainLayout>
        );
    }

    if (!candidate) {
        return (
            <MainLayout title="Candidato" description="">
                <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                    Candidato não encontrado.
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout
            title={candidate.name || "Candidato"}
            description={formatPhone(candidate.phone_normalizado)}
            actions={
                <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            }
        >
            <div className="space-y-6 max-w-3xl">
                {isExistentRedirect && (
                    <div
                        className="flex items-center gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200"
                        role="alert"
                    >
                        <UserCheck className="h-5 w-5 shrink-0 text-amber-500" />
                        <div>
                            <p className="font-medium">Cadastro existente</p>
                            <p className="text-sm text-amber-200/90">
                                Este telefone já possui cadastro. Aqui estão os dados e processos.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        size="sm"
                        className="bg-white text-slate-900 hover:bg-slate-100"
                        onClick={() =>
                            window.open(
                                `https://wa.me/55${candidate.phone_normalizado.replace(/\D/g, "")}`,
                                "_blank"
                            )
                        }
                    >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                    </Button>
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                            >
                                <Pencil className="h-4 w-4" />
                                Editar dados
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Editar dados do candidato</DialogTitle>
                                <DialogDescription>
                                    Atualize as informações pessoais e preferências.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Nome</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                        className="border-slate-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">CPF</Label>
                                    <Input
                                        value={formData.cpf}
                                        onChange={(e) => setFormData((p) => ({ ...p, cpf: e.target.value }))}
                                        className="border-slate-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Data de nascimento</Label>
                                    <Input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData((p) => ({ ...p, birth_date: e.target.value }))}
                                        className="border-slate-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Escolaridade</Label>
                                    <Select
                                        value={formData.education}
                                        onValueChange={(v) => setFormData((p) => ({ ...p, education: v }))}
                                    >
                                        <SelectTrigger className="border-slate-300">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EDUCATION_OPTIONS.map((o) => (
                                                <SelectItem key={o.value} value={o.value}>
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Valor VT (R$)</Label>
                                    <CurrencyInputBR
                                        placeholder="0,00"
                                        value={formData.vt_value_cents === "" ? 0 : parseFloat(String(formData.vt_value_cents)) || 0}
                                        onChange={(n) =>
                                            setFormData((p) => ({ ...p, vt_value_cents: n === 0 ? "" : String(n) }))
                                        }
                                        className="border-slate-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Preferência de horário</Label>
                                    <div className="flex gap-2">
                                        {(["MANHA", "TARDE", "NOITE"] as const).map((opt) => (
                                            <Button
                                                key={opt}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    formData.schedule_prefs.includes(opt)
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className={
                                                    formData.schedule_prefs.includes(opt)
                                                        ? ""
                                                        : "border-slate-300"
                                                }
                                                onClick={() =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        schedule_prefs: p.schedule_prefs.includes(opt)
                                                            ? p.schedule_prefs.filter((x) => x !== opt)
                                                            : [...p.schedule_prefs, opt],
                                                    }))
                                                }
                                            >
                                                {opt === "MANHA" ? "Manhã" : opt === "TARDE" ? "Tarde" : "Noite"}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="worked"
                                        checked={formData.worked_here_before}
                                        onCheckedChange={(v) =>
                                            setFormData((p) => ({ ...p, worked_here_before: !!v }))
                                        }
                                    />
                                    <Label htmlFor="worked" className="text-slate-700">
                                        Já trabalhou nesta empresa?
                                    </Label>
                                </div>
                                <Button type="submit" className="w-full">
                                    Salvar
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-medium text-slate-400">Processos participados</h2>
                    <div className="space-y-2">
                        {applications.length === 0 ? (
                            <p className="rounded-lg border border-slate-800/80 bg-slate-900/30 px-4 py-6 text-center text-sm text-slate-500">
                                Nenhum processo cadastrado.
                            </p>
                        ) : (
                            applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/30 px-4 py-3 transition-colors hover:bg-slate-800/40"
                                    onClick={() => router.push(`/applications/${app.id}`)}
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs text-slate-500">
                                                {(app as { protocol?: string }).protocol ?? "—"}
                                            </span>
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(
                                                    app.status
                                                )}`}
                                            >
                                                {STATUS_LABELS[app.status] ?? app.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                                            <span className="flex items-center gap-1.5 text-slate-300">
                                                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                                                {app.company?.nome_interno ?? "—"}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-300">
                                                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                                                {app.sector?.nome ?? "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="text-xs text-slate-500">
                                            {formatDate(
                                                (app as { createdAt?: string }).createdAt ??
                                                    (app as { created_at?: string }).created_at
                                            )}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-slate-500" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className=" rounded-xl border border-slate-800/80 bg-slate-900/30 px-4 py-3">
                    <h3 className="mb-2 text-xs font-medium text-slate-500">Resumo</h3>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                            <span className="text-slate-500">Nome:</span>{" "}
                            <span className="text-slate-300">{candidate.name || "—"}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">CPF:</span>{" "}
                            <span className="text-slate-300">{candidate.cpf || "—"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
