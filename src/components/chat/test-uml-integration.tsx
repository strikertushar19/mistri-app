"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { umlDiagramApi } from "@/lib/api/uml-diagram"
import { toast } from "@/components/ui/use-toast"

export function TestUMLIntegration() {
  const [repoPath, setRepoPath] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const testUMLGeneration = async () => {
    if (!repoPath.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository path",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult("")

    try {
      const response = await umlDiagramApi.generateRepositoryDiagram(repoPath, 'png')
      
      if (response.success && response.image_url) {
        setResult(`✅ Success! UML diagram generated for ${repoPath}\n\nImage URL: ${response.image_url}\n\n![UML Diagram](${response.image_url})`)
        
        toast({
          title: "Success",
          description: `UML diagram generated for ${repoPath}`,
        })
      } else {
        setResult(`❌ Failed to generate UML diagram\n\nError: ${response.error}`)
        
        toast({
          title: "Error",
          description: response.error || "Failed to generate UML diagram",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing UML generation:", error)
      setResult(`❌ Error: ${error}`)
      
      toast({
        title: "Error",
        description: "Failed to test UML generation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-light)]">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Test UML Diagram Integration
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Repository Path
          </label>
          <input
            type="text"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="Enter repository path (e.g., /path/to/repo or .)"
            className="w-full px-3 py-2 border border-[var(--border-light)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)]"
          />
        </div>
        
        <Button
          onClick={testUMLGeneration}
          disabled={loading || !repoPath.trim()}
          className="w-full"
        >
          {loading ? "Generating..." : "Generate UML Diagram"}
        </Button>
        
        {result && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
              Result:
            </h4>
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
              <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
