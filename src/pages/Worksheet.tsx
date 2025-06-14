
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getWorksheet, 
  getCurrentQuestionIndex, 
  saveCurrentQuestionIndex,
  markAsCompleted,
  getAllQuestions,
  getTotalQuestionsCount,
  getCompletedQuestionsCount
} from "@/utils/storage";
import Question from "@/components/Question";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { toast } from "sonner";

const Worksheet = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(getCurrentQuestionIndex());
  const [allQuestions, setAllQuestions] = useState(getAllQuestions());
  const [completedCount, setCompletedCount] = useState(getCompletedQuestionsCount());
  const [totalCount, setTotalCount] = useState(getTotalQuestionsCount());
  const [worksheet, setWorksheet] = useState(getWorksheet());

  useEffect(() => {
    // Check if worksheet data exists
    const worksheetData = getWorksheet();
    if (!worksheetData) {
      toast.error("No worksheet found. Please upload one first.");
      navigate("/");
      return;
    }
    
    setWorksheet(worksheetData);
    setAllQuestions(getAllQuestions());
    setTotalCount(getTotalQuestionsCount());
    setCompletedCount(getCompletedQuestionsCount());
    setCurrentIndex(getCurrentQuestionIndex());
  }, [navigate]);

  const handleNextQuestion = () => {
    const updatedCompletedCount = getCompletedQuestionsCount();
    setCompletedCount(updatedCompletedCount);
    
    if (currentIndex < allQuestions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveCurrentQuestionIndex(nextIndex);
    } else {
      // All questions completed
      markAsCompleted(true);
      navigate("/results");
    }
  };

  const handleFinish = () => {
    markAsCompleted(true);
    navigate("/results");
  };

  // Show loading state if worksheet isn't loaded yet
  if (!worksheet || allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading worksheet...</p>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="container max-w-md px-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <h1 className="text-xl font-bold text-center text-quiz-dark">
              {worksheet.title}
            </h1>
            <div className="w-5" /> {/* Empty div for flex spacing */}
          </div>
          
          <ProgressBar 
            current={currentIndex + 1} 
            total={allQuestions.length} 
          />
        </div>
      </header>
      
      <main className="flex-grow container max-w-md px-4 py-6">
        {currentQuestion ? (
          <Question 
            question={currentQuestion} 
            onNext={handleNextQuestion} 
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl">No questions found</p>
            <Button 
              onClick={() => navigate("/")}
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        )}
        
        {/* Show finish button if at least half of questions are completed */}
        {completedCount >= totalCount / 2 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={handleFinish}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Finish Worksheet ({completedCount}/{totalCount})</span>
            </Button>
            {completedCount < totalCount && (
              <p className="text-xs text-gray-500 mt-2">
                You can finish now or continue answering all questions
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Worksheet;
