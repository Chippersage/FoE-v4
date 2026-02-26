// features/react-form/hooks/useActivityLoader.ts

import { useEffect, useState } from "react";
import { type Activity, type Question } from "../types";

export const useActivityLoader = (xmlUrl: string) => {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(xmlUrl);
      const text = await res.text();
      const xml = new DOMParser().parseFromString(text, "text/xml");

      const questions: Question[] = Array.from(
        xml.querySelectorAll("questions > question")
      ).map(q => ({
        id: q.getAttribute("id") || "",
        type: q.getAttribute("type") || "",
        marks: parseInt(q.getAttribute("marks") || "1"),
        text: q.querySelector("text")?.textContent?.trim(),
        mediaUrl: q.querySelector("media")?.textContent?.trim(),
        options: Array.from(q.querySelectorAll("option")).map(opt => ({
          id: opt.getAttribute("id") || "",
          text: opt.textContent?.trim() || "",
          correct: opt.getAttribute("correct") === "true",
        })),
      }));

      const activityMediaNode = xml.querySelector("activity > media");

      setActivity({
        instructions:
          xml.querySelector("instructions")?.textContent?.trim() || "",
        maxPlaysPerAudio: parseInt(
          xml.querySelector("maxPlaysPerAudio")?.textContent || "3"
        ),
        mediaUrl: activityMediaNode?.textContent?.trim(),
        mediaType: activityMediaNode?.getAttribute("type") || undefined,
        questions,
        scriptUrl:
          xml.querySelector("appScriptUrl")?.textContent?.trim() || "",
      });
    };

    load();
  }, [xmlUrl]);

  return { activity };
};