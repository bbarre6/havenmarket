import Link from "next/link";
import { requireFullUser } from "@/lib/auth-helpers";
import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";

export default async function AccountPage() {
  const user = await requireFullUser();

  return (
    <div className="container-page flex max-w-2xl flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Account settings</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/account/addresses" className="font-medium text-brand hover:underline">
            Addresses
          </Link>
          <Link href="/account/watchlist" className="font-medium text-brand hover:underline">
            Watchlist
          </Link>
        </div>
      </div>
      <p className="text-sm text-muted">Signed in as {user.email}</p>
      <ProfileForm name={user.name} bio={user.bio ?? ""} storeName={user.storeName ?? ""} isSeller={user.isSeller} />
      <PasswordForm />
    </div>
  );
}
