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
import { CurrencyInputBR } from "@/components/ui/CurrencyInputBR";
import { DateInputBR } from "@/components/ui/DateInputBR";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useState } from "react";
import { format } from "date-fns";

const formSchema = z.object({
    name: z.string().min(3, "Nome completo é obrigatório"),
    cpf: z.string().min(11, "CPF inválido").transform(v => v.replace(/\D/g, "")),
    birth_date: z.string().refine((date) => !date || new Date(date).toString() !== 'Invalid Date', {
        message: "Data inválida",
    }),
    education: z.enum(["FUNDAMENTAL", "MEDIO", "SUPERIOR", "POS_GRADUACAO"]),
    vt_value_cents: z.preprocess((val) => Number(val), z.number().min(0)),
    worked_here_before: z.boolean().optional(),
    candidate_schedule_selections: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ApplicationPublicFormProps {
    token: string;
    initialData: any;
    onSuccess: () => void;
}

export function ApplicationPublicForm({ token, initialData, onSuccess }: ApplicationPublicFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData.candidate.name || "",
            cpf: initialData.candidate.cpf || "",
            birth_date: initialData.candidate.birth_date ? format(new Date(initialData.candidate.birth_date), "yyyy-MM-dd") : "",
            education: initialData.candidate.education || undefined,
            vt_value_cents: (initialData.candidate.vt_value_cents || 0) / 100,
            worked_here_before: initialData.candidate.worked_here_before || false,
            candidate_schedule_selections: initialData.candidate_schedule_selections || [],
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            const payload = { ...values, vt_value_cents: Math.round(values.vt_value_cents * 100) };
            await api.submitApplicationByToken(token, payload);
            toast.success("Cadastro enviado com sucesso!");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao enviar cadastro", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                    <Input placeholder="000.000.000-00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Nascimento</FormLabel>
                                <FormControl>
                                    <DateInputBR
                                        placeholder="DD/MM/AAAA"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Escolaridade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="FUNDAMENTAL">Ensino Fundamental</SelectItem>
                                    <SelectItem value="MEDIO">Ensino Médio</SelectItem>
                                    <SelectItem value="SUPERIOR">Ensino Superior</SelectItem>
                                    <SelectItem value="POS_GRADUACAO">Pós-Graduação</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Horários - entre Escolaridade e VT */}
                <FormField
                    control={form.control}
                    name="candidate_schedule_selections"
                    render={({ field }) => {
                        const sector = initialData?.sector ?? (initialData as { application?: { sector?: { schedule_slots?: string[] } } })?.application?.sector;
                        const slots: string[] = Array.isArray(sector?.schedule_slots) ? sector.schedule_slots : (Array.isArray(sector?.scheduleSlots) ? sector.scheduleSlots : []);
                        const hasSlots = slots.length > 0;
                        return (
                            <FormItem className="space-y-2">
                                <FormLabel>Horários de sua disponibilidade</FormLabel>
                                <FormDescription>
                                    {hasSlots ? "Selecione um ou mais horários em que você pode trabalhar nesta vaga." : "Informe seus horários disponíveis (ex: Manhã, Tarde, Comercial)."}
                                </FormDescription>
                                {hasSlots ? (
                                    <div className="flex flex-col gap-2">
                                        {slots.map((slot: string) => (
                                            <div key={slot} className="flex flex-row items-center space-x-3">
                                                <Checkbox id={`schedule-${slot}`} checked={field.value?.includes(slot)} onCheckedChange={(c) => c ? field.onChange([...(field.value || []), slot]) : field.onChange((field.value || []).filter((v) => v !== slot))} />
                                                <label htmlFor={`schedule-${slot}`} className="text-sm font-normal cursor-pointer">{slot}</label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Input placeholder="Ex: Manhã, Tarde, Comercial" value={Array.isArray(field.value) && field.value.length > 0 ? field.value.join(" | ") : ""} onChange={(e) => { const t = e.target.value.trim(); field.onChange(t ? [t] : []); }} />
                                )}
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <FormField
                    control={form.control}
                    name="vt_value_cents"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor do Vale Transporte (Diário - ida e volta total)</FormLabel>
                            <FormControl>
                                <CurrencyInputBR
                                    placeholder="0,00"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {initialData?.company?.perguntar_recontratacao && (
                    <FormField
                        control={form.control}
                        name="worked_here_before"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        {initialData.company.sigilosa || initialData.company.modo_pergunta_recontratacao === "GENERICO"
                                            ? "Já trabalhou nesta empresa anteriormente?"
                                            : `Já trabalhou na ${initialData.company.nome} anteriormente?`}
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                )}

                <p className="text-xs text-muted-foreground text-center">
                    Obs.: não solicitamos senha e nem pagamento em nenhuma etapa.
                </p>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Enviando..." : "Finalizar Cadastro"}
                </Button>
            </form>
        </Form>
    );
}
