
import React, { useState } from "react";
import { Question as QuestionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateQuestionAnswer } from "@/utils/storage";

interface QuestionProps {
  question: QuestionType;
  onNext: () => void;
}

const Question = ({ question, onNext }: QuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    let answer: string | string[] = "";
    let correct = false;
    
    switch (question.type) {
      case "multiple-choice":
      case "matching":
        answer = selectedOption;
        correct = selectedOption === question.correctAnswer;
        break;
      case "text":
      case "fill-blank":
        answer = textAnswer.trim();
        // Check case-insensitive but allow partial credit for close answers
        const userAnswerLower = answer.toLowerCase();
        correct = 
          Array.isArray(question.correctAnswer) 
            ? question.correctAnswer.some(a => 
                userAnswerLower === a.toLowerCase()
              )
            : userAnswerLower === question.correctAnswer.toLowerCase();
        break;
    }
    
    setIsCorrect(correct);
    updateQuestionAnswer(question.id, answer, correct);
    setHasSubmitted(true);
  };
  
  const handleNext = () => {
    onNext();
    setHasSubmitted(false);
    setSelectedOption("");
    setTextAnswer("");
  };

  const renderFeedback = () => {
    return (
      <div className={cn(
        "p-4 rounded-xl mt-4 flex items-center gap-3",
        isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      )}>
        {isCorrect ? (
          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : (
          <X className="h-5 w-5 text-red-500 flex-shrink-0" />
        )}
        <div>
          <p className="font-medium">
            {isCorrect ? "Correct!" : "Not quite right"}
          </p>
          {!isCorrect && (
            <p className="text-sm mt-1">
              The correct answer is:{" "}
              <span className="font-medium">
                {Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(", ")
                  : question.correctAnswer}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case "multiple-choice":
      case "matching":
        return (
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="space-y-3 mt-4"
            disabled={hasSubmitted}
          >
            {question.options?.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-center space-x-2 rounded-xl p-3 border",
                  selectedOption === option.id 
                    ? "border-quiz-primary bg-purple-50" 
                    : "border-gray-200",
                  hasSubmitted && option.id === question.correctAnswer
                    ? "border-green-500 bg-green-50"
                    : "",
                  hasSubmitted && 
                    selectedOption === option.id && 
                    option.id !== question.correctAnswer
                    ? "border-red-500 bg-red-50"
                    : ""
                )}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="text-quiz-primary"
                />
                <Label
                  htmlFor={option.id}
                  className="flex-grow cursor-pointer py-2"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case "text":
      case "fill-blank":
        return (
          <div className="mt-6">
            <Input
              type="text"
              placeholder="Type your answer here..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="input-field text-lg"
              disabled={hasSubmitted}
              autoFocus
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="question-container">
      <h3 className="text-xl font-medium mb-4">{question.text}</h3>
      
      {renderQuestionContent()}
      
      {hasSubmitted && renderFeedback()}
      
      <div className="mt-6 flex justify-end">
        {!hasSubmitted ? (
          <Button 
            onClick={handleSubmit}
            disabled={
              (question.type === "multiple-choice" || question.type === "matching") 
                ? !selectedOption 
                : !textAnswer.trim()
            }
            className="bg-quiz-primary hover:bg-quiz-primary/90 rounded-xl px-8"
          >
            Submit
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            className="bg-quiz-secondary hover:bg-quiz-secondary/90 rounded-xl px-8"
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
};

export default Question;
