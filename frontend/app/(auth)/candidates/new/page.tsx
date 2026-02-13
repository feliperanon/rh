"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { toast } from "sonner";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewCandidatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length < 10) {
            toast.error("Informe um telefone válido (DDD + número).");
            return;
        }
        setLoading(true);
        try {
            const created = await api.createCandidate({
                phone: phoneDigits,
                name: name.trim() || undefined,
            });
            toast.success("Candidato cadastrado.");
            router.push(`/candidates/${created.id}`);
        } catch (err: any) {
            const msg = err?.message || err?.data?.message || "Erro ao cadastrar.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout
            title="Cadastrar candidato"
            description="Cadastro manual de candidato (telefone obrigatório)."
        >
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/candidates">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <span className="app-text-muted text-sm">Voltar para Candidatos</span>
                </div>

                <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border app-border-color bg-[hsl(var(--app-card-bg))] p-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="app-text">Telefone *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Ex: (31) 99409-7893"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="app-border-color bg-[hsl(var(--app-input-bg))] app-text"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="app-text">Nome</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Nome do candidato (opcional)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="app-border-color bg-[hsl(var(--app-input-bg))] app-text"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={loading} className="btn-primary">
                            <UserPlus className="h-4 w-4" />
                            Cadastrar
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/candidates">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
