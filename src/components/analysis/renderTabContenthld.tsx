import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";

// Diagram Image Component for displaying generated images with zoom functionality
const DiagramImageComponent = ({ image, title }: { image: any, title: string }) => {
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
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

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  const handleDownload = () => {
    try {
      if (image.image_format === 'svg') {
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
          <button onClick={handleZoomOut} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" title="Zoom Out">-</button>
          <span className="text-xs text-gray-600 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" title="Zoom In">+</button>
          <button onClick={handleReset} className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors" title="Reset View">Reset</button>
          <button onClick={handleDownload} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1" title="Download Diagram">
            <Download className="h-3 w-3" />Download
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded border">
        {imageError ? (
          <div className="text-red-600 text-center py-4">Failed to load image</div>
        ) : (
          <div 
            ref={containerRef}
            className="relative overflow-hidden border border-gray-200 rounded"
            style={{ height: '600px', cursor: isDragging ? 'grabbing' : 'grab' }}
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
                  style={{ width: `${image.width}px`, height: `${image.height}px` }}
                />
              ) : (
                <img
                  src={`data:image/${image.image_format};base64,${image.image_data}`}
                  alt={title}
                  className="max-w-full max-h-full object-contain"
                  style={{ width: `${image.width}px`, height: `${image.height}px` }}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div>{image.width} × {image.height} pixels • {image.image_format.toUpperCase()}</div>
          <div className="text-xs text-gray-400">Drag to pan • Scroll to zoom • Use buttons for precise control</div>
        </div>
      </div>
    </div>
  );
};

// Mermaid Diagram Component
const MermaidDiagram = ({ diagram, title }: { diagram: string, title: string }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
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
      script.onerror = () => console.error('Failed to load Mermaid');
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
          const svgContent = svgElement.outerHTML;
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
          <Download className="h-4 w-4" />Download
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

// Interfaces for HLD data
interface HLDComponent {
  name: string;
  purpose: string;
  responsibilities: string[];
  interfaces: string[];
  repository: string;
}

interface CrossRepositoryPattern {
  pattern: string;
  description: string;
  repositories: string[];
  impact: string;
}

interface IntegrationPoint {
  name: string;
  description: string;
  type: string;
  repositories: string[];
  data_flow: string;
}

interface HLDSystemArchitecture {
  overview: string;
  components: HLDComponent[];
  data_flow: string;
  deployment_model: string;
  scalability_approach: string;
  communication_patterns: string;
}

interface HLDRecommendation {
  description: string;
  category?: string;
  priority?: string;
  impact?: string;
}

interface HLDData {
  overview: string;
  system_architecture: HLDSystemArchitecture;
  recommendations: HLDRecommendation[];
  cross_repository_patterns: CrossRepositoryPattern[];
  integration_points: IntegrationPoint[];
  diagrams?: {
    class_diagram?: string;
    component_diagram?: string;
    sequence_diagram?: string;
    activity_diagram?: string;
  };
  diagram_images?: {
    class_diagram?: any;
    component_diagram?: any;
    sequence_diagram?: any;
    activity_diagram?: any;
  };
}

interface HLDAnalysisData {
  hld_analysis: HLDData;
}

interface RenderTabContentHLDProps {
  activeTab: string;
  parsedAnalysis: HLDAnalysisData;
  analysisData: {
    job?: {
      repository_name?: string;
      repository_url?: string;
      multi_repo_names?: string[];
      multi_repo_urls?: string[];
    };
    analysis_data?: {
      hld_analysis?: any;
      [key: string]: any;
    };
  } | null;
}

export const RenderTabContentHLD: React.FC<RenderTabContentHLDProps> = ({
  activeTab,
  parsedAnalysis,
  analysisData
}) => {
  // Try to get HLD data from parsedAnalysis first, then fallback to analysisData
  let hldData = parsedAnalysis?.hld_analysis;
  
  if (!hldData && analysisData?.analysis_data?.hld_analysis) {
    console.log('Falling back to analysisData.analysis_data.hld_analysis');
    hldData = analysisData.analysis_data.hld_analysis;
  }

  console.log('RenderTabContentHLD - Debug Info:', {
    activeTab,
    hasParsedAnalysis: !!parsedAnalysis,
    hasHLDData: !!hldData,
    parsedAnalysisKeys: parsedAnalysis ? Object.keys(parsedAnalysis) : [],
    hldDataKeys: hldData ? Object.keys(hldData) : [],
    analysisData: analysisData,
    hasAnalysisDataHLD: !!analysisData?.analysis_data?.hld_analysis
  });

  if (!hldData) {
    return (
      <div className="bg-[var(--muted)] p-4 rounded-lg">
        <p className="text-[var(--muted-foreground)] text-center py-4">
          No HLD analysis data available
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <h4 className="font-medium text-yellow-800 mb-2">Debug Information:</h4>
          <div className="text-yellow-700 space-y-1">
            <div>Has parsedAnalysis: {!!parsedAnalysis ? 'Yes' : 'No'}</div>
            <div>Has hldData: {!!hldData ? 'Yes' : 'No'}</div>
            <div>parsedAnalysis keys: {parsedAnalysis ? Object.keys(parsedAnalysis).join(', ') : 'None'}</div>
            <div>analysisData keys: {analysisData ? Object.keys(analysisData).join(', ') : 'None'}</div>
            <div>analysisData.analysis_data keys: {analysisData?.analysis_data ? Object.keys(analysisData.analysis_data).join(', ') : 'None'}</div>
            <div>Has analysisData.analysis_data.hld_analysis: {!!analysisData?.analysis_data?.hld_analysis ? 'Yes' : 'No'}</div>
            {analysisData?.analysis_data?.hld_analysis && (
              <div>HLD Analysis keys: {Object.keys(analysisData.analysis_data.hld_analysis).join(', ')}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  switch (activeTab) {
    case 'overview':
      return (
        <div className="space-y-6">
          {/* System Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
              System Overview
            </h2>
            <div className="bg-[var(--muted)] p-4 rounded-lg">
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {hldData.overview || 'No system overview available'}
              </p>
            </div>
          </section>

          {/* Multi-Repository Information */}
          {analysisData?.job?.multi_repo_names && analysisData.job.multi_repo_names.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Repositories Analyzed
              </h2>
              <div className="grid gap-4">
                {analysisData.job.multi_repo_names.map((repoName, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-[var(--chart-2)]">{repoName}</h3>
                      {analysisData.job?.multi_repo_urls?.[index] && (
                        <a 
                          href={analysisData.job.multi_repo_urls[index]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[var(--chart-2)] hover:text-[var(--chart-1)] hover:underline transition-colors"
                        >
                          View Repository →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cross-Repository Patterns */}
          {hldData.cross_repository_patterns && hldData.cross_repository_patterns.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Cross-Repository Patterns
              </h2>
              <div className="grid gap-4">
                {hldData.cross_repository_patterns.map((pattern, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                    <div className="border-b border-[var(--border)] pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-[var(--chart-2)] mb-2">{pattern.pattern}</h3>
                      <p className="text-[var(--muted-foreground)]">{pattern.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-[var(--foreground)] mb-2">Repositories</h4>
                        <div className="bg-[var(--chart-1)]/10 border border-[var(--chart-1)]/20 rounded p-3">
                          <ul className="space-y-1">
                            {pattern.repositories.map((repo, idx) => (
                              <li key={idx} className="text-sm text-[var(--foreground)]">{repo}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-[var(--foreground)] mb-2">Impact</h4>
                        <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-3)]/10 p-3 rounded border border-[var(--chart-3)]/20">
                          {pattern.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Integration Points */}
          {hldData.integration_points && hldData.integration_points.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Integration Points
              </h2>
              <div className="grid gap-4">
                {hldData.integration_points.map((point, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                    <div className="border-b border-[var(--border)] pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-[var(--chart-2)] mb-2">{point.name}</h3>
                      <p className="text-[var(--muted-foreground)]">{point.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-[var(--foreground)] mb-2">Type</h4>
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-[var(--chart-1)]/10 text-[var(--chart-1)] border border-[var(--chart-1)]/20">
                            {point.type}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-[var(--foreground)] mb-2">Repositories</h4>
                          <div className="bg-[var(--chart-2)]/10 border border-[var(--chart-2)]/20 rounded p-3">
                            <ul className="space-y-1">
                              {point.repositories.map((repo, idx) => (
                                <li key={idx} className="text-sm text-[var(--foreground)]">{repo}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-[var(--foreground)] mb-2">Data Flow</h4>
                        <p className="text-sm text-[var(--muted-foreground)] bg-[var(--chart-4)]/10 p-3 rounded border border-[var(--chart-4)]/20">
                          {point.data_flow}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      );

    case 'architecture':
      return (
        <div className="space-y-6">
          {/* System Architecture Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
              System Architecture Overview
            </h2>
            <div className="bg-[var(--muted)] p-4 rounded-lg">
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {hldData.system_architecture.overview || 'No architecture overview available'}
              </p>
            </div>
          </section>

          {/* Communication Patterns */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
              Communication Patterns
            </h2>
            <div className="bg-[var(--muted)] p-4 rounded-lg">
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {hldData.system_architecture.communication_patterns || 'No communication patterns information available'}
              </p>
            </div>
          </section>

          {/* Data Flow */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
              Data Flow
            </h2>
            <div className="bg-[var(--muted)] p-4 rounded-lg">
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {hldData.system_architecture.data_flow || 'No data flow information available'}
              </p>
            </div>
          </section>

          {/* Deployment Model */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
              Deployment Model
            </h2>
            <div className="bg-[var(--muted)] p-4 rounded-lg">
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {hldData.system_architecture.deployment_model || 'No deployment model information available'}
              </p>
            </div>
          </section>

          {/* Scalability Approach */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
              Scalability Approach
            </h2>
            <div className="bg-[var(--muted)] p-4 rounded-lg">
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {hldData.system_architecture.scalability_approach || 'No scalability approach information available'}
              </p>
            </div>
          </section>
        </div>
      );

    case 'components':
      return (
        <div className="space-y-6">
          {/* System Components */}
          {hldData.system_architecture?.components && Array.isArray(hldData.system_architecture.components) && hldData.system_architecture.components.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                System Components
              </h2>
              <div className="grid gap-6">
                {hldData.system_architecture.components.map((component, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
                    {/* Component Header */}
                    <div className="border-b border-[var(--border)] pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-[var(--chart-2)] mb-2">{component.name}</h3>
                      <p className="text-[var(--muted-foreground)] mb-2">{component.purpose}</p>
                      <div className="text-sm text-[var(--chart-1)] font-medium">
                        Repository: {component.repository}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
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

          {(!hldData.system_architecture?.components || hldData.system_architecture.components.length === 0) && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
              <p className="text-[var(--muted-foreground)] text-center py-4">No components information available</p>
            </div>
          )}
        </div>
      );

    case 'recommendations':
      return (
        <div className="space-y-6">
          {/* Recommendations */}
          {hldData.recommendations && Array.isArray(hldData.recommendations) && hldData.recommendations.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Recommendations
              </h2>
              <div className="space-y-6">
                {hldData.recommendations.map((rec, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
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
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(!hldData.recommendations || hldData.recommendations.length === 0) && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
              <p className="text-[var(--muted-foreground)] text-center py-4">No recommendations available</p>
            </div>
          )}
        </div>
      );

    case 'diagrams':
      return (
        <div className="space-y-6">
          {/* Architecture Diagrams */}
          {hldData.diagrams && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Architecture Diagrams
              </h2>
              
              <div className="space-y-6">
                {/* Component Diagram */}
                {hldData.diagrams.component_diagram && (
                  <MermaidDiagram 
                    key="component-diagram"
                    diagram={hldData.diagrams.component_diagram} 
                    title="Component Diagram" 
                  />
                )}
                
                {/* Sequence Diagram */}
                {hldData.diagrams.sequence_diagram && (
                  <MermaidDiagram 
                    key="sequence-diagram"
                    diagram={hldData.diagrams.sequence_diagram} 
                    title="Sequence Diagram" 
                  />
                )}
                
                {/* Activity Diagram */}
                {hldData.diagrams.activity_diagram && (
                  <MermaidDiagram 
                    key="activity-diagram"
                    diagram={hldData.diagrams.activity_diagram} 
                    title="Activity Diagram" 
                  />
                )}
                
                {/* Class Diagram */}
                {hldData.diagrams.class_diagram && (
                  <MermaidDiagram 
                    key="class-diagram"
                    diagram={hldData.diagrams.class_diagram} 
                    title="Class Diagram" 
                  />
                )}
              </div>
            </section>
          )}

          {/* Generated Diagram Images */}
          {hldData.diagram_images && typeof hldData.diagram_images === 'object' && Object.keys(hldData.diagram_images).length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)] border-b-2 border-[var(--chart-2)] pb-2">
                Generated Diagram Images
              </h2>
              
              <div className="space-y-6">
                {Object.entries(hldData.diagram_images).map(([type, image]) => (
                  <DiagramImageComponent 
                    key={type}
                    image={image} 
                    title={type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                  />
                ))}
              </div>
            </section>
          )}

          {(!hldData.diagrams && !hldData.diagram_images) && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
              <p className="text-[var(--muted-foreground)] text-center py-4">No diagrams available</p>
            </div>
          )}
        </div>
      );

    default:
      return <div>Select a tab to view content</div>;
  }
};
