"use client";

type LogoProps = {
    /** Altura da logo em pixels. */
    height?: number;
    /** Mostrar o slogan "SELEÇÃO & RECRUTAMENTO" abaixo. */
    showSlogan?: boolean;
    /** Classe CSS adicional. */
    className?: string;
};

/**
 * Exibe a logo da marca (PNG com fundo transparente).
 * Sem card nem fundo no container para a transparência aparecer corretamente.
 */
export function Logo({ height = 100, showSlogan = true, className = "" }: LogoProps) {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className="flex items-center justify-center overflow-hidden"
                style={{ minHeight: height }}
            >
                <img
                    src="/logo.png"
                    alt="LF Seleção & Recrutamento"
                    style={{
                        height: `${height}px`,
                        width: "auto",
                        maxWidth: "min(100%, 280px)",
                        display: "block",
                    }}
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
