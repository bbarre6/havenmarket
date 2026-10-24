"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { questionSchema, answerSchema } from "@/lib/validation";

export type SimpleFormState = { error?: string; success?: boolean };

export async function askQuestionAction(
  listingSlug: string,
  _prevState: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const user = await requireUser();
  const parsed = questionSchema.safeParse({
    listingId: formData.get("listingId"),
    question: formData.get("question"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid question." };
  }

  await prisma.question.create({
    data: { listingId: parsed.data.listingId, askerId: user.id, question: parsed.data.question },
  });

  revalidatePath(`/product/${listingSlug}`);
  return { success: true };
}

export async function answerQuestionAction(
  listingSlug: string,
  _prevState: SimpleFormState,
  formData: FormData
): Promise<SimpleFormState> {
  const user = await requireUser();
  const parsed = answerSchema.safeParse({
    questionId: formData.get("questionId"),
    answer: formData.get("answer"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid answer." };
  }

  const question = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
    include: { listing: true },
  });
  if (!question || question.listing.sellerId !== user.id) {
    return { error: "You can only answer questions on your own listings." };
  }

  await prisma.question.update({
    where: { id: parsed.data.questionId },
    data: { answer: parsed.data.answer, answeredAt: new Date() },
  });

  revalidatePath(`/product/${listingSlug}`);
  return { success: true };
}
