import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{ background: "hsl(var(--login-bg))" }}
    >
      <LoginCard />
    </div>
  );
}
