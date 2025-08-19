"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Code, FileText, Layers, Shield, Zap, Lightbulb, GitBranch, Database, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseJSONWithEscapes, fixEscapedCharacters } from "@/lib/utils/json-parser"


interface AnalysisResponseProps {
  content: string | any
  className?: string
}

interface RepositoryOverview {
  name: string
  description: string
  main_technology: string
}

interface SystemComponent {
  name: string
  purpose: string
  responsibilities: string[]
  dependencies: string[]
}

interface SystemArchitecture {
  overview: string
  components: SystemComponent[]
  data_flow: string
}

interface Class {
  name: string
  purpose: string
  attributes: string[]
  methods: string[]
  relationships: string[]
}

interface DetailedDesign {
  classes: Class[]
  interfaces: any[]
  data_structures: any[]
}

interface DesignPattern {
  pattern: string
  description: string
  benefits: string[]
  location: string
}

interface ErrorHandling {
  strategies: string[]
  exceptions: string[]
}

interface PlantUMLDiagrams {
  class_diagram?: string
  component_diagram?: string
  sequence_diagram?: string
  activity_diagram?: string
}

interface AnalysisData {
  analysis_type: string
  repository_overview: RepositoryOverview
  system_architecture: SystemArchitecture
  detailed_design: DetailedDesign
  design_patterns: DesignPattern[]
  algorithms: any[]
  error_handling: ErrorHandling
  security_considerations: string[]
  performance_considerations: string[]
  recommendations: string[]
  plantuml_diagrams: PlantUMLDiagrams
}

