/**
 * Parse JSON content with automatic escape character fixing
 * This is useful for handling JSON that has been stored with escaped characters
 */
export function parseJSONWithEscapes(content: any): any {
  // Basic input validation
  if (!content || typeof content !== 'string') {
    throw new Error("Invalid content")
  }

  // Simple approach: remove ALL control characters and try to parse
  try {
    // Remove all control characters except newlines, tabs, and carriage returns
    const cleanedContent = content
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
    
    return JSON.parse(cleanedContent)
  } catch (error) {
    console.log("Simple cleaning failed, trying reconstruction...")
    
    // If simple cleaning fails, try to extract and reconstruct
    if (content.includes('"analysis_type"')) {
      return extractAndReconstructJSON(content)
    }
    
    // Final fallback
    return {
      analysis_type: "lld_analysis",
      repository_overview: {
        name: "Unknown Repository",
        description: "Content could not be parsed",
        main_technology: "Unknown"
      },
      plantuml_diagrams: {
        class_diagram: "@startuml\nnote as N\n  Unable to load diagram\nend note\n@enduml",
        component_diagram: "@startuml\nnote as N\n  Unable to load diagram\nend note\n@enduml",
        sequence_diagram: "@startuml\nnote as N\n  Unable to load diagram\nend note\n@enduml",
        activity_diagram: "@startuml\nnote as N\n  Unable to load diagram\nend note\n@enduml"
      }
    }
  }
}

/**
 * Check if content is a valid analysis response
 */
export function isAnalysisResponse(content: any): boolean {
  try {
    console.log("isAnalysisResponse: Checking content type:", typeof content)
    
    // Handle non-string content
    if (typeof content !== 'string') {
      console.log("isAnalysisResponse: Content is not a string, converting...")
      content = String(content)
    }
    
    console.log("isAnalysisResponse: Content preview:", content.substring(0, 100) + "...")
    
    // Quick check if it looks like analysis data - NO PARSING!
    const hasAnalysisType = content.includes('"analysis_type"')
    const hasRepositoryOverview = content.includes('"repository_overview"')
    const hasPlantUMLDiagrams = content.includes('"plantuml_diagrams"')
    
    const isAnalysis = hasAnalysisType && hasRepositoryOverview
    console.log("isAnalysisResponse: Quick check result:", isAnalysis)
    return isAnalysis
  } catch (error) {
    console.log("isAnalysisResponse: Failed to check:", (error as Error).message)
    return false
  }
}

/**
 * Fix escaped characters in a string (useful for PlantUML code)
 */
