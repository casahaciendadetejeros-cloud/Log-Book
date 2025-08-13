import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/pdf-export";
import { visitorAPI, statisticsAPI } from "@/lib/firebase";
import { Calendar, Search, Download, Eye, Trash2, Users, TrendingUp, Clock, RefreshCw, LogOut } from "lucide-react";
import type { Visitor } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch all visitors
  const { data: visitors = [], refetch: refetchVisitors, isLoading } = useQuery({
    queryKey: ['visitors'],
    queryFn: visitorAPI.getAllVisitors,
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['statistics'],
    queryFn: statisticsAPI.getStatistics,
  });

  // Search visitors
  const { data: searchResults = [] } = useQuery({
    queryKey: ['visitors', 'search', searchQuery],
    queryFn: () => visitorAPI.searchVisitors(searchQuery),
    enabled: searchQuery.length > 0,
  });

  // Get visitors by date
  const { data: dateResults = [] } = useQuery({
    queryKey: ['visitors', 'date', selectedDate],
    queryFn: () => visitorAPI.getVisitorsByDate(selectedDate),
    enabled: selectedDate.length > 0,
  });

  // Determine which data to display
  const allDisplayVisitors = searchQuery ? searchResults : selectedDate ? dateResults : visitors;
  
  // Pagination calculations
  const totalRecords = allDisplayVisitors.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayVisitors = allDisplayVisitors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDate, pageSize]);

  const handleExportPDF = () => {
    // Use all filtered data instead of just current page
    const dataToExport = allDisplayVisitors;
    const filename = selectedDate 
      ? `visitor-log-${selectedDate}` 
      : searchQuery 
        ? `visitor-log-search-${searchQuery.replace(/[^a-zA-Z0-9]/g, '')}` 
        : "visitor-log-all";
    
    exportToPDF(dataToExport, filename);
    toast({
      title: "PDF Export",
      description: `Exported ${dataToExport.length} visitor records as PDF.`,
    });
  };

  const handleDeleteVisitor = async (id: string) => {
    if (confirm("Are you sure you want to delete this visitor?")) {
      const success = await visitorAPI.deleteVisitor(id);
      if (success) {
        toast({
          title: "Visitor Deleted",
          description: "Visitor has been successfully deleted.",
        });
        refetchVisitors();
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete visitor. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = () => {
    // Reset all filters and refresh data
    setSearchQuery("");
    setSelectedDate("");
    setCurrentPage(1);
    refetchVisitors();
    toast({
      title: "Dashboard Refreshed",
      description: "Data refreshed and filters cleared.",
    });
  };

  const handleViewDetails = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsViewDialogOpen(true);
  };

  const formatDateTime = (dateTime: Date | string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString() + " - " + date.toLocaleTimeString();
  };

  const columns = [
    {
      header: "Control #",
      accessorKey: "controlNumber",
      sortable: true,
    },
    {
      header: "Full Name", 
      accessorKey: "name",
      sortable: true,
    },
    {
      header: "Phone Number",
      accessorKey: "phone",
      sortable: false,
    },
    {
      header: "Email",
      accessorKey: "email", 
      sortable: true,
    },
    {
      header: "Date & Time",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row: Visitor) => formatDateTime(row.createdAt),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      sortable: false,
      cell: (row: Visitor) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row)}
            className="text-primary-green hover:text-green-700"
            data-testid={`button-view-${row.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteVisitor(row.id)}
            className="text-primary-red hover:text-red-800"
            data-testid={`button-delete-${row.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mb-96">
      <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Tourism Office Admin Dashboard</h2>
        <p className="text-white/90">Manage and monitor tourist registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-light-green">
                <Users className="text-primary-green h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Visitors</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-today">
                  {isLoading ? "..." : statistics?.todayVisitors || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="text-blue-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-week">
                  {isLoading ? "..." : statistics?.weekVisitors || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="text-purple-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registered</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-total">
                  {isLoading ? "..." : statistics?.totalVisitors || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="text-yellow-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Daily</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="stat-average">
                  {isLoading ? "..." : statistics?.avgDaily || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search visitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>

              {/* Date Filter */}
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
                data-testid="input-date-filter"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleExportPDF}
                className="bg-primary-green text-white hover:bg-green-700"
                data-testid="button-export-pdf"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                data-testid="button-refresh"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading visitors...</div>
          ) : displayVisitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No visitors found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Control Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.controlNumber}</TableCell>
                    <TableCell>{visitor.name}</TableCell>
                    <TableCell>
                      {visitor.phone ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">📞 {visitor.phone}</div>
                        </div>
                      ) : visitor.email ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">📧 {visitor.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No contact info</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {visitor.purpose?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(visitor.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(visitor)}
                          data-testid={`button-view-${visitor.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVisitor(visitor.id)}
                          className="text-primary-red hover:text-red-800"
                          data-testid={`button-delete-${visitor.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination Controls */}
          {totalRecords > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-6 pt-6 border-t space-y-4 lg:space-y-0">
              {/* Left: Records per page */}
              <div className="flex flex-col sm:flex-row sm:items-baseline space-y-2 sm:space-y-0 sm:space-x-2 items-center sm:items-baseline">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-xs sm:text-sm text-gray-700">Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm min-w-0"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">records per page.</span>
                  <span className="text-xs sm:text-sm text-gray-700 sm:hidden">per page</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} records.
                </span>
              </div>

              {/* Right: Page navigation */}
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                
                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show fewer pages on mobile
                      const maxDistance = window.innerWidth < 640 ? 1 : 2;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= maxDistance
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const shouldShowEllipsis = index > 0 && array[index - 1] !== page - 1;
                      
                      return (
                        <div key={page} className="flex items-center">
                          {shouldShowEllipsis && (
                            <span className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 sm:px-3 text-xs sm:text-sm min-w-0 ${
                              currentPage === page 
                                ? "bg-primary-green text-white hover:bg-green-700" 
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visitor Detail Modal */}
      {isViewDialogOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Visitor Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsViewDialogOpen(false)}
                  data-testid="button-close-modal"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Control Number</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded" data-testid="text-modal-control">
                    {selectedVisitor.controlNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded" data-testid="text-modal-name">
                    {selectedVisitor.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Information</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded" data-testid="text-modal-contact">
                    {selectedVisitor.phone ? (
                      <>📞 {selectedVisitor.phone}</>
                    ) : selectedVisitor.email ? (
                      <>📧 {selectedVisitor.email}</>
                    ) : (
                      "No contact information provided"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose of Visit</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded" data-testid="text-modal-purpose">
                    {selectedVisitor.purpose ? (
                      <Badge variant="secondary" className="capitalize">
                        {selectedVisitor.purpose.replace('_', ' ')}
                      </Badge>
                    ) : (
                      "Not specified"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Time</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded" data-testid="text-modal-date">
                    {formatDateTime(selectedVisitor.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  data-testid="button-modal-close"
                >
                  Close
                </Button>
                <Button
                  className="bg-primary-green text-white hover:bg-green-700"
                  onClick={() => exportToPDF([selectedVisitor], `visitor-${selectedVisitor.controlNumber}`)}
                  data-testid="button-modal-export"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
