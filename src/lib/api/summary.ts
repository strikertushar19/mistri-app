import { TokenManager } from '@/lib/auth/token-manager'
import { apiClient } from './client'

export interface SummaryStats {
  repositories_analyzed: number;
  diagrams_generated: number;
  pull_requests_analyzed: number;
  design_patterns_found: number;
  total_analyses: number;
  popular_patterns: Array<{
    pattern_name: string;
    count: number;
    last_seen: string;
  }>;
  diagram_types: Array<{
    diagram_type: string;
    count: number;
    last_seen: string;
  }>;
  last_updated: string;
}

export async function fetchSummaryStats(): Promise<SummaryStats> {
  try {
    const response = await apiClient.get('/summary/stats');
    return response.data;
  } catch (error: any) {
    // If the summary endpoint doesn't exist yet (backend not updated), return demo data
    if (error.response?.status === 404) {
      console.warn('Summary endpoint not found, returning demo data. Please ensure backend is updated.');
      return getDemoSummaryData();
    }
    
    // Re-throw other errors
    throw error;
  }
}

// Fallback demo data when backend summary endpoint isn't available
function getDemoSummaryData(): SummaryStats {
  return {
    repositories_analyzed: 0,
    diagrams_generated: 0,
    pull_requests_analyzed: 0,
    design_patterns_found: 0,
    total_analyses: 0,
    popular_patterns: [],
    diagram_types: [],
    last_updated: new Date().toISOString()
  };
}
