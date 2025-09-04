'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, GitBranch, Calendar, Code2, DollarSign, Shield, Zap, GitCommit, Layers, Activity, Download } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';

import { RenderTabContentLLD, shouldShowTab } from '@/components/analysis/renderTabContentlld';
import { RenderTabContentHLD } from '@/components/analysis/renderTabContenthld';

interface AnalysisComponent {
  name: string;
  purpose: string;
  responsibilities: string[];
  dependencies: string[];
  technology?: string;
  interfaces?: string[];
}

interface DiagramImage {
  type: string;
  image_data: string; // Base64 encoded image
  image_format: string;
  width: number;
  height: number;
}

interface Recommendation {
  description?: string;
  category?: string;
  priority?: string;
  impact?: string;
  rationale?: string;
  implementation?: string | any;
}

interface SecurityConsideration {
  aspect?: string;
  description?: string;
  strengths?: string[];
  vulnerabilities?: string[];
  recommendations?: string[];
}

interface DesignPattern {
  pattern?: string;
  benefits?: string[];
  location?: string;
  description?: string;
  alternatives?: string[];
  anti_patterns?: string[];
  implementation_quality?: string;
}

interface AlgorithmComplexity {
  time?: string;
  space?: string;
  best_case?: string;
  average_case?: string;
  worst_case?: string;
}

interface Algorithm {
  name?: string;
  description?: string;
  complexity?: string | AlgorithmComplexity;
  purpose?: string;
  implementation?: string | any;
  location?: string;
  optimization_potential?: string;
  performance_characteristics?: string;
}

interface PerformanceConsideration {
  aspect: string;
  metrics: string;
  bottlenecks: string[];
  optimizations: string[];
  current_implementation: string;
}

interface AnalysisData {
  analysis_type: string;
  repository_overview: {
    name: string;
    description: string;
    main_technology: string;
    project_type?: string;
    architecture_style?: string;
    key_components?: string[];
    design_patterns_used?: string[];
    performance_considerations?: string;
    security_posture?: string;
    algorithms?: string;
    diagrams?: string[];
    error_handling?: string;
    recommendations?: string[];
    scalability_approach?: string;
  };
  system_architecture: {
    system_architecture: {
      overview: string;
      components: AnalysisComponent[];
      data_flow: string;
      deployment_model?: string;
      scalability_approach?: string;
    };
  };
  detailed_design: {
    classes: any[];
    interfaces: any[];
    data_structures: Array<{
      name: string;
      type: string;
      purpose: string;
    }>;
  };
  design_patterns: {
    design_patterns: (string | DesignPattern)[];
    pattern_analysis?: {
      missing_patterns?: string[];
      pattern_coverage?: string;
      overall_pattern_usage?: string;
    };
  };
  algorithms: {
    algorithms: (string | Algorithm)[];
    algorithm_analysis?: {
      bottlenecks?: string[];
      overall_complexity?: string;
      optimization_opportunities?: string[];
    };
  };
  error_handling: {
    error_handling: {
      strategies: any[];
      exceptions: any[];
      error_analysis?: {
        gaps?: string[];
        improvements?: string[];
        overall_strategy?: string;
      };
    };
  };
  security_considerations: {
    security_analysis?: {
      compliance?: string[];
      risk_level?: string;
      critical_issues?: string;
      overall_security?: string;
    };
    security_considerations: {
    security_analysis?: {
      compliance?: string[];
      risk_level?: string;
      critical_issues?: string[];
      overall_security?: string;
    };
    security_considerations: (string | SecurityConsideration)[];
  };
  };
  performance_considerations: {
    performance_analysis?: {
      monitoring?: string | string[];
      scalability?: string;
      overall_performance?: string;
      critical_bottlenecks?: string[];
    };
    performance_considerations: (string | PerformanceConsideration)[];
  };
  recommendations: {
    recommendations: (string | Recommendation)[];
    recommendations_analysis?: {
      long_term_goals?: string[];
      overall_quality?: string;
      maintenance_plan?: string;
      critical_improvements?: string[];
    };
  };
  mermaid_diagrams?: {
    class_diagram?: string;
    component_diagram?: string;
    sequence_diagram?: string;
    activity_diagram?: string;
  };
  diagram_images?: {
    class_diagram?: DiagramImage;
    component_diagram?: DiagramImage;
    sequence_diagram?: DiagramImage;
    activity_diagram?: DiagramImage;
  };
  // Add support for HLD analysis
  hld_analysis?: any;
}

