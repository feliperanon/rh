import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Company, Sector } from "@/types";
import { STATUS_OPTIONS } from "@/lib/status-labels";
import { toast } from "sonner";
import { Download } from "lucide-react";

export function ExportModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);

    // Filters
    const [companyId, setCompanyId] = useState<string>("all");
    const [sectorId, setSectorId] = useState<string>("all");
    const [status, setStatus] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        if (open) {
            loadCompanies();
        }
    }, [open]);

    useEffect(() => {
        if (companyId && companyId !== "all") {
            loadSectors(companyId);
        } else {
            setSectors([]);
            setSectorId("all");
        }
    }, [companyId]);

    const loadCompanies = async () => {
        try {
            const data = await api.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar empresas");
        }
    };

    const loadSectors = async (companyId: string) => {
        try {
            const data = await api.getSectors(companyId);
            setSectors(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar setores");
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (companyId !== "all") filters.companyId = companyId;
            if (sectorId !== "all") filters.sectorId = sectorId;
            if (status !== "all") filters.status = status;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const blob = await api.exportApplications(filters);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inscricoes_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Exportação concluída!");
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao exportar dados");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Exportar Dados</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Empresa</Label>
                        <Select value={companyId} onValueChange={setCompanyId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas as empresas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as empresas</SelectItem>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                        {company.nome_interno}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Setor / Vaga</Label>
                        <Select value={sectorId} onValueChange={setSectorId} disabled={companyId === "all"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos os setores" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os setores</SelectItem>
                                {sectors.map((sector) => (
                                    <SelectItem key={sector.id} value={sector.id}>
                                        {sector.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                {STATUS_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>De</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Até</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleExport} disabled={loading}>
                        {loading ? "Exportando..." : "Exportar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
