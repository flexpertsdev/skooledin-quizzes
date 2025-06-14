
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Upload } from "lucide-react";
import StudentForm from "@/components/StudentForm";
import WorksheetUpload from "@/components/WorksheetUpload";
import { getStudentInfo } from "@/utils/storage";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("name");
  const [hasCompletedInfo, setHasCompletedInfo] = useState(!!getStudentInfo());

  const handleStudentFormComplete = () => {
    setHasCompletedInfo(true);
    setActiveTab("upload");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-6 bg-white shadow-sm">
        <div className="container max-w-md px-4">
          <h1 className="text-3xl font-bold text-center text-quiz-primary">
            <span className="text-quiz-dark">Quiz</span> Wiz
          </h1>
          <p className="text-center text-gray-600 mt-1">
            Interactive Worksheet Genie
          </p>
        </div>
      </header>
      
      <main className="flex-grow container max-w-md px-4 py-8">
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger 
              value="name" 
              disabled={hasCompletedInfo}
              className="flex items-center gap-2 py-3"
            >
              <BookOpen className="h-4 w-4" />
              <span>Student Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              disabled={!hasCompletedInfo}
              className="flex items-center gap-2 py-3"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="name" className="mt-0">
            <StudentForm onComplete={handleStudentFormComplete} />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-0">
            <WorksheetUpload />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Quiz Wiz Worksheet Genie
      </footer>
    </div>
  );
};

export default Index;