// Create a union type for both LLD and HLD analysis
type AnalysisDataUnion = AnalysisData | {
  analysis_type: 'hld_analysis';
  hld_analysis: any;
};

// Mermaid types are defined in src/types/mermaid.d.ts



export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [parsedAnalysis, setParsedAnalysis] = useState<AnalysisDataUnion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisData(analysisId);
    }
  }, [analysisId]);

  // Reset active tab when analysis type changes or when parsed analysis changes
  useEffect(() => {
    if (analysisData?.job?.analysis_type) {
      setActiveTab('overview');
    }
  }, [analysisData?.job?.analysis_type]);

  // Ensure active tab is valid when parsed analysis changes
  useEffect(() => {
    if (parsedAnalysis) {
      const currentTabs = getTabs();
      if (currentTabs.length > 0) {
        const validTabIds = currentTabs.map(tab => tab.id);
        if (!validTabIds.includes(activeTab)) {
          setActiveTab('overview');
        }
      }
    }
  }, [parsedAnalysis, activeTab]);

  // Robust JSON parsing function with multiple fallback strategies
  const parseJSONWithFallbacks = (rawString: string): any => {
    const strategies = [
      // Strategy 1: Direct parsing
      () => JSON.parse(rawString),
      
      // Strategy 2: Basic cleaning
      () => {
        const cleaned = rawString
          .replace(/\\n/g, '\\n')
          .replace(/\\r/g, '\\r')
          .replace(/\\t/g, '\\t')
          .replace(/\\\\/g, '\\\\')
          .replace(/\\"/g, '\\"');
        return JSON.parse(cleaned);
      },
      
      // Strategy 3: Aggressive string value cleaning
      () => {
        let cleaned = rawString;
        // Fix unescaped quotes in string values
        cleaned = cleaned.replace(/:\s*"([^"]*?)"/g, (match: string, content: string) => {
          const cleanContent = content
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"');
          return `: "${cleanContent}"`;
        });
        return JSON.parse(cleaned);
      },
      
      // Strategy 4: Fix common JSON syntax issues
      () => {
        let cleaned = rawString;
        
        // Fix trailing commas
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix missing quotes around property names
        cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        
        // Fix unescaped control characters
        cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
        
        // Fix common quote issues
        cleaned = cleaned.replace(/:\s*'([^']*?)'/g, ':"$1"');
        
        return JSON.parse(cleaned);
      },
      
      // Strategy 5: Try to extract JSON from malformed string
      () => {
        let cleaned = rawString;
        
        // Find the first { and last } to extract JSON
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        
        // Apply all previous cleaning strategies
        cleaned = cleaned.replace(/\\n/g, '\\n')
          .replace(/\\r/g, '\\r')
          .replace(/\\t/g, '\\t')
          .replace(/\\\\/g, '\\\\')
          .replace(/\\"/g, '\\"')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          .replace(/[\x00-\x1F\x7F]/g, '')
          .replace(/:\s*'([^']*?)'/g, ':"$1"');
        
        return JSON.parse(cleaned);
      },
      
      // Strategy 6: Handle truncated JSON strings
      () => {
        let cleaned = rawString;
        
        // Find the first { and last } to extract JSON
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        
        // Count quotes to find unclosed strings
        let quoteCount = 0;
        let inString = false;
        let escapeNext = false;
        let lastValidPosition = -1;
        
        for (let i = 0; i < cleaned.length; i++) {
          const char = cleaned[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            quoteCount++;
          }
          
          // If we're not in a string and we find a valid JSON structure
          if (!inString && (char === '}' || char === ']')) {
            lastValidPosition = i;
          }
        }
        
        // If we have an odd number of quotes, we have an unclosed string
        if (quoteCount % 2 !== 0) {
          // Find the last unclosed quote and close it
          const lastQuotePos = cleaned.lastIndexOf('"');
          if (lastQuotePos !== -1) {
            // Check if this quote is actually unclosed (not followed by proper JSON structure)
            const afterQuote = cleaned.substring(lastQuotePos + 1).trim();
            if (!afterQuote.startsWith('"') && !afterQuote.startsWith(',') && !afterQuote.startsWith('}') && !afterQuote.startsWith(']')) {
              // This quote is unclosed, close it and add proper JSON ending
              cleaned = cleaned.substring(0, lastQuotePos + 1) + '"}';
            }
          }
        }
        
        // Apply all previous cleaning strategies
        cleaned = cleaned.replace(/\\n/g, '\\n')
          .replace(/\\r/g, '\\r')
          .replace(/\\t/g, '\\t')
          .replace(/\\\\/g, '\\\\')
          .replace(/\\"/g, '\\"')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          .replace(/[\x00-\x1F\x7F]/g, '')
          .replace(/:\s*'([^']*?)'/g, ':"$1"');
        
        return JSON.parse(cleaned);
      },
      
      // Strategy 7: Last resort - try to fix truncated strings by looking for common patterns
      () => {
        let cleaned = rawString;
        
        // Find the first { and last } to extract JSON
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        
        // Look for common truncation patterns and fix them
        const truncationPatterns = [
          // Pattern: string ends with unclosed quote followed by incomplete content
          /"([^"]*?)(?:\s*$|\s*[^",}\]])$/g,
          // Pattern: string ends with incomplete word
          /"([^"]*?)(?:\s*[a-zA-Z0-9_]*\s*$)/g,
        ];
        
        for (const pattern of truncationPatterns) {
          const matches = cleaned.match(pattern);
          if (matches) {
            // Close the string and add proper JSON ending
            cleaned = cleaned.replace(pattern, '"$1"}');
            break;
          }
        }
        
        // If the JSON doesn't end properly, try to close it
        if (!cleaned.trim().endsWith('}')) {
          // Count opening and closing braces
          const openBraces = (cleaned.match(/\{/g) || []).length;
          const closeBraces = (cleaned.match(/\}/g) || []).length;
          
          // Add missing closing braces
          for (let i = 0; i < openBraces - closeBraces; i++) {
            cleaned += '}';
          }
        }
        
        // Apply all previous cleaning strategies
        cleaned = cleaned.replace(/\\n/g, '\\n')
          .replace(/\\r/g, '\\r')
          .replace(/\\t/g, '\\t')
          .replace(/\\\\/g, '\\\\')
          .replace(/\\"/g, '\\"')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          .replace(/[\x00-\x1F\x7F]/g, '')
          .replace(/:\s*'([^']*?)'/g, ':"$1"');
        
        return JSON.parse(cleaned);
      },
      
      // Strategy 8: Specific fix for truncated component_diagram and other diagram fields
      () => {
        let cleaned = rawString;
        
        // Find the first { and last } to extract JSON
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        
        // Look for specific truncation patterns in diagram fields
        const diagramFields = ['component_diagram', 'sequence_diagram', 'activity_diagram', 'class_diagram'];
        
        for (const field of diagramFields) {
          const fieldPattern = new RegExp(`"${field}"\\s*:\\s*"([^"]*?)(?:\\s*$|\\s*[^",}\\]])$`, 'g');
          const matches = cleaned.match(fieldPattern);
          
          if (matches) {
            // The field is truncated, close it properly
            cleaned = cleaned.replace(fieldPattern, `"${field}": "$1"`);
          }
        }
        
        // If the JSON still doesn't end properly, try to close it
        if (!cleaned.trim().endsWith('}')) {
          // Count opening and closing braces
          const openBraces = (cleaned.match(/\{/g) || []).length;
          const closeBraces = (cleaned.match(/\}/g) || []).length;
          
          // Add missing closing braces
          for (let i = 0; i < openBraces - closeBraces; i++) {
            cleaned += '}';
          }
        }
        
        // Apply all previous cleaning strategies
        cleaned = cleaned.replace(/\\n/g, '\\n')
          .replace(/\\r/g, '\\r')
          .replace(/\\t/g, '\\t')
          .replace(/\\\\/g, '\\\\')
          .replace(/\\"/g, '\\"')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          .replace(/[\x00-\x1F\x7F]/g, '')
          .replace(/:\s*'([^']*?)'/g, ':"$1"');
        
        return JSON.parse(cleaned);
      }
    ];
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`Trying parsing strategy ${i + 1}...`);
        const result = strategies[i]();
        console.log(`Strategy ${i + 1} succeeded!`);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Strategy ${i + 1} failed:`, lastError.message);
      }
    }
    
    throw lastError || new Error('All parsing strategies failed');
  };

  const fetchAnalysisData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const { analysisAPI } = await import('@/lib/api/code-analysis');
      const data = await analysisAPI.getAnalysisResult(id);
      
      // Check if the job was not found
      if (!data) {
        setError('Analysis job not found. This job may have been deleted or does not exist.');
        return;
      }
      
      setAnalysisData(data);
      
      console.log('Full API response:', data);
      console.log('Analysis data structure:', data?.analysis_data);
      console.log('Diagram images:', data?.analysis_data?.diagram_images);
      
      // Check if we have diagram images in the response
      if (data?.analysis_data?.diagram_images) {
        console.log('Found diagram images in response:', Object.keys(data.analysis_data.diagram_images));
      }
      
      // Use the analysis_data directly if it exists, otherwise try to parse raw_result
      if (data?.analysis_data) {
        console.log('Using analysis_data directly from API response');
        
        // Check if this is HLD analysis
        if (data.job?.analysis_type === 'hld_analysis') {
          console.log('Processing HLD analysis data');
          
          // For HLD, we need to check if hld_analysis exists in analysis_data
          if (data.analysis_data.hld_analysis) {
            console.log('HLD analysis data found:', data.analysis_data.hld_analysis);
            // For HLD, set parsedAnalysis to the hld_analysis data
            setParsedAnalysis({
              analysis_type: 'hld_analysis',
              hld_analysis: data.analysis_data.hld_analysis
            });
          } else {
            console.log('No HLD analysis data found, falling back to raw_result parsing');
            // Try to parse raw_result for HLD if hld_analysis is not available
            if (data.analysis_data.raw_result) {
              try {
                const parsed = parseJSONWithFallbacks(data.analysis_data.raw_result);
                console.log('HLD parsing successful:', parsed);
                setParsedAnalysis({
                  analysis_type: 'hld_analysis',
                  hld_analysis: parsed
                });
              } catch (parseError) {
                console.error('HLD JSON Parse Error:', parseError);
                setError(`Failed to parse HLD analysis result: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
              }
            } else {
              setError('No HLD analysis data found');
            }
          }
        } else {
          // For LLD analysis, use the existing logic
          console.log('Processing LLD analysis data');
          
          // Create a combined analysis object with both the analysis data and diagram images
          const combinedAnalysis = {
            ...data.analysis_data,
            // Ensure diagram_images are properly structured
            diagram_images: data.analysis_data.diagram_images || {}
          };
          
          console.log('Combined analysis data:', combinedAnalysis);
          console.log('Diagram images structure:', combinedAnalysis.diagram_images);
          console.log('Available diagram types:', Object.keys(combinedAnalysis.diagram_images || {}));
          
          // Log each diagram image for debugging
          if (combinedAnalysis.diagram_images) {
            Object.entries(combinedAnalysis.diagram_images).forEach(([type, image]) => {
              const diagramImage = image as any;
              console.log(`Diagram ${type}:`, {
                type: diagramImage?.type,
                format: diagramImage?.image_format,
                width: diagramImage?.width,
                height: diagramImage?.height,
                dataLength: diagramImage?.image_data?.length || 0
              });
            });
          }
          
          setParsedAnalysis(combinedAnalysis);
        }
        
      } else if (data?.analysis_data?.raw_result) {
        // Fallback to parsing raw_result if analysis_data is not available
        try {
          console.log('Falling back to parsing raw_result');
          console.log('Raw result type:', typeof data.analysis_data.raw_result);
          console.log('Raw result length:', data.analysis_data.raw_result.length);
          
          console.log('Using robust parsing with multiple fallback strategies...');
          const parsed = parseJSONWithFallbacks(data.analysis_data.raw_result);
          console.log('Parsing successful:', parsed);
          setParsedAnalysis(parsed);
          
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Raw result that failed to parse:', data.analysis_data.raw_result);
          
          // Show more detailed error information
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';
          setError(`Failed to parse analysis result: ${errorMessage}`);
          
          // Log the problematic section around the error
          if (parseError instanceof SyntaxError && parseError.message.includes('position')) {
            const positionMatch = parseError.message.match(/position (\d+)/);
            if (positionMatch) {
              const position = parseInt(positionMatch[1]);
              const start = Math.max(0, position - 100);
              const end = Math.min(data.analysis_data.raw_result.length, position + 100);
              console.error('Problematic JSON section:', data.analysis_data.raw_result.substring(start, end));
            }
          }
        }
      } else {
        console.log('No analysis data found in response');
        setError('No analysis data found in response');
      }
    } catch (err) {
      console.error('API Error:', err);
      
      // Check if it's a 404 error (job not found)
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('not found'))) {
        setError('Analysis job not found. This job may have been deleted or does not exist.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--chart-2)]"></div>
        <div className="text-lg text-[var(--foreground)]">Loading analysis...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-4xl mx-auto p-6">
        <div className="text-[var(--destructive)] text-lg mb-4">
          {error.includes('Analysis job not found') ? (
            <div className="space-y-4">
              <div className="text-2xl font-semibold mb-2">Analysis Job Not Found</div>
              <div className="text-base text-[var(--muted-foreground)]">
                This analysis job may have been deleted or does not exist.
              </div>
            </div>
          ) : (
            `Error: ${error}`
          )}
        </div>
        
        {/* Debug information for JSON parsing errors */}
        {error.includes('Failed to parse analysis result') && analysisData?.analysis_data?.raw_result && (
          <div className="bg-[var(--muted)] p-4 rounded-lg text-left mb-4">
            <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">Debug Information:</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-[var(--foreground)]">Raw Result Length:</strong> {analysisData.analysis_data.raw_result.length} characters
              </div>
              <div>
                <strong className="text-[var(--foreground)]">First 500 characters:</strong>
                <pre className="mt-2 bg-[var(--card)] p-2 rounded overflow-x-auto text-xs text-[var(--foreground)]">
                  {analysisData.analysis_data.raw_result.substring(0, 500)}
                </pre>
              </div>
              <div>
                <strong className="text-[var(--foreground)]">Last 500 characters:</strong>
                <pre className="mt-2 bg-[var(--card)] p-2 rounded overflow-x-auto text-xs text-[var(--foreground)]">
                  {analysisData.analysis_data.raw_result.substring(Math.max(0, analysisData.analysis_data.raw_result.length - 500))}
                </pre>
              </div>
              {error.includes('position') && (
                <div>
                  <strong className="text-[var(--foreground)]">Error Position Analysis:</strong>
                  <pre className="mt-2 bg-[var(--card)] p-2 rounded overflow-x-auto text-xs text-[var(--foreground)]">
                    {(() => {
                      const positionMatch = error.match(/position (\d+)/);
                      if (positionMatch) {
                        const position = parseInt(positionMatch[1]);
                        const start = Math.max(0, position - 200);
                        const end = Math.min(analysisData.analysis_data.raw_result.length, position + 200);
                        return `Position ${position}: ${analysisData.analysis_data.raw_result.substring(start, end)}`;
                      }
                      return 'Could not extract position information';
                    })()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          {error.includes('Analysis job not found') ? (
            <Button
              onClick={() => router.push('/analysis')}
              className="px-4 py-2 bg-[var(--chart-2)] text-[var(--primary-foreground)] rounded hover:bg-[var(--chart-1)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analysis Jobs
            </Button>
          ) : (
            <button 
              onClick={() => analysisId && fetchAnalysisData(analysisId)}
              className="px-4 py-2 bg-[var(--chart-2)] text-[var(--primary-foreground)] rounded hover:bg-[var(--chart-1)] transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!parsedAnalysis) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 max-w-4xl mx-auto p-6">
        <div className="text-lg text-center text-[var(--foreground)]">No parsed analysis data found</div>
        {analysisData && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">Debug Information:</h3>
            <div className="bg-[var(--muted)] p-4 rounded-lg text-sm">
              <div className="mb-4">
                <strong className="text-[var(--foreground)]">Analysis Data Structure:</strong>
                <pre className="mt-2 bg-[var(--card)] p-2 rounded overflow-x-auto max-h-60 text-[var(--foreground)]">
                  {JSON.stringify(analysisData, null, 2)}
                </pre>
              </div>
              {analysisData?.analysis_data?.raw_result && (
                <div>
                  <strong className="text-[var(--foreground)]">Raw Result (first 500 chars):</strong>
                  <pre className="mt-2 bg-[var(--card)] p-2 rounded overflow-x-auto text-[var(--foreground)]">
                    {analysisData.analysis_data.raw_result.substring(0, 500)}...
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Tab configuration based on analysis type and available data
  const getTabs = () => {
    if (analysisData?.job?.analysis_type === 'hld_analysis') {
      return [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'architecture', label: 'Architecture', icon: Layers },
        { id: 'components', label: 'Components', icon: GitCommit },
        { id: 'recommendations', label: 'Recommendations', icon: Code2 },
        { id: 'diagrams', label: 'Diagrams', icon: Activity },
      ];
    } else {
      const allTabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'architecture', label: 'Architecture', icon: Layers },
        { id: 'components', label: 'Components', icon: GitCommit },
        { id: 'design-patterns', label: 'Design Patterns', icon: Code2 },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'performance', label: 'Performance', icon: Zap },
        { id: 'algorithms', label: 'Algorithms', icon: Code2 },
        { id: 'recommendations', label: 'Recommendations', icon: Code2 },
        { id: 'diagrams', label: 'Diagrams', icon: Activity },
      ];

      // Filter tabs based on available data for LLD analysis
      if (parsedAnalysis && 'analysis_type' in parsedAnalysis && parsedAnalysis.analysis_type !== 'hld_analysis') {
        return allTabs.filter(tab => shouldShowTab(tab.id, parsedAnalysis as AnalysisData));
      }
      
      return allTabs;
    }
  };

  const tabs = getTabs();


  return (
    <DashboardLayout fullWidth={true} showDefaultHeader={false}>
      <div className="flex h-[calc(100vh-4rem)] group-hover/sidebar transition-all duration-300 ease-in-out fixed top-16 left-0 right-0 z-30">
        {/* Header with Theme Toggle and User Menu */}
        <div className="fixed top-0 right-0 z-50 p-4">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        {/* Analysis Tab Sidebar */}
        <div className="w-64 bg-[var(--bg-elevated-secondary)] border border-[var(--border-heavy)] flex-shrink-0 flex flex-col ml-16 group-hover/sidebar:ml-0 transition-all duration-300 ease-in-out h-full">
          <div className="p-4 border-b border-[var(--border-heavy)] flex-shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                {analysisData?.job?.analysis_type === 'hld_analysis' ? 'HLD Analysis' : 'Code Analysis'}
              </h1>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 min-h-0 touch-pan-y">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center rounded-md transition-all duration-300 ease-in-out text-sm font-medium relative px-2 py-2 mx-1 gap-3 justify-start w-full cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[var(--interactive-bg-secondary-press)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-bg-secondary-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <tab.icon className={`flex-shrink-0 transition-all duration-200 h-5 w-5 ${
                    activeTab === tab.id ? 'text-[var(--icon-primary)]' : 'text-current'
                  }`} />
                  <span className="truncate overflow-hidden transition-[max-width,opacity,transform] duration-300 pl-2 opacity-100 max-w-[160px] translate-x-0">
                    {tab.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-shrink-0 px-6 pt-6">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-[var(--foreground)]">
                    {analysisData?.job?.analysis_type === 'hld_analysis' ? 'High-Level Design Analysis' : 'Code Analysis Report'}
                  </h1>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <Button
                  onClick={() => router.push('/analysis')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Analysis Jobs
                </Button>
              </div>
            </div>

            {/* Job Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--card)] rounded-lg p-4 shadow-sm border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-[var(--chart-2)]" />
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Repository</h3>
                </div>
                <p className="text-lg font-semibold text-[var(--card-foreground)]">{analysisData?.job?.repository_name || 'N/A'}</p>
                {analysisData?.job?.repository_url && (
                  <a 
                    href={analysisData.job.repository_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--chart-2)] hover:text-[var(--chart-1)] truncate block mt-1 transition-colors"
                  >
                    View Repository →
                  </a>
                )}
              </div>
              
              <div className="bg-[var(--card)] rounded-lg p-4 shadow-sm border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-[var(--chart-1)]" />
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Status</h3>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    analysisData?.job?.status === 'completed' 
                      ? 'bg-[var(--chart-1)] text-[var(--primary-foreground)]' 
                      : analysisData?.job?.status === 'processing'
                      ? 'bg-[var(--chart-3)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}>
                    {analysisData?.job?.status || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="bg-[var(--card)] rounded-lg p-4 shadow-sm border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="h-4 w-4 text-[var(--chart-4)]" />
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Model Used</h3>
                </div>
                <p className="text-lg font-semibold text-[var(--card-foreground)]">{analysisData?.job?.model_used || 'N/A'}</p>
                <p className="text-sm text-[var(--muted-foreground)]">Tokens: {analysisData?.job?.total_tokens?.toLocaleString() || 0}</p>
              </div>
              
              <div className="bg-[var(--card)] rounded-lg p-4 shadow-sm border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-[var(--chart-5)]" />
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Analysis Type</h3>
                </div>
                <p className="text-lg font-semibold text-[var(--card-foreground)]">
                  {analysisData?.job?.analysis_type === 'hld_analysis' 
                    ? 'High-Level Design' 
                    : analysisData?.job?.analysis_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Created: {analysisData?.job?.created_at ? new Date(analysisData.job.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-6 min-h-0 touch-pan-y">
            <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)]">
              <div className="p-6">
                {analysisData?.job?.analysis_type === 'hld_analysis' ? (
                  <RenderTabContentHLD
                    activeTab={activeTab}
                    parsedAnalysis={{ hld_analysis: parsedAnalysis?.hld_analysis }}
                    analysisData={analysisData}
                  />
                ) : (
                  <RenderTabContentLLD
                    activeTab={activeTab}
                    parsedAnalysis={parsedAnalysis as AnalysisData}
                    analysisData={analysisData}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}