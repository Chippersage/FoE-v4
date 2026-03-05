import { useState, useEffect } from "react";

export function useAssessmentEngine(xmlUrl: string) {
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(xmlUrl);
      const text = await res.text();
      const xml = new DOMParser().parseFromString(text, "text/xml");

      const questions = Array.from(
        xml.querySelectorAll("questions > question")
      ).map(q => ({
        id: q.getAttribute("id") || "",
        type: q.getAttribute("type") || "",
        text: q.querySelector("text")?.textContent?.trim(),
        correctAnswer:
          q.querySelector("correctAnswer")?.textContent?.trim(),
        options: Array.from(q.querySelectorAll("option")).map(opt => ({
          id: opt.getAttribute("id") || "",
          text: opt.textContent?.trim() || "",
        })),
      }));

      setActivity({
        instructions:
          xml.querySelector("instructions")?.textContent?.trim(),
        scriptUrl:
          xml.querySelector("appScriptUrl")?.textContent?.trim(),
        questions,
      });
    };

    load();
  }, [xmlUrl]);

  return activity;
}