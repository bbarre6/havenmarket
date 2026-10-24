import AskQuestionForm from "@/components/AskQuestionForm";
import AnswerForm from "@/components/AnswerForm";

type QAItem = {
  id: string;
  question: string;
  answer: string | null;
  createdAt: Date;
  asker: { id: string; name: string };
};

export default function QASection({
  listingSlug,
  listingId,
  questions,
  isOwner,
  isSignedIn,
}: {
  listingSlug: string;
  listingId: string;
  questions: QAItem[];
  isOwner: boolean;
  isSignedIn: boolean;
}) {
  return (
    <div className="card p-5">
      <h2 className="mb-3 text-base font-bold text-foreground">Questions &amp; Answers</h2>

      {questions.length === 0 && <p className="mb-3 text-sm text-muted">No questions yet. Be the first to ask.</p>}

      <ul className="mb-4 space-y-3">
        {questions.map((q) => (
          <li key={q.id} className="border-b border-border pb-3 last:border-0">
            <p className="text-sm">
              <span className="font-medium text-foreground">Q:</span> {q.question}
            </p>
            {q.answer ? (
              <p className="mt-1 text-sm text-muted">
                <span className="font-medium text-brand">A:</span> {q.answer}
              </p>
            ) : isOwner ? (
              <AnswerForm listingSlug={listingSlug} questionId={q.id} />
            ) : (
              <p className="mt-1 text-xs text-muted">Awaiting seller response</p>
            )}
          </li>
        ))}
      </ul>

      {isSignedIn && !isOwner ? (
        <AskQuestionForm listingSlug={listingSlug} listingId={listingId} />
      ) : !isSignedIn ? (
        <p className="text-sm text-muted">Sign in to ask a question.</p>
      ) : null}
    </div>
  );
}
