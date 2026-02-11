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
        method: "DELETE", // Assuming DELETE toggles active status or actual delete
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
};
