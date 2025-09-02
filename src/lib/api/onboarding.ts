import { apiClient } from './client';

export interface OnboardingStatus {
  status: 'complete' | 'needs_connection' | 'needs_repositories' | 'needs_analysis';
  has_github_connection: boolean;
  has_gitlab_connection: boolean;
  has_any_connection: boolean;
  has_repositories: boolean;
  has_completed_analysis: boolean;
  repository_count: number;
  analysis_count: number;
}

const ONBOARDING_CACHE_KEY = 'mistri_onboarding_status';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedOnboardingStatus extends OnboardingStatus {
  timestamp: number;
}

export const onboardingAPI = {
  /**
   * Get the user's onboarding status with caching
   */
  async getOnboardingStatus(forceRefresh = false): Promise<OnboardingStatus> {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedOnboardingStatus();
      if (cached) {
        console.log('📦 Using cached onboarding status');
        return cached;
      }
    }

    try {
      console.log('🌐 Fetching fresh onboarding status from API');
      const response = await apiClient.get('/analysis/onboarding-status');
      const status = response.data;
      
      // Cache the result
      setCachedOnboardingStatus(status);
      
      return status;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      throw error;
    }
  },

  // Clear cache (useful when user completes onboarding steps)
  clearCache: () => {
    localStorage.removeItem(ONBOARDING_CACHE_KEY);
    console.log('🗑️ Cleared onboarding status cache');
  },

  // Update cache with new status (useful when we know status changed)
  updateCache: (status: OnboardingStatus) => {
    setCachedOnboardingStatus(status);
    console.log('💾 Updated onboarding status cache');
  },
};

function getCachedOnboardingStatus(): OnboardingStatus | null {
  try {
    const cached = localStorage.getItem(ONBOARDING_CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedOnboardingStatus = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(ONBOARDING_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error reading cached onboarding status:', error);
    localStorage.removeItem(ONBOARDING_CACHE_KEY);
    return null;
  }
}

function setCachedOnboardingStatus(status: OnboardingStatus): void {
  try {
    const cached: CachedOnboardingStatus = {
      ...status,
      timestamp: Date.now(),
    };
    localStorage.setItem(ONBOARDING_CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error caching onboarding status:', error);
  }
}
