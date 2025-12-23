import { Avatar, AvatarFallback } from "./ui/avatar";
import { User } from "lucide-react";

export function UserProfile() {
  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-3 p-3 bg-white rounded-lg border">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-gray-100">
          <User className="w-5 h-5 text-gray-600" />
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">Citizen User</p>
        <p className="text-xs text-muted-foreground">Making cities better</p>
      </div>
    </div>
  );
}