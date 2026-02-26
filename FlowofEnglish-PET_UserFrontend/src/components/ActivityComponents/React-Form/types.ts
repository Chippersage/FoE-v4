// features/react-form/types.ts

export interface Option {
  id: string;
  text: string;
  correct?: boolean;
}

export interface Question {
  id: string;
  type: string;
  marks: number;
  text?: string;
  mediaUrl?: string;
  options?: Option[];
}

export interface Activity {
  instructions: string;
  maxPlaysPerAudio: number;
  mediaUrl?: string;
  mediaType?: string;
  questions: Question[];
  scriptUrl?: string;
}