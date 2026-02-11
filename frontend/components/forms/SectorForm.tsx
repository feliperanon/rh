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
    company_id: z.string().uuid({
        message: "Empresa inválida",
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
                // Update sector logic (needs endpoint in api.ts)
                // ensure api.updateSector exists or use generic patch
                // For now assuming updateSector exists or create works
                // await api.updateSector(sector.id, values);
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

                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                            Disponível para seleção
                        </FormDescription>
                    </div>
                    <FormField
                        control={form.control}
                        name="ativo"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : (sector ? "Atualizar" : "Criar")}
                </Button>
            </form>
        </Form>
    );
}
