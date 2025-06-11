import { Question, Option } from "../types/types";

export const fetchAndParseQuestionsFromXML = async (
  xmlUrl: string
): Promise<{ questions: Question[]; activitiesHeaderText: string | null }> => {
  const response = await fetch(xmlUrl);
  const xmlString = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // First check if we have an activities tag and extract its headertext
  const activitiesNode = xmlDoc.getElementsByTagName("activities")[0];
  const activitiesHeaderText =
    activitiesNode?.getAttribute("headertext") || null;

  const questionNodes = xmlDoc.getElementsByTagName("question");
  const questions: Question[] = [];

  for (let i = 0; i < questionNodes.length; i++) {
    const questionNode = questionNodes[i];
    const questionId = questionNode.getAttribute("id") || `question_${i}`;
    const rawText = questionNode.getAttribute("desc") || "";
    const questionText = rawText.replace(/^\{\s*|\s*\}$/g, "");
    const headerText = questionNode.getAttribute("headertext") || "";
    const reference = questionNode.getAttribute("reference") || null; // Parse reference attribute
    const img = questionNode.getAttribute("img") || null; // Parse img attribute

    const optionNodes = questionNode.getElementsByTagName("option");
    const options: Option[] = [];
    let correctCount = 0;

    for (let j = 0; j < optionNodes.length; j++) {
      const optionNode = optionNodes[j];
      const optionId =
        optionNode.getAttribute("slno") || `${questionId}_option_${j}`;
      const isCorrect =
        optionNode.getAttribute("correct")?.toLowerCase() === "true";
      const optionText = optionNode.getAttribute("desc") || "";

      if (isCorrect) correctCount++;

      options.push({
        id: optionId,
        text: optionText,
        isCorrect,
      });
    }

    const type: "single" | "multiple" =
      correctCount > 1 ? "multiple" : "single";

    questions.push({
      id: questionId,
      text: questionText,
      headerText, // Individual question headerText
      reference, // Add reference to the question object
      img, // Add img to the question object
      options,
      type,
      marks: 1,
    });
  }

  return { questions, activitiesHeaderText };
};
