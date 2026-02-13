import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();

    const headers = {
        "Content-Type": "application/json",
        ...(session?.accessToken && {
            Authorization: `Bearer ${session.accessToken}`,
        }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // signOut(); // Optional: force logout on 401
        throw new Error("Não autorizado");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro API: ${response.status}`);
    }

    return response.json();
}

async function fetchPublic(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro API: ${response.status}`);
    }

    return response.json();
}

export const api = {
    // Companies
    getCompanies: () => fetchWithAuth("/companies"),
    createCompany: (data: any) => fetchWithAuth("/companies", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateCompany: (id: string, data: any) => fetchWithAuth(`/companies/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    toggleCompany: (id: string) => fetchWithAuth(`/companies/${id}`, {
        method: "DELETE",
    }),

    // Sectors
    getSectors: (companyId?: string) =>
        fetchWithAuth(`/sectors${companyId ? `?companyId=${companyId}` : ""}`),
    createSector: (data: any) => fetchWithAuth("/sectors", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Applications
    getApplications: (filters?: {
        status?: string;
        companyId?: string;
        sectorId?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.companyId) params.append("company_id", filters.companyId);
        if (filters?.sectorId) params.append("sector_id", filters.sectorId);
        if (filters?.startDate) params.append("start_date", filters.startDate);
        if (filters?.endDate) params.append("end_date", filters.endDate);
        const query = params.toString() ? `?${params.toString()}` : "";
        return fetchWithAuth(`/applications${query}`);
    },
    deleteApplication: (id: string) =>
        fetchWithAuth(`/applications/${id}`, { method: "DELETE" }),
    createApplication: (data: any) => fetchWithAuth("/applications", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    getApplication: (id: string) => fetchWithAuth(`/applications/${id}`),
    updateApplicationStatus: (id: string, status: string) => fetchWithAuth(`/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    }),
    whatsappOpened: (id: string) => fetchWithAuth(`/applications/${id}/whatsapp-opened`, {
        method: "POST",
    }),
    markSent: (id: string) => fetchWithAuth(`/applications/${id}/mark-sent`, {
        method: "POST",
    }),
    getDashboardStats: () => fetchWithAuth("/applications/stats"),
    getAnalytics: (params?: { start_date?: string; end_date?: string }) => {
        const search = new URLSearchParams();
        if (params?.start_date) search.set("start_date", params.start_date);
        if (params?.end_date) search.set("end_date", params.end_date);
        const q = search.toString() ? `?${search.toString()}` : "";
        return fetchWithAuth(`/applications/analytics${q}`);
    },

    // Candidates
    getCandidates: (filters?: { search?: string; protocol?: string }) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.protocol) params.append("protocol", filters.protocol);
        const query = params.toString() ? `?${params.toString()}` : "";
        return fetchWithAuth(`/candidates${query}`);
    },
    getCandidate: (id: string) => fetchWithAuth(`/candidates/${id}`),
    updateCandidate: (id: string, data: any) => fetchWithAuth(`/candidates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    deleteCandidate: (id: string) => fetchWithAuth(`/candidates/${id}`, {
        method: "DELETE",
    }),

    // Public
    getApplicationByToken: (token: string) => fetchPublic(`/invite/${token}`),
    submitApplicationByToken: (token: string, data: any) => fetchPublic(`/invite/${token}`, {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Export
    exportApplications: async (filters?: { status?: string, companyId?: string, sectorId?: string, startDate?: string, endDate?: string }) => {
        const session = await getSession();
        const headers = {
            ...(session?.accessToken && {
                Authorization: `Bearer ${session.accessToken}`,
            }),
        };

        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.companyId) params.append('company_id', filters.companyId);
        if (filters?.sectorId) params.append('sector_id', filters.sectorId);
        if (filters?.startDate) params.append('start_date', filters.startDate);
        if (filters?.endDate) params.append('end_date', filters.endDate);

        const response = await fetch(`${API_URL}/applications/export/all?${params.toString()}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) throw new Error("Erro ao exportar");

        return response.blob();
    },

    refreshInviteLink: (id: string) => fetchWithAuth(`/applications/${id}/refresh-link`, {
        method: "POST",
    }),
};
