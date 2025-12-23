import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Plus, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileText
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  category: string;
  status: "new" | "in-progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
  date: string;
  address: string;
  description: string;
  submittedBy: string;
  assignedTo?: string;
  adminNotes?: string;
}

interface CitizenDashboardProps {
  reports: Report[];
  userReports: Report[];
  onReportIssue: () => void;
  onQuickPhoto: () => void;
}

export function CitizenDashboard({ reports, userReports, onReportIssue, onQuickPhoto }: CitizenDashboardProps) {
  const communityStats = {
    totalReports: reports.length,
    resolved: reports.filter(r => r.status === "resolved").length,
    inProgress: reports.filter(r => r.status === "in-progress").length,
    thisMonth: reports.filter(r => {
      const reportDate = new Date(r.date);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }).length
  };

  const userStats = {
    myReports: userReports.length,
    myResolved: userReports.filter(r => r.status === "resolved").length,
    myPending: userReports.filter(r => r.status !== "resolved").length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "in-progress": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 md:p-8 rounded-xl">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-4xl mb-3">Report. Track. Improve.</h1>
          <p className="text-emerald-100 text-sm md:text-lg mb-4 md:mb-6">
            Shehar Sudhrega, Click Se Badlega!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onReportIssue}
              className="bg-white text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div>
        <h2 className="text-lg md:text-xl mb-4">Community Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-medium">{communityStats.totalReports}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-medium">{communityStats.resolved}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Issues Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-medium">{communityStats.inProgress}</div>
              <div className="text-xs md:text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-medium">{communityStats.thisMonth}</div>
              <div className="text-xs md:text-sm text-muted-foreground">This Month</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h3 className="text-base md:text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={onReportIssue}>
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Report New Issue</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Submit a detailed report</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={onQuickPhoto}>
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">Quick Photo Report</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Snap and submit instantly</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">My Reports</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{userStats.myReports} reports submitted</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Stats */}
          <Card className="mt-4 lg:mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Your Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs md:text-sm">Reports Submitted</span>
                <span className="font-medium text-sm md:text-base">{userStats.myReports}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs md:text-sm">Issues Resolved</span>
                <span className="font-medium text-green-600 text-sm md:text-base">{userStats.myResolved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs md:text-sm">Pending Review</span>
                <span className="font-medium text-yellow-600 text-sm md:text-base">{userStats.myPending}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <h3 className="text-base md:text-lg mb-4">Your Recent Reports</h3>
          <div className="space-y-3">
            {userReports.slice(0, 5).map((report) => (
              <Card key={report.id}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm md:text-base pr-2">{report.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(report.status)}
                      <Badge 
                        variant={
                          report.status === "resolved" ? "default" : 
                          report.status === "in-progress" ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {report.status === "in-progress" ? "In Progress" : report.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Mobile: Stack items vertically, Desktop: Keep horizontal */}
                  <div className="space-y-1 md:space-y-0 md:flex md:items-center md:gap-4 text-xs md:text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{report.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                  {report.assignedTo && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">Assigned to {report.assignedTo}</Badge>
                    </div>
                  )}
                  {report.adminNotes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="font-medium text-blue-900 text-xs md:text-sm">Admin Update:</p>
                      <p className="text-blue-800 text-xs md:text-sm">{report.adminNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {userReports.length === 0 && (
              <Card>
                <CardContent className="p-6 md:p-8 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm md:text-base">No reports submitted yet</p>
                  <p className="text-xs md:text-sm">Start by reporting an issue in your area</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}