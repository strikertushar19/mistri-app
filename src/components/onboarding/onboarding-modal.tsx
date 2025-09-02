'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Github, GitBranch, Gitlab, ArrowRight, CheckCircle, AlertCircle, Code2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingStatus } from '@/lib/api/onboarding';
import { repositoryAPI, Repository, RepositoryAPIResponse } from '@/lib/api/repositories';
import Image from 'next/image';

interface OnboardingModalProps {
  status: OnboardingStatus | null;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  status,
  onComplete,
  onSkip
}) => {
  const router = useRouter();
  const [availableProviders, setAvailableProviders] = useState<{
    github: boolean;
    gitlab: boolean;
    bitbucket: boolean;
  }>({ github: false, gitlab: false, bitbucket: false });
  const [checkingProviders, setCheckingProviders] = useState(true);
  const [repositories, setRepositories] = useState<{
    github: Repository[];
    gitlab: Repository[];
    bitbucket: Repository[];
  }>({ github: [], gitlab: [], bitbucket: [] });
  const [loadingStates, setLoadingStates] = useState<{
    github: boolean;
    gitlab: boolean;
    bitbucket: boolean;
  }>({ github: false, gitlab: false, bitbucket: false });
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [analysisType, setAnalysisType] = useState<string>("lld_analysis");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<'connect' | 'repositories' | 'analyze'>('connect');
  const [currentProvider, setCurrentProvider] = useState<'github' | 'gitlab' | 'bitbucket'>('github');

  if (!status) return null;

  // Check available providers on mount
  useEffect(() => {
    const checkAvailableProviders = async () => {
      const providers = { github: false, gitlab: false, bitbucket: false };
      
      console.log('🔍 Checking available providers...');
      
      // Check each provider by trying to fetch repositories
      try {
        const githubResponse = await repositoryAPI.getGitHubRepositories(1, 1);
        providers.github = 'repositories' in githubResponse;
        console.log('📦 GitHub response:', githubResponse);
        console.log('✅ GitHub available:', providers.github);
      } catch (err) {
        console.log('❌ GitHub not available:', err);
      }

      try {
        const gitlabResponse = await repositoryAPI.getGitLabRepositories(1, 1);
        providers.gitlab = 'repositories' in gitlabResponse;
        console.log('📦 GitLab response:', gitlabResponse);
        console.log('✅ GitLab available:', providers.gitlab);
      } catch (err) {
        console.log('❌ GitLab not available:', err);
      }

      try {
        const bitbucketResponse = await repositoryAPI.getBitbucketRepositories(1, 1);
        providers.bitbucket = 'repositories' in bitbucketResponse;
        console.log('📦 Bitbucket response:', bitbucketResponse);
        console.log('✅ Bitbucket available:', providers.bitbucket);
      } catch (err) {
        console.log('❌ Bitbucket not available:', err);
      }

                     console.log('🎯 Final providers:', providers);
               setAvailableProviders(providers);
               setCheckingProviders(false);
             };

             checkAvailableProviders();
  }, []);

  // Determine current step based on status
  useEffect(() => {
    console.log('🎯 Onboarding status changed:', status);
    if (status.status === 'needs_connection') {
      setCurrentStep('connect');
    } else if (status.status === 'needs_repositories') {
      setCurrentStep('repositories');
      // Auto-fetch repositories if we have available providers
      if (availableProviders.github || availableProviders.gitlab || availableProviders.bitbucket) {
        const provider = availableProviders.github ? 'github' : 
                        availableProviders.gitlab ? 'gitlab' : 'bitbucket';
        console.log(`🔄 Auto-fetching repositories for ${provider}...`);
        handleShowRepos(provider);
      }
    } else if (status.status === 'needs_analysis') {
      setCurrentStep('analyze');
    }
  }, [status, availableProviders]);

  // Auto-fetch repositories when switching to a provider tab that has no repositories
  useEffect(() => {
    if (currentStep === 'repositories' && !checkingProviders) {
      const currentRepos = repositories[currentProvider] || [];
      const isProviderAvailable = availableProviders[currentProvider];
      
      if (isProviderAvailable && currentRepos.length === 0 && !loadingStates[currentProvider]) {
        console.log(`🔄 Auto-fetching repositories for ${currentProvider} (no cached repos)...`);
        handleShowRepos(currentProvider);
      }
    }
  }, [currentProvider, currentStep, checkingProviders, availableProviders, repositories, loadingStates]);

  const handleConnect = async (provider: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/${provider}/init`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth flow');
      }

      const data = await response.json();
      window.location.href = data.oauth_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleShowRepos = async (provider: 'github' | 'gitlab' | 'bitbucket') => {
    console.log(`🚀 Fetching repositories for ${provider}...`);
    setLoadingStates(prev => ({ ...prev, [provider]: true }));
    setError(null);
    setCurrentProvider(provider);

    try {
      let response: RepositoryAPIResponse;
      
      switch (provider) {
        case 'github':
          response = await repositoryAPI.getGitHubRepositories(1, 100);
          break;
        case 'gitlab':
          response = await repositoryAPI.getGitLabRepositories(1, 100);
          break;
        case 'bitbucket':
          response = await repositoryAPI.getBitbucketRepositories(1, 100);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      console.log(`📦 ${provider} response:`, response);

      // Check if this is a no-integration response
      if ('integration' in response && response.integration === false) {
        console.log(`❌ No ${provider} integration:`, response.message);
        setError(response.message || 'No integration found');
        setRepositories(prev => ({ ...prev, [provider]: [] }));
        return;
      }

      // Handle normal repository response
      if ('repositories' in response) {
        console.log(`✅ Found ${response.repositories?.length || 0} repositories for ${provider}`);
        console.log(`🔍 Sample repository data:`, response.repositories?.[0]);
        setRepositories(prev => ({ ...prev, [provider]: response.repositories || [] }));
        setCurrentStep('repositories');
        // Clear any existing error when repositories are found
        setError(null);
      } else {
        console.log(`❌ Unexpected response format for ${provider}:`, response);
        setError('Unexpected response format');
        setRepositories(prev => ({ ...prev, [provider]: [] }));
      }
    } catch (err) {
      console.log(`❌ Error fetching ${provider} repositories:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      setRepositories(prev => ({ ...prev, [provider]: [] }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleRepoSelection = (repo: Repository, checked: boolean) => {
    if (checked && selectedRepos.length < 5) {
      setSelectedRepos([...selectedRepos, repo]);
    } else if (!checked) {
      setSelectedRepos(selectedRepos.filter(r => r.id !== repo.id));
    }
  };

  const handleAnalysis = async () => {
    if (selectedRepos.length === 0) {
      setError("Please select at least one repository");
      return;
    }

    // Limit to 5 repositories for LLD analysis
    if (analysisType === 'lld_analysis' && selectedRepos.length > 5) {
      setError("You can analyze a maximum of 5 repositories at once for LLD analysis");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('🔍 Selected repositories for analysis:', selectedRepos);

      // For LLD analysis, create separate jobs for each repository
      if (analysisType === 'lld_analysis') {
        console.log('🔍 Creating separate LLD analysis jobs for each repository...');
        
        const analysisPromises = selectedRepos.map(async (repo, index) => {
          const requestBody = {
            repository_url: repo.url,
            repository_name: repo.name,
            is_multi_repo: false,
            analysis_type: analysisType,
            model_used: "gemini-1.5-flash"
          };
          
          console.log(`🔍 Creating analysis job ${index + 1}/${selectedRepos.length} for ${repo.name}:`, requestBody);

          const response = await fetch(`${API_BASE_URL}/analysis/jobs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            throw new Error(`Failed to create analysis job for ${repo.name}`);
          }

          const data = await response.json();
          console.log(`✅ Analysis job created for ${repo.name}:`, data);
          return data;
        });

        // Wait for all analysis jobs to be created
        const results = await Promise.all(analysisPromises);
        console.log('✅ All LLD analysis jobs created:', results);
        
      } else {
        // For other analysis types (like HLD), use the existing multi-repo logic
        const requestBody = selectedRepos.length === 1 ? {
          repository_url: selectedRepos[0].url,
          repository_name: selectedRepos[0].name,
          is_multi_repo: false,
          analysis_type: analysisType,
          model_used: "gemini-1.5-flash"
        } : {
          is_multi_repo: true,
          multi_repository_urls: selectedRepos.map(repo => {
            console.log(`🔍 Repository ${repo.name} URL:`, repo.url);
            return repo.url;
          }),
          multi_repo_names: selectedRepos.map(repo => {
            console.log(`🔍 Repository ${repo.name} Name:`, repo.name);
            return repo.name;
          }),
          analysis_type: analysisType,
          model_used: "gemini-1.5-flash"
        };
        
        console.log('🔍 Analysis request body:', requestBody);

        const response = await fetch(`${API_BASE_URL}/analysis/jobs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error('Failed to create analysis job');
        }

        const data = await response.json();
        console.log('Analysis job created:', data);
      }
      
      // Close modal, refresh status, and redirect to analysis page
      onComplete();
      router.push('/analysis');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis job');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter repositories based on search query for current provider
  const currentRepositories = repositories[currentProvider] || [];
  const filteredRepositories = currentRepositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log('📊 Repository state:', {
    currentProvider,
    totalRepositories: currentRepositories.length,
    filteredRepositories: filteredRepositories.length,
    searchQuery,
    currentStep,
    loadingStates
  });

  const getStepContent = () => {
    switch (currentStep) {
      case 'connect':
        return {
          title: 'Connect Your Code Provider',
          description: 'Connect your GitHub or GitLab account to start analyzing your repositories.',
          icon: <Github className="h-12 w-12 text-[var(--chart-2)]" />,
        };

      case 'repositories':
        return {
          title: 'Select Repositories',
          description: 'Choose which repositories you want to analyze. You need at least one repository to get started.',
          icon: <GitBranch className="h-12 w-12 text-[var(--chart-2)]" />,
        };

      case 'analyze':
        return {
          title: 'Start Your First Analysis',
          description: 'Run an analysis on one of your repositories to unlock all features.',
          icon: <Code2 className="h-12 w-12 text-[var(--chart-2)]" />,
        };

      default:
        return {
          title: 'Welcome to Mistri!',
          description: 'Let\'s get you set up to start analyzing your code.',
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
        };
    }
  };

  const content = getStepContent();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {content.icon}
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  {content.title}
                </h2>
                <p className="text-[var(--muted-foreground)]">
                  {content.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentStep === 'connect' ? 'bg-[var(--chart-2)]' : 'bg-green-500'}`} />
              <div className={`h-2 w-2 rounded-full ${currentStep === 'repositories' ? 'bg-[var(--chart-2)]' : status.has_any_connection ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`h-2 w-2 rounded-full ${currentStep === 'analyze' ? 'bg-[var(--chart-2)]' : status.has_completed_analysis ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>Connect</span>
              <span>Repositories</span>
              <span>Analyze</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded">
              {error}
            </div>
          )}

          {/* Step Content */}
          {currentStep === 'connect' && (
            <div className="space-y-4 mb-6">
              {Object.values(availableProviders).some(Boolean) ? (
                <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500 text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--foreground)]">Code Providers Connected</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {Object.entries(availableProviders)
                            .filter(([_, available]) => available)
                            .map(([provider, _]) => provider.charAt(0).toUpperCase() + provider.slice(1))
                            .join(', ')} repositories are available
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-[var(--border)]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
                            <Github className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--foreground)]">Connect GitHub</h3>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Link your GitHub account to access your repositories
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConnect('github')}
                          className="flex items-center gap-2"
                        >
                          Connect GitHub
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[var(--border)]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
                            <Gitlab className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--foreground)]">Connect GitLab</h3>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Link your GitLab account to access your repositories
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConnect('gitlab')}
                          className="flex items-center gap-2"
                        >
                          Connect GitLab
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[var(--border)]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
                            <GitBranch className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--foreground)]">Connect Bitbucket</h3>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Link your Bitbucket account to access your repositories
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConnect('bitbucket')}
                          className="flex items-center gap-2"
                        >
                          Connect Bitbucket
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentStep === 'repositories' && (
            <div className="space-y-4 mb-6">
              {/* Analysis Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Analysis Type:</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lld_analysis">Low-Level Design (LLD) Analysis</SelectItem>
                    {/* <SelectItem value="hld_analysis">High-Level Design (HLD) Analysis</SelectItem> */}
                  </SelectContent>
                </Select>
                {/* <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {analysisType === "hld_analysis" 
                    ? "HLD analysis will first run LLD on all selected repositories, then generate a high-level design showing how they work together."
                    : "LLD analysis will analyze each repository individually for detailed design patterns and architecture."
                  }
                </p> */}
              </div>

              {/* Repository Selection Info */}
              <div className="mb-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  Select up to 5 repositories (currently selected: {selectedRepos.length}/5)
                </p>
              </div>

              {/* Provider Tabs */}
              <Tabs value={currentProvider} onValueChange={(value) => setCurrentProvider(value as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="github" className="flex items-center space-x-2">
                    <Image src="/github-mark.svg" alt="GitHub" width={16} height={16} className="h-4 w-4" />
                    <span>GitHub</span>
                  </TabsTrigger>
                  <TabsTrigger value="gitlab" className="flex items-center space-x-2">
                    <Image src="/gitlab-svgrepo-com.svg" alt="GitLab" width={16} height={16} className="h-4 w-4" />
                    <span>GitLab</span>
                  </TabsTrigger>
                  <TabsTrigger value="bitbucket" className="flex items-center space-x-2">
                    <Image src="/bitbucket.svg" alt="Bitbucket" width={16} height={16} className="h-4 w-4" />
                    <span>Bitbucket</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="github" className="mt-0">
                  {checkingProviders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Checking GitHub connection...</span>
                    </div>
                  ) : !availableProviders.github ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Image src="/github-mark.svg" alt="GitHub" width={48} height={48} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Connect GitHub</h3>
                        <p className="text-[var(--muted-foreground)] mb-4">
                          Connect your GitHub account to access your repositories and start analyzing your code.
                        </p>
                      </div>
                      <Button
                        onClick={() => handleConnect('github')}
                        className="flex items-center gap-2"
                      >
                        <Image src="/github-mark.svg" alt="GitHub" width={16} height={16} className="h-4 w-4" />
                        Connect GitHub
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : loadingStates.github ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading GitHub repositories...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search GitHub repositories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 pl-10 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Repository Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                        {filteredRepositories.map((repo) => {
                          const isSelected = selectedRepos.some(r => r.id === repo.id);
                          const isDisabled = !isSelected && selectedRepos.length >= 5;
                          
                          return (
                            <Card key={repo.id} className={`${isSelected ? 'ring-2 ring-primary' : ''} ${isDisabled ? 'opacity-50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleRepoSelection(repo, e.target.checked)}
                                    disabled={isDisabled}
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-2"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate text-[var(--foreground)]">{repo.name}</h3>
                                    <p className="text-xs text-[var(--muted-foreground)] truncate">{repo.description || 'No description'}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      {repo.language && (
                                        <Badge variant="secondary" className="text-xs">
                                          {repo.language}
                                        </Badge>
                                      )}
                                      <span className="text-xs text-[var(--muted-foreground)]">
                                        ⭐ {repo.stars} | 🍴 {repo.forks}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                      Updated: {new Date(repo.updated_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {filteredRepositories.length === 0 && currentRepositories.length === 0 && (
                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                          <p className="mb-4">No GitHub repositories found.</p>
                          <Button
                            onClick={() => handleShowRepos('github')}
                            variant="outline"
                            size="sm"
                          >
                            Refresh Repositories
                          </Button>
                        </div>
                      )}

                      {filteredRepositories.length === 0 && currentRepositories.length > 0 && (
                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                          No repositories match your search query. Try adjusting your search.
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="gitlab" className="mt-0">
                  {checkingProviders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Checking GitLab connection...</span>
                    </div>
                  ) : !availableProviders.gitlab ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Image src="/gitlab-svgrepo-com.svg" alt="GitLab" width={48} height={48} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Connect GitLab</h3>
                        <p className="text-[var(--muted-foreground)] mb-4">
                          Connect your GitLab account to access your repositories and start analyzing your code.
                        </p>
                      </div>
                      <Button
                        onClick={() => handleConnect('gitlab')}
                        className="flex items-center gap-2"
                      >
                        <Image src="/gitlab-svgrepo-com.svg" alt="GitLab" width={16} height={16} className="h-4 w-4" />
                        Connect GitLab
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : loadingStates.gitlab ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading GitLab repositories...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search GitLab repositories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 pl-10 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Repository Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                        {filteredRepositories.map((repo) => {
                          const isSelected = selectedRepos.some(r => r.id === repo.id);
                          const isDisabled = !isSelected && selectedRepos.length >= 5;
                          
                          return (
                            <Card key={repo.id} className={`${isSelected ? 'ring-2 ring-primary' : ''} ${isDisabled ? 'opacity-50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleRepoSelection(repo, e.target.checked)}
                                    disabled={isDisabled}
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-2"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate text-[var(--foreground)]">{repo.name}</h3>
                                    <p className="text-xs text-[var(--muted-foreground)] truncate">{repo.description || 'No description'}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      {repo.language && (
                                        <Badge variant="secondary" className="text-xs">
                                          {repo.language}
                                        </Badge>
                                      )}
                                      <span className="text-xs text-[var(--muted-foreground)]">
                                        ⭐ {repo.stars} | 🍴 {repo.forks}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                      Updated: {new Date(repo.updated_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {filteredRepositories.length === 0 && currentRepositories.length === 0 && (
                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                          <p className="mb-4">No GitLab repositories found.</p>
                          <Button
                            onClick={() => handleShowRepos('gitlab')}
                            variant="outline"
                            size="sm"
                          >
                            Refresh Repositories
                          </Button>
                        </div>
                      )}

                      {filteredRepositories.length === 0 && currentRepositories.length > 0 && (
                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                          No repositories match your search query. Try adjusting your search.
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="bitbucket" className="mt-0">
                  {checkingProviders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Checking Bitbucket connection...</span>
                    </div>
                  ) : !availableProviders.bitbucket ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Image src="/bitbucket.svg" alt="Bitbucket" width={48} height={48} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Connect Bitbucket</h3>
                        <p className="text-[var(--muted-foreground)] mb-4">
                          Connect your Bitbucket account to access your repositories and start analyzing your code.
                        </p>
                      </div>
                      <Button
                        onClick={() => handleConnect('bitbucket')}
                        className="flex items-center gap-2"
                      >
                        <Image src="/bitbucket.svg" alt="Bitbucket" width={16} height={16} className="h-4 w-4" />
                        Connect Bitbucket
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : loadingStates.bitbucket ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading Bitbucket repositories...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search Bitbucket repositories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 pl-10 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Repository Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                        {filteredRepositories.map((repo) => {
                          const isSelected = selectedRepos.some(r => r.id === repo.id);
                          const isDisabled = !isSelected && selectedRepos.length >= 5;
                          
                          return (
                            <Card key={repo.id} className={`${isSelected ? 'ring-2 ring-primary' : ''} ${isDisabled ? 'opacity-50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleRepoSelection(repo, e.target.checked)}
                                    disabled={isDisabled}
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-2"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate text-[var(--foreground)]">{repo.name}</h3>
                                    <p className="text-xs text-[var(--muted-foreground)] truncate">{repo.description || 'No description'}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      {repo.language && (
                                        <Badge variant="secondary" className="text-xs">
                                          {repo.language}
                                        </Badge>
                                      )}
                                      <span className="text-xs text-[var(--muted-foreground)]">
                                        ⭐ {repo.stars} | 🍴 {repo.forks}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                      Updated: {new Date(repo.updated_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {filteredRepositories.length === 0 && currentRepositories.length === 0 && (
                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                          <p className="mb-4">No Bitbucket repositories found.</p>
                          <Button
                            onClick={() => handleShowRepos('bitbucket')}
                            variant="outline"
                            size="sm"
                          >
                            Refresh Repositories
                          </Button>
                        </div>
                      )}

                      {filteredRepositories.length === 0 && currentRepositories.length > 0 && (
                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                          No repositories match your search query. Try adjusting your search.
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {currentStep === 'analyze' && (
            <div className="space-y-4 mb-6">
              <Card className="border-[var(--border)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--foreground)]">Start Analysis</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          You can now analyze your repositories using the chat interface
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.location.href = '/chat'}
                      className="flex items-center gap-2"
                    >
                      Go to Chat
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Status Summary */}
          <div className="bg-[var(--muted)] rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-[var(--chart-3)]" />
              <span className="font-medium text-[var(--foreground)]">Current Status</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--muted-foreground)]">Connections:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {status.has_any_connection ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Repositories:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {status.repository_count}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Analyses:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {status.analysis_count}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Status:</span>
                <span className="ml-2 font-medium text-[var(--foreground)]">
                  {status.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onSkip}
              className="text-[var(--muted-foreground)]"
            >
              Skip for Now
            </Button>
            <div className="flex gap-2">
              {currentStep === 'repositories' && selectedRepos.length > 0 && (
                <Button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Analysis...
                    </>
                  ) : (
                    <>
                      Analyze {selectedRepos.length} Repository{selectedRepos.length !== 1 ? 's' : ''}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={onComplete}
                className="flex items-center gap-2"
              >
                Check Status
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
