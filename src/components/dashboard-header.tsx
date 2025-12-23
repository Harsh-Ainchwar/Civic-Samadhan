import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  onReportIssue: () => void;
}

export function DashboardHeader({ onReportIssue }: DashboardHeaderProps) {
  return (
    <div className="bg-blue-600 text-white p-8 rounded-lg mb-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl mb-2">Make Your City Better</h1>
        <p className="text-blue-100 text-lg mb-6">
          Report issues, track progress, build community
        </p>
        <Button 
          onClick={onReportIssue}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report an Issue
        </Button>
      </div>
    </div>
  );
}