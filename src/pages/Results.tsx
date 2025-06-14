
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getWorksheet, 
  getStudentInfo, 
  isCompleted,
  getCorrectAnswersCount,
  getTotalQuestionsCount,
  clearStorage
} from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share, RefreshCcw } from "lucide-react";
import { generatePDF } from "@/services/pdfService";
import { toast } from "sonner";

const Results = () => {
  const navigate = useNavigate();
  const [worksheet, setWorksheet] = useState(getWorksheet());
  const [studentInfo, setStudentInfo] = useState(getStudentInfo());
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [scorePercent, setScorePercent] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Check if worksheet is completed
    if (!isCompleted()) {
      toast.error("Please complete the worksheet first");
      navigate("/worksheet");
      return;
    }
    
    // Check if worksheet and student info exist
    if (!worksheet || !studentInfo) {
      toast.error("Missing worksheet data");
      navigate("/");
      return;
    }
    
    // Calculate score
    const correct = getCorrectAnswersCount();
    const total = getTotalQuestionsCount();
    const percent = Math.round((correct / total) * 100);
    
    setCorrectCount(correct);
    setTotalCount(total);
    setScorePercent(percent);
    
  }, [navigate, worksheet, studentInfo]);
  
  const handleDownloadPDF = async () => {
    if (!worksheet || !studentInfo) return;
    
    try {
      setIsGenerating(true);
      const url = await generatePDF(worksheet, studentInfo);
      setPdfUrl(url);
      
      // Automatically download the PDF
      const link = document.createElement("a");
      link.href = url;
      link.download = `${studentInfo.name}_${worksheet.title}.pdf`.replace(/\s+/g, '_');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleShare = async () => {
    if (!worksheet || !studentInfo || !pdfUrl) {
      // Generate PDF first if not already generated
      try {
        setIsGenerating(true);
        const url = await generatePDF(worksheet, studentInfo);
        setPdfUrl(url);
        setIsGenerating(false);
        
        // Continue with sharing
        shareResults(url);
      } catch (error) {
        console.error("Error generating PDF for sharing:", error);
        toast.error("Failed to generate PDF for sharing");
        setIsGenerating(false);
        return;
      }
    } else {
      // PDF already generated, proceed with sharing
      shareResults(pdfUrl);
    }
  };
  
  const shareResults = async (url: string) => {
    try {
      // Convert blob URL to blob
      const response = await fetch(url);
      const blob = await response.blob();
      
      const fileName = `${studentInfo?.name}_${worksheet?.title}.pdf`.replace(/\s+/g, '_');
      
      // Use Web Share API if available
      if (navigator.share) {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        
        await navigator.share({
          title: `${worksheet?.title} - ${studentInfo?.name}`,
          text: `${studentInfo?.name}'s completed worksheet with score: ${scorePercent}%`,
          files: [file]
        });
        toast.success("Shared successfully!");
      } else {
        // Fallback for browsers that don't support sharing files
        toast.info("Your browser doesn't support direct sharing. Please use the download button instead.");
      }
    } catch (error) {
      console.error("Error sharing results:", error);
      if ((error as Error).name !== 'AbortError') {
        toast.error("Failed to share results");
      }
    }
  };
  
  const handleStartNew = () => {
    clearStorage();
    navigate("/");
  };
  
  if (!worksheet || !studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-6 bg-white shadow-sm">
        <div className="container max-w-md px-4">
          <h1 className="text-3xl font-bold text-center text-quiz-primary">
            Results
          </h1>
        </div>
      </header>
      
      <main className="flex-grow container max-w-md px-4 py-8">
        <Card className="p-6 shadow-lg rounded-3xl border-none animate-fade-in mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-quiz-dark mb-1">
              {studentInfo.name}
            </h2>
            <p className="text-gray-500 text-sm">
              Completed on {studentInfo.timestamp}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-medium mb-4 text-center text-quiz-dark">
              {worksheet.title}
            </h3>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-2xl font-bold">
                  {correctCount}/{totalCount}
                </p>
              </div>
              
              <div className={`text-3xl font-bold rounded-full h-20 w-20 flex items-center justify-center ${
                scorePercent >= 80 
                  ? "bg-green-100 text-green-700" 
                  : scorePercent >= 60 
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {scorePercent}%
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="w-full h-12 bg-quiz-primary hover:bg-quiz-primary/90 rounded-xl flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span>{isGenerating ? "Generating PDF..." : "Download Results"}</span>
            </Button>
            
            <Button 
              onClick={handleShare}
              disabled={isGenerating}
              variant="outline"
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
            >
              <Share className="h-5 w-5" />
              <span>Share with Teacher</span>
            </Button>
          </div>
        </Card>
        
        <div className="text-center">
          <Button 
            variant="ghost"
            onClick={handleStartNew}
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-quiz-primary"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Start New Worksheet</span>
          </Button>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Quiz Wiz Worksheet Genie
      </footer>
    </div>
  );
};

export default Results;
