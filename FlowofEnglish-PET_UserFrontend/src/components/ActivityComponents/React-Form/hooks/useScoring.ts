import { type Activity } from "../types";

export const useScoring = (
  activity: Activity | null,
  answers: Record<string, any>
) => {

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const calculateScore = () => {
    if (!activity) return { score: 0, maxScore: 0 };

    let score = 0;
    let maxScore = 0;

    activity.questions.forEach((q) => {
      maxScore += q.marks;

      switch (q.type) {

case "mcq-single": {
  console.log("---- Checking question ----");
  console.log("Question ID:", q.id);
  console.log("User answer:", answers[q.id]);
  console.log("Correct answer:", q.correctAnswer);
  console.log("Equal?", answers[q.id] === q.correctAnswer);

  if (answers[q.id] === q.correctAnswer) {
    score += q.marks;
  }
  break;
}

        case "mcq-multiple": {
          const correctOptions = (q.correctAnswer || "")
            .split(",")
            .map(opt => opt.trim())
            .filter(Boolean);

          const userAnswers = answers[q.id] || [];

          const isExactMatch =
            correctOptions.length === userAnswers.length &&
            correctOptions.every(id => userAnswers.includes(id));

          if (isExactMatch) {
            score += q.marks;
          }
          break;
        }

        case "audio-typing": {
          const userAnswer = answers[q.id] || "";
          const correct = q.correctAnswer || "";

          if (normalize(userAnswer) === normalize(correct)) {
            score += q.marks;
          }
          break;
        }

        case "typing": {
          const userAnswer = answers[q.id] || "";
          const correct = q.correctAnswer || "";

          if (normalize(userAnswer) === normalize(correct)) {
            score += q.marks;
          }
          break;
        }

        default:
          break;
      }
    });

    return { score, maxScore };
  };

  return { calculateScore };
};