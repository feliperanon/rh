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
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col bg-white dark:bg-gray-800 shadow-md md:flex">
                <div className="flex h-16 items-center justify-center border-b px-4">
                    <h1 className="text-xl font-bold text-primary">RH System</h1>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t p-4">
                    <div className="mb-4 flex items-center gap-3 px-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {session.user?.name?.[0] || "U"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium">{session.user?.name}</p>
                            <p className="truncate text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Mobile Header */}
                <header className="flex h-16 items-center border-b bg-white px-4 shadow-sm md:hidden dark:bg-gray-800">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <Menu className="h-6 w-6" />
                    </Button>
                    <h1 className="text-lg font-bold">RH System</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
