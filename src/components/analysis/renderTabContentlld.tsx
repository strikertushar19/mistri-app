import React, { useState,useRef,useEffect } from "react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Expandable Accordion Component with Expand All functionality
const ExpandableAccordion = ({ children, defaultOpenItems = [] }: { children: React.ReactNode, defaultOpenItems?: string[] }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultOpenItems);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedItems(defaultOpenItems);
      setIsAllExpanded(false);
    } else {
      // Get all accordion item values from children
      const allItems = React.Children.toArray(children)
        .filter((child: any) => child?.props?.value)
        .map((child: any) => child.props.value);
      setExpandedItems(allItems);
      setIsAllExpanded(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={toggleExpandAll}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] rounded-md border border-[var(--border)] cursor-pointer transition-colors"
        >
          {isAllExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Expand All
            </>
          )}
        </button>
      </div>
      <Accordion 
        type="multiple" 
        value={expandedItems} 
        onValueChange={setExpandedItems}
        className="w-full"
      >
        {children}
      </Accordion>
    </div>
  );
};

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
            className="px-2 py-1 text-xs bg-[var(--foreground)] text-[var(--background)] rounded hover:bg-[var(--foreground)]/90 transition-colors flex items-center gap-1"
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
          className="px-3 py-1 text-sm bg-[var(--sidebar)] text-[var(--sidebar-foreground)] rounded border border-blue-600 hover:bg-[var(--sidebar)]/90 transition-colors flex items-center gap-2 cursor-pointer"
          title="Download Diagram"
          type="button"
        >
          <Download className="h-4 w-4 pointer-events-none" />
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


interface RenderTabContentLLDProps {
  activeTab: string;
  parsedAnalysis: AnalysisData;
  analysisData: {
    job?: {
      repository_name?: string;
      repository_url?: string;
    };
  } | null;
}


// Helper function to check if a tab should be shown based on available data
export const shouldShowTab = (tabId: string, parsedAnalysis: AnalysisData): boolean => {
  switch (tabId) {
    case 'overview':
      return true; // Always show overview
    case 'architecture':
      return !!(parsedAnalysis?.system_architecture?.system_architecture);
    case 'components':
      return !!(parsedAnalysis?.system_architecture?.system_architecture?.components && Array.isArray(parsedAnalysis.system_architecture.system_architecture.components) && parsedAnalysis.system_architecture.system_architecture.components.length > 0);
    case 'design-patterns':
      return !!(parsedAnalysis?.design_patterns?.design_patterns && Array.isArray(parsedAnalysis.design_patterns.design_patterns) && parsedAnalysis.design_patterns.design_patterns.length > 0);
    case 'security':
      return !!(parsedAnalysis?.security_considerations?.security_analysis || (parsedAnalysis?.security_considerations?.security_considerations && Array.isArray(parsedAnalysis.security_considerations.security_considerations) && parsedAnalysis.security_considerations.security_considerations.length > 0));
    case 'performance':
      return !!(parsedAnalysis?.performance_considerations?.performance_analysis || (parsedAnalysis?.performance_considerations?.performance_considerations && Array.isArray(parsedAnalysis.performance_considerations.performance_considerations) && parsedAnalysis.performance_considerations.performance_considerations.length > 0));
    case 'algorithms':
      return !!(parsedAnalysis?.algorithms?.algorithms && Array.isArray(parsedAnalysis.algorithms.algorithms) && parsedAnalysis.algorithms.algorithms.length > 0);
    case 'recommendations':
      return !!(parsedAnalysis?.recommendations?.recommendations && Array.isArray(parsedAnalysis.recommendations.recommendations) && parsedAnalysis.recommendations.recommendations.length > 0);
    case 'diagrams':
      return !!(parsedAnalysis?.mermaid_diagrams || parsedAnalysis?.diagram_images);
    default:
      return true;
  }
};

