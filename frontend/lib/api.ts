import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

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
    getApplications: () => fetchWithAuth("/applications"),
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

    // Candidates
    getCandidates: (search: string) => fetchWithAuth(`/candidates?search=${search}`),
    getCandidate: (id: string) => fetchWithAuth(`/candidates/${id}`),

    // Public
    getApplicationByToken: (token: string) => fetchPublic(`/invite/${token}`),
    submitApplicationByToken: (token: string, data: any) => fetchPublic(`/invite/${token}`, {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Export
    exportApplications: async () => {
        const session = await getSession();
        const headers = {
            ...(session?.accessToken && {
                Authorization: `Bearer ${session.accessToken}`,
            }),
        };

        const response = await fetch(`${API_URL}/applications/export/all`, {
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
