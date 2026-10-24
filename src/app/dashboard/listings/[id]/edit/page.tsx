import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import EditListingForm from "@/components/EditListingForm";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const [listing, categories] = await Promise.all([
    prisma.listing.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } }),
    prisma.category.findMany({ select: { id: true, name: true, parentId: true } }),
  ]);

  if (!listing || listing.sellerId !== user.id) notFound();

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-xl font-bold text-foreground">Edit listing</h2>
      <EditListingForm listing={listing} categories={categories} />
    </div>
  );
}
