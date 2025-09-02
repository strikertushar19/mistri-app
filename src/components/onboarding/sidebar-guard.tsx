'use client';
import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingModal } from './onboarding-modal';
import { onboardingAPI, OnboardingStatus } from '@/lib/api/onboarding';



interface SidebarGuardProps {
  children: ReactNode;
  allowedPaths?: string[];
}

export const SidebarGuard: React.FC<SidebarGuardProps> = ({ 
  children, 
  allowedPaths = ['/settings', '/profile', '/dashboard'] 
}) => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await onboardingAPI.getOnboardingStatus();
      setOnboardingStatus(status);
      
      // Show modal if user tries to access restricted features
      if (status.status !== 'complete' && !allowedPaths.some(path => pathname.startsWith(path))) {
        setShowModal(true);
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
    // Refresh the onboarding status
    checkOnboardingStatus();
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  // Show loading state
  if (loading) {
    return <>{children}</>;
  }

  // If onboarding is complete or user is on allowed path, render children
  if (onboardingStatus?.status === 'complete' || allowedPaths.some(path => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  // Show onboarding modal for restricted access
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
