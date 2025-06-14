
import React from "react";
import { Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  status: string;
  progress?: number;
}

const LoadingState = ({ status, progress = 0 }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative">
        <Loader 
          className="h-14 w-14 text-quiz-primary animate-spin" 
          strokeWidth={1.5}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 bg-white rounded-full"></div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mt-6 mb-2">
        {status}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6">
        Please wait while we process your worksheet...
      </p>
      
      <div className="w-full max-w-xs">
        <Progress 
          value={progress} 
          className="h-2 bg-gray-200"
        />
        <div className="flex justify-end mt-2">
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
