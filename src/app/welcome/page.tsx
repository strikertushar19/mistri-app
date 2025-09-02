'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Gitlab, GitBranch, Code2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { onboardingAPI, OnboardingStatus } from '@/lib/api/onboarding';

export default function WelcomePage() {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await onboardingAPI.getOnboardingStatus();
      setOnboardingStatus(status);
      
      // If onboarding is complete, redirect to dashboard
      if (status.status === 'complete') {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!onboardingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Welcome to Mistri!
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Let's get you set up to start analyzing your code.
          </p>
        </div>
      </div>
    );
  }

  const getStepContent = () => {
    switch (onboardingStatus.status) {
      case 'needs_connection':
        return {
          title: 'Connect Your Code Provider',
          description: 'Connect your GitHub or GitLab account to start analyzing your repositories.',
          icon: <Github className="h-16 w-16 text-[var(--chart-2)]" />,
          steps: [
            {
              title: 'Connect GitHub',
              description: 'Link your GitHub account to access your repositories',
              action: 'Connect GitHub',
              href: '/settings?tab=integrations&provider=github',
              completed: onboardingStatus.has_github_connection,
              icon: <Github className="h-8 w-8" />
            },
            {
              title: 'Connect GitLab',
              description: 'Link your GitLab account to access your repositories',
              action: 'Connect GitLab',
              href: '/settings?tab=integrations&provider=gitlab',
              completed: onboardingStatus.has_gitlab_connection,
              icon: <Gitlab className="h-8 w-8" />
            }
          ]
        };

      case 'needs_repositories':
        return {
          title: 'Select Repositories',
          description: 'Choose which repositories you want to analyze. You need at least one repository to get started.',
          icon: <GitBranch className="h-16 w-16 text-[var(--chart-2)]" />,
          steps: [
            {
              title: 'Go to Settings',
              description: 'Navigate to settings to manage your repositories',
              action: 'Manage Repositories',
              href: '/settings?tab=repositories',
              completed: onboardingStatus.has_repositories,
              icon: <GitBranch className="h-8 w-8" />
            }
          ]
        };

      case 'needs_analysis':
        return {
          title: 'Start Your First Analysis',
          description: 'Run an analysis on one of your repositories to unlock all features.',
          icon: <Code2 className="h-16 w-16 text-[var(--chart-2)]" />,
          steps: [
            {
              title: 'Go to Chat',
              description: 'Use the chat interface to request an analysis',
              action: 'Start Analysis',
              href: '/chat',
              completed: onboardingStatus.has_completed_analysis,
              icon: <Code2 className="h-8 w-8" />
            }
          ]
        };

      default:
        return {
          title: 'Welcome to Mistri!',
          description: 'Let\'s get you set up to start analyzing your code.',
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          steps: []
        };
    }
  };

  const content = getStepContent();

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            {content.title}
          </h1>
          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`h-3 w-3 rounded-full ${onboardingStatus.status === 'needs_connection' ? 'bg-[var(--chart-2)]' : 'bg-green-500'}`} />
            <div className={`h-3 w-3 rounded-full ${onboardingStatus.status === 'needs_repositories' ? 'bg-[var(--chart-2)]' : onboardingStatus.has_any_connection ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`h-3 w-3 rounded-full ${onboardingStatus.status === 'needs_analysis' ? 'bg-[var(--chart-2)]' : onboardingStatus.has_completed_analysis ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
          <div className="flex justify-center gap-8 text-sm text-[var(--muted-foreground)] mt-2">
            <span>Connect</span>
            <span>Repositories</span>
            <span>Analyze</span>
          </div>
        </div>

        {/* Steps */}
        <div className="grid gap-6 mb-8">
          {content.steps.map((step, index) => (
            <Card key={index} className={`${step.completed ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-[var(--border)]'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${step.completed ? 'bg-green-500 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                      {step.completed ? <CheckCircle className="h-6 w-6" /> : step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--foreground)]">
                        {step.title}
                      </h3>
                      <p className="text-[var(--muted-foreground)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.completed ? (
                      <span className="text-green-600 font-medium">Completed</span>
                    ) : (
                      <Button
                        size="lg"
                        onClick={() => window.location.href = step.href}
                        className="flex items-center gap-2"
                      >
                        {step.action}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--chart-3)]" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[var(--muted-foreground)]">Connections:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {onboardingStatus.has_any_connection ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Repositories:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {onboardingStatus.repository_count}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Analyses:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {onboardingStatus.analysis_count}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Status:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {onboardingStatus.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/settings')}
            className="text-[var(--muted-foreground)]"
          >
            Go to Settings
          </Button>
          <Button
            onClick={checkOnboardingStatus}
            className="flex items-center gap-2"
          >
            Check Status
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
