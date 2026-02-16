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
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
    nome: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    ativo: z.boolean().default(true),
    company_id: z.string().min(1, {
        message: "Empresa é obrigatória",
    }),
    schedule_slots: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

// Parse "08:00 às 17:00" or "08:00-17:00" to { start, end }
function parseSlot(slot: string): { start: string; end: string } {
    const match = slot.match(/(\d{1,2}:\d{2})\s*(?:às|-|a)\s*(\d{1,2}:\d{2})/i);
    if (match) return { start: match[1], end: match[2] };
    return { start: "08:00", end: "17:00" };
}

// Format to "08:00 às 17:00"
function formatSlot(start: string, end: string): string {
    return `${start} às ${end}`;
}

interface SectorFormProps {
    sector?: Sector; // For editing
    companyId: string; // Required for creating new sector
    onSuccess: () => void;
}

export function SectorForm({ sector, companyId, onSuccess }: SectorFormProps) {
    const [loading, setLoading] = useState(false);

    const slotsFromSector = (sector?.schedule_slots ?? []).map((s) => parseSlot(s));
    const initialSlots = slotsFromSector.length > 0
        ? slotsFromSector
        : [{ start: "08:00", end: "17:00" }];

    const [localSlots, setLocalSlots] = useState<{ start: string; end: string }[]>(initialSlots);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            nome: sector?.nome || "",
            ativo: sector?.ativo ?? true,
            company_id: sector?.company_id || companyId,
            schedule_slots: (sector?.schedule_slots ?? []).length > 0
                ? (sector?.schedule_slots ?? [])
                : ["08:00 às 17:00"],
        } as any,
    });

    const addSlot = () => {
        const newSlots = [...localSlots, { start: "08:00", end: "17:00" }];
        setLocalSlots(newSlots);
        form.setValue(
            "schedule_slots",
            newSlots.map((s) => formatSlot(s.start, s.end))
        );
    };

    const removeSlot = (index: number) => {
        const newSlots = localSlots.filter((_, i) => i !== index);
        setLocalSlots(newSlots);
        form.setValue(
            "schedule_slots",
            newSlots.map((s) => formatSlot(s.start, s.end))
        );
    };

    const updateSlot = (index: number, field: "start" | "end", value: string) => {
        const newSlots = [...localSlots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setLocalSlots(newSlots);
        form.setValue(
            "schedule_slots",
            newSlots.map((s) => formatSlot(s.start, s.end))
        );
    };

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            const payload = {
                ...values,
                schedule_slots: localSlots.map((s) => formatSlot(s.start, s.end)),
            };
            if (sector) {
                await api.updateSector(sector.id, payload);
                toast.success("Setor atualizado com sucesso!");
            } else {
                await api.createSector(payload);
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

                <FormItem>
                    <div className="mb-2">
                        <FormLabel className="text-slate-700">Horários disponíveis de trabalho</FormLabel>
                        <FormDescription className="text-slate-500">
                            Adicione os horários que esta vaga oferece (ex: 08:00 às 17:00).
                        </FormDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                        {localSlots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => updateSlot(index, "start", e.target.value)}
                                    className="w-[120px]"
                                />
                                <span className="text-sm text-muted-foreground">às</span>
                                <Input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => updateSlot(index, "end", e.target.value)}
                                    className="w-[120px]"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                                    onClick={() => removeSlot(index)}
                                    disabled={localSlots.length <= 1}
                                    aria-label="Remover horário"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-fit"
                            onClick={addSlot}
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Adicionar horário
                        </Button>
                    </div>
                </FormItem>

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
