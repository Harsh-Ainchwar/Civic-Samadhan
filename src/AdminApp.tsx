import { useState } from "react";
import { AdminNavigation } from "./components/admin-navigation";
import { AdminDashboard } from "./components/admin-dashboard";
import { ReportIssueForm } from "./components/report-issue-form";
import { ReportAnalytics } from "./components/report-analytics";
import { ImageDebugTest } from "./components/image-debug-test";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { useComplaints } from "./contexts/ComplaintContext";

interface UserInfo {
  name: string;
  email: string;
  department?: string;
}

interface AdminAppProps {
  userInfo: UserInfo;
  onLogout: () => void;
}

export default function AdminApp({ userInfo, onLogout }: AdminAppProps) {
  const [activeView, setActiveView] = useState("dashboard");
  const currentUser = userInfo.name;
  const { complaints, addComplaint, updateComplaint, deleteComplaint, loading } = useComplaints();

  const handleReportSubmit = (newReport: any) => {
    addComplaint(newReport);
    setActiveView("dashboard");
    toast.success("Report submitted successfully!");
  };

  const handleUpdateReport = (reportId: string, updates: any) => {
    updateComplaint(reportId, updates);
  };

  const handleDeleteReport = (reportId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this complaint?');
    if (confirmDelete) {
      deleteComplaint(reportId);
      toast.success("Report deleted successfully!");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <AdminDashboard 
            reports={complaints}
            onUpdateReport={handleUpdateReport}
            onDeleteReport={handleDeleteReport}
          />
        );
      case "analytics":
        return (
          <ReportAnalytics 
            reports={complaints}
          />
        );
      case "debug":
        return <ImageDebugTest />;
      case "report-issue":
        return (
          <ReportIssueForm 
            onSubmit={handleReportSubmit}
            onCancel={() => setActiveView("dashboard")}
            currentUser={currentUser}
          />
        );
      default:
        return (
          <AdminDashboard 
            reports={complaints}
            onUpdateReport={handleUpdateReport}
            onDeleteReport={handleDeleteReport}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AdminNavigation 
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
      />
      <div className="flex-1 overflow-auto">
        <div className="p-3 md:p-6">
          {renderContent()}
        </div>
      </div>
      <Toaster />
    </div>
  );
}