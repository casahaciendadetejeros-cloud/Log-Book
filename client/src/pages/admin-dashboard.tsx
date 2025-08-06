import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { exportToPDF } from "@/lib/pdf-export";
import { 
  Users, Calendar, TrendingUp, Clock, Search, Download, RefreshCw, 
  Eye, Edit2, Trash2
} from "lucide-react";
import type { Visitor } from "@shared/schema";

interface Statistics {
  todayVisitors: number;
  weekVisitors: number;
  totalVisitors: number;
  avgDaily: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: statistics, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  const { data: visitors = [], isLoading: visitorsLoading, refetch } = useQuery<Visitor[]>({
    queryKey: ["/api/visitors", { search: searchQuery, date: dateFilter }],
    queryFn: async () => {
      let url = "/api/visitors";
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (dateFilter) params.append("date", dateFilter);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      return response.json();
    },
  });

  const deleteVisitorMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/visitors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Visitor Deleted",
        description: "Visitor record has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete visitor record.",
        variant: "destructive",
      });
    },
  });

  const handleExportPDF = () => {
    exportToPDF(visitors, "visitor-log");
    toast({
      title: "PDF Export",
      description: "Visitor log has been exported as PDF.",
    });
  };

  const handleViewDetails = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

  const handleDelete = (visitor: Visitor) => {
    if (confirm(`Are you sure you want to delete ${visitor.name}?`)) {
      deleteVisitorMutation.mutate(visitor.id);
    }
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
            className="text-blue-600 hover:text-blue-800"
            data-testid={`button-edit-${row.id}`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Manage and monitor tourist registrations</p>
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
                  {statsLoading ? "..." : statistics?.todayVisitors || 0}
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
                  {statsLoading ? "..." : statistics?.weekVisitors || 0}
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
                  {statsLoading ? "..." : statistics?.totalVisitors || 0}
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
                  {statsLoading ? "..." : statistics?.avgDaily || 0}
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
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
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
                onClick={() => refetch()}
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
        <DataTable
          data={visitors}
          columns={columns}
          loading={visitorsLoading}
          emptyMessage="No visitors found"
        />
      </Card>

      {/* Visitor Detail Modal */}
      {isModalOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Visitor Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded" data-testid="text-modal-phone">
                    {selectedVisitor.phone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded" data-testid="text-modal-email">
                    {selectedVisitor.email}
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
                  onClick={() => setIsModalOpen(false)}
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
  );
}
