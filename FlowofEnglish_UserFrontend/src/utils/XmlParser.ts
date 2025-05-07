import { Question, Option } from "../types/types";

export const parseQuestionsFromXML = (xmlString: string): Question[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const questionNodes = xmlDoc.getElementsByTagName("question");
  const questions: Question[] = [];

  for (let i = 0; i < questionNodes.length; i++) {
    const questionNode = questionNodes[i];
    const questionId = questionNode.getAttribute("id") || `question_${i}`;
    const questionType = questionNode.getAttribute("type") as
      | "single"
      | "multiple";
    const marks = parseInt(questionNode.getAttribute("marks") || "1", 10);

    const textNode = questionNode.getElementsByTagName("text")[0];
    const questionText = textNode ? textNode.textContent || "" : "";

    const optionNodes = questionNode.getElementsByTagName("option");
    const options: Option[] = [];

    for (let j = 0; j < optionNodes.length; j++) {
      const optionNode = optionNodes[j];
      const optionId =
        optionNode.getAttribute("id") || `${questionId}_option_${j}`;
      const isCorrect = optionNode.getAttribute("correct") === "true";
      const optionText = optionNode.textContent || "";

      options.push({
        id: optionId,
        text: optionText,
        isCorrect,
      });
    }

    questions.push({
      id: questionId,
      text: questionText,
      options,
      type: questionType,
      marks,
    });
  }

  return questions;
};
