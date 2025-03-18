import React, { useEffect, useRef } from "react";

const WordOfTheDay = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Create script element
    const script = document.createElement("script");
    script.src = "https://wordsmith.org/words/word3.js"; // Using the CSS-friendly version
    script.async = true;

    // Append the script to the container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (containerRef.current) {
        const scriptElement = containerRef.current.querySelector("script");
        if (scriptElement) {
          containerRef.current.removeChild(scriptElement);
        }
      }
    };
  }, []);

  return <div ref={containerRef} className="word-of-the-day-container" />;
};

export default WordOfTheDay;
