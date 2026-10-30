import { BiValue } from '../i18n/Bi';
import type { ChoiceQuestion } from '../help/caseSymptoms';

// Pick-one questions shown as tappable answers. Tap an answer to choose it, tap it again to clear
// it — none are required, a farmer can skip what they do not know.
export function ChoiceQuestions({
  questions,
  answers,
  onPick,
}: {
  questions: ChoiceQuestion[];
  answers: Record<string, string>;
  onPick: (questionId: string, optionId: string) => void;
}) {
  return (
    <>
      {questions.map((q) => (
        <div className="field-group choice-question" key={q.id} role="group" aria-label={`${q.question.en} / ${q.question.te}`}>
          <BiValue value={q.question} as="strong" />
          <div className="chip-row">
            {q.options.map((o) => {
              const on = answers[q.id] === o.id;
              return (
                <button key={o.id} type="button" className={on ? 'chip-on' : 'secondary'} aria-pressed={on} onClick={() => onPick(q.id, o.id)}>
                  <span className="bi-en">{o.label.en}</span>
                  <span className="bi-te">{o.label.te}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
