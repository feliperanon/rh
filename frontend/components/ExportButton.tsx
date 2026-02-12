"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface ExportButtonProps {
    filters?: {
        status?: string;
        companyId?: string;
        sectorId?: string;
        startDate?: string;
        endDate?: string;
    };
}

export function ExportButton({ filters }: ExportButtonProps = {}) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const blob = await api.exportApplications(filters || undefined);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `inscricoes_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Download iniciado!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao exportar dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="h-9 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={handleExport}
            disabled={loading}
        >
            <Download className="h-4 w-4" />
            {loading ? "Exportando…" : "Exportar"}
        </Button>
    );
}