export function AnalysisResponse({ content, className }: AnalysisResponseProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'architecture']))
  const [activeTab, setActiveTab] = useState<string>('overview')

  useEffect(() => {
    try {
      console.log("AnalysisResponse: Processing content type:", typeof content)
      
      // If content is already parsed (object), use it directly
      if (typeof content === 'object' && content !== null) {
        console.log("AnalysisResponse: Content is already parsed object")
        setAnalysisData(content)
        return
      }
      
      // If content is a string, parse it
      if (typeof content === 'string') {
        console.log("AnalysisResponse: Parsing string content:", content.substring(0, 200) + "...")
        const parsed = parseJSONWithEscapes(content)
        console.log("AnalysisResponse: Parsed data:", parsed)
        setAnalysisData(parsed)
        return
      }
      
      console.error("AnalysisResponse: Invalid content type:", typeof content)
    } catch (error) {
      console.error("Failed to parse analysis content:", error)
    }
  }, [content])

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const renderPlantUMLDiagram = (diagramCode: string, title: string) => {
    if (!diagramCode) return null

    // If the diagram code contains a PlantUML URL, render it as an image
    if (diagramCode.includes('https://www.plantuml.com/plantuml/')) {
      return (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-[var(--text-primary)] mb-3">{title}</h4>
          <img 
            src={diagramCode} 
            alt={title}
            className="max-w-full h-auto rounded-lg border border-[var(--border-light)]"
          />
        </div>
      )
    }

    // If it's PlantUML code, show it as code block
    return (
      <div className="mb-6">
        <h4 className="text-md font-semibold text-[var(--text-primary)] mb-3">{title}</h4>
        <details className="mt-2">
          <summary className="text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
            View PlantUML Code
          </summary>
          <pre className="mt-2 text-xs bg-[var(--bg-secondary)] p-3 rounded border border-[var(--border-light)] overflow-x-auto">
            <code>{diagramCode}</code>
          </pre>
        </details>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className={cn("text-[var(--text-secondary)] text-sm", className)}>
        Failed to parse analysis data
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'design', label: 'Design', icon: Code },
    { id: 'patterns', label: 'Patterns', icon: GitBranch },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'diagrams', label: 'Diagrams', icon: Database },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
  ]

  return (
    <div className={cn("bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-light)]", className)}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-light)]">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {analysisData.analysis_type.replace(/_/g, ' ').toUpperCase()} Analysis
          </h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {analysisData.repository_overview.name} - {analysisData.repository_overview.description}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-light)] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">Repository</h4>
                <p className="text-sm text-[var(--text-secondary)]">{analysisData.repository_overview.name}</p>
              </div>
              <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">Main Technology</h4>
                <p className="text-sm text-[var(--text-secondary)]">{analysisData.repository_overview.main_technology}</p>
              </div>
            </div>
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">Description</h4>
              <p className="text-sm text-[var(--text-secondary)]">{analysisData.repository_overview.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">System Overview</h4>
              <p className="text-sm text-[var(--text-secondary)]">{analysisData.system_architecture.overview}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">Components</h4>
              <div className="space-y-3">
                {analysisData.system_architecture.components.map((component, index) => (
                  <div key={index} className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
                    <h5 className="font-medium text-[var(--text-primary)] mb-2">{component.name}</h5>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{component.purpose}</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Responsibilities:</span>
                        <ul className="text-xs text-[var(--text-secondary)] ml-4 mt-1">
                          {component.responsibilities.map((resp, idx) => (
                            <li key={idx} className="list-disc">{resp}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Dependencies:</span>
                        <p className="text-xs text-[var(--text-secondary)] ml-4 mt-1">
                          {component.dependencies.join(', ') || 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">Data Flow</h4>
              <p className="text-sm text-[var(--text-secondary)]">{analysisData.system_architecture.data_flow}</p>
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">Classes</h4>
              <div className="space-y-3">
                {analysisData.detailed_design.classes.map((cls, index) => (
                  <div key={index} className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
                    <h5 className="font-medium text-[var(--text-primary)] mb-2">{cls.name}</h5>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{cls.purpose}</p>
                    <div className="space-y-2">
                      {cls.attributes.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-[var(--text-primary)]">Attributes:</span>
                          <ul className="text-xs text-[var(--text-secondary)] ml-4 mt-1">
                            {cls.attributes.map((attr, idx) => (
                              <li key={idx} className="list-disc">{attr}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {cls.methods.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-[var(--text-primary)]">Methods:</span>
                          <ul className="text-xs text-[var(--text-secondary)] ml-4 mt-1">
                            {cls.methods.map((method, idx) => (
                              <li key={idx} className="list-disc">{method}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {analysisData.design_patterns.map((pattern, index) => (
              <div key={index} className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">{pattern.pattern}</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{pattern.description}</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">Benefits:</span>
                    <ul className="text-xs text-[var(--text-secondary)] ml-4 mt-1">
                      {pattern.benefits.map((benefit, idx) => (
                        <li key={idx} className="list-disc">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">Location:</span>
                    <p className="text-xs text-[var(--text-secondary)] ml-4 mt-1">{pattern.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">Security Considerations</h4>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                {analysisData.security_considerations.map((consideration, index) => (
                  <li key={index} className="list-disc ml-4">{consideration}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">Performance Considerations</h4>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                {analysisData.performance_considerations.map((consideration, index) => (
                  <li key={index} className="list-disc ml-4">{consideration}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'diagrams' && (
          <div className="space-y-6">
            {analysisData.plantuml_diagrams.class_diagram && 
              renderPlantUMLDiagram(analysisData.plantuml_diagrams.class_diagram, "Class Diagram")}
            
            {analysisData.plantuml_diagrams.component_diagram && 
              renderPlantUMLDiagram(analysisData.plantuml_diagrams.component_diagram, "Component Diagram")}
            
            {analysisData.plantuml_diagrams.sequence_diagram && 
              renderPlantUMLDiagram(analysisData.plantuml_diagrams.sequence_diagram, "Sequence Diagram")}
            
            {analysisData.plantuml_diagrams.activity_diagram && 
              renderPlantUMLDiagram(analysisData.plantuml_diagrams.activity_diagram, "Activity Diagram")}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">Recommendations</h4>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                {analysisData.recommendations.map((recommendation, index) => (
                  <li key={index} className="list-disc ml-4">{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
