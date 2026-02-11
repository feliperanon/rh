"use client";

import { ReactNode } from "react";

interface MainLayoutProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export function MainLayout({ title, description, actions, children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="bg-rh-gradient py-10">
                <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-6 rounded-3xl bg-white/5 p-5 shadow-2xl shadow-slate-900/70 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary-foreground/60">
                                Painel RH
                            </p>
                            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-1 max-w-2xl text-sm text-primary-foreground/80">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions && <div className="flex items-center">{actions}</div>}
                    </div>
                    <div className="space-y-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
