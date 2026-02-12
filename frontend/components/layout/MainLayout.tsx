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
        <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-0.5 text-sm text-slate-400">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex shrink-0 items-center gap-2">
                        {actions}
                    </div>
                )}
            </header>

            <div>{children}</div>
        </div>
    );
}
