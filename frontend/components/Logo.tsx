"use client";

type LogoProps = {
    /** Altura da logo em pixels. */
    height?: number;
    /** Mostrar o slogan "SELEÇÃO & RECRUTAMENTO" abaixo. */
    showSlogan?: boolean;
    /** Fundo claro atrás da logo (evita preto em PNG com transparência). */
    lightBackground?: boolean;
    /** Classe CSS adicional. */
    className?: string;
};

export function Logo({ height = 80, showSlogan = true, lightBackground = false, className = "" }: LogoProps) {
    const wrapperClass = lightBackground
        ? "flex flex-col items-center justify-center rounded-xl bg-white px-6 py-4 shadow-sm"
        : "flex flex-col items-center justify-center";

    return (
        <div className={`${wrapperClass} ${className}`}>
            <img
                src="/logo.png"
                alt="LF Seleção & Recrutamento"
                style={{ height: `${height}px`, width: "auto", maxWidth: "100%" }}
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
