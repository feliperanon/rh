import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/companies/:path*",
        "/sectors/:path*",
        "/candidates/:path*",
        "/applications/:path*",
    ],
};