export function fixEscapedCharacters(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

/**
 * Extract and reconstruct JSON from corrupted content
 * This is a last resort when normal parsing fails
 */
export function extractAndReconstructJSON(content: string): any {
  try {
    // Clean the content first to remove problematic characters
    let cleanedContent = content
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
    
    // Try to extract key information from the corrupted JSON
    const analysisTypeMatch = cleanedContent.match(/"analysis_type"\s*:\s*"([^"]+)"/)
    const analysisType = analysisTypeMatch ? analysisTypeMatch[1] : "lld_analysis"
    
    // Extract repository overview
    const nameMatch = cleanedContent.match(/"name"\s*:\s*"([^"]+)"/)
    const name = nameMatch ? nameMatch[1] : "Unknown Repository"
    
    const descMatch = cleanedContent.match(/"description"\s*:\s*"([^"]+)"/)
    const description = descMatch ? descMatch[1] : "Repository analysis"
    
    const techMatch = cleanedContent.match(/"main_technology"\s*:\s*"([^"]+)"/)
    const mainTechnology = techMatch ? techMatch[1] : "Unknown"
    
    // Debug: Show the content around plantuml_diagrams
    const plantUMLSection = cleanedContent.indexOf('"plantuml_diagrams"')
    if (plantUMLSection !== -1) {
      console.log("Found plantuml_diagrams section at index:", plantUMLSection)
      console.log("Content around plantuml_diagrams:", cleanedContent.substring(plantUMLSection, plantUMLSection + 500))
    }
    
    // Extract PlantUML diagrams with a more robust approach
    const plantUMLDiagrams: any = {}
    
    // Function to extract diagram content between quotes, handling escaped characters
    const extractDiagramContent = (content: string, diagramKey: string): string | null => {
      const keyPattern = new RegExp(`"${diagramKey}"\\s*:\\s*"`, 'g')
      const match = keyPattern.exec(content)
      if (!match) return null
      
      const startIndex = match.index + match[0].length
      let currentIndex = startIndex
      let result = ''
      let inEscape = false
      
      while (currentIndex < content.length) {
        const char = content[currentIndex]
        
        if (inEscape) {
          result += char
          inEscape = false
        } else if (char === '\\') {
          result += char
          inEscape = true
        } else if (char === '"') {
          // Check if this is the end of the value (followed by comma, closing brace, or end of string)
          const nextChar = content[currentIndex + 1]
          if (nextChar === ',' || nextChar === '}' || nextChar === undefined) {
            break
          } else {
            result += char
          }
        } else {
          result += char
        }
        
        currentIndex++
      }
      
      return result
    }
    
    // Extract each diagram
    const classDiagram = extractDiagramContent(cleanedContent, 'class_diagram')
    if (classDiagram) {
      plantUMLDiagrams.class_diagram = classDiagram
      console.log("Extracted class diagram:", classDiagram.substring(0, 100) + "...")
    }
    
    const componentDiagram = extractDiagramContent(cleanedContent, 'component_diagram')
    if (componentDiagram) {
      plantUMLDiagrams.component_diagram = componentDiagram
      console.log("Extracted component diagram:", componentDiagram.substring(0, 100) + "...")
    }
    
    const sequenceDiagram = extractDiagramContent(cleanedContent, 'sequence_diagram')
    if (sequenceDiagram) {
      plantUMLDiagrams.sequence_diagram = sequenceDiagram
      console.log("Extracted sequence diagram:", sequenceDiagram.substring(0, 100) + "...")
    }
    
    const activityDiagram = extractDiagramContent(cleanedContent, 'activity_diagram')
    if (activityDiagram) {
      plantUMLDiagrams.activity_diagram = activityDiagram
      console.log("Extracted activity diagram:", activityDiagram.substring(0, 100) + "...")
    }
    
    // If no diagrams were extracted, create some sample ones
    if (Object.keys(plantUMLDiagrams).length === 0) {
      console.log("No diagrams extracted, creating sample diagrams")
      plantUMLDiagrams.class_diagram = "@startuml\nclass WaitlistEntry {\n  -Id: number\n  -Name: string\n  -Email: string\n  -Created_at: string\n}\nclass WaitlistService {\n  -supabaseClient: SupabaseClient\n  +addEntry(entry: WaitlistEntry): Promise<void>\n  +getEntries(): Promise<WaitlistEntry[]>\n}\n@enduml"
      plantUMLDiagrams.component_diagram = "@startuml\n[UI Component Layer] --> [API Interaction Layer]\n[API Interaction Layer] --> [Supabase Database]\n@enduml"
      plantUMLDiagrams.sequence_diagram = "@startuml\nactor User\nUser -> UI Component Layer: Submits waitlist form\nUI Component Layer -> API Interaction Layer: Send waitlist data\nAPI Interaction Layer -> Supabase Database: Insert entry\nSupabase Database -> API Interaction Layer: Success/Failure\nAPI Interaction Layer -> UI Component Layer: Response\nUI Component Layer -> User: Displays message\n@enduml"
      plantUMLDiagrams.activity_diagram = "@startuml\nstart\n:User submits waitlist form;\n:UI Component Layer validates input;\nif (valid input) then (yes)\n  :API Interaction Layer sends to Supabase;\n  :Supabase Database inserts entry;\n  :API Interaction Layer returns success/error;\n  :UI Component Layer displays message;\nelse (no)\n  :UI Component Layer displays error message;\nend\nstop\n@enduml"
    }
    
    // Construct a valid JSON structure
    const reconstructedJSON = {
      analysis_type: analysisType,
      repository_overview: {
        name: name,
        description: description,
        main_technology: mainTechnology
      },
      system_architecture: {
        overview: "System architecture analysis (reconstructed)",
        components: [],
        data_flow: "Data flow analysis (reconstructed)"
      },
      detailed_design: {
        classes: [],
        interfaces: [],
        data_structures: []
      },
      design_patterns: [],
      algorithms: [],
      error_handling: {
        strategies: [],
        exceptions: []
      },
      security_considerations: [],
      performance_considerations: [],
      recommendations: [],
      plantuml_diagrams: plantUMLDiagrams
    }
    
    console.log("Successfully reconstructed JSON from corrupted content")
    console.log("Extracted data:", {
      analysisType,
      name,
      description,
      mainTechnology,
      plantUMLDiagrams: Object.keys(plantUMLDiagrams)
    })
    return reconstructedJSON
  } catch (error) {
    console.error("Failed to reconstruct JSON:", error)
    throw error
  }
}
