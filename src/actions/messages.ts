"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { messageSchema } from "@/lib/validation";
import { checkMessageRateLimit } from "@/lib/rate-limit";

export type SimpleFormState = { error?: string; success?: boolean };

export async function sendMessageAction(
  _prevState: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const user = await requireUser();

  const limited = await checkMessageRateLimit(user.id);
  if (limited) {
    return { error: limited };
  }

  const parsed = messageSchema.safeParse({
    receiverId: formData.get("receiverId"),
    listingId: formData.get("listingId") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid message." };
  }
  if (parsed.data.receiverId === user.id) {
    return { error: "You can't message yourself." };
  }

  await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: parsed.data.receiverId,
      listingId: parsed.data.listingId,
      body: parsed.data.body,
    },
  });

  revalidatePath("/messages");
  return { success: true };
}

export async function markThreadRead(otherUserId: string) {
  const user = await requireUser();
  await prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/messages");
}
