import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import ListingForm from "@/components/ListingForm";

export default async function SellPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Sign in to start selling</h1>
        <Link href="/login?callbackUrl=/sell" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  const categories = await prisma.category.findMany({ select: { id: true, name: true, parentId: true } });

  return (
    <div className="container-page max-w-3xl py-8">
      <h1 className="mb-1 text-xl font-bold text-foreground">Create a listing</h1>
      <p className="mb-6 text-sm text-muted">List an item for sale — fixed price or auction.</p>
      <ListingForm categories={categories} />
    </div>
  );
}
