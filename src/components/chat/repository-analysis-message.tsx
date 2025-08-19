"use client"

import React, { useState, useEffect } from 'react'
import { AnalysisResponse } from './analysis-response'
import { isAnalysisResponse, parseJSONWithEscapes } from '@/lib/utils/json-parser'
import { cn } from '@/lib/utils'

interface RepositoryAnalysisMessageProps {
  content: string
  className?: string
}

export function RepositoryAnalysisMessage({ content, className }: RepositoryAnalysisMessageProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageTitles, setImageTitles] = useState<string[]>([])
  const [processedContent, setProcessedContent] = useState(content)
  
  console.log("RepositoryAnalysisMessage: Received content length:", content?.length)
  console.log("RepositoryAnalysisMessage: Content preview:", content?.substring(0, 200) + "...")
  
  // Extract image URLs and process content
  useEffect(() => {
    if (content) {
      // Look for diagram references and extract meaningful names
      const diagramRegex = /!\[(.*?)\]\((https:\/\/www\.plantuml\.com\/plantuml\/[^)]+)\)/g
      const matches = [...content.matchAll(diagramRegex)]
      
      const urls: string[] = []
      const titles: string[] = []
      let textContent = content
      
      for (const match of matches) {
        const title = match[1]
        const url = match[2]
        
        // Generate meaningful diagram names based on content context
        let diagramName = title
        
        // If title is generic, try to extract context from surrounding text
        if (title === 'UML Diagram' || title === 'Diagram') {
          // Look for context in the content before this diagram
          const beforeText = content.substring(0, match.index || 0)
          const lines = beforeText.split('\n').slice(-5) // Last 5 lines
          const contextText = lines.join(' ').toLowerCase()
          
          if (contextText.includes('class') || contextText.includes('entity')) {
            diagramName = 'Class Diagram'
          } else if (contextText.includes('sequence') || contextText.includes('interaction')) {
            diagramName = 'Sequence Diagram'
          } else if (contextText.includes('activity') || contextText.includes('flow')) {
            diagramName = 'Activity Diagram'
          } else if (contextText.includes('use case') || contextText.includes('actor')) {
            diagramName = 'Use Case Diagram'
          } else if (contextText.includes('er') || contextText.includes('entity relationship') || contextText.includes('database')) {
            diagramName = 'Entity Relationship Diagram'
          } else if (contextText.includes('component') || contextText.includes('architecture')) {
            diagramName = 'Component Architecture Diagram'
          } else if (contextText.includes('deployment') || contextText.includes('infrastructure')) {
            diagramName = 'Deployment Diagram'
          } else if (contextText.includes('state') || contextText.includes('machine')) {
            diagramName = 'State Machine Diagram'
          } else {
            // Try to extract from the URL or use a more descriptive name
            const urlPath = url.split('/')
            const format = urlPath[urlPath.length - 2] || 'svg'
            diagramName = `Architecture Diagram (${format.toUpperCase()})`
          }
        }
        
        urls.push(url)
        titles.push(diagramName)
        
        // Remove this specific match from text content
        textContent = textContent.replace(match[0], '')
      }
      
      console.log("RepositoryAnalysisMessage: Found image URLs:", urls)
      console.log("RepositoryAnalysisMessage: Found image titles:", titles)
      setImageUrls(urls)
      setImageTitles(titles)
      setProcessedContent(textContent)
    }
  }, [content])
  
  // Check if the content contains repository analysis indicators
  const isRepositoryAnalysis = (text: string): boolean => {
    const analysisKeywords = [
      'repository analysis',
      'codebase analysis',
      'system architecture',
      'design patterns',
      'class diagram',
      'component diagram',
      'sequence diagram',
      'activity diagram',
      'use case diagram',
      'entity relationship',
      'database schema',
      'api documentation',
      'low level design',
      'high level design',
      'lld',
      'hld'
    ]
    
    const lowerText = text.toLowerCase()
    return analysisKeywords.some(keyword => lowerText.includes(keyword))
  }

  // Check if content contains image references (from backend UML conversion)
  const hasImageReferences = (text: string): boolean => {
    const hasImages = text.includes('![UML Diagram](') && text.includes('plantuml.com')
    console.log("RepositoryAnalysisMessage: Checking for image references:", hasImages)
    if (hasImages) {
      const imageMatches = text.match(/!\[UML Diagram\]\((https:\/\/www\.plantuml\.com\/plantuml\/[^)]+)\)/g)
      console.log("RepositoryAnalysisMessage: Found image URLs:", imageMatches)
    }
    return hasImages
  }

  // Determine if this is a repository analysis message
  // Prioritize image references over JSON analysis
  const hasImages = hasImageReferences(content)
  const isAnalysis = hasImages || 
                     isRepositoryAnalysis(content) || 
                     (isAnalysisResponse(content) && !hasImages)

  // If it's a structured analysis response, use the existing AnalysisResponse component
  if (isAnalysisResponse(content)) {
    try {
      const parsedContent = parseJSONWithEscapes(content)
      return (
        <div>
          <AnalysisResponse content={parsedContent} className={cn("mb-4", className)} />
          
          {/* Add UML Diagrams if present */}
          {imageUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold text-[var(--text-primary)] mb-3">Architecture Diagrams</h4>
              {imageUrls.map((url, index) => (
                <div key={index} className="mb-6">
                  <h5 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    {imageTitles[index] || `Architecture Diagram ${index + 1}`}
                  </h5>
                  <img 
                    src={url}
                    alt={imageTitles[index] || `Architecture Diagram ${index + 1}`}
                    className="max-w-full h-auto rounded-lg border border-[var(--border-light)] shadow-sm"
                    onError={(e) => {
                      console.error("Failed to load image:", url)
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'block'
                    }}
                    onLoad={() => console.log("Image loaded successfully:", url)}
                  />
                  <div className="hidden p-4 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-secondary)] text-sm">
                    <strong>{imageTitles[index] || 'Architecture Diagram'}</strong><br/>
                    Image failed to load. <a href={url} target="_blank" className="text-[var(--accent-primary)] hover:underline">Click here to view</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    } catch (error) {
      console.error("Failed to parse analysis content:", error)
    }
  }

  // For plain text with image references, render as markdown-like content
  if (isAnalysis) {
    return (
      <div className={cn("bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-light)] p-4", className)}>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Repository Analysis
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Analysis of the selected codebase with architectural diagrams and insights
          </p>
        </div>
        
        <div className="prose prose-sm max-w-none">
          {/* Text content */}
          <div 
            className="whitespace-pre-wrap text-[var(--text-primary)]"
            dangerouslySetInnerHTML={{
              __html: processedContent
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-[var(--bg-primary)] px-1 rounded">$1</code>')
            }}
          />
          
          {/* UML Diagrams */}
          {imageUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold text-[var(--text-primary)] mb-3">Architecture Diagrams</h4>
              {imageUrls.map((url, index) => (
                <div key={index} className="mb-6">
                  <h5 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    {imageTitles[index] || `Diagram ${index + 1}`}
                  </h5>
                  <img 
                    src={url}
                    alt={imageTitles[index] || `Diagram ${index + 1}`}
                    className="max-w-full h-auto rounded-lg border border-[var(--border-light)] shadow-sm"
                    onError={(e) => {
                      console.error("Failed to load image:", url)
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'block'
                    }}
                    onLoad={() => console.log("Image loaded successfully:", url)}
                  />
                  <div className="hidden p-4 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-secondary)] text-sm">
                    <strong>{imageTitles[index] || 'Diagram'}</strong><br/>
                    Image failed to load. <a href={url} target="_blank" className="text-[var(--accent-primary)] hover:underline">Click here to view</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // If not a repository analysis, return null
  return null
}
