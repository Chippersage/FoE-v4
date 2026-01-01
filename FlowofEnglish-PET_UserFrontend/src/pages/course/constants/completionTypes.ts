// constants/completionTypes.ts
export const MANUAL_COMPLETION_TYPES = [
  "image",
  "pdf",
  "youtube",
  // Add more types later as needed
  // "audio",
  // "word",
  // "document",
  // "text",
  // "link"
];

export const AUTO_COMPLETION_TYPES = [
  "video",
  // These auto-complete based on user interaction
  "assignment", // Actually needs submission but auto-completes after upload
  "googleform",
  "assessment",
  "mcq",
  "mtf",
  "quiz"
];

export const NEEDS_SUBMISSION_TYPES = [
  "assignment",
  "googleform",
  "assessment",
  "quiz"
];