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
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: "hsl(var(--app-bg))", color: "hsl(var(--app-text))" }}>
                Carregando...
            </div>
        );
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
        <div className="min-h-screen" style={{ background: "hsl(var(--app-bg))", color: "hsl(var(--app-text))" }}>
            <div className="flex min-h-screen">
                <aside
                    className="hidden w-64 flex-col border-r p-5 md:flex md:max-h-[calc(100vh-2rem)] md:overflow-y-auto md:pb-6"
                    style={{ borderColor: "hsl(var(--app-border))", background: "hsl(var(--app-surface))", boxShadow: "var(--app-shadow)" }}
                >
                    <Link
                        href="/dashboard"
                        className="mb-8 shrink-0 text-lg font-medium tracking-tight"
                        style={{ color: "hsl(var(--app-text))" }}
                    >
                        RH
                    </Link>
                    <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive
                                        ? "text-white"
                                        : "hover:bg-[hsl(214_32%_94%)]"
                                        }`}
                                    style={isActive ? { background: "hsl(var(--app-primary))", color: "white" } : { color: "hsl(var(--app-text-muted))" }}
                                >
                                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto shrink-0 border-t pt-4" style={{ borderColor: "hsl(var(--app-border))" }}>
                        <div className="flex items-center gap-3 px-1 py-2">
                            <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                                style={{ background: "hsl(var(--app-primary))", color: "white" }}
                            >
                                {session.user?.name?.[0] || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium" style={{ color: "hsl(var(--app-text))" }}>
                                    {session.user?.name}
                                </p>
                                <p className="truncate text-xs" style={{ color: "hsl(var(--app-text-muted))" }}>
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 w-full justify-start gap-2"
                            style={{ color: "hsl(var(--app-text-muted))" }}
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header
                        className="flex h-14 items-center justify-between border-b px-4 md:hidden"
                        style={{ borderColor: "hsl(var(--app-border))", background: "hsl(var(--app-surface))" }}
                    >
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="text-base font-medium" style={{ color: "hsl(var(--app-text))" }}>RH</span>
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
