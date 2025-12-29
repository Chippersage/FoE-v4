// @ts-nocheck
export const resolveIframeScore = ({
  iframeScore,
  subconceptMaxscore,
}: {
  iframeScore?: number | null;
  subconceptMaxscore?: number;
}) => {
  const total =
    typeof subconceptMaxscore === "number" && subconceptMaxscore > 0
      ? subconceptMaxscore
      : 1;

  const score =
    typeof iframeScore === "number"
      ? iframeScore
      : total;

  return { score, total };
};
