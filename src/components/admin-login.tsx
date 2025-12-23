import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Mail, Lock, ArrowLeft, Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AdminLoginProps {
  onLogin: (userInfo: { name: string; email: string; department: string }) => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accessCode: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication with admin access code validation
    if (formData.accessCode !== "ADMIN2024") {
      toast.error("Invalid admin access code");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Mock successful authentication
    toast.success("Admin access granted");
    onLogin({ 
      name: "Admin User", 
      email: formData.email,
      department: "Municipal Operations"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-teal-700 hover:text-teal-800 hover:bg-teal-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portal Selection
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">Admin Access</CardTitle>
              <CardDescription className="text-teal-600">
                Secure login for municipal staff
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <div className="flex items-start space-x-2">
                <Key className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium">Demo Access Code</p>
                  <p className="text-amber-700">Use <span className="font-mono bg-amber-100 px-1 rounded">ADMIN2024</span> to access the admin portal</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Official Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@civicsamadhan.gov"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="pl-10 pr-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessCode">Admin Access Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="Enter admin access code"
                    value={formData.accessCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessCode: e.target.value }))}
                    required
                    className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This code is provided by your department supervisor
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl transition-all duration-200"
              >
                Sign In to Admin Portal
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto"
              >
                Contact IT Support
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Secured by municipal authentication system</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}