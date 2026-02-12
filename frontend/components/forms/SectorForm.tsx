"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useState } from "react";
import { Sector } from "@/types";

const formSchema = z.object({
    nome: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    ativo: z.boolean().default(true),
    company_id: z.string().min(1, {
        message: "Empresa é obrigatória",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface SectorFormProps {
    sector?: Sector; // For editing
    companyId: string; // Required for creating new sector
    onSuccess: () => void;
}

export function SectorForm({ sector, companyId, onSuccess }: SectorFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            nome: sector?.nome || "",
            ativo: sector?.ativo ?? true,
            company_id: sector?.company_id || companyId,
        } as any,
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            if (sector) {
                toast.error("Edição ainda não implementada no API client");
            } else {
                await api.createSector(values);
                toast.success("Setor criado com sucesso!");
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar setor", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Setor/Vaga</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Produção, Administrativo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                            <div className="space-y-0.5">
                                <FormLabel className="text-slate-700">Ativo</FormLabel>
                                <FormDescription className="text-slate-500">
                                    Disponível para seleção
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : (sector ? "Atualizar" : "Criar")}
                </Button>
            </form>
        </Form>
    );
}
