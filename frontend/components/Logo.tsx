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

export function Logo({ height = 100, showSlogan = true, lightBackground = false, className = "" }: LogoProps) {
    const wrapperClass = lightBackground
        ? "flex flex-col items-center justify-center rounded-xl bg-white px-8 py-5 shadow-md border border-gray-100"
        : "flex flex-col items-center justify-center";

    return (
        <div className={`${wrapperClass} ${className}`}>
            <div className="flex items-center justify-center bg-white rounded-lg overflow-hidden" style={{ minHeight: height }}>
                <img
                    src="/logo.png"
                    alt="LF Seleção & Recrutamento"
                    style={{ height: `${height}px`, width: "auto", maxWidth: "min(100%, 280px)", display: "block" }}
                    className="object-contain object-center"
                />
            </div>
            {showSlogan && (
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">
                    Seleção & Recrutamento
                </p>
            )}
        </div>
    );
}
