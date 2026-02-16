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

const scheduleEnum = z.enum(["MANHA", "TARDE", "NOITE"]);

const formSchema = z.object({
    nome: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    ativo: z.boolean().default(true),
    company_id: z.string().min(1, {
        message: "Empresa é obrigatória",
    }),
    schedule_prefs: z.array(scheduleEnum).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface SectorFormProps {
    sector?: Sector; // For editing
    companyId: string; // Required for creating new sector
    onSuccess: () => void;
}

const schedules = [
    { id: "MANHA" as const, label: "Manhã" },
    { id: "TARDE" as const, label: "Tarde" },
    { id: "NOITE" as const, label: "Noite" },
];

export function SectorForm({ sector, companyId, onSuccess }: SectorFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            nome: sector?.nome || "",
            ativo: sector?.ativo ?? true,
            company_id: sector?.company_id || companyId,
            schedule_prefs: (sector?.schedule_prefs as ("MANHA" | "TARDE" | "NOITE")[]) || [],
        } as any,
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            if (sector) {
                await api.updateSector(sector.id, values);
                toast.success("Setor atualizado com sucesso!");
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
                    name="schedule_prefs"
                    render={() => (
                        <FormItem>
                            <div className="mb-2">
                                <FormLabel className="text-slate-700">Horários disponíveis de trabalho</FormLabel>
                                <FormDescription className="text-slate-500">
                                    Selecione os turnos que esta vaga oferece.
                                </FormDescription>
                            </div>
                            <div className="flex flex-col gap-2">
                                {schedules.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="schedule_prefs"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) =>
                                                            checked
                                                                ? field.onChange([...field.value, item.id])
                                                                : field.onChange(field.value?.filter((v) => v !== item.id))
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
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
