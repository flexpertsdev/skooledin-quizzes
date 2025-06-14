
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { saveWorksheet, clearStorage } from "@/utils/storage";
import { processWorksheetImage } from "@/services/openAIService";
import LoadingState from "@/components/LoadingState";
import { Worksheet } from "@/types";

// Processing stages for the loading animation
const processingStages = [
  "Analyzing worksheet...",
  "Extracting questions...",
  "Converting to interactive format...",
  "Finalizing worksheet..."
];

const WorksheetUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const simulateProcessingStages = () => {
    const totalStages = processingStages.length;
    let currentStage = 0;
    
    const interval = setInterval(() => {
      if (currentStage < totalStages) {
        setProcessingStage(currentStage);
        setProcessingProgress(Math.floor((currentStage / (totalStages - 1)) * 100));
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please upload a worksheet image");
      return;
    }
    
    setIsUploading(true);
    const cleanupInterval = simulateProcessingStages();
    
    // Clear any previous data
    clearStorage();
    
    try {
      // Process the worksheet image using OpenAI
      const result = await processWorksheetImage(file);
      
      if (result.error || !result.worksheet) {
        toast.error(result.error || "Failed to process worksheet");
        setIsUploading(false);
        cleanupInterval();
        return;
      }
      
      // Save the processed worksheet
      saveWorksheet(result.worksheet);
      
      toast.success("Worksheet processed successfully!");
      cleanupInterval();
      setTimeout(() => {
        navigate("/worksheet");
      }, 500);
    } catch (error) {
      console.error("Error during worksheet processing:", error);
      toast.error("Something went wrong. Please try again.");
      setIsUploading(false);
      cleanupInterval();
    }
  };

  const handleDemoClick = () => {
    clearStorage();
    const demoWorksheet = createSampleWorksheet();
    saveWorksheet(demoWorksheet);
    toast.success("Demo worksheet loaded!");
    navigate("/worksheet");
  };

  // For demo purposes - we'll create a sample Spanish worksheet
  const createSampleWorksheet = (): Worksheet => {
    return {
      id: "demo-worksheet",
      title: "Spanish Game Night Worksheet!",
      description: "Let's practice our Spanish game phrases!",
      sections: [
        {
          id: "section-1",
          title: "Match the English to Spanish",
          instructions: "Match the sentences, fill in the blanks, and have fun!",
          questions: [
            {
              id: "q1",
              type: "matching",
              text: "It is my turn.",
              options: [
                { id: "a", text: "¡Oh no, te deslizaste por la serpiente!" },
                { id: "b", text: "Es mi turno." },
                { id: "c", text: "Voy a tirar el dado." },
                { id: "d", text: "Te moviste dos espacios." },
                { id: "e", text: "Subí la escalera." }
              ],
              correctAnswer: "b"
            },
            {
              id: "q2",
              type: "matching",
              text: "I will throw the dice.",
              options: [
                { id: "a", text: "¡Oh no, te deslizaste por la serpiente!" },
                { id: "b", text: "Es mi turno." },
                { id: "c", text: "Voy a tirar el dado." },
                { id: "d", text: "Te moviste dos espacios." },
                { id: "e", text: "Subí la escalera." }
              ],
              correctAnswer: "c"
            },
            {
              id: "q3",
              type: "matching",
              text: "You moved two spaces.",
              options: [
                { id: "a", text: "¡Oh no, te deslizaste por la serpiente!" },
                { id: "b", text: "Es mi turno." },
                { id: "c", text: "Voy a tirar el dado." },
                { id: "d", text: "Te moviste dos espacios." },
                { id: "e", text: "Subí la escalera." }
              ],
              correctAnswer: "d"
            },
            {
              id: "q4",
              type: "matching",
              text: "I climbed the ladder.",
              options: [
                { id: "a", text: "¡Oh no, te deslizaste por la serpiente!" },
                { id: "b", text: "Es mi turno." },
                { id: "c", text: "Voy a tirar el dado." },
                { id: "d", text: "Te moviste dos espacios." },
                { id: "e", text: "Subí la escalera." }
              ],
              correctAnswer: "e"
            },
            {
              id: "q5",
              type: "matching",
              text: "Oh no, you slid down!",
              options: [
                { id: "a", text: "¡Oh no, te deslizaste por la serpiente!" },
                { id: "b", text: "Es mi turno." },
                { id: "c", text: "Voy a tirar el dado." },
                { id: "d", text: "Te moviste dos espacios." },
                { id: "e", text: "Subí la escalera." }
              ],
              correctAnswer: "a"
            }
          ]
        },
        {
          id: "section-2",
          title: "Fill in the blanks",
          instructions: "Fill in the missing Spanish words:",
          questions: [
            {
              id: "q6",
              type: "fill-blank",
              text: "_______ mi turno.",
              correctAnswer: "Es"
            },
            {
              id: "q7",
              type: "fill-blank",
              text: "Voy a _______ el dado.",
              correctAnswer: "tirar"
            },
            {
              id: "q8",
              type: "fill-blank",
              text: "Te _______ dos espacios.",
              correctAnswer: "moviste"
            },
            {
              id: "q9",
              type: "fill-blank",
              text: "Subí la _______.",
              correctAnswer: "escalera"
            },
            {
              id: "q10",
              type: "fill-blank",
              text: "_______ no, te deslizaste por la serpiente.",
              correctAnswer: "Oh"
            }
          ]
        }
      ]
    };
  };

  if (isUploading) {
    return (
      <Card className="p-6 shadow-lg rounded-3xl border-none">
        <LoadingState 
          status={processingStages[processingStage]} 
          progress={processingProgress}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg rounded-3xl border-none">
      <h2 className="text-2xl font-bold mb-2 text-center text-quiz-dark">
        Upload Your Worksheet
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Take a photo or upload an image of your worksheet
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-quiz-primary transition-colors"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Upload 
            className="mx-auto h-12 w-12 text-gray-400 mb-3" 
            strokeWidth={1.5}
          />
          
          {file ? (
            <p className="text-quiz-primary font-medium">
              {file.name}
            </p>
          ) : (
            <>
              <p className="font-medium text-lg mb-1">
                Tap to upload
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG or PDF up to 10MB
              </p>
            </>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 text-lg bg-quiz-primary hover:bg-quiz-primary/90 rounded-xl"
          disabled={!file}
        >
          Process Worksheet
        </Button>
      </form>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl"
          onClick={handleDemoClick}
        >
          <BookOpen className="h-5 w-5" />
          <span>Try Demo Worksheet</span>
        </Button>
      </div>
    </Card>
  );
};

export default WorksheetUpload;
