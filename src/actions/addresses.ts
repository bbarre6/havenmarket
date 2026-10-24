"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { addressSchema } from "@/lib/validation";

export type AddressFormState = { error?: string; success?: boolean };

export async function createAddressAction(
  _prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const user = await requireUser();

  const parsed = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "United States",
    phone: formData.get("phone") || "",
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the address fields." };
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  await prisma.address.create({
    data: {
      userId: user.id,
      fullName: parsed.data.fullName,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
      phone: parsed.data.phone || null,
      isDefault: parsed.data.isDefault,
    },
  });

  revalidatePath("/checkout");
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();
  await prisma.address.deleteMany({ where: { id: addressId, userId: user.id } });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
