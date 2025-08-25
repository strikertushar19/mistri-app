'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BarChart3, GitBranch, Calendar, Code2, DollarSign, Shield, Zap, GitCommit, Layers, Activity, Download } from 'lucide-react';


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
}

// Mermaid types are defined in src/types/mermaid.d.ts

// Tab component for better navigation
const TabButton = ({ 
  isActive, 
  onClick, 
  children, 
  icon: Icon 
}: { 
  isActive: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors min-w-[180px] w-auto ${
      isActive
        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--border)]'
        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
    }`}
    style={{ maxWidth: '100%', width: 'fit-content' }}
  >
    <Icon className="h-4 w-4 flex-shrink-0" />
    <span className="truncate">{children}</span>
  </button>
);

// Diagram Image Component for displaying generated images with zoom functionality
const DiagramImageComponent = ({ image, title }: { image: any, title: string }) => {
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  console.log(`DiagramImageComponent for ${title}:`, image);

  if (!image || !image.image_data) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">{title}:</h3>
        <div className="bg-white p-4 rounded border">
          <div className="text-gray-500 text-center py-4">
            No image available - {!image ? 'No image object' : 'No image data'}
          </div>
        </div>
      </div>
    );
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  const handleDownload = () => {
    try {
      if (image.image_format === 'svg') {
        // For SVG, create a blob and download
        const svgContent = atob(image.image_data);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For other formats, convert base64 to blob and download
        const byteCharacters = atob(image.image_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${image.image_format}` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${image.image_format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700">{title}:</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-xs text-gray-600 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            title="Reset View"
          >
            Reset
          </button>
          <button
            onClick={handleDownload}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
            title="Download Diagram"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded border">
        {imageError ? (
          <div className="text-red-600 text-center py-4">
            Failed to load image
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="relative overflow-hidden border border-gray-200 rounded"
            style={{ 
              height: '600px',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              {image.image_format === 'svg' ? (
                <div 
                  className="max-w-full max-h-full"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      try {
                        return atob(image.image_data);
                      } catch (error) {
                        console.error('Failed to decode SVG data:', error);
                        setImageError(true);
                        return '<div class="text-red-600 p-4">Failed to decode SVG data</div>';
                      }
                    })()
                  }}
                  style={{
                    width: `${image.width}px`,
                    height: `${image.height}px`
                  }}
                />
              ) : (
                <img
                  src={`data:image/${image.image_format};base64,${image.image_data}`}
                  alt={title}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    width: `${image.width}px`,
                    height: `${image.height}px`
                  }}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div>
            {image.width} × {image.height} pixels • {image.image_format.toUpperCase()}
          </div>
          <div className="text-xs text-gray-400">
            Drag to pan • Scroll to zoom • Use buttons for precise control
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Mermaid Diagram Component
const MermaidDiagram = ({ diagram, title }: { diagram: string, title: string }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    // Load Mermaid from CDN
    const loadMermaid = async () => {
      if (window.mermaid) {
        setMermaidLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js';
      script.onload = () => {
        window.mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose'
        });
        setMermaidLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Mermaid');
      };
      document.head.appendChild(script);
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (mermaidLoaded && diagram && elementRef.current) {
      const diagramId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      window.mermaid.render(diagramId, diagram)
        .then((result) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = result.svg;
          }
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          if (elementRef.current) {
            elementRef.current.innerHTML = `
              <div class="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
                <p class="font-medium">Failed to render diagram</p>
                <p class="text-sm mt-1">${error.message}</p>
                <details class="mt-2 text-left">
                  <summary class="cursor-pointer text-xs">Show diagram code</summary>
                  <pre class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">${diagram}</pre>
                </details>
              </div>
            `;
          }
        });
    }
  }, [mermaidLoaded, diagram]);

  const handleDownload = () => {
    try {
      if (elementRef.current) {
        const svgElement = elementRef.current.querySelector('svg');
        if (svgElement) {
          // Get the SVG content
          const svgContent = svgElement.outerHTML;
          
          // Create a blob and download
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // If no SVG found, try to download the diagram code as text
          const blob = new Blob([diagram], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.mermaid`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download diagram. Please try again.');
    }
  };

  if (!diagram || diagram.trim() === '') {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">{title}:</h3>
        <div className="bg-white p-4 rounded border">
          <div className="text-gray-500 text-center py-4">No diagram available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700">{title}:</h3>
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
          title="Download Diagram"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
      <div className="bg-white p-4 rounded border overflow-x-auto">
        {!mermaidLoaded ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <div className="text-gray-500">Loading Mermaid...</div>
          </div>
        ) : (
          <div ref={elementRef} className="mermaid-container min-h-[100px]"></div>
        )}
      </div>
    </div>
  );
};

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [parsedAnalysis, setParsedAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisData(analysisId);
    }
  }, [analysisId]);

  // Robust JSON parsing function with multiple fallback strategies
  const parseJSONWithFallbacks = (rawString: string): any => {
    const strategies = [
      // Strategy 1: Direct parsing
      () => JSON.parse(rawString),
      
      // Strategy 2: Basic cleaning
      () => {
        let cleaned = rawString
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
          let lastQuotePos = cleaned.lastIndexOf('"');
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
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <div className="text-[var(--destructive)] text-lg mb-4">Error: {error}</div>
        
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
        
        <button 
          onClick={() => analysisId && fetchAnalysisData(analysisId)}
          className="px-4 py-2 bg-[var(--chart-2)] text-[var(--primary-foreground)] rounded hover:bg-[var(--chart-1)] transition-colors"
        >
          Retry
        </button>
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

  // Tab configuration
  const tabs = [
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

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Repository Overview */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Repository Overview
              </h2>
              <div className="grid gap-6">
                {/* Basic Information */}
                <div className="bg-[var(--muted)] p-4 rounded-lg">
                  <h3 className="font-medium text-[var(--foreground)] mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-[var(--foreground)]">Name:</span>
                      <p className="text-[var(--muted-foreground)] mt-1">{parsedAnalysis.repository_overview?.name || analysisData?.job?.repository_name || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-[var(--foreground)]">Description:</span>
                      <p className="text-[var(--muted-foreground)] mt-1">{parsedAnalysis.repository_overview?.description || 'No description available'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-[var(--foreground)]">Project Type:</span>
                      <p className="text-[var(--muted-foreground)] mt-1">{parsedAnalysis.repository_overview?.project_type || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-[var(--foreground)]">Technology Stack:</span>
                      <p className="text-[var(--muted-foreground)] mt-1">{parsedAnalysis.repository_overview?.main_technology || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Architecture & Design */}
                <div className="bg-[var(--muted)] p-4 rounded-lg">
                  <h3 className="font-medium text-[var(--foreground)] mb-3">Architecture & Design</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-[var(--foreground)]">Architecture Style:</span>
                      <p className="text-[var(--muted-foreground)] mt-1">{parsedAnalysis.repository_overview?.architecture_style || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-[var(--foreground)]">Scalability Approach:</span>
                      <p className="text-[var(--muted-foreground)] mt-1">{parsedAnalysis.repository_overview?.scalability_approach || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Key Components */}
                {parsedAnalysis.repository_overview?.key_components && parsedAnalysis.repository_overview.key_components.length > 0 && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Key Components</h3>
                    <div className="grid gap-2">
                      {parsedAnalysis.repository_overview.key_components.map((component: string, index: number) => (
                        <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3">
                          <span className="text-[var(--foreground)]">{component}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Design Patterns */}
                {parsedAnalysis.repository_overview?.design_patterns_used && parsedAnalysis.repository_overview.design_patterns_used.length > 0 && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Design Patterns Used</h3>
                    <div className="grid gap-2">
                      {parsedAnalysis.repository_overview.design_patterns_used.map((pattern: string, index: number) => (
                        <div key={index} className="bg-[var(--chart-1)]/10 border border-[var(--chart-1)]/20 rounded-lg p-3">
                          <span className="text-[var(--foreground)] font-medium">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Considerations */}
                {parsedAnalysis.repository_overview?.performance_considerations && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Performance Considerations</h3>
                    <div className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.performance_considerations}</p>
                    </div>
                  </div>
                )}

                {/* Security  */}
                {parsedAnalysis.repository_overview?.security_posture && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Security </h3>
                    <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.security_posture}</p>
                    </div>
                  </div>
                )}

                {/* Algorithms */}
                {parsedAnalysis.repository_overview?.algorithms && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Algorithms</h3>
                    <div className="bg-[var(--chart-4)]/10 border border-[var(--chart-4)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.algorithms}</p>
                    </div>
                  </div>
                )}

                {/* Error Handling */}
                {parsedAnalysis.repository_overview?.error_handling && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Error Handling</h3>
                    <div className="bg-[var(--chart-5)]/10 border border-[var(--chart-5)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.error_handling}</p>
                    </div>
                  </div>
                )}

                {/* Available Diagrams */}
                {parsedAnalysis.repository_overview?.diagrams && parsedAnalysis.repository_overview.diagrams.length > 0 && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Available Diagrams</h3>
                    <div className="grid gap-2">
                      {parsedAnalysis.repository_overview.diagrams.map((diagram: string, index: number) => (
                        <div key={index} className="bg-[var(--chart-2)]/10 border border-[var(--chart-2)]/20 rounded-lg p-3">
                          <span className="text-[var(--foreground)] font-medium">{diagram}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {parsedAnalysis.repository_overview?.recommendations && parsedAnalysis.repository_overview.recommendations.length > 0 && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Key Recommendations</h3>
                    <div className="grid gap-3">
                      {parsedAnalysis.repository_overview.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded-lg p-3">
                          <span className="text-[var(--foreground)]">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Data Structures */}
            {/* {parsedAnalysis.detailed_design?.data_structures && parsedAnalysis.detailed_design.data_structures.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Data Structures
                </h2>
                <div className="grid gap-4">
                  {parsedAnalysis.detailed_design.data_structures.map((ds, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-lg text-[var(--chart-1)] mb-2">{ds.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] mb-2">Type: {ds.type}</p>
                      <p className="text-[var(--muted-foreground)]">{ds.purpose}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
 */}


            {/* Recommendations */}
            {/* {parsedAnalysis.recommendations && parsedAnalysis.recommendations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Recommendations
                </h2>
                <div className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded-lg p-4">
                  <ul className="space-y-2">
                    {parsedAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">

                        <span className="text-[var(--foreground)]">
                          {typeof rec === 'string' ? rec : (
                            <div className="space-y-2">
                              {(rec as Recommendation).description && <div className="font-medium">{(rec as Recommendation).description}</div>}
                              {(rec as Recommendation).category && <div className="text-sm text-[var(--muted-foreground)]">Category: {(rec as Recommendation).category}</div>}
                              {(rec as Recommendation).priority && <div className="text-sm text-[var(--muted-foreground)]">Priority: {(rec as Recommendation).priority}</div>}
                              {(rec as Recommendation).impact && <div className="text-sm text-[var(--muted-foreground)]">Impact: {(rec as Recommendation).impact}</div>}
                              {(rec as Recommendation).rationale && <div className="text-sm text-[var(--muted-foreground)]">Rationale: {(rec as Recommendation).rationale}</div>}
                              {(rec as Recommendation).implementation && (
                                <div className="text-sm text-[var(--muted-foreground)]">
                                  Implementation: {typeof (rec as Recommendation).implementation === 'string' ? (rec as Recommendation).implementation : JSON.stringify((rec as Recommendation).implementation)}
                                </div>
                              )}
                            </div>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )} */}
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-6">
            {/* System Architecture */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                System Architecture
              </h2>
              <div className="space-y-6">
                {/* Overview */}
                <div className="bg-[var(--muted)] p-4 rounded-lg">
                  <h3 className="font-medium text-[var(--foreground)] mb-2">Overview:</h3>
                  <div className="text-[var(--muted-foreground)]">
                    {parsedAnalysis.system_architecture.system_architecture?.overview || 'No architecture overview available'}
                  </div>
                </div>
                
                {/* Data Flow */}
                <div className="bg-[var(--muted)] p-4 rounded-lg">
                  <h3 className="font-medium text-[var(--foreground)] mb-2">Data Flow:</h3>
                  <div className="text-[var(--muted-foreground)]">
                    {parsedAnalysis.system_architecture.system_architecture?.data_flow || 'No data flow information available'}
                  </div>
                </div>

                {/* Deployment Model */}
                {parsedAnalysis.system_architecture.system_architecture?.deployment_model && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-2">Deployment Model:</h3>
                    <p className="text-[var(--muted-foreground)]">{parsedAnalysis.system_architecture.system_architecture.deployment_model}</p>
                  </div>
                )}

                {/* Scalability Approach */}
                {parsedAnalysis.system_architecture.system_architecture?.scalability_approach && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-2">Scalability Approach:</h3>
                    <p className="text-[var(--muted-foreground)]">{parsedAnalysis.system_architecture.system_architecture.scalability_approach}</p>
                  </div>
                )}
              </div>
            </section>

            {/* System Components */}
            {parsedAnalysis.system_architecture.system_architecture?.components && parsedAnalysis.system_architecture.system_architecture.components.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  System Components
                </h2>
                <div className="grid gap-6">
                  {parsedAnalysis.system_architecture.system_architecture.components.map((component, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                      {/* Component Header */}
                      <div className="border-b border-[var(--border)] pb-3 mb-4">
                        <h3 className="text-lg font-semibold text-[var(--chart-2)] mb-2">{component.name}</h3>
                        <p className="text-[var(--muted-foreground)]">{component.purpose}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Technology */}
                          {component.technology && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Technology
                              </h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-1)]/10 p-3 rounded border border-[var(--chart-1)]/20">
                                {component.technology}
                              </p>
                            </div>
                          )}

                          {/* Responsibilities */}
                          {component.responsibilities && component.responsibilities.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Responsibilities
                              </h4>
                              <div className="bg-[var(--chart-2)]/10 border border-[var(--chart-2)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {component.responsibilities.map((resp, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{resp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Dependencies */}
                          {component.dependencies && component.dependencies.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Dependencies
                              </h4>
                              <div className="bg-[var(--chart-5)]/10 border border-[var(--chart-5)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {component.dependencies.map((dep, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{dep}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Interfaces */}
                          {component.interfaces && component.interfaces.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Interfaces
                              </h4>
                              <div className="bg-[var(--chart-4)]/10 border border-[var(--chart-4)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {component.interfaces.map((iface: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <span className="text-sm text-[var(--foreground)] font-mono">{iface}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      case 'components':
        return (
          <div className="space-y-6">
            {/* Components */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Components
              </h2>
              <div className="grid gap-4">
                {parsedAnalysis.system_architecture.system_architecture?.components && parsedAnalysis.system_architecture.system_architecture.components.length > 0 ? (
                  parsedAnalysis.system_architecture.system_architecture.components.map((component, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-lg text-[var(--chart-2)] mb-2">{component.name}</h3>
                      <p className="text-[var(--muted-foreground)] mb-3">{component.purpose}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-[var(--foreground)] mb-2">Responsibilities:</h4>
                          <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1">
                            {component.responsibilities?.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            )) || <li>No responsibilities listed</li>}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-[var(--foreground)] mb-2">Dependencies:</h4>
                          <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1">
                            {component.dependencies?.map((dep, idx) => (
                              <li key={idx}>{dep}</li>
                            )) || <li>No dependencies listed</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
                    <p className="text-[var(--muted-foreground)] text-center py-4">No components information available</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      case 'design-patterns':
        return (
          <div className="space-y-6">
            {/* Design Patterns */}
            {parsedAnalysis.design_patterns?.design_patterns && parsedAnalysis.design_patterns.design_patterns.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Design Patterns
                </h2>
                <div className="space-y-6">
                  {parsedAnalysis.design_patterns.design_patterns.map((pattern, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                      {typeof pattern === 'string' ? (
                        <div className="text-[var(--foreground)]">{pattern}</div>
                      ) : (
                        <div className="space-y-4">
                          {/* Pattern Header */}
                          <div className="border-b border-[var(--border)] pb-3">
                            <h3 className="text-lg font-semibold text-[var(--chart-2)]">
                              {pattern.pattern || 'Design Pattern'}
                            </h3>
                            {pattern.location && (
                              <p className="text-sm text-[var(--muted-foreground)] mt-1 flex items-center gap-2">
                                <span>
                                  Location: <span className="font-mono bg-[var(--muted)] px-2 py-1 rounded">{pattern.location}</span>
                                </span>
                                {analysisData?.job?.repository_url && (
                                  <a 
                                    href={analysisData.job.repository_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-[var(--chart-2)] hover:text-[var(--chart-1)] hover:underline transition-colors"
                                  >
                                    View Repository →
                                  </a>
                                )}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          {pattern.description && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Description
                              </h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-1)]/10 p-3 rounded border border-[var(--chart-1)]/20">
                                {pattern.description}
                              </p>
                            </div>
                          )}

                          {/* Benefits */}
                          {pattern.benefits && pattern.benefits.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Benefits
                              </h4>
                              <div className="bg-[var(--chart-2)]/10 border border-[var(--chart-2)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {pattern.benefits.map((benefit: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Alternatives */}
                          {pattern.alternatives && pattern.alternatives.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Alternatives
                              </h4>
                              <div className="bg-[var(--chart-4)]/10 border border-[var(--chart-4)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {pattern.alternatives.map((alternative: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{alternative}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Anti-patterns */}
                          {pattern.anti_patterns && pattern.anti_patterns.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Anti-patterns
                              </h4>
                              <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {pattern.anti_patterns.map((antiPattern: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{antiPattern}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Implementation Quality */}
                          {pattern.implementation_quality && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                                Implementation Quality
                              </h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-3)]/10 p-3 rounded border border-[var(--chart-3)]/20">
                                {pattern.implementation_quality}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pattern Analysis */}
            {parsedAnalysis.design_patterns?.pattern_analysis && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Pattern Analysis
                </h2>
                <div className="space-y-4">
                  {parsedAnalysis.design_patterns.pattern_analysis.pattern_coverage && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Pattern Coverage</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.design_patterns.pattern_analysis.pattern_coverage}</p>
                    </div>
                  )}
                  
                  {parsedAnalysis.design_patterns.pattern_analysis.overall_pattern_usage && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Overall Pattern Usage</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.design_patterns.pattern_analysis.overall_pattern_usage}</p>
                    </div>
                  )}

                  {parsedAnalysis.design_patterns.pattern_analysis.missing_patterns && parsedAnalysis.design_patterns.pattern_analysis.missing_patterns.length > 0 && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Missing Patterns</h3>
                      <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-1">
                        {parsedAnalysis.design_patterns.pattern_analysis.missing_patterns.map((pattern, index) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Security Analysis */}
            {parsedAnalysis.security_considerations?.security_analysis && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Security Analysis
                </h2>
                <div className="space-y-4">
                  {parsedAnalysis.security_considerations.security_analysis.risk_level && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Risk Level</h3>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        parsedAnalysis.security_considerations.security_analysis.risk_level === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : parsedAnalysis.security_considerations.security_analysis.risk_level === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {parsedAnalysis.security_considerations.security_analysis.risk_level}
                      </span>
                    </div>
                  )}

                  {parsedAnalysis.security_considerations.security_analysis.overall_security && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Overall Security Assessment</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.security_considerations.security_analysis.overall_security}</p>
                    </div>
                  )}

                  {parsedAnalysis.security_considerations.security_analysis?.critical_issues && Array.isArray(parsedAnalysis.security_considerations.security_analysis.critical_issues) && parsedAnalysis.security_considerations.security_analysis.critical_issues.length > 0 && (
                    <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--destructive)] mb-3">Critical Issues</h3>
                      <ul className="space-y-2">
                        {parsedAnalysis.security_considerations.security_analysis.critical_issues.map((issue: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[var(--foreground)]">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedAnalysis.security_considerations.security_analysis?.compliance && parsedAnalysis.security_considerations.security_analysis.compliance.length > 0 && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Compliance Issues</h3>
                      <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-1">
                        {parsedAnalysis.security_considerations.security_analysis.compliance.map((compliance: string, index: number) => (
                          <li key={index}>{compliance}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Security Considerations */}
            {parsedAnalysis.security_considerations?.security_considerations && Array.isArray(parsedAnalysis.security_considerations.security_considerations) && parsedAnalysis.security_considerations.security_considerations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Security Considerations
                </h2>
                <div className="space-y-6">
                  {parsedAnalysis.security_considerations.security_considerations.map((security: string | SecurityConsideration, index: number) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                      {typeof security === 'string' ? (
                        <div className="text-[var(--foreground)]">{security}</div>
                      ) : (
                        <div className="space-y-4">
                          {/* Aspect Header */}
                          <div className="border-b border-[var(--border)] pb-3">
                            <h3 className="text-lg font-semibold text-[var(--chart-2)]">
                              {(security as SecurityConsideration).aspect || 'Security Aspect'}
                            </h3>
                          </div>

                          {/* Description */}
                          {(security as SecurityConsideration).description && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">Description</h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-1)]/10 p-3 rounded border border-[var(--chart-1)]/20">
                                {(security as SecurityConsideration).description}
                              </p>
                            </div>
                          )}

                          {/* Strengths */}
                          {(security as SecurityConsideration).strengths && (security as SecurityConsideration).strengths!.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">Strengths</h4>
                              <div className="bg-[var(--chart-2)]/10 border border-[var(--chart-2)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {(security as SecurityConsideration).strengths!.map((strength: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Vulnerabilities */}
                          {(security as SecurityConsideration).vulnerabilities && (security as SecurityConsideration).vulnerabilities!.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">Vulnerabilities</h4>
                              <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {(security as SecurityConsideration).vulnerabilities!.map((vulnerability: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{vulnerability}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {(security as SecurityConsideration).recommendations && (security as SecurityConsideration).recommendations!.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">Recommendations</h4>
                              <div className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {(security as SecurityConsideration).recommendations!.map((recommendation: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-sm text-[var(--foreground)]">{recommendation}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Error Handling */}
            {parsedAnalysis.error_handling && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Error Handling
                </h2>
                <div className="space-y-4">
                  {/* Exceptions */}
                  {parsedAnalysis.error_handling.error_handling?.exceptions && parsedAnalysis.error_handling.error_handling.exceptions.length > 0 && (
                    <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--destructive)] mb-3">Exceptions:</h3>
                      <div className="grid gap-4">
                        {parsedAnalysis.error_handling.error_handling.exceptions.map((exception, index) => (
                          <div key={index} className="bg-[var(--card)] border border-[var(--destructive)]/20 rounded-lg p-3">
                            <div className="font-medium text-[var(--destructive)] mb-2">{exception.type}</div>
                            <p className="text-sm text-[var(--muted-foreground)] mb-2">{exception.description}</p>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              <div><strong>Handling:</strong> {exception.handling}</div>
                              <div><strong>Frequency:</strong> {exception.frequency}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategies */}
                  {parsedAnalysis.error_handling.error_handling?.strategies && parsedAnalysis.error_handling.error_handling.strategies.length > 0 && (
                    <div className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--chart-3)] mb-3">Strategies:</h3>
                      <div className="grid gap-4">
                        {parsedAnalysis.error_handling.error_handling.strategies.map((strategy, index) => (
                          <div key={index} className="bg-[var(--card)] border border-[var(--chart-3)]/20 rounded-lg p-3">
                            <div className="font-medium text-[var(--chart-3)] mb-2">{strategy.strategy}</div>
                            <p className="text-sm text-[var(--muted-foreground)] mb-2">{strategy.description}</p>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              <div><strong>Coverage:</strong> {strategy.coverage}</div>
                              <div><strong>Effectiveness:</strong> {strategy.effectiveness}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Analysis */}
                  {parsedAnalysis.error_handling.error_handling?.error_analysis && (
                    <div className="bg-[var(--muted)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-3">Error Analysis:</h3>
                      <div className="space-y-4">
                        {parsedAnalysis.error_handling.error_handling.error_analysis.gaps && (
                          <div>
                            <h4 className="font-medium text-[var(--foreground)] mb-2">Gaps:</h4>
                            <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1">
                              {parsedAnalysis.error_handling.error_handling.error_analysis.gaps.map((gap, index) => (
                                <li key={index}>{gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {parsedAnalysis.error_handling.error_handling.error_analysis.improvements && (
                          <div>
                            <h4 className="font-medium text-[var(--foreground)] mb-2">Improvements:</h4>
                            <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1">
                              {parsedAnalysis.error_handling.error_handling.error_analysis.improvements.map((improvement, index) => (
                                <li key={index}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {parsedAnalysis.error_handling.error_handling.error_analysis.overall_strategy && (
                          <div>
                            <h4 className="font-medium text-[var(--foreground)] mb-2">Overall Strategy:</h4>
                            <p className="text-sm text-[var(--muted-foreground)]">{parsedAnalysis.error_handling.error_handling.error_analysis.overall_strategy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            {/* Performance Analysis */}
            {parsedAnalysis.performance_considerations?.performance_analysis && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Performance Analysis
                </h2>
                <div className="space-y-4">
                  {parsedAnalysis.performance_considerations.performance_analysis.overall_performance && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Overall Performance</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.performance_considerations.performance_analysis.overall_performance}</p>
                    </div>
                  )}

                  {parsedAnalysis.performance_considerations.performance_analysis.scalability && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Scalability</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.performance_considerations.performance_analysis.scalability}</p>
                    </div>
                  )}

                  {parsedAnalysis.performance_considerations.performance_analysis.critical_bottlenecks && parsedAnalysis.performance_considerations.performance_analysis.critical_bottlenecks.length > 0 && (
                    <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--destructive)] mb-3">Critical Bottlenecks</h3>
                      <ul className="space-y-2">
                        {parsedAnalysis.performance_considerations.performance_analysis.critical_bottlenecks.map((bottleneck, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[var(--foreground)]">{bottleneck}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedAnalysis.performance_considerations.performance_analysis.monitoring && parsedAnalysis.performance_considerations.performance_analysis.monitoring.length > 0 && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Monitoring Recommendations</h3>
                      <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-1">
                        {(Array.isArray(parsedAnalysis.performance_considerations.performance_analysis.monitoring)
                          ? parsedAnalysis.performance_considerations.performance_analysis.monitoring
                          : [parsedAnalysis.performance_considerations.performance_analysis.monitoring]
                        ).map((monitoring: string, index: number) => (
                          <li key={index}>{monitoring}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Performance Considerations */}
            {parsedAnalysis.performance_considerations?.performance_considerations && parsedAnalysis.performance_considerations.performance_considerations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Performance Considerations
                </h2>
                <div className="space-y-6">
                  {parsedAnalysis.performance_considerations.performance_considerations.map((performance, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                      {typeof performance === 'string' ? (
                        <div className="text-[var(--foreground)]">{performance}</div>
                      ) : (
                        <div className="space-y-4">
                          {/* Aspect Header */}
                          <div className="border-b border-[var(--border)] pb-3">
                            <h3 className="text-lg font-semibold text-[var(--chart-2)]">
                              {performance.aspect || 'Performance Aspect'}
                            </h3>
                          </div>

                          {/* Metrics */}
                          {performance.metrics && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">
                                Metrics
                              </h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-1)]/10 p-3 rounded border border-[var(--chart-1)]/20">
                                {performance.metrics}
                              </p>
                            </div>
                          )}

                          {/* Bottlenecks */}
                          {performance.bottlenecks && performance.bottlenecks.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">
                                Bottlenecks
                              </h4>
                              <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {performance.bottlenecks.map((bottleneck: string, idx: number) => (
                                    <li key={idx} className="text-sm text-[var(--foreground)]">
                                      {bottleneck}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Optimizations */}
                          {performance.optimizations && performance.optimizations.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">
                                Optimizations
                              </h4>
                              <div className="bg-[var(--chart-2)]/10 border border-[var(--chart-2)]/20 rounded p-3">
                                <ul className="space-y-2">
                                  {performance.optimizations.map((optimization: string, idx: number) => (
                                    <li key={idx} className="text-sm text-[var(--foreground)]">
                                      {optimization}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Current Implementation */}
                          {performance.current_implementation && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">
                                Current Implementation
                              </h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-4)]/10 p-3 rounded border border-[var(--chart-4)]/20">
                                {performance.current_implementation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      case 'algorithms':
        return (
          <div className="space-y-6">
            {/* Algorithm Analysis */}
            {parsedAnalysis.algorithms?.algorithm_analysis && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Algorithm Analysis
                </h2>
                <div className="space-y-4">
                  {parsedAnalysis.algorithms.algorithm_analysis.overall_complexity && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Overall Complexity</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.algorithms.algorithm_analysis.overall_complexity}</p>
                    </div>
                  )}

                  {parsedAnalysis.algorithms.algorithm_analysis.bottlenecks && parsedAnalysis.algorithms.algorithm_analysis.bottlenecks.length > 0 && (
                    <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--destructive)] mb-3">Bottlenecks</h3>
                      <ul className="space-y-2">
                        {parsedAnalysis.algorithms.algorithm_analysis.bottlenecks.map((bottleneck, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[var(--foreground)]">{bottleneck}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedAnalysis.algorithms.algorithm_analysis.optimization_opportunities && parsedAnalysis.algorithms.algorithm_analysis.optimization_opportunities.length > 0 && (
                    <div className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--chart-3)] mb-3">Optimization Opportunities</h3>
                      <ul className="space-y-2">
                        {parsedAnalysis.algorithms.algorithm_analysis.optimization_opportunities.map((opportunity, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[var(--foreground)]">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Algorithms */}
            {parsedAnalysis.algorithms?.algorithms && parsedAnalysis.algorithms.algorithms.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Algorithms
                </h2>
                <div className="space-y-4">
                  {parsedAnalysis.algorithms.algorithms.map((algorithm, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--chart-1)]/20 rounded-lg p-4 shadow-sm">
                      {typeof algorithm === 'string' ? (
                        <div className="text-[var(--foreground)]">{algorithm}</div>
                      ) : (
                        <div className="space-y-3">
                          {(algorithm as Algorithm).name && (
                            <div>
                              <h4 className="font-semibold text-lg text-[var(--chart-1)]">{(algorithm as Algorithm).name}</h4>
                              {(algorithm as Algorithm).location && (
                                <p className="text-sm text-[var(--muted-foreground)]">Location: {(algorithm as Algorithm).location}</p>
                              )}
                            </div>
                          )}
                          {(algorithm as Algorithm).description && (
                            <div>
                              <h5 className="font-medium text-[var(--foreground)] mb-1">Description:</h5>
                              <p className="text-sm text-[var(--muted-foreground)]">{(algorithm as Algorithm).description}</p>
                            </div>
                          )}
                          {(algorithm as Algorithm).complexity && (
                            <div>
                              <h5 className="font-medium text-[var(--foreground)] mb-1">Complexity:</h5>
                              <div className="text-sm text-[var(--muted-foreground)]">
                                {(() => {
                                  const complexity = (algorithm as Algorithm).complexity;
                                  if (typeof complexity === 'string') {
                                    return complexity;
                                  } else if (complexity && typeof complexity === 'object') {
                                    return (
                                      <div className="grid grid-cols-2 gap-2">
                                        {complexity.time && <div><span className="font-medium">Time:</span> {complexity.time}</div>}
                                        {complexity.space && <div><span className="font-medium">Space:</span> {complexity.space}</div>}
                                        {complexity.best_case && <div><span className="font-medium">Best Case:</span> {complexity.best_case}</div>}
                                        {complexity.average_case && <div><span className="font-medium">Average Case:</span> {complexity.average_case}</div>}
                                        {complexity.worst_case && <div><span className="font-medium">Worst Case:</span> {complexity.worst_case}</div>}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          )}
                          {(algorithm as Algorithm).optimization_potential && (
                            <div>
                              <h5 className="font-medium text-[var(--foreground)] mb-1">Optimization Potential:</h5>
                              <p className="text-sm text-[var(--muted-foreground)]">{(algorithm as Algorithm).optimization_potential}</p>
                            </div>
                          )}
                          {(algorithm as Algorithm).performance_characteristics && (
                            <div>
                              <h5 className="font-medium text-[var(--foreground)] mb-1">Performance Characteristics:</h5>
                              <p className="text-sm text-[var(--muted-foreground)]">{(algorithm as Algorithm).performance_characteristics}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            {/* Recommendations */}
            {parsedAnalysis.recommendations?.recommendations && parsedAnalysis.recommendations.recommendations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Recommendations
                </h2>
                <div className="space-y-6">
                  {parsedAnalysis.recommendations.recommendations.map((rec, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                      {typeof rec === 'string' ? (
                        <div className="text-[var(--foreground)]">{rec}</div>
                      ) : (
                        <div className="space-y-4">
                          {/* Recommendation Header */}
                          <div className="border-b border-[var(--border)] pb-3">
                            <h3 className="text-lg font-semibold text-[var(--chart-2)]">
                              {rec.description || 'Recommendation'}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {rec.category && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[var(--chart-1)]/10 text-[var(--chart-1)] border border-[var(--chart-1)]/20">
                                  {rec.category}
                                </span>
                              )}
                              {rec.priority && (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  rec.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : rec.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {rec.priority}
                                </span>
                              )}
                              {rec.impact && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[var(--chart-3)]/10 text-[var(--chart-3)] border border-[var(--chart-3)]/20">
                                  {rec.impact}
                                </span>
                                )}
                            </div>
                          </div>

                          {/* Rationale */}
                          {rec.rationale && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">Rationale</h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-1)]/10 p-3 rounded border border-[var(--chart-1)]/20">
                                {rec.rationale}
                              </p>
                            </div>
                          )}

                          {/* Implementation */}
                          {rec.implementation && (
                            <div>
                              <h4 className="font-medium text-[var(--foreground)] mb-2">Implementation</h4>
                              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-2)]/10 p-3 rounded border border-[var(--chart-2)]/20">
                                {typeof rec.implementation === 'string' ? rec.implementation : JSON.stringify(rec.implementation)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recommendations Analysis */}
            {parsedAnalysis.recommendations?.recommendations_analysis && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Recommendations Analysis
                </h2>
                <div className="space-y-4">
                  {parsedAnalysis.recommendations.recommendations_analysis.overall_quality && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Overall Quality</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.recommendations.recommendations_analysis.overall_quality}</p>
                    </div>
                  )}

                  {parsedAnalysis.recommendations.recommendations_analysis.maintenance_plan && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Maintenance Plan</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.recommendations.recommendations_analysis.maintenance_plan}</p>
                    </div>
                  )}

                  {parsedAnalysis.recommendations.recommendations_analysis.critical_improvements && parsedAnalysis.recommendations.recommendations_analysis.critical_improvements.length > 0 && (
                    <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--destructive)] mb-3">Critical Improvements</h3>
                      <ul className="space-y-2">
                        {parsedAnalysis.recommendations.recommendations_analysis.critical_improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[var(--foreground)]">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedAnalysis.recommendations.recommendations_analysis.long_term_goals && parsedAnalysis.recommendations.recommendations_analysis.long_term_goals.length > 0 && (
                    <div className="bg-[var(--chart-4)]/10 border border-[var(--chart-4)]/20 rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-3">Long Term Goals</h3>
                      <ul className="space-y-2">
                        {parsedAnalysis.recommendations.recommendations_analysis.long_term_goals.map((goal, index) => (
                          <li key={index} className="flex items-start">
                                                             <span className="text-[var(--foreground)]">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        );

      case 'diagrams':
        return (
          <div className="space-y-6">
            {/* Architecture Diagrams */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Architecture Diagrams
              </h2>
              

              
              <div className="space-y-6">
                {/* Component Diagram - Only show if diagram exists and renders */}
                {parsedAnalysis.mermaid_diagrams?.component_diagram && (
                  <MermaidDiagram 
                    key="component-diagram"
                    diagram={parsedAnalysis.mermaid_diagrams.component_diagram} 
                    title="Component Diagram" 
                  />
                )}
                
                {/* Sequence Diagram - Only show if diagram exists and renders */}
                {parsedAnalysis.mermaid_diagrams?.sequence_diagram && (
                  <MermaidDiagram 
                    key="sequence-diagram"
                    diagram={parsedAnalysis.mermaid_diagrams.sequence_diagram} 
                    title="Sequence Diagram" 
                  />
                )}
                
                {/* Activity Diagram - Only show if diagram exists and renders */}
                {parsedAnalysis.mermaid_diagrams?.activity_diagram && (
                  <MermaidDiagram 
                    key="activity-diagram"
                    diagram={parsedAnalysis.mermaid_diagrams.activity_diagram} 
                    title="Activity Diagram" 
                  />
                )}
                
                {/* Class Diagram - Only show if diagram exists and renders */}
                {parsedAnalysis.mermaid_diagrams?.class_diagram && (
                  <MermaidDiagram 
                    key="class-diagram"
                    diagram={parsedAnalysis.mermaid_diagrams.class_diagram} 
                    title="Class Diagram" 
                  />
                )}
              </div>
            </section>

            {/* Generated Diagram Images */}
            {parsedAnalysis.diagram_images && Object.keys(parsedAnalysis.diagram_images).length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                  Generated Diagram Images
                </h2>
                
                <div className="space-y-6">
                  {Object.entries(parsedAnalysis.diagram_images).map(([type, image]) => (
                    <DiagramImageComponent 
                      key={type}
                      image={image} 
                      title={type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <DashboardLayout>
              <div className="space-y-6">
          {/* Header with Back Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-[var(--foreground)]">
                  Code Analysis Report
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <span className="font-mono bg-[var(--muted)] px-2 py-0.5 rounded">
                  Analysis ID: {analysisData?.job?.id || 'Unknown'}
                </span>
              
                
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {analysisData?.job?.analysis_type?.replace('_', ' ').toUpperCase() || 'N/A'}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Created: {analysisData?.job?.created_at ? new Date(analysisData.job.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Timing and Cost Information */}
        {/* <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Execution Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Started:</span> 
              <span className="ml-1 font-medium">
                {analysisData?.job?.started_at && analysisData.job.started_at !== "0001-01-01T05:53:28+05:53" 
                  ? new Date(analysisData.job.started_at).toLocaleString() 
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Completed:</span> 
              <span className="ml-1 font-medium">
                {analysisData?.job?.completed_at && analysisData.job.completed_at !== "0001-01-01T05:53:28+05:53"
                  ? new Date(analysisData.job.completed_at).toLocaleString() 
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Cost Estimate:</span> 
              <span className="ml-1 font-medium">${analysisData?.job?.cost_estimate || 0}</span>
            </div>
          </div>
        </div> */}

        {/* Tabbed Navigation */}
        <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)]">
          <div className="border-b border-[var(--border)]">
            <div className="flex space-x-1 p-4 overflow-x-auto">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                >
                  {tab.label}
                </TabButton>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}