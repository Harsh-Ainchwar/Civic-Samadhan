import { useState } from "react";
import { CitizenNavigation } from "./components/citizen-navigation";
import { CitizenDashboard } from "./components/citizen-dashboard";
import { ReportIssueForm } from "./components/report-issue-form";
import { MyReports } from "./components/my-reports";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { useComplaints } from "./contexts/ComplaintContext";

interface UserInfo {
  name: string;
  email: string;
}



interface CitizenAppProps {
  userInfo: UserInfo;
  onLogout: () => void;
}

export default function CitizenApp({ userInfo, onLogout }: CitizenAppProps) {
  const [activeView, setActiveView] = useState("dashboard");
  const currentUser = userInfo.name;
  const { complaints, addComplaint, loading } = useComplaints();

  // Filter out rejected complaints for user reports
  const userReports = complaints.filter(r => r.submittedBy === currentUser && r.status !== "rejected");

  const handleReportSubmit = async (newReport: any) => {
    try {
      await addComplaint(newReport);
      setActiveView("dashboard");
      toast.success("Report submitted successfully! City officials will review your submission.");
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("Failed to submit report. Please try again.");
    }
  };

  const handleQuickPhoto = () => {
    toast.info("Quick Photo feature would open camera interface");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your reports...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <CitizenDashboard 
            reports={complaints}
            userReports={userReports}
            onReportIssue={() => setActiveView("report-issue")}
            onQuickPhoto={handleQuickPhoto}
          />
        );
      case "report-issue":
        return (
          <ReportIssueForm 
            onSubmit={handleReportSubmit}
            onCancel={() => setActiveView("dashboard")}
            currentUser={currentUser}
          />
        );
      case "my-reports":
        // For MyReports, we need to filter out "rejected" status since it's not supported
        const myReportsForDisplay = userReports
          .filter(report => report.status !== "rejected")
          .map(report => ({
            id: report.id,
            title: report.title,
            category: report.category,
            // Map the status to the supported types for MyReports
            status: report.status as "new" | "in-progress" | "resolved",
            priority: report.priority,
            date: report.date,
            address: report.address,
            description: report.description,
            submittedBy: report.submittedBy,
            assignedTo: report.assignedTo,
            adminNotes: report.adminNotes,
            photos: report.photos
          }));
        return <MyReports reports={myReportsForDisplay} />;
      default:
        return (
          <CitizenDashboard 
            reports={complaints}
            userReports={userReports}
            onReportIssue={() => setActiveView("report-issue")}
            onQuickPhoto={handleQuickPhoto}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <CitizenNavigation 
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