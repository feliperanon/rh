import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

const isConfigMissing =
    process.env.NODE_ENV === "production" &&
    (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL);

function isSessionRequest(url: string): boolean {
    try {
        const path = new URL(url).pathname;
        return path.endsWith("/session");
    } catch {
        return false;
    }
}

async function wrappedHandler(req: Request, context: { params: Promise<{ nextauth?: string[] }> }) {
    if (isConfigMissing && req.url && isSessionRequest(req.url)) {
        if (process.env.NODE_ENV === "production") {
            console.warn(
                "[NextAuth] NEXTAUTH_SECRET ou NEXTAUTH_URL não definidos. Defina no Environment do Render (rh-gppm)."
            );
        }
        return new Response(JSON.stringify({ session: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
    return handler(req, context as any);
}

export const GET = wrappedHandler;
export const POST = wrappedHandler;
