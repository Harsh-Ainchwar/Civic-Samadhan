import { Home, FileText, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface CitizenNavigationProps {
  currentUser: string;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export function CitizenNavigation({ currentUser, activeView, onViewChange, onLogout }: CitizenNavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my-reports", label: "My Reports", icon: FileText },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">CivicSamadhan</h1>
              <p className="text-xs text-gray-500">Citizen Portal</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                    activeView === item.id
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {currentUser}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex space-x-1 mt-3 pb-2 border-b border-gray-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors flex-1",
                activeView === item.id
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-gray-600"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </header>
  );
}