import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { getSellerQuestions } from "@/lib/seller";
import AnswerForm from "@/components/AnswerForm";

export default async function DashboardQuestionsPage() {
  const user = await requireUser();
  const questions = await getSellerQuestions(user.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">Buyer questions</h2>
      {questions.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">No questions yet.</div>
      ) : (
        <div className="card divide-y divide-border">
          {questions.map((q) => (
            <div key={q.id} className="p-4">
              <Link href={`/product/${q.listing.slug}`} className="text-xs font-medium text-brand hover:underline">
                {q.listing.title}
              </Link>
              <p className="mt-1 text-sm text-foreground">
                <span className="font-medium">{q.asker.name} asked:</span> {q.question}
              </p>
              {q.answer ? (
                <p className="mt-1 text-sm text-muted">
                  <span className="font-medium text-brand">Your answer:</span> {q.answer}
                </p>
              ) : (
                <div className="mt-2">
                  <AnswerForm listingSlug={q.listing.slug} questionId={q.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
