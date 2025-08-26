'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { analysisAPI, AnalysisJob } from '@/lib/api/code-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Search, 
  Filter,
  ExternalLink,
  Calendar,
  Code2,
  Database,
  GitBranch,
  FileText,
  Settings,
  Eye
} from 'lucide-react';

// Custom SelectItem component without tick marks
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export default function AnalysisListPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const itemsPerPage = 10;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.analysis_type = typeFilter;
      }

      const response = await analysisAPI.listAnalysisJobs(params);
      setJobs(response.jobs);
      setTotalJobs(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis jobs');
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const filteredJobs = jobs.filter(job => 
    job.repository_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.analysis_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.repository_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' };
      case 'processing':
        return { icon: Loader2, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Processing' };
      case 'completed':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' };
      case 'failed':
        return { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' };
      default:
        return { icon: Clock, color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'lld_analysis':
        return <BarChart3 className="h-4 w-4" />;
      case 'design_pattern_detector':
        return <Code2 className="h-4 w-4" />;
      case 'architecture_summary':
        return <GitBranch className="h-4 w-4" />;
      case 'unit_test_analyzer':
        return <FileText className="h-4 w-4" />;
      case 'route_extraction':
        return <Database className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const viewAnalysis = (jobId: string) => {
    router.push(`/analysis/${jobId}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalJobs / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalJobs);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, statusFilter, typeFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis Jobs</h1>
            <p className="text-muted-foreground">
              View and manage your code analysis jobs
            </p>
          </div>
          <Button
            onClick={refreshJobs}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
            </div>
            
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={handleTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lld_analysis">LLD Analysis</SelectItem>
                  <SelectItem value="design_pattern_detector">Design Patterns</SelectItem>
                  <SelectItem value="architecture_summary">Architecture Summary</SelectItem>
                  <SelectItem value="unit_test_analyzer">Unit Test Analysis</SelectItem>
                  <SelectItem value="route_extraction">Route Extraction</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end text-sm text-muted-foreground">
                {totalJobs > 0 ? (
                  <span>
                    Showing {startItem}-{endItem} of {totalJobs} jobs
                </span>
                ) : (
                  <span>No jobs found</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading analysis jobs...</span>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                <span>Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
            <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No analysis jobs found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Try adjusting your filters or search terms.'
                        : 'Start by analyzing a repository in the chat.'}
                    </p>
                    <Button onClick={() => router.push('/chat')}>
                      Go to Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => {
                const statusInfo = getStatusInfo(job.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            {getAnalysisTypeIcon(job.analysis_type)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {job.repository_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {job.repository_url}
                              </p>
                </div>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
            </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Created: {formatDate(job.created_at)}</span>
                  </div>
                            {job.completed_at && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <span>Completed: {formatDate(job.completed_at)}</span>
              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Code2 className="h-4 w-4 text-muted-foreground" />
                              <span>Type: {job.analysis_type.replace('_', ' ')}</span>
              </div>
            </div>
            
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Model: {job.model_used}</span>
                          </div>
                </div>

                        <div className="flex items-center gap-2 ml-4">
                          {job.status === 'completed' && (
                            <Button
                              onClick={() => viewAnalysis(job.id)}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Analysis
                            </Button>
                          )}
                          {job.status === 'processing' && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Processing...</span>
                </div>
              )}
                  </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
                </div>
              )}
              
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
                  </div>
                </div>
              )}
            </div>
    </DashboardLayout>
  );
}
