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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useState } from "react";
import { Company } from "@/types";

const formSchema = z.object({
    nome_interno: z.string().min(3, {
        message: "Nome deve ter pelo menos 3 caracteres.",
    }),
    ativo: z.boolean().default(true),
    sigilosa: z.boolean().default(false),
    perguntar_recontratacao: z.boolean().default(false),
    modo_pergunta_recontratacao: z.enum(["GENERICO", "COM_NOME"]),
}).refine((data) => {
    if (data.sigilosa && data.modo_pergunta_recontratacao === "COM_NOME") {
        return false;
    }
    return true;
}, {
    message: "Empresas sigilosas devem usar modo de pergunta GENERICO.",
    path: ["modo_pergunta_recontratacao"],
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyFormProps {
    company?: Company; // For editing
    onSuccess: () => void;
}

export function CompanyForm({ company, onSuccess }: CompanyFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            nome_interno: company?.nome_interno || "",
            ativo: company?.ativo ?? true,
            sigilosa: company?.sigilosa ?? false,
            perguntar_recontratacao: company?.perguntar_recontratacao ?? false,
            modo_pergunta_recontratacao: (company?.modo_pergunta_recontratacao as "GENERICO" | "COM_NOME") || "GENERICO",
        } as any,
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            if (company) {
                await api.updateCompany(company.id, values);
                toast.success("Empresa atualizada com sucesso!");
            } else {
                await api.createCompany(values);
                toast.success("Empresa criada com sucesso!");
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar empresa", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    // Watch sigilosa to automatically set mode to GENERICO if true
    const sigilosa = form.watch("sigilosa");
    if (sigilosa && form.getValues("modo_pergunta_recontratacao") !== "GENERICO") {
        form.setValue("modo_pergunta_recontratacao", "GENERICO");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nome_interno"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Interno</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Cliente Alpha" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                            Disponível para novas vagas
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

                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Sigilosa</FormLabel>
                        <FormDescription>
                            Esconde nome da empresa no formulário público
                        </FormDescription>
                    </div>
                    <FormField
                        control={form.control}
                        name="sigilosa"
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

                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Perguntar Recontratação</FormLabel>
                        <FormDescription>
                            Questiona se o candidato já trabalhou na empresa
                        </FormDescription>
                    </div>
                    <FormField
                        control={form.control}
                        name="perguntar_recontratacao"
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

                <FormField
                    control={form.control}
                    name="modo_pergunta_recontratacao"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Modo da Pergunta</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={sigilosa}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o modo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="GENERICO">Genérico ("nesta empresa")</SelectItem>
                                    <SelectItem value="COM_NOME">Com Nome ("na Empresa X")</SelectItem>
                                </SelectContent>
                            </Select>
                            {sigilosa && <FormDescription>Empresas sigilosas usam modo genérico.</FormDescription>}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : (company ? "Atualizar" : "Criar")}
                </Button>
            </form>
        </Form>
    );
}
