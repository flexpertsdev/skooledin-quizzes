
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { saveStudentInfo } from "@/utils/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StudentFormProps {
  onComplete: () => void;
}

const StudentForm = ({ onComplete }: StudentFormProps) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setIsSubmitting(true);
    
    // Format current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const timestamp = `${formattedDate} at ${formattedTime}`;
    
    // Save student info to session storage
    saveStudentInfo({
      name: name.trim(),
      timestamp
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 500);
  };

  return (
    <div className="animate-fade-in">
      <Card className="p-6 shadow-lg rounded-3xl border-none">
        <h2 className="text-2xl font-bold mb-6 text-center text-quiz-dark">
          Welcome to Quiz Wiz!
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="student-name" 
              className="text-sm font-medium text-gray-700"
            >
              Your Name
            </label>
            <Input
              id="student-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl p-4 h-12 text-lg"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-quiz-primary hover:bg-quiz-primary/90 rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Start Worksheet"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default StudentForm;
