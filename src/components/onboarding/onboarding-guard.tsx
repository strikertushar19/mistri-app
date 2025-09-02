'use client';
import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingModal } from './onboarding-modal';
import { onboardingAPI, OnboardingStatus } from '@/lib/api/onboarding';
import { analysisAPI } from '@/lib/api/code-analysis';



interface OnboardingGuardProps {
  children: ReactNode;
  allowedPaths?: string[];
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ 
  children, 
  allowedPaths = ['/settings', '/profile'] 
}) => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async (forceRefresh = false) => {
    try {
      const status = await onboardingAPI.getOnboardingStatus(forceRefresh);
      
      // Check if user has any analysis jobs (including processing ones)
      let hasAnyAnalysisJobs = false;
      try {
        const analysisJobs = await analysisAPI.listAnalysisJobs({ limit: 1 });
        hasAnyAnalysisJobs = analysisJobs.total > 0;
        console.log('🔍 Analysis jobs check:', { total: analysisJobs.total, hasAnyAnalysisJobs });
      } catch (analysisError) {
        console.log('🔍 Could not fetch analysis jobs:', analysisError);
        // If we can't fetch analysis jobs, fall back to the backend status
        hasAnyAnalysisJobs = status.has_completed_analysis;
      }
      
      // Update status to reflect if user has any analysis jobs
      const updatedStatus = {
        ...status,
        has_completed_analysis: hasAnyAnalysisJobs || status.has_completed_analysis,
        analysis_count: hasAnyAnalysisJobs ? Math.max(status.analysis_count, 1) : status.analysis_count
      };
      
      setOnboardingStatus(updatedStatus);
      
      console.log('🔍 Frontend Onboarding Status:', updatedStatus);
      
      // Show modal only if onboarding is not complete AND user has no analysis jobs at all
      if (updatedStatus.status !== 'complete' && !hasAnyAnalysisJobs) {
        setShowModal(true);
      } else {
        // User has analysis jobs or completed onboarding, don't show modal
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // If there's an error, allow access (fallback)
      setOnboardingStatus({
        status: 'complete',
        has_github_connection: false,
        has_gitlab_connection: false,
        has_any_connection: false,
        has_repositories: false,
        has_completed_analysis: false,
        repository_count: 0,
        analysis_count: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowModal(false);
    // Clear cache and refresh the onboarding status
    onboardingAPI.clearCache();
    checkOnboardingStatus(true);
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--chart-2)]"></div>
          <div className="text-lg text-[var(--foreground)]">Loading...</div>
        </div>
      </div>
    );
  }

  // If onboarding is complete OR user has any analysis jobs, render children
  if (onboardingStatus?.status === 'complete' || onboardingStatus?.has_completed_analysis) {
    return <>{children}</>;
  }

  // Show onboarding modal
  return (
    <>
      {children}
      {showModal && (
        <OnboardingModal
          status={onboardingStatus}
          onComplete={handleOnboardingComplete}
          onSkip={handleSkip}
        />
      )}
    </>
  );
};
