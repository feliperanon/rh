"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Users,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    if (!session) {
        return null;
    }

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/companies", label: "Empresas", icon: Building2 },
        { href: "/sectors", label: "Setores", icon: FileText },
        { href: "/candidates", label: "Candidatos", icon: Users },
        { href: "/applications", label: "Candidaturas", icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-900 p-6 md:flex">
                    <Link href="/dashboard" className="mb-6 text-2xl font-semibold tracking-tight text-white">
                        RH System
                    </Link>
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive
                                            ? "bg-white/10 text-white"
                                            : "text-slate-300 hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-6 space-y-2 rounded-2xl border border-white/10 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold">
                                {session.user?.name?.[0] || "U"}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{session.user?.name}</p>
                                <p className="text-xs text-slate-500">{session.user?.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => signOut()}>
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-slate-900 px-4 text-white md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <span className="text-lg font-semibold">RH System</span>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 py-10">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
