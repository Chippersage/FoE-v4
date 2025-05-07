import React, { useEffect, useRef } from "react";

interface ScoreDisplayProps {
  score: number;
  total: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, total }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const size = 100;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Calculate percentage
    const percentage = total > 0 ? score / total : 0;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 40, 0, 2 * Math.PI);
    ctx.strokeStyle = "#e6e6e6";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw progress arc
    const startAngle = -0.5 * Math.PI; // Start at top
    const endAngle = startAngle + 2 * Math.PI * percentage;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 40, startAngle, endAngle);
    ctx.strokeStyle = "#1b4332";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw text
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#1b4332";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${score}/${total}`, size / 2, size / 2);
  }, [score, total]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width="100"
        height="100"
        className="w-[100px] h-[100px]"
      ></canvas>
    </div>
  );
};

export default ScoreDisplay;
