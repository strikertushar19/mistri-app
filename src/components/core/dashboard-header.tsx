"use client";

import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Filter,
  Search,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export function DashboardHeader({ projectName }: { projectName: string }) {
  const [selectedDateRange, setSelectedDateRange] = useState("Select Dates");
  
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your total revenue
          </h1>
          <div className="mt-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              $90,239.00
            </span>
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}