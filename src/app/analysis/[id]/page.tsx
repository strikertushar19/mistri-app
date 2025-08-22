'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BarChart3, GitBranch, Calendar, Code2, DollarSign } from 'lucide-react';

interface AnalysisComponent {
  name: string;
  purpose: string;
  responsibilities: string[];
  dependencies: string[];
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

interface AnalysisData {
  analysis_type: string;
  repository_overview: {
    name: string;
    description: string;
    main_technology: string;
  };
  system_architecture: {
    overview: string;
    components: AnalysisComponent[];
    data_flow: string;
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
  design_patterns: (string | any)[];
  algorithms: (string | Algorithm)[];
  error_handling: {
    strategies: any[];
    exceptions: any[];
    error_analysis?: {
      gaps?: string[];
      improvements?: string[];
      overall_strategy?: string;
    };
  };
  security_considerations: (string | Recommendation)[];
  performance_considerations: (string | Recommendation)[];
  recommendations: (string | Recommendation)[];
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

// Enhanced Mermaid Diagram Component with better error handling
const MermaidDiagram = ({ diagram, title }: { diagram: string, title: string }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: false,
            curve: 'basis'
          }
        });
        setMermaidLoaded(true);
      };
      script.onerror = () => {
        setRenderError('Failed to load Mermaid library');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadMermaid();
  }, []);

  // Function to clean and fix common Mermaid syntax issues
  const cleanDiagram = (rawDiagram: string): string => {
    if (!rawDiagram || rawDiagram.trim() === '') {
      return '';
    }

    // First, unescape the string literals from JSON
    let cleaned = rawDiagram
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .trim();

    // Only apply minimal fixes for actually broken syntax
    // Don't remove newlines or change the structure if it's already valid
    
    // Fix only obvious truncation issues
    if (cleaned.includes('[') && !cleaned.includes(']')) {
      // Find the last incomplete bracket and close it
      const lastOpenBracket = cleaned.lastIndexOf('[');
      if (lastOpenBracket !== -1) {
        const afterBracket = cleaned.substring(lastOpenBracket + 1);
        if (!afterBracket.includes(']')) {
          // Extract the node content and close it
          const nodeContent = afterBracket.split(/\s/)[0] || 'Node';
          cleaned = cleaned.substring(0, lastOpenBracket + 1) + nodeContent + ']';
        }
      }
    }

    // Fix only incomplete class definitions (missing closing brace)
    if (cleaned.includes('class ') && cleaned.includes('{') && !cleaned.includes('}')) {
      cleaned += '\n}';
    }

    // Fix only incomplete sequence diagram (missing closing)
    if (cleaned.includes('sequenceDiagram') && !cleaned.includes('activate') && !cleaned.includes('deactivate')) {
      // Add basic activate/deactivate if missing
      if (cleaned.includes('participant') && !cleaned.includes('activate')) {
        const lines = cleaned.split('\n');
        const participantLines = lines.filter(line => line.includes('participant'));
        if (participantLines.length > 0) {
          // Add activate/deactivate for the first participant interaction
          const firstMessageIndex = lines.findIndex(line => line.includes('->>'));
          if (firstMessageIndex !== -1) {
            const participant = participantLines[0].split(/\s+/)[1];
            lines.splice(firstMessageIndex + 1, 0, `    activate ${participant}`);
            const lastMessageIndex = lines.findLastIndex(line => line.includes('-->>'));
            if (lastMessageIndex !== -1) {
              lines.splice(lastMessageIndex + 1, 0, `    deactivate ${participant}`);
            }
            cleaned = lines.join('\n');
          }
        }
      }
    }

    // Only remove truly problematic trailing characters
    cleaned = cleaned.replace(/\s*--\s*$/, '');
    cleaned = cleaned.replace(/\s*-->\s*$/, '');
    cleaned = cleaned.replace(/\s*\[\s*$/, '');
    cleaned = cleaned.replace(/\s*\(\s*$/, '');

    return cleaned;
  };

  // Function to handle recursive sequence diagrams that cause "too much recursion" errors
  const fixRecursiveSequenceDiagram = (diagram: string): string => {
    if (!diagram.includes('sequenceDiagram')) {
      return diagram;
    }

    // Only apply fixes if the diagram is actually causing recursion issues
    // For now, just return the diagram as-is since the syntax looks correct
    return diagram;
  };

  useEffect(() => {
    if (mermaidLoaded && diagram && elementRef.current) {
      setIsLoading(true);
      setRenderError(null);
      
      // Clean the diagram string with multiple strategies
      let processedDiagram = cleanDiagram(diagram);
      
      // Apply specific fixes for sequence diagrams to prevent recursion
      processedDiagram = fixRecursiveSequenceDiagram(processedDiagram);
      
      // Clear previous content
      elementRef.current.innerHTML = '';
      
      // Create a unique ID for this diagram
      const diagramId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      // Render the diagram with enhanced error handling
      window.mermaid.render(diagramId, processedDiagram)
        .then((result) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = result.svg;
            setIsLoading(false);
          }
        })
        .catch((error: Error) => {
          console.error('Mermaid rendering error:', error);
          setRenderError(error.message);
          setIsLoading(false);
          
          // Try to create a fallback diagram if the original is too malformed
          const createFallbackDiagram = (originalDiagram: string, diagramType: string): string => {
            if (originalDiagram.includes('graph LR') || originalDiagram.includes('graph TD') || originalDiagram.includes('flowchart')) {
              return `graph TD
    A[Component A] --> B[Component B]
    B --> C[Component C]
    C --> A`;
            } else if (originalDiagram.includes('sequenceDiagram')) {
              return `sequenceDiagram
    participant A as Client
    participant B as Server
    A->>B: Request
    B->>A: Response`;
            } else if (originalDiagram.includes('classDiagram')) {
              return `classDiagram
    class User {
        +String name
        +String email
    }
    class System {
        +String version
    }
    User --> System`;
            } else {
              return `graph TD
    A[Start] --> B[Process]
    B --> C[End]`;
            }
          };

          // Try to render a fallback diagram
          const fallbackDiagram = createFallbackDiagram(diagram, title);
          
          window.mermaid.render(`${diagramId}-fallback`, fallbackDiagram)
            .then((fallbackResult) => {
              if (elementRef.current) {
                elementRef.current.innerHTML = `
                  <div class="text-yellow-600 p-4 bg-yellow-50 rounded border border-yellow-200 mb-4">
                    <div class="flex items-center mb-2">
                      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <p class="font-semibold">Original diagram failed to render</p>
                    </div>
                    <p class="text-sm mb-3">Error: ${error.message}</p>
                    <p class="text-sm mb-3">Showing simplified fallback diagram instead.</p>
                  </div>
                  ${fallbackResult.svg}
                  <details class="mt-4">
                    <summary class="cursor-pointer text-sm font-medium hover:text-yellow-800">Show original diagram code</summary>
                    <pre class="mt-2 text-xs bg-white p-3 rounded border overflow-x-auto font-mono">${diagram}</pre>
                  </details>
                `;
              }
            })
            .catch((fallbackError) => {
              // If even the fallback fails, show the error with debug info
              if (elementRef.current) {
                elementRef.current.innerHTML = `
                  <div class="text-red-600 p-4 bg-red-50 rounded border border-red-200">
                    <div class="flex items-center mb-2">
                      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <p class="font-semibold">Failed to render diagram</p>
                    </div>
                    <p class="text-sm mb-3">Error: ${error.message}</p>
                    <p class="text-sm mb-3">Fallback also failed: ${fallbackError.message}</p>
                    <details class="mb-3">
                      <summary class="cursor-pointer text-sm font-medium hover:text-red-800">Show processed diagram</summary>
                      <pre class="mt-2 text-xs bg-white p-3 rounded border overflow-x-auto font-mono">${processedDiagram}</pre>
                    </details>
                    <details>
                      <summary class="cursor-pointer text-sm font-medium hover:text-red-800">Show original diagram</summary>
                      <pre class="mt-2 text-xs bg-white p-3 rounded border overflow-x-auto font-mono">${diagram}</pre>
                    </details>
                  </div>
                `;
              }
            });
        });
    }
  }, [mermaidLoaded, diagram]);

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
      <h3 className="font-medium text-gray-700 mb-3">{title}:</h3>
      <div className="bg-white p-4 rounded border overflow-x-auto">
        {!mermaidLoaded ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <div className="text-gray-500">Loading Mermaid...</div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <div className="text-gray-500">Rendering diagram...</div>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="text-lg">Loading analysis...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-4xl mx-auto p-6">
        <div className="text-red-600 text-lg mb-4">Error: {error}</div>
        
        {/* Debug information for JSON parsing errors */}
        {error.includes('Failed to parse analysis result') && analysisData?.analysis_data?.raw_result && (
          <div className="bg-gray-100 p-4 rounded-lg text-left mb-4">
            <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
            <div className="space-y-4">
              <div>
                <strong>Raw Result Length:</strong> {analysisData.analysis_data.raw_result.length} characters
              </div>
              <div>
                <strong>First 500 characters:</strong>
                <pre className="mt-2 bg-white p-2 rounded overflow-x-auto text-xs">
                  {analysisData.analysis_data.raw_result.substring(0, 500)}
                </pre>
              </div>
              <div>
                <strong>Last 500 characters:</strong>
                <pre className="mt-2 bg-white p-2 rounded overflow-x-auto text-xs">
                  {analysisData.analysis_data.raw_result.substring(Math.max(0, analysisData.analysis_data.raw_result.length - 500))}
                </pre>
              </div>
              {error.includes('position') && (
                <div>
                  <strong>Error Position Analysis:</strong>
                  <pre className="mt-2 bg-white p-2 rounded overflow-x-auto text-xs">
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!parsedAnalysis) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 max-w-4xl mx-auto p-6">
        <div className="text-lg text-center">No parsed analysis data found</div>
        {analysisData && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
            <div className="bg-gray-100 p-4 rounded-lg text-sm">
              <div className="mb-4">
                <strong>Analysis Data Structure:</strong>
                <pre className="mt-2 bg-white p-2 rounded overflow-x-auto max-h-60">
                  {JSON.stringify(analysisData, null, 2)}
                </pre>
              </div>
              {analysisData?.analysis_data?.raw_result && (
                <div>
                  <strong>Raw Result (first 500 chars):</strong>
                  <pre className="mt-2 bg-white p-2 rounded overflow-x-auto">
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/analysis')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Analysis Jobs
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Code Analysis Report</h1>
              <p className="text-muted-foreground">
                Analysis ID: {analysisData?.job?.id || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Job Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Repository</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">{analysisData?.job?.repository_name || 'N/A'}</p>
            {analysisData?.job?.repository_url && (
              <a 
                href={analysisData.job.repository_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate block mt-1"
              >
                View Repository →
              </a>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</h3>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                analysisData?.job?.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : analysisData?.job?.status === 'processing'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {analysisData?.job?.status || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Model Used</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">{analysisData?.job?.model_used || 'N/A'}</p>
            <p className="text-sm text-gray-600">Tokens: {analysisData?.job?.total_tokens?.toLocaleString() || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Analysis Type</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {analysisData?.job?.analysis_type?.replace('_', ' ').toUpperCase() || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              Created: {analysisData?.job?.created_at ? new Date(analysisData.job.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Timing and Cost Information */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
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
        </div>

                {/* Analysis Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Repository Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
              Repository Overview
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700">Name:</h3>
              <p className="text-gray-600 mb-2">{parsedAnalysis.repository_overview?.name || analysisData?.job?.repository_name || 'N/A'}</p>
              
              <h3 className="font-medium text-gray-700">Description:</h3>
              <p className="text-gray-600 mb-2">{parsedAnalysis.repository_overview?.description || 'No description available'}</p>
              
              <h3 className="font-medium text-gray-700">Technology Stack:</h3>
              <p className="text-gray-600">{parsedAnalysis.repository_overview?.main_technology || 'Not specified'}</p>
            </div>
          </section>

          {/* System Architecture */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
              System Architecture
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Overview:</h3>
                <p className="text-gray-600">{parsedAnalysis.system_architecture?.overview || 'No architecture overview available'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Data Flow:</h3>
                <p className="text-gray-600">{parsedAnalysis.system_architecture?.data_flow || 'No data flow information available'}</p>
              </div>
            </div>
          </section>

          {/* Components */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
              Components
            </h2>
            <div className="grid gap-4">
              {parsedAnalysis.system_architecture?.components && parsedAnalysis.system_architecture.components.length > 0 ? (
                parsedAnalysis.system_architecture.components.map((component, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-lg text-blue-600 mb-2">{component.name}</h3>
                    <p className="text-gray-600 mb-3">{component.purpose}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Responsibilities:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {component.responsibilities?.map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          )) || <li>No responsibilities listed</li>}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Dependencies:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {component.dependencies?.map((dep, idx) => (
                            <li key={idx}>{dep}</li>
                          )) || <li>No dependencies listed</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <p className="text-gray-500 text-center py-4">No components information available</p>
                </div>
              )}
            </div>
          </section>

          {/* Data Structures */}
          {parsedAnalysis.detailed_design?.data_structures && parsedAnalysis.detailed_design.data_structures.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
                Data Structures
              </h2>
              <div className="grid gap-4">
                {parsedAnalysis.detailed_design.data_structures.map((ds, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-lg text-green-600 mb-2">{ds.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">Type: {ds.type}</p>
                    <p className="text-gray-600">{ds.purpose}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Security Considerations */}
          {parsedAnalysis.security_considerations && parsedAnalysis.security_considerations.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
                Security Considerations
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {parsedAnalysis.security_considerations.map((security, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span className="text-gray-700">
                        {typeof security === 'string' ? security : (
                          <div className="space-y-1">
                            {security.description && <div className="font-medium">{security.description}</div>}
                            {security.category && <div className="text-sm text-gray-600">Category: {security.category}</div>}
                            {security.priority && <div className="text-sm text-gray-600">Priority: {security.priority}</div>}
                            {security.impact && <div className="text-sm text-gray-600">Impact: {security.impact}</div>}
                            {security.implementation && (
                              <div className="text-sm text-gray-600">
                                Implementation: {typeof security.implementation === 'string' ? security.implementation : JSON.stringify(security.implementation)}
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
          )}

          {/* Error Handling */}
          {parsedAnalysis.error_handling && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
                Error Handling
              </h2>
              <div className="space-y-4">
                {/* Exceptions */}
                {parsedAnalysis.error_handling.exceptions && parsedAnalysis.error_handling.exceptions.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-800 mb-3">Exceptions:</h3>
                    <div className="grid gap-4">
                      {parsedAnalysis.error_handling.exceptions.map((exception, index) => (
                        <div key={index} className="bg-white border border-red-200 rounded-lg p-3">
                          <div className="font-medium text-red-700 mb-2">{exception.type}</div>
                          <p className="text-sm text-gray-600 mb-2">{exception.description}</p>
                          <div className="text-xs text-gray-500">
                            <div><strong>Handling:</strong> {exception.handling}</div>
                            <div><strong>Frequency:</strong> {exception.frequency}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategies */}
                {parsedAnalysis.error_handling.strategies && parsedAnalysis.error_handling.strategies.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800 mb-3">Strategies:</h3>
                    <div className="grid gap-4">
                      {parsedAnalysis.error_handling.strategies.map((strategy, index) => (
                        <div key={index} className="bg-white border border-yellow-200 rounded-lg p-3">
                          <div className="font-medium text-yellow-700 mb-2">{strategy.strategy}</div>
                          <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                          <div className="text-xs text-gray-500">
                            <div><strong>Coverage:</strong> {strategy.coverage}</div>
                            <div><strong>Effectiveness:</strong> {strategy.effectiveness}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Analysis */}
                {parsedAnalysis.error_handling.error_analysis && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Error Analysis:</h3>
                    <div className="space-y-4">
                      {parsedAnalysis.error_handling.error_analysis.gaps && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Gaps:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {parsedAnalysis.error_handling.error_analysis.gaps.map((gap, index) => (
                              <li key={index}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {parsedAnalysis.error_handling.error_analysis.improvements && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Improvements:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {parsedAnalysis.error_handling.error_analysis.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {parsedAnalysis.error_handling.error_analysis.overall_strategy && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Overall Strategy:</h4>
                          <p className="text-sm text-gray-600">{parsedAnalysis.error_handling.error_analysis.overall_strategy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Performance Considerations */}
          {parsedAnalysis.performance_considerations && parsedAnalysis.performance_considerations.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
                Performance Considerations
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {parsedAnalysis.performance_considerations.map((performance, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">
                        {typeof performance === 'string' ? performance : (
                          <div className="space-y-1">
                            {performance.description && <div className="font-medium">{performance.description}</div>}
                            {performance.category && <div className="text-sm text-gray-600">Category: {performance.category}</div>}
                            {performance.priority && <div className="text-sm text-gray-600">Priority: {performance.priority}</div>}
                            {performance.impact && <div className="text-sm text-gray-600">Impact: {performance.impact}</div>}
                            {performance.implementation && (
                              <div className="text-sm text-gray-600">
                                Implementation: {typeof performance.implementation === 'string' ? performance.implementation : JSON.stringify(performance.implementation)}
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
          )}

          {/* Design Patterns */}
          {parsedAnalysis.design_patterns && parsedAnalysis.design_patterns.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
                Design Patterns
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {parsedAnalysis.design_patterns.map((pattern, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span className="text-gray-700">
                        {typeof pattern === 'string' ? pattern : (
                          <div className="space-y-1">
                            {pattern.name && <div className="font-medium">{pattern.name}</div>}
                            {pattern.description && <div className="text-sm text-gray-600">{pattern.description}</div>}
                            {pattern.category && <div className="text-sm text-gray-600">Category: {pattern.category}</div>}
                            {pattern.purpose && <div className="text-sm text-gray-600">Purpose: {pattern.purpose}</div>}
                            {pattern.implementation && (
                              <div className="text-sm text-gray-600">
                                Implementation: {typeof pattern.implementation === 'string' ? pattern.implementation : JSON.stringify(pattern.implementation)}
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
          )}

          {/* Algorithms */}
          {parsedAnalysis.algorithms && parsedAnalysis.algorithms.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
                Algorithms
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid gap-4">
                  {parsedAnalysis.algorithms.map((algorithm, index) => (
                    <div key={index} className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                      {typeof algorithm === 'string' ? (
                        <div className="text-gray-700">{algorithm}</div>
                      ) : (
                        <div className="space-y-3">
                          {(algorithm as Algorithm).name && (
                            <div>
                              <h4 className="font-semibold text-lg text-green-600">{(algorithm as Algorithm).name}</h4>
                              {(algorithm as Algorithm).location && (
                                <p className="text-sm text-gray-500">Location: {(algorithm as Algorithm).location}</p>
                              )}
                            </div>
                          )}
                          {(algorithm as Algorithm).description && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Description:</h5>
                              <p className="text-sm text-gray-600">{(algorithm as Algorithm).description}</p>
                            </div>
                          )}
                          {(algorithm as Algorithm).complexity && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Complexity:</h5>
                              <div className="text-sm text-gray-600">
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
                              <h5 className="font-medium text-gray-700 mb-1">Optimization Potential:</h5>
                              <p className="text-sm text-gray-600">{(algorithm as Algorithm).optimization_potential}</p>
                            </div>
                          )}
                          {(algorithm as Algorithm).performance_characteristics && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-1">Performance Characteristics:</h5>
                              <p className="text-sm text-gray-600">{(algorithm as Algorithm).performance_characteristics}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Recommendations */}
          {parsedAnalysis.recommendations && parsedAnalysis.recommendations.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
                Recommendations
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {parsedAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span className="text-gray-700">
                        {typeof rec === 'string' ? rec : (
                          <div className="space-y-2">
                            {(rec as Recommendation).description && <div className="font-medium">{(rec as Recommendation).description}</div>}
                            {(rec as Recommendation).category && <div className="text-sm text-gray-600">Category: {(rec as Recommendation).category}</div>}
                            {(rec as Recommendation).priority && <div className="text-sm text-gray-600">Priority: {(rec as Recommendation).priority}</div>}
                            {(rec as Recommendation).impact && <div className="text-sm text-gray-600">Impact: {(rec as Recommendation).impact}</div>}
                            {(rec as Recommendation).rationale && <div className="text-sm text-gray-600">Rationale: {(rec as Recommendation).rationale}</div>}
                            {(rec as Recommendation).implementation && (
                              <div className="text-sm text-gray-600">
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
          )}

          {/* Architecture Diagrams */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
              Architecture Diagrams
            </h2>
            
            <div className="space-y-6">
              {/* Component Diagram */}
              {parsedAnalysis.mermaid_diagrams?.component_diagram ? (
                <MermaidDiagram 
                  diagram={parsedAnalysis.mermaid_diagrams.component_diagram} 
                  title="Component Diagram" 
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">Component Diagram:</h3>
                  <div className="bg-white p-4 rounded border">
                    <div className="text-gray-500 text-center py-4">No diagram available</div>
                  </div>
                </div>
              )}
              
              {/* Sequence Diagram */}
              {parsedAnalysis.mermaid_diagrams?.sequence_diagram ? (
                <MermaidDiagram 
                  diagram={parsedAnalysis.mermaid_diagrams.sequence_diagram} 
                  title="Sequence Diagram" 
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">Sequence Diagram:</h3>
                  <div className="bg-white p-4 rounded border">
                    <div className="text-gray-500 text-center py-4">No diagram available</div>
                  </div>
                </div>
              )}
              
              {/* Activity Diagram */}
              {parsedAnalysis.mermaid_diagrams?.activity_diagram ? (
                <MermaidDiagram 
                  diagram={parsedAnalysis.mermaid_diagrams.activity_diagram} 
                  title="Activity Diagram" 
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">Activity Diagram:</h3>
                  <div className="bg-white p-4 rounded border">
                    <div className="text-gray-500 text-center py-4">No diagram available</div>
                  </div>
                </div>
              )}
              
              {/* Class Diagram */}
              {parsedAnalysis.mermaid_diagrams?.class_diagram ? (
                <MermaidDiagram 
                  diagram={parsedAnalysis.mermaid_diagrams.class_diagram} 
                  title="Class Diagram" 
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">Class Diagram:</h3>
                  <div className="bg-white p-4 rounded border">
                    <div className="text-gray-500 text-center py-4">No diagram available</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}