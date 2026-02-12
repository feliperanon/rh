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
    Menu,
    Columns
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
        { href: "/kanban", label: "Board (Funil)", icon: Columns },
        { href: "/companies", label: "Empresas", icon: Building2 },
        { href: "/sectors", label: "Setores", icon: FileText },
        { href: "/candidates", label: "Candidatos", icon: Users },
        { href: "/applications", label: "Candidaturas", icon: FileText },
    ];

    return (
        <div className="dark min-h-screen bg-slate-950 text-white">
            <div className="flex min-h-screen">
                <aside className="hidden w-64 flex-col border-r border-slate-800/80 bg-slate-950 p-5 md:flex">
                    <Link
                        href="/dashboard"
                        className="mb-8 text-lg font-medium tracking-tight text-white"
                    >
                        RH
                    </Link>
                    <nav className="flex-1 space-y-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                        }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto border-t border-slate-800/80 pt-4">
                        <div className="flex items-center gap-3 px-1 py-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300">
                                {session.user?.name?.[0] || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-200">
                                    {session.user?.name}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 w-full justify-start gap-2 text-slate-400 hover:text-slate-200"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex h-14 items-center justify-between border-b border-slate-800/80 px-4 md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="text-base font-medium">RH</span>
                    </header>

                    <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
