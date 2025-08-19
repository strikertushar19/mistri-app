/**
 * PlantUML Encoder - Converts PlantUML text to the correct format for PlantUML server
 * This uses the official PlantUML encoding algorithm
 */

/**
 * Encode a single 6-bit value to PlantUML format
 */
function encode6bit(b: number): string {
  if (b < 10) return String.fromCharCode(48 + b)
  b -= 10
  if (b < 26) return String.fromCharCode(65 + b)
  b -= 26
  if (b < 26) return String.fromCharCode(97 + b)
  b -= 26
  if (b === 0) return '-'
  if (b === 1) return '_'
  return '?'
}

/**
 * Encode PlantUML text using the official PlantUML algorithm
 */
export function encodePlantUML(text: string): string {
  try {
    let r = ''
    let i = 0
    const len = text.length

    while (i < len) {
      const c1 = text.charCodeAt(i++)
      r += encode6bit(c1 & 0x3f)
      
      if (i < len) {
        const c2 = text.charCodeAt(i++)
        r += encode6bit((c1 >> 6) & 0x3f | (c2 & 0x0f) << 2)
        
        if (i < len) {
          const c3 = text.charCodeAt(i++)
          r += encode6bit((c2 >> 4) & 0x3f | (c3 & 0x03) << 4)
          r += encode6bit((c3 >> 2) & 0x3f)
        } else {
          r += encode6bit((c2 >> 4) & 0x3f)
        }
      } else {
        r += encode6bit((c1 >> 6) & 0x3f)
      }
    }
    
    return r
  } catch (error) {
    console.error("Error encoding PlantUML:", error)
    throw error
  }
}

/**
 * Browser-compatible PlantUML encoder that doesn't require external packages
 */
export function encodePlantUMLBrowser(text: string): string {
  try {
    // Use the same algorithm as plantuml-encoder but implemented in pure JavaScript
    const encode6bit = (b: number): string => {
      if (b < 10) return String.fromCharCode(48 + b)
      b -= 10
      if (b < 26) return String.fromCharCode(65 + b)
      b -= 26
      if (b < 26) return String.fromCharCode(97 + b)
      b -= 26
      if (b === 0) return '-'
      if (b === 1) return '_'
      return '?'
    }

    let r = ''
    let i = 0
    const len = text.length

    while (i < len) {
      const c1 = text.charCodeAt(i++)
      r += encode6bit(c1 & 0x3f)
      
      if (i < len) {
        const c2 = text.charCodeAt(i++)
        r += encode6bit((c1 >> 6) & 0x3f | (c2 & 0x0f) << 2)
        
        if (i < len) {
          const c3 = text.charCodeAt(i++)
          r += encode6bit((c2 >> 4) & 0x3f | (c3 & 0x03) << 4)
          r += encode6bit((c3 >> 2) & 0x3f)
        } else {
          r += encode6bit((c2 >> 4) & 0x3f)
        }
      } else {
        r += encode6bit((c1 >> 6) & 0x3f)
      }
    }
    
    return r
  } catch (error) {
    console.error("Error in browser PlantUML encoding:", error)
    throw error
  }
}

/**
 * Generate a PlantUML URL for PNG format
 */
export function generatePlantUMLUrl(plantumlCode: string, format: 'png' | 'svg' = 'png'): string {
  try {
    // Clean the PlantUML code
    const cleanCode = plantumlCode
      .replace(/@startuml\s*/g, '')
      .replace(/\s*@enduml\s*/g, '')
      .trim()
    
    // Encode using browser-compatible PlantUML algorithm
    const encoded = encodePlantUMLBrowser(cleanCode)
    
    // Generate URL with the correct format
    return `https://www.plantuml.com/plantuml/${format}/${encoded}`
  } catch (error) {
    console.error("Error generating PlantUML URL:", error)
    return ""
  }
}

/**
 * Generate a PlantUML URL with DEFLATE encoding (alternative method)
 */
export function generatePlantUMLDeflateUrl(plantumlCode: string, format: 'png' | 'svg' = 'png'): string {
  try {
    // Clean the PlantUML code
    const cleanCode = plantumlCode
      .replace(/@startuml\s*/g, '')
      .replace(/\s*@enduml\s*/g, '')
      .trim()
    
    // Use base64 encoding with ~1 header for DEFLATE
    const base64 = btoa(unescape(encodeURIComponent(cleanCode)))
    const encoded = '~1' + base64
    
    // Generate URL
    return `https://www.plantuml.com/plantuml/${format}/${encoded}`
  } catch (error) {
    console.error("Error generating PlantUML DEFLATE URL:", error)
    return ""
  }
}
