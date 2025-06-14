
import { Worksheet, StudentInfo, Question } from "@/types";

const WORKSHEET_KEY = "quiz_wizard_worksheet";
const CURRENT_QUESTION_KEY = "quiz_wizard_current_question";
const STUDENT_INFO_KEY = "quiz_wizard_student_info";
const COMPLETED_KEY = "quiz_wizard_completed";

export const saveWorksheet = (worksheet: Worksheet): void => {
  sessionStorage.setItem(WORKSHEET_KEY, JSON.stringify(worksheet));
};

export const getWorksheet = (): Worksheet | null => {
  const data = sessionStorage.getItem(WORKSHEET_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveCurrentQuestionIndex = (index: number): void => {
  sessionStorage.setItem(CURRENT_QUESTION_KEY, index.toString());
};

export const getCurrentQuestionIndex = (): number => {
  const index = sessionStorage.getItem(CURRENT_QUESTION_KEY);
  return index ? parseInt(index, 10) : 0;
};

export const saveStudentInfo = (info: StudentInfo): void => {
  sessionStorage.setItem(STUDENT_INFO_KEY, JSON.stringify(info));
};

export const getStudentInfo = (): StudentInfo | null => {
  const data = sessionStorage.getItem(STUDENT_INFO_KEY);
  return data ? JSON.parse(data) : null;
};

export const markAsCompleted = (completed: boolean): void => {
  sessionStorage.setItem(COMPLETED_KEY, completed.toString());
};

export const isCompleted = (): boolean => {
  const completed = sessionStorage.getItem(COMPLETED_KEY);
  return completed === "true";
};

export const updateQuestionAnswer = (
  questionId: string, 
  answer: string | string[], 
  isCorrect: boolean
): void => {
  const worksheet = getWorksheet();
  if (!worksheet) return;
  
  let updated = false;
  
  const updatedSections = worksheet.sections.map(section => {
    const updatedQuestions = section.questions.map(question => {
      if (question.id === questionId) {
        updated = true;
        return {
          ...question,
          userAnswer: answer,
          isCorrect
        };
      }
      return question;
    });
    
    return {
      ...section,
      questions: updatedQuestions
    };
  });
  
  if (updated) {
    saveWorksheet({
      ...worksheet,
      sections: updatedSections
    });
  }
};

export const getCompletedQuestionsCount = (): number => {
  const worksheet = getWorksheet();
  if (!worksheet) return 0;
  
  return worksheet.sections.reduce((total, section) => {
    return total + section.questions.filter(q => q.userAnswer !== undefined).length;
  }, 0);
};

export const getTotalQuestionsCount = (): number => {
  const worksheet = getWorksheet();
  if (!worksheet) return 0;
  
  return worksheet.sections.reduce((total, section) => {
    return total + section.questions.length;
  }, 0);
};

export const getAllQuestions = (): Question[] => {
  const worksheet = getWorksheet();
  if (!worksheet) return [];
  
  return worksheet.sections.flatMap(section => section.questions);
};

export const getCorrectAnswersCount = (): number => {
  const questions = getAllQuestions();
  return questions.filter(q => q.isCorrect).length;
};

export const clearStorage = (): void => {
  sessionStorage.removeItem(WORKSHEET_KEY);
  sessionStorage.removeItem(CURRENT_QUESTION_KEY);
  sessionStorage.removeItem(STUDENT_INFO_KEY);
  sessionStorage.removeItem(COMPLETED_KEY);
};
