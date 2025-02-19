import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const EmojiBubbles = ({ emoji = "🎈", count = 10, interval = 1000 }) => {
  const [emojis, setEmojis] = useState([]);
  console.log("emojis", emojis);

  useEffect(() => {
    const addEmoji = () => {
      setEmojis((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100, // Random left position (0-100%)
          top: Math.random() * 100, // Random top position (0-100%)
        },
      ]);

      setTimeout(() => {
        setEmojis((prev) => prev.slice(1));
      }, 2000); // Remove after 1.5 seconds
    };

    const intervalId = setInterval(addEmoji, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {emojis.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute text-7xl"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default EmojiBubbles;
