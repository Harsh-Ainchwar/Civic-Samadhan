import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { 
  BarChart3, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Target
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
  photos?: Array<{
    id: string;
    url: string;
    filename: string;
  }>;
}

interface ReportAnalyticsProps {
  reports: Report[];
}

export function ReportAnalytics({ reports }: ReportAnalyticsProps) {
  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const statusCounts = {
      total: reports.length,
      new: reports.filter(r => r.status === "new").length,
      inProgress: reports.filter(r => r.status === "in-progress").length,
      resolved: reports.filter(r => r.status === "resolved").length,
      rejected: reports.filter(r => r.status === "rejected").length
    };

    const priorityCounts = {
      critical: reports.filter(r => r.priority === "critical").length,
      high: reports.filter(r => r.priority === "high").length,
      medium: reports.filter(r => r.priority === "medium").length,
      low: reports.filter(r => r.priority === "low").length
    };

    return {
      statusCounts,
      priorityCounts
    };
  }, [reports]);

  // Prepare data for charts
  const statusBarData = [
    { name: "New", value: analyticsData.statusCounts.new, color: "#ef4444" },
    { name: "In Progress", value: analyticsData.statusCounts.inProgress, color: "#f59e0b" },
    { name: "Resolved", value: analyticsData.statusCounts.resolved, color: "#10b981" },
    { name: "Rejected", value: analyticsData.statusCounts.rejected, color: "#6b7280" }
  ];

  const priorityBarData = [
    { name: "Critical", value: analyticsData.priorityCounts.critical, color: "#dc2626" },
    { name: "High", value: analyticsData.priorityCounts.high, color: "#ea580c" },
    { name: "Medium", value: analyticsData.priorityCounts.medium, color: "#ca8a04" },
    { name: "Low", value: analyticsData.priorityCounts.low, color: "#16a34a" }
  ];



  // Calculate resolution rate
  const resolutionRate = analyticsData.statusCounts.total > 0 
    ? Math.round((analyticsData.statusCounts.resolved / analyticsData.statusCounts.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8" />
          <h1 className="text-3xl font-medium">Report Analytics</h1>
        </div>
        <p className="text-emerald-100">Comprehensive analysis of civic issue reports</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-blue-600">{analyticsData.statusCounts.total}</div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-red-600">{analyticsData.statusCounts.new}</div>
            <div className="text-sm text-muted-foreground">New Reports</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-yellow-600">{analyticsData.statusCounts.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-green-600">{analyticsData.statusCounts.resolved}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-600">{analyticsData.statusCounts.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-emerald-600">{resolutionRate}%</div>
            <div className="text-sm text-muted-foreground">Resolution Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Report Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill={(entry: any) => entry.color}
                >
                  {statusBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              Priority Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {priorityBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">{analyticsData.statusCounts.total}</div>
              <div className="text-sm text-blue-700">Total Reports Submitted</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">{resolutionRate}%</div>
              <div className="text-sm text-green-700">Resolution Success Rate</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-semibold text-yellow-600">
                {analyticsData.statusCounts.new + analyticsData.statusCounts.inProgress}
              </div>
              <div className="text-sm text-yellow-700">Pending Reports</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-semibold text-red-600">{analyticsData.priorityCounts.critical}</div>
              <div className="text-sm text-red-700">Critical Priority Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}