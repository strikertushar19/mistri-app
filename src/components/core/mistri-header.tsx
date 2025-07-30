"use client";

import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Filter,
  Search,
  GitBranch,
  Code2,
  Play,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

export function MistriHeader({ projectName }: { projectName: string }) {
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 days");
  
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Code Analysis Dashboard
          </h1>
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <span className="text-lg font-medium text-gray-700">{projectName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">All systems operational</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 bg-white border-gray-300 hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4" />
            <span>{selectedDateRange}</span>
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center space-x-2 bg-white border-gray-300 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>

          <Button 
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4" />
            <span>Run Analysis</span>
          </Button>
        </div>
      </div>

      {/* Search and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search repositories, branches, or analysis..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Sync Repos
          </Button>
          <Button variant="outline" size="sm">
            <Code2 className="w-4 h-4 mr-1" />
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
}