import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import AddressForm from "@/components/AddressForm";
import DeleteAddressButton from "@/components/DeleteAddressButton";

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } });

  return (
    <div className="container-page flex max-w-2xl flex-col gap-6 py-8">
      <h1 className="text-xl font-bold text-foreground">Shipping addresses</h1>

      {addresses.length > 0 && (
        <div className="card divide-y divide-border">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 p-4">
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {a.fullName} {a.isDefault && <span className="badge badge-blue ml-1">Default</span>}
                </p>
                <p className="text-muted">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
                </p>
              </div>
              <DeleteAddressButton addressId={a.id} />
            </div>
          ))}
        </div>
      )}

      <AddressForm />
    </div>
  );
}
