import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { cn } from "./ui/utils";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  Filter,
  MapPin,
  Calendar,
  MessageSquare,
  Wrench,
  User,
  X,
  ChevronRight,
  Menu,
  Image as ImageIcon,
  ZoomIn
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { EnhancedImageDisplay } from "./enhanced-image-display";

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
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AdminDashboardProps {
  reports: Report[];
  onUpdateReport: (reportId: string, updates: Partial<Report>) => void;
}

export function AdminDashboard({ reports, onUpdateReport }: AdminDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "in-progress": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected": return <AlertTriangle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = (reportId: string, newStatus: string) => {
    onUpdateReport(reportId, { status: newStatus as any });
    toast.success(`Report status updated to ${newStatus}`);
  };

  const handleAssignReport = (reportId: string, assignedTo: string) => {
    onUpdateReport(reportId, { assignedTo });
    toast.success(`Report assigned to ${assignedTo}`);
  };

  const handleAddNote = (reportId: string, note: string) => {
    onUpdateReport(reportId, { adminNotes: note });
    toast.success("Admin note added successfully");
  };

  const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === "new").length,
    inProgress: reports.filter(r => r.status === "in-progress").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    critical: reports.filter(r => r.priority === "critical").length
  };

  // Mobile detail view handler
  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  // Report Details Component (for reuse in both desktop and mobile)
  const ReportDetailsContent = () => (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Manage Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select 
              value={selectedReport?.status} 
              onValueChange={(value) => selectedReport && handleStatusUpdate(selectedReport.id, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Assign To</label>
            <Select 
              value={selectedReport?.assignedTo || "unassigned"} 
              onValueChange={(value) => selectedReport && handleAssignReport(selectedReport.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="John Smith">Pramod Ansari (Streets)</SelectItem>
                <SelectItem value="Sarah Johnson">Sara (Utilities)</SelectItem>
                <SelectItem value="Mike Brown">Dhruv Rathi (Parks)</SelectItem>
                <SelectItem value="Lisa Davis">Arjun Kapoor (Traffic)</SelectItem>
                <SelectItem value="Diya Deshpande">Diya Deshpande (Sidewalk)</SelectItem>
                <SelectItem value="Karan Jadhav">Karan Jadhav (Water)</SelectItem>
                <SelectItem value="Maya Mahajan">Maya Mahajan (Trash)</SelectItem> 
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Admin Notes</label>
            <Textarea
              placeholder="Add internal notes..."
              value={selectedReport?.adminNotes || ""}
              onChange={(e) => selectedReport && handleAddNote(selectedReport.id, e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => selectedReport && handleStatusUpdate(selectedReport.id, "resolved")}
            disabled={selectedReport?.status === "resolved"}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Resolved
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Report Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium mb-1">{selectedReport?.title}</p>
            <p className="text-sm text-muted-foreground">{selectedReport?.description}</p>
          </div>
          
          {/* Photos Section - Fixed with EnhancedImageDisplay */}
          {selectedReport?.photos && selectedReport.photos.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Attached Photos ({selectedReport.photos.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedReport.photos.map((photo, index) => (
                  <div key={photo.id || `photo-${index}`} className="group relative">
                    <EnhancedImageDisplay
                      src={photo.url}
                      alt={photo.filename || 'Uploaded photo'}
                      filename={photo.filename}
                      className="aspect-square border rounded-lg"
                      showDebugInfo={true}
                      onImageClick={() => window.open(photo.url, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                        onClick={() => window.open(photo.url, '_blank')}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm space-y-1">
            <p><strong>Category:</strong> {selectedReport?.category}</p>
            <p><strong>Location:</strong> {selectedReport?.address}</p>
            {selectedReport?.coordinates && (
              <p>
                <strong>View Location:</strong>{" "}
                <a 
                  href={`https://www.google.com/maps?q=${selectedReport.coordinates.lat},${selectedReport.coordinates.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  Open in Google Maps
                </a>
              </p>
            )}
            <p><strong>Submitted:</strong> {selectedReport && new Date(selectedReport.date).toLocaleString()}</p>
            <p><strong>Reporter:</strong> {selectedReport?.submittedBy}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 md:p-6 rounded-lg">
        <h1 className="text-2xl md:text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-emerald-100 text-sm md:text-base">Manage and resolve civic complaints efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl font-medium text-emerald-600">{stats.total}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Total Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl font-medium text-red-600">{stats.new}</div>
            <div className="text-xs md:text-sm text-muted-foreground">New Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl font-medium text-yellow-600">{stats.inProgress}</div>
            <div className="text-xs md:text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl font-medium text-green-600">{stats.resolved}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-1 col-span-2 sm:col-start-auto">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl font-medium text-red-700">{stats.critical}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:gap-4">
                <div className="flex-1 md:min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 md:contents">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="md:w-40">
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="md:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <Card 
                key={report.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedReport?.id === report.id && "ring-2 ring-emerald-500"
                )}
                onClick={() => window.innerWidth < 1024 ? handleReportSelect(report) : setSelectedReport(report)}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm md:text-base pr-2">{report.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(report.status)}
                      <Badge className={cn(getPriorityColor(report.priority), "text-xs")}>
                        {report.priority}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground lg:hidden" />
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
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span>{report.submittedBy}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 md:truncate">{report.description}</p>
                  {report.assignedTo && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">Assigned to {report.assignedTo}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports found matching your filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Desktop Report Details Panel */}
        <div className="hidden lg:block space-y-4">
          {selectedReport ? (
            <ReportDetailsContent />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a report to view details and manage</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Report Details Sheet */}
      <Sheet open={isDetailsOpen && !!selectedReport} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">Report Details</SheetTitle>
          </SheetHeader>
          {selectedReport && <ReportDetailsContent />}
        </SheetContent>
      </Sheet>
    </div>
  );
}