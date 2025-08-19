import { apiClient } from './client'

export interface UMLDiagramRequest {
  plantuml_code: string
  format?: string
}

export interface UMLDiagramResponse {
  image_url: string
  format: string
  success: boolean
  error?: string
}

export const umlDiagramApi = {
  /**
   * Generate a UML diagram from PlantUML code
   */
  generateDiagram: async (request: UMLDiagramRequest): Promise<UMLDiagramResponse> => {
    const response = await apiClient.post('/chat/uml-diagram', request)
    return response.data
  },

  /**
   * Generate a UML diagram from repository code
   */
  generateRepositoryDiagram: async (repositoryPath: string, format: 'png' | 'svg' = 'png'): Promise<UMLDiagramResponse> => {
    const response = await apiClient.post('/chat/repository-uml-diagram', {
      repository_path: repositoryPath,
      format: format
    })
    return response.data
  }
}


