import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { User, Shield } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: "citizen" | "admin";
  onRoleChange: (role: "citizen" | "admin") => void;
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <div className="flex items-center gap-2 p-2 md:p-3 bg-white rounded-lg border">
      <div className="flex items-center gap-1 md:gap-2">
        {currentRole === "citizen" ? (
          <User className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
        ) : (
          <Shield className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
        )}
        <span className="font-medium text-xs md:text-sm">
          {currentRole === "citizen" ? "Citizen" : "Admin"}
        </span>
        <Badge variant={currentRole === "admin" ? "destructive" : "secondary"} className="text-xs hidden sm:inline-flex">
          {currentRole === "citizen" ? "Public" : "Staff"}
        </Badge>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRoleChange(currentRole === "citizen" ? "admin" : "citizen")}
        className="text-xs md:text-sm px-2 md:px-3"
      >
        <span className="hidden md:inline">Switch to </span>
        {currentRole === "citizen" ? "Admin" : "Citizen"}
      </Button>
    </div>
  );
}