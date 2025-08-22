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
      }
    }
  }
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

    }
    
    console.log("Successfully reconstructed JSON from corrupted content")
    console.log("Extracted data:", {
      analysisType,
      name,
      description,
      mainTechnology
    })
    return reconstructedJSON
  } catch (error) {
    console.error("Failed to reconstruct JSON:", error)
    throw error
  }
}
