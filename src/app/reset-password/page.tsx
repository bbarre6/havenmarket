import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-bold text-foreground">Choose a new password</h1>
        <p className="mb-6 text-sm text-muted">Set a new password for your account.</p>
        <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
