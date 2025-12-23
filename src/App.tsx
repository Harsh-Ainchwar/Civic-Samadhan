import { useState } from "react";
import CitizenApp from "./CitizenApp";
import AdminApp from "./AdminApp";
import { CitizenLogin } from "./components/citizen-login";
import { AdminLogin } from "./components/admin-login";
import { Button } from "./components/ui/button";
import { Shield, User } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { ComplaintProvider } from "./contexts/ComplaintContext";
import civicSamadhanLogo from 'figma:asset/825f42b24faf631a9052f4e773b207ab7084e00b.png';

interface UserInfo {
  name: string;
  email: string;
  department?: string;
}

function AppContent() {
  const [currentMode, setCurrentMode] = useState<"citizen" | "admin" | "citizen-login" | "admin-login" | "select">("select");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleCitizenLogin = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentMode("citizen");
  };

  const handleAdminLogin = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentMode("admin");
  };

  const handleDirectAdminAccess = () => {
    const adminInfo: UserInfo = {
      name: "Admin User",
      email: "admin@civicsamadhan.com",
      department: "Municipal Administration"
    };
    setUserInfo(adminInfo);
    setCurrentMode("admin");
  };

  const handleLogout = () => {
    setUserInfo(null);
    setCurrentMode("select");
  };

  if (currentMode === "citizen" && userInfo) {
    return <CitizenApp userInfo={userInfo} onLogout={handleLogout} />;
  }

  if (currentMode === "admin" && userInfo) {
    return <AdminApp userInfo={userInfo} onLogout={handleLogout} />;
  }

  if (currentMode === "citizen-login") {
    return <CitizenLogin onLogin={handleCitizenLogin} onBack={() => setCurrentMode("select")} />;
  }

  if (currentMode === "admin-login") {
    return <AdminLogin onLogin={handleAdminLogin} onBack={() => setCurrentMode("select")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src={civicSamadhanLogo} 
              alt="CivicSamadhan Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CivicSamadhan</h1>
          <p className="text-gray-600">Choose your portal to get started</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setCurrentMode("citizen-login")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <User className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Citizen Portal</div>
              <div className="text-emerald-100 text-sm">Report issues & track progress</div>
            </div>
          </Button>

          <Button
            onClick={handleDirectAdminAccess}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Shield className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Admin Portal</div>
              <div className="text-teal-100 text-sm">Manage reports & assign tasks</div>
            </div>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
             Civic Issue Reporting Platform
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ComplaintProvider>
      <AppContent />
    </ComplaintProvider>
  );
}