export const RenderTabContentLLD: React.FC<RenderTabContentLLDProps> = ({
  activeTab,
  parsedAnalysis,
  analysisData
}) => {
    // Check if the current tab should be shown
    if (!shouldShowTab(activeTab, parsedAnalysis)) {
      return (
        <div className="text-center py-8">
          <div className="text-[var(--muted-foreground)]">
            No data available for this section
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Repository Overview */}
            <ExpandableAccordion key="overview" defaultOpenItems={['basic-info']}>
              <AccordionItem value="basic-info">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Basic Information
                </AccordionTrigger>
                <AccordionContent>
                <div className="bg-[var(--muted)] p-4 rounded-lg">
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="architecture-design">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Architecture & Design
                </AccordionTrigger>
                <AccordionContent>
                <div className="bg-[var(--muted)] p-4 rounded-lg">
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
                </AccordionContent>
              </AccordionItem>

                {parsedAnalysis.repository_overview?.key_components && Array.isArray(parsedAnalysis.repository_overview.key_components) && parsedAnalysis.repository_overview.key_components.length > 0 && (
                <AccordionItem value="key-components">
                                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Key Components
                </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="grid gap-2">
                      {parsedAnalysis.repository_overview.key_components.map((component: string, index: number) => (
                        <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3">
                          <span className="text-[var(--foreground)]">{component}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                {parsedAnalysis.repository_overview?.design_patterns_used && Array.isArray(parsedAnalysis.repository_overview.design_patterns_used) && parsedAnalysis.repository_overview.design_patterns_used.length > 0 && (
                <AccordionItem value="design-patterns">
                                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Design Patterns Used
                </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="grid gap-2">
                      {parsedAnalysis.repository_overview.design_patterns_used.map((pattern: string, index: number) => (
                        <div key={index} className="bg-[var(--chart-1)]/10 border border-[var(--chart-1)]/20 rounded-lg p-3">
                          <span className="text-sm text-[var(--foreground)] font-medium">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                {parsedAnalysis.repository_overview?.performance_considerations && (
                <AccordionItem value="performance">
                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                    Performance Considerations
                  </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.performance_considerations}</p>
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                {parsedAnalysis.repository_overview?.security_posture && (
                <AccordionItem value="security">
                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                    Security Posture
                  </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.security_posture}</p>
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                {parsedAnalysis.repository_overview?.algorithms && (
                <AccordionItem value="algorithms">
                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                    Algorithms
                  </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="bg-[var(--chart-4)]/10 border border-[var(--chart-4)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.algorithms}</p>
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                {parsedAnalysis.repository_overview?.error_handling && (
                <AccordionItem value="error-handling">
                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                    Error Handling
                  </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="bg-[var(--chart-5)]/10 border border-[var(--chart-5)]/20 rounded-lg p-3">
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.repository_overview.error_handling}</p>
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                {parsedAnalysis.repository_overview?.diagrams && Array.isArray(parsedAnalysis.repository_overview.diagrams) && parsedAnalysis.repository_overview.diagrams.length > 0 && (
                <AccordionItem value="diagrams">
                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                    Available Diagrams
                  </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="grid gap-2">
                      {parsedAnalysis.repository_overview.diagrams.map((diagram: string, index: number) => (
                        <div key={index} className="bg-[var(--chart-2)]/10 border border-[var(--chart-2)]/20 rounded-lg p-3">
                          <span className="text-[var(--foreground)] font-medium">{diagram}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
                )}

                {parsedAnalysis.repository_overview?.recommendations && Array.isArray(parsedAnalysis.repository_overview.recommendations) && parsedAnalysis.repository_overview.recommendations.length > 0 && (
                <AccordionItem value="recommendations">
                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                    Key Recommendations
                  </AccordionTrigger>
                  <AccordionContent>
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <div className="grid gap-3">
                      {parsedAnalysis.repository_overview.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="bg-[var(--chart-3)]/10 border border-[var(--chart-3)]/20 rounded-lg p-3">
                          <span className="text-[var(--foreground)]">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </ExpandableAccordion>

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
            <ExpandableAccordion key="architecture" defaultOpenItems={['architecture-overview']}>
              <AccordionItem value="architecture-overview">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  System Architecture Overview
                </AccordionTrigger>
                <AccordionContent>
              <div className="space-y-6">
                {/* Overview */}
                <div className="bg-[var(--muted)] p-4 rounded-lg">
                  <h3 className="font-medium text-[var(--foreground)] mb-2">Overview:</h3>
                  <div className="text-[var(--muted-foreground)]">
                    {parsedAnalysis?.system_architecture?.system_architecture?.overview || 'No architecture overview available'}
                  </div>
                </div>
                
                {/* Data Flow */}
                <div className="bg-[var(--muted)] p-4 rounded-lg">
                  <h3 className="font-medium text-[var(--foreground)] mb-2">Data Flow:</h3>
                  <div className="text-[var(--muted-foreground)]">
                    {parsedAnalysis?.system_architecture?.system_architecture?.data_flow || 'No data flow information available'}
                  </div>
                </div>

                {/* Deployment Model */}
                {parsedAnalysis?.system_architecture?.system_architecture?.deployment_model && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-2">Deployment Model:</h3>
                    <p className="text-[var(--muted-foreground)]">{parsedAnalysis.system_architecture.system_architecture.deployment_model}</p>
                  </div>
                )}

                {/* Scalability Approach */}
                {parsedAnalysis?.system_architecture?.system_architecture?.scalability_approach && (
                  <div className="bg-[var(--muted)] p-4 rounded-lg">
                    <h3 className="font-medium text-[var(--foreground)] mb-2">Scalability Approach:</h3>
                    <p className="text-[var(--muted-foreground)]">{parsedAnalysis.system_architecture.system_architecture.scalability_approach}</p>
                  </div>
                )}
              </div>
                </AccordionContent>
              </AccordionItem>

            {/* System Components */}
                          {parsedAnalysis?.system_architecture?.system_architecture?.components && Array.isArray(parsedAnalysis.system_architecture.system_architecture.components) && parsedAnalysis.system_architecture.system_architecture.components.length > 0 && (
                <AccordionItem value="system-components">
                  <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                    System Components
                  </AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
                </AccordionItem>
              )}
            </ExpandableAccordion>
          </div>
        );

      case 'components':
        return (
          <div className="space-y-6">
            {/* Components */}
            <ExpandableAccordion key="components" defaultOpenItems={['components-list']}>
              <AccordionItem value="components-list">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Components
                </AccordionTrigger>
                <AccordionContent>
              <div className="grid gap-4">
                {parsedAnalysis?.system_architecture?.system_architecture?.components && Array.isArray(parsedAnalysis.system_architecture.system_architecture.components) && parsedAnalysis.system_architecture.system_architecture.components.length > 0 ? (
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
                </AccordionContent>
              </AccordionItem>
            </ExpandableAccordion>
          </div>
        );

      case 'design-patterns':
        return (
          <div className="space-y-6">
            {/* Design Patterns */}
            <ExpandableAccordion key="design-patterns" defaultOpenItems={['design-patterns-list']}>
            {parsedAnalysis?.design_patterns?.design_patterns && Array.isArray(parsedAnalysis.design_patterns.design_patterns) && parsedAnalysis.design_patterns.design_patterns.length > 0 && (
              <AccordionItem value="design-patterns-list">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Design Patterns
                </AccordionTrigger>
                  <AccordionContent>
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
                              <div className="mt-2">
                                <h4 className="font-medium text-[var(--foreground)] mb-2">Location:</h4>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {(() => {
                                    const location = pattern.location;
                                    if (typeof location === 'string') {
                                      return location.split(',').map((loc: string, idx: number) => (
                                        <span 
                                          key={idx} 
                                          className="font-mono bg-[var(--muted)] px-2 py-1 rounded text-xs border border-[var(--border)]"
                                        >
                                          {loc.trim()}
                                        </span>
                                      ));
                                    } else if (Array.isArray(location)) {
                                      return (location as any[]).map((loc: any, idx: number) => (
                                        <span 
                                          key={idx} 
                                          className="font-mono bg-[var(--muted)] px-2 py-1 rounded text-xs border border-[var(--border)]"
                                        >
                                          {typeof loc === 'string' ? loc.trim() : String(loc).trim()}
                                        </span>
                                      ));
                                    } else {
                                      return (
                                        <span className="font-mono bg-[var(--muted)] px-2 py-1 rounded text-xs border border-[var(--border)]">
                                          {String(location)}
                                        </span>
                                      );
                                    }
                                  })()}
                                </div>
                                {analysisData?.job?.repository_url && (
                                  <a 
                                    href={analysisData.job.repository_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-[var(--chart-2)] hover:text-[var(--chart-1)] hover:underline transition-colors"
                                  >
                                    View Repository →
                                  </a>
                                )}
                              </div>
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
                  </AccordionContent>
                </AccordionItem>
            )}

            {/* Pattern Analysis */}
            {parsedAnalysis?.design_patterns?.pattern_analysis && (
                <AccordionItem value="pattern-analysis">
                  <AccordionTrigger className="text-xl font-semibold text-[var(--foreground)]">
                  Pattern Analysis
                  </AccordionTrigger>
                  <AccordionContent>
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

                  {parsedAnalysis.design_patterns?.pattern_analysis?.missing_patterns && Array.isArray(parsedAnalysis.design_patterns.pattern_analysis.missing_patterns) && parsedAnalysis.design_patterns.pattern_analysis.missing_patterns.length > 0 && (
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
                                  </AccordionContent>
              </AccordionItem>
            )}
            </ExpandableAccordion>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Security Analysis */}
            <ExpandableAccordion key="security" defaultOpenItems={['security-analysis']}>
            {parsedAnalysis.security_considerations?.security_analysis && (
              <AccordionItem value="security-analysis">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Security Analysis
                </AccordionTrigger>
                  <AccordionContent>
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

                  {parsedAnalysis.security_considerations?.security_analysis?.compliance && Array.isArray(parsedAnalysis.security_considerations.security_analysis.compliance) && parsedAnalysis.security_considerations.security_analysis.compliance.length > 0 && (
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
                  </AccordionContent>
                </AccordionItem>
            )}

            {/* Security Considerations */}
            {parsedAnalysis.security_considerations?.security_considerations && Array.isArray(parsedAnalysis.security_considerations.security_considerations) && parsedAnalysis.security_considerations.security_considerations.length > 0 && (
              <AccordionItem value="security-considerations">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Security Considerations
                </AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
                </AccordionItem>
            )}

            {/* Error Handling */}
            {parsedAnalysis.error_handling && (
                <AccordionItem value="error-handling">
                  <AccordionTrigger className="text-xl font-semibold text-[var(--foreground)]">
                  Error Handling
                  </AccordionTrigger>
                  <AccordionContent>
                <div className="space-y-4">
                  {/* Exceptions */}
                  {parsedAnalysis.error_handling?.error_handling?.exceptions && Array.isArray(parsedAnalysis.error_handling.error_handling.exceptions) && parsedAnalysis.error_handling.error_handling.exceptions.length > 0 && (
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
                  {parsedAnalysis.error_handling?.error_handling?.strategies && Array.isArray(parsedAnalysis.error_handling.error_handling.strategies) && parsedAnalysis.error_handling.error_handling.strategies.length > 0 && (
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
                        {parsedAnalysis.error_handling?.error_handling?.error_analysis?.gaps && Array.isArray(parsedAnalysis.error_handling.error_handling.error_analysis.gaps) && (
                          <div>
                            <h4 className="font-medium text-[var(--foreground)] mb-2">Gaps:</h4>
                            <ul className="list-disc list-inside text-sm text-[var(--muted-foreground)] space-y-1">
                              {parsedAnalysis.error_handling.error_handling.error_analysis.gaps.map((gap, index) => (
                                <li key={index}>{gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {parsedAnalysis.error_handling?.error_handling?.error_analysis?.improvements && Array.isArray(parsedAnalysis.error_handling.error_handling.error_analysis.improvements) && (
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
                                  </AccordionContent>
              </AccordionItem>
            )}
            </ExpandableAccordion>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            {/* Performance Analysis */}
            <ExpandableAccordion key="performance" defaultOpenItems={['performance-analysis']}>
            {parsedAnalysis.performance_considerations?.performance_analysis && (
              <AccordionItem value="performance-analysis">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Performance Analysis
                </AccordionTrigger>
                  <AccordionContent>
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

                  {parsedAnalysis.performance_considerations?.performance_analysis?.critical_bottlenecks && Array.isArray(parsedAnalysis.performance_considerations.performance_analysis.critical_bottlenecks) && parsedAnalysis.performance_considerations.performance_analysis.critical_bottlenecks.length > 0 && (
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
                  </AccordionContent>
                </AccordionItem>
            )}

            {/* Performance Considerations */}
            {parsedAnalysis.performance_considerations?.performance_considerations && Array.isArray(parsedAnalysis.performance_considerations.performance_considerations) && parsedAnalysis.performance_considerations.performance_considerations.length > 0 && (
              <AccordionItem value="performance-considerations">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Performance Considerations
                </AccordionTrigger>
                  <AccordionContent>
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
                                  </AccordionContent>
              </AccordionItem>
            )}
            </ExpandableAccordion>
          </div>
        );

      case 'algorithms':
        return (
          <div className="space-y-6">
            {/* Algorithm Analysis */}
            <ExpandableAccordion key="algorithms" defaultOpenItems={['algorithm-analysis']}>
            {parsedAnalysis.algorithms?.algorithm_analysis && (
              <AccordionItem value="algorithm-analysis">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Algorithm Analysis
                </AccordionTrigger>
                  <AccordionContent>
                <div className="space-y-4">
                  {parsedAnalysis.algorithms.algorithm_analysis.overall_complexity && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Overall Complexity</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.algorithms.algorithm_analysis.overall_complexity}</p>
                    </div>
                  )}

                  {parsedAnalysis.algorithms?.algorithm_analysis?.bottlenecks && Array.isArray(parsedAnalysis.algorithms.algorithm_analysis.bottlenecks) && parsedAnalysis.algorithms.algorithm_analysis.bottlenecks.length > 0 && (
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

                  {parsedAnalysis.algorithms?.algorithm_analysis?.optimization_opportunities && Array.isArray(parsedAnalysis.algorithms.algorithm_analysis.optimization_opportunities) && parsedAnalysis.algorithms.algorithm_analysis.optimization_opportunities.length > 0 && (
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
                  </AccordionContent>
                </AccordionItem>
            )}

            {/* Algorithms */}
            {parsedAnalysis.algorithms?.algorithms && Array.isArray(parsedAnalysis.algorithms.algorithms) && parsedAnalysis.algorithms.algorithms.length > 0 && (
              <AccordionItem value="algorithms-list">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Algorithms
                </AccordionTrigger>
                  <AccordionContent>
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
                                <div className="mt-2">
                                  <h5 className="font-medium text-[var(--foreground)] mb-2">Location:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {(() => {
                                      const location = (algorithm as Algorithm).location;
                                      if (typeof location === 'string') {
                                        return location.split(',').map((loc: string, idx: number) => (
                                          <span 
                                            key={idx} 
                                            className="font-mono bg-[var(--muted)] px-2 py-1 rounded text-xs border border-[var(--border)]"
                                          >
                                            {loc.trim()}
                                          </span>
                                        ));
                                      } else if (Array.isArray(location)) {
                                        return (location as any[]).map((loc: any, idx: number) => (
                                          <span 
                                            key={idx} 
                                            className="font-mono bg-[var(--muted)] px-2 py-1 rounded text-xs border border-[var(--border)]"
                                          >
                                            {typeof loc === 'string' ? loc.trim() : String(loc).trim()}
                                          </span>
                                        ));
                                      } else {
                                        return (
                                          <span className="font-mono bg-[var(--muted)] px-2 py-1 rounded text-xs border border-[var(--border)]">
                                            {String(location)}
                                          </span>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>
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
                                  </AccordionContent>
              </AccordionItem>
            )}
            </ExpandableAccordion>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            {/* Recommendations */}
            <ExpandableAccordion key="recommendations" defaultOpenItems={['recommendations-list']}>
            {parsedAnalysis.recommendations?.recommendations && Array.isArray(parsedAnalysis.recommendations.recommendations) && parsedAnalysis.recommendations.recommendations.length > 0 && (
              <AccordionItem value="recommendations-list">
                <AccordionTrigger className="text-lg font-medium text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                  Recommendations
                </AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
                </AccordionItem>
            )}

            {/* Recommendations Analysis */}
            {parsedAnalysis.recommendations?.recommendations_analysis && (
                <AccordionItem value="recommendations-analysis">
                  <AccordionTrigger className="text-xl font-semibold text-[var(--foreground)]">
                  Recommendations Analysis
                  </AccordionTrigger>
                  <AccordionContent>
                <div className="space-y-4">
                  {parsedAnalysis.recommendations?.recommendations_analysis?.overall_quality && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Overall Quality</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.recommendations.recommendations_analysis.overall_quality}</p>
                    </div>
                  )}

                  {parsedAnalysis.recommendations?.recommendations_analysis?.maintenance_plan && (
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                      <h3 className="font-medium text-[var(--foreground)] mb-2">Maintenance Plan</h3>
                      <p className="text-[var(--muted-foreground)]">{parsedAnalysis.recommendations.recommendations_analysis.maintenance_plan}</p>
                    </div>
                  )}

                  {parsedAnalysis.recommendations?.recommendations_analysis?.critical_improvements && Array.isArray(parsedAnalysis.recommendations.recommendations_analysis.critical_improvements) && parsedAnalysis.recommendations.recommendations_analysis.critical_improvements.length > 0 && (
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

                  {parsedAnalysis.recommendations?.recommendations_analysis?.long_term_goals && Array.isArray(parsedAnalysis.recommendations.recommendations_analysis.long_term_goals) && parsedAnalysis.recommendations.recommendations_analysis.long_term_goals.length > 0 && (
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
                                  </AccordionContent>
              </AccordionItem>
            )}
            </ExpandableAccordion>
          </div>
        );

      case 'diagrams':
        return (
          <div className="space-y-6">
            {/* Architecture Diagrams */}
            {parsedAnalysis.mermaid_diagrams && (
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
            )}

            {/* Generated Diagram Images */}
            {parsedAnalysis.diagram_images && typeof parsedAnalysis.diagram_images === 'object' && Object.keys(parsedAnalysis.diagram_images).length > 0 && (
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
