import { Card, CardContent } from "./ui/card";
import { Plus, Camera, FileText } from "lucide-react";

interface ActionCardsProps {
  onReportIssue: () => void;
  onQuickPhoto: () => void;
  onMyReports: () => void;
}

export function ActionCards({ onReportIssue, onQuickPhoto, onMyReports }: ActionCardsProps) {
  const actions = [
    {
      title: "Report Issue",
      description: "Report a new problem in your area",
      icon: Plus,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      onClick: onReportIssue
    },
    {
      title: "Quick Photo",
      description: "Take a photo and report instantly",
      icon: Camera,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      onClick: onQuickPhoto
    },
    {
      title: "My Reports",
      description: "Check your submitted reports",
      icon: FileText,
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700",
      onClick: onMyReports
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <Card 
            key={index}
            className="border-0 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-105"
            onClick={action.onClick}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full ${action.color} ${action.hoverColor} flex items-center justify-center mx-auto mb-4 transition-colors`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-medium mb-2">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}