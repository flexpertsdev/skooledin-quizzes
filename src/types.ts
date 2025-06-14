
export type QuestionType = "multiple-choice" | "text" | "fill-blank" | "matching";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: Option[];
  correctAnswer: string | string[];
  userAnswer?: string | string[];
  isCorrect?: boolean;
}

export interface WorksheetSection {
  id: string;
  title: string;
  instructions: string;
  questions: Question[];
}

export interface Worksheet {
  id: string;
  title: string;
  description?: string;
  sections: WorksheetSection[];
}

export interface StudentInfo {
  name: string;
  timestamp: string;
}

export interface ProcessingStatus {
  stage: number;
  message: string;
  progress: number;
}
