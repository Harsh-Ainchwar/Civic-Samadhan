import { cn } from "./ui/utils";
import { Map, FileText, User, Settings, Home } from "lucide-react";

interface SidebarNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function SidebarNavigation({ activeView, onViewChange }: SidebarNavigationProps) {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "city-map", label: "City Map", icon: Map },
    { id: "report-issue", label: "Report Issue", icon: FileText },
    { id: "my-reports", label: "My Reports", icon: User },
    { id: "admin", label: "Admin Dashboard", icon: Settings, badge: "Staff" }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">CL</span>
        </div>
        <div>
          <h2 className="font-medium">CityLink</h2>
          <p className="text-sm text-muted-foreground">Civic Reporting Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-2 mb-8">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Navigation
        </p>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-medium" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <IconComponent className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Quick Stats
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Reports</span>
            <span className="font-medium">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Resolved Today</span>
            <span className="font-medium">8</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Your Reports</span>
            <span className="font-medium">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}