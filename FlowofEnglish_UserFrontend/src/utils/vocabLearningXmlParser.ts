import type { VocabularyData, Word } from "@/types/types";

// Accepts an S3 URL, fetches the XML, then parses it
export async function parseXMLData(xmlUrl: string): Promise<VocabularyData> {
  // Fetch the XML content from the URL
  const response = await fetch(xmlUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML: ${response.statusText}`);
  }
  const xmlString = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid XML format");
  }

  const activitiesElement = xmlDoc.querySelector("activities");
  if (!activitiesElement) {
    throw new Error("No activities element found");
  }

  const type = activitiesElement.getAttribute("type");
  if (!type || (type !== "flashcard" && type !== "slider")) {
    throw new Error("Invalid or missing type attribute");
  }

  const wordElements = xmlDoc.querySelectorAll("word");
  const words: Word[] = [];

  wordElements.forEach((wordElement) => {
    const termElement = wordElement.querySelector("term");
    const meaningElement = wordElement.querySelector("meaning");
    const exampleElement = wordElement.querySelector("example");

    if (!termElement || !meaningElement) {
      console.warn("Skipping word with missing term or meaning");
      return;
    }

    const word: Word = {
      term: termElement.textContent?.trim() || "",
      meaning: meaningElement.textContent?.trim() || "",
      example: exampleElement?.textContent?.trim(),
    };

    if (word.term && word.meaning) {
      words.push(word);
    }
  });

  if (words.length === 0) {
    throw new Error("No valid words found in XML");
  }

  return {
    type: type as "flashcard" | "slider",
    words,
  };
}
