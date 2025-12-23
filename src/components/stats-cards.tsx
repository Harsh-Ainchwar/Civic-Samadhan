import { Card, CardContent } from "./ui/card";
import { MapPin, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalReports: number;
    newIssues: number;
    inProgress: number;
    resolved: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Reports",
      value: stats.totalReports,
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "New Issues",
      value: stats.newIssues,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-medium">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
                <div className={`p-3 rounded-full ${item.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}