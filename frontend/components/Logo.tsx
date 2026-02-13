"use client";

type LogoProps = {
    /** Altura da logo em pixels. */
    height?: number;
    /** Mostrar o slogan "SELEÇÃO & RECRUTAMENTO" abaixo. */
    showSlogan?: boolean;
    /** Classe CSS adicional. */
    className?: string;
};

export function Logo({ height = 80, showSlogan = true, className = "" }: LogoProps) {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <img
                src="/logo.png"
                alt="LF Seleção & Recrutamento"
                style={{ height: `${height}px`, width: "auto" }}
                className="object-contain"
            />
            {showSlogan && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mt-1">
                    Seleção & Recrutamento
                </p>
            )}
        </div>
    );
}
