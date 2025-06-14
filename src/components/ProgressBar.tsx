
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.floor((current / total) * 100) : 0;
  
  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Question {current} of {total}
        </span>
        <span className="font-medium text-quiz-primary">
          {percentage}% Complete
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn("h-2 bg-gray-200")}
      />
    </div>
  );
};

export default ProgressBar;
