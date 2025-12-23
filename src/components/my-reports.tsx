import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Clock, CheckCircle, AlertCircle, TrendingUp, Image, ZoomIn } from "lucide-react";

interface Report {
  id: string;
  title: string;
  category: string;
  status: "new" | "in-progress" | "resolved";
  date: string;
  address: string;
  description: string;
  photos?: Array<{
    id: string;
    url: string;
    filename: string;
  }>;
}

interface MyReportsProps {
  reports: Report[];
}

export function MyReports({ reports }: MyReportsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary" className="bg-red-50 text-red-600"><AlertCircle className="w-3 h-3 mr-1" />New</Badge>;
      case "in-progress":
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-600"><TrendingUp className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-green-50 text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-medium mb-2">No reports yet</h3>
        <p className="text-muted-foreground">
          Start by reporting an issue in your neighborhood to make your city better.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">My Reports</h2>
        <p className="text-muted-foreground">{reports.length} total reports</p>
      </div>
      
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(report.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {report.address}
                    </div>
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-3">{report.description}</p>
              
              {report.photos && report.photos.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Photos ({report.photos.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {report.photos.map((photo) => (
                      <div key={photo.id} className="group relative">
                        <div className="aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={photo.url}
                            alt={photo.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('My Reports - Image failed to load:', {
                                filename: photo.filename,
                                urlPrefix: photo.url?.substring(0, 50)
                              });
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmY2YjAwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIj5GQUlMRUQ8L3RleHQ+Cjwvc3ZnPg==';
                            }}
                            onLoad={() => {
                              console.log('My Reports - Image loaded successfully:', photo.filename);
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
                            onClick={() => window.open(photo.url, '_blank')}
                          >
                            <ZoomIn className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="capitalize">
                  {report.category.replace('-', ' ')}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Updated 2 days ago
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}