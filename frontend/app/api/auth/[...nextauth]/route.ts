import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

const isConfigMissing =
    process.env.NODE_ENV === "production" &&
    (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL);

function getAuthPath(url: string): string | null {
    try {
        const path = new URL(url).pathname;
        const match = path.match(/\/api\/auth\/(.+)$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

/** Quando NEXTAUTH_SECRET/NEXTAUTH_URL faltam, responde sem chamar o NextAuth (evita "Server error" em HTML). */
function responseWhenConfigMissing(req: Request): Response | null {
    if (!isConfigMissing || !req.url) return null;
    const path = getAuthPath(req.url);
    if (!path) return null;

    const json = (body: object) =>
        new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    if (path === "session") return json({ session: null });
    if (path === "csrf") return json({ csrfToken: "" });
    if (path === "providers") return json({});
    if (path === "getcsrf") return json({ csrfToken: "" });

    console.warn(
        "[NextAuth] NEXTAUTH_SECRET ou NEXTAUTH_URL não definidos. Defina no Environment do Render (rh-gppm)."
    );
    return json({ error: "ConfigurationMissing", message: "Configure NEXTAUTH_SECRET e NEXTAUTH_URL no Render." });
}

async function wrappedHandler(req: Request, context: { params: Promise<{ nextauth?: string[] }> }) {
    const safe = responseWhenConfigMissing(req);
    if (safe) return safe;
    return handler(req, context as any);
}

export const GET = wrappedHandler;
export const POST = wrappedHandler;
