// src/utils/fetchAndParseQuestionsFromXML.ts
import axios from "axios";

export interface ParsedQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

/**
 * Fetches XML from a given URL and parses it into a list of questions.
 * Each question includes its text, options, and the correct answer.
 */
export const fetchAndParseQuestionsFromXML = async (
  xmlUrl: string
): Promise<ParsedQuestion[]> => {
  try {
    // Fetch the XML file content
    const response = await axios.get(xmlUrl);
    const xmlString = response.data;

    // Parse the XML string into a DOM structure
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Extract all <question> nodes
    const questionNodes = xmlDoc.getElementsByTagName("question");
    const questions: ParsedQuestion[] = [];

    // Iterate over each <question> node
    for (let i = 0; i < questionNodes.length; i++) {
      const questionNode = questionNodes[i];
      const questionId = questionNode.getAttribute("id") || `question_${i}`;

      // Extract question text and remove unwanted braces if any
      const questionText = (questionNode.getAttribute("desc") || "")
        .replace(/[{}]/g, "")
        .trim();

      const optionNodes = questionNode.getElementsByTagName("option");
      const options: string[] = [];
      let correctAnswer = "";

      // Extract each option and determine the correct one
      for (let j = 0; j < optionNodes.length; j++) {
        const optionNode = optionNodes[j];
        const optionText = (optionNode.getAttribute("desc") || "")
          .replace(/[{}]/g, "")
          .trim();

        const isCorrect =
          optionNode.getAttribute("correct")?.toLowerCase() === "true";

        options.push(optionText);
        if (isCorrect) correctAnswer = optionText;
      }

      // Add parsed question to the result list
      questions.push({
        id: questionId,
        text: questionText,
        options,
        correctAnswer,
      });
    }

    return questions;
  } catch (error) {
    console.error("Error parsing XML:", error);
    return [];
  }
};
