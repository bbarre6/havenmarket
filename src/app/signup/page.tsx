import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-bold text-foreground">Create your account</h1>
        <p className="mb-6 text-sm text-muted">Buy, sell, and bid — all from one account.</p>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
