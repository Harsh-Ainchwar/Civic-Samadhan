import { Button } from "./ui/button";
import { RoleSwitcher } from "./role-switcher";
import { Badge } from "./ui/badge";
import { Bell, Settings, HelpCircle } from "lucide-react";

interface NavigationHeaderProps {
  currentRole: "citizen" | "admin";
  onRoleChange: (role: "citizen" | "admin") => void;
  currentUser: string;
}

export function NavigationHeader({ currentRole, onRoleChange, currentUser }: NavigationHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between p-3 md:p-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-sm md:text-lg">CR</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-medium text-base md:text-lg">Civic Reporter</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Community Issue Tracking</p>
            </div>
          </div>
          
          <Badge variant="outline" className="hidden lg:inline-flex">
            v2.0
          </Badge>
        </div>

        {/* Center - Role Switcher (Hidden on mobile, shown on tablet+) */}
        <div className="hidden sm:flex flex-1 justify-center">
          <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
        </div>

        {/* Right Side - User Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Mobile Role Switcher */}
          <div className="sm:hidden">
            <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 pl-2 md:pl-3 border-l">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-medium text-xs md:text-sm">
                {currentUser.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium">{currentUser}</p>
              <p className="text-xs text-muted-foreground">
                {currentRole === "admin" ? "Administrator" : "Citizen"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}