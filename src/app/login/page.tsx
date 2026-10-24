import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-bold text-foreground">Sign in</h1>
        <p className="mb-6 text-sm text-muted">
          Demo login: <span className="font-mono">demo@marketplace.test</span> / <span className="font-mono">Demo12345!</span>
        </p>
        <LoginForm callbackUrl={callbackUrl ?? "/"} />
        <p className="mt-3 text-center text-sm">
          <Link href="/forgot-password" className="text-brand hover:underline">
            Forgot your password?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
