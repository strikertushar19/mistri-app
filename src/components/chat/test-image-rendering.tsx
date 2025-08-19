"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

export function TestImageRendering() {
  const [testImageUrl, setTestImageUrl] = useState("")
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const testImageUrl1 = "https://www.plantuml.com/plantuml/svg/~1SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vtSfO0G00"
  const testImageUrl2 = "https://www.plantuml.com/plantuml/png/~1SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vtSfO0G00"

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
    console.log("Test image loaded successfully")
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
    console.error("Test image failed to load")
  }

  return (
    <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-light)]">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Test Image Rendering
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            Test SVG Image:
          </h4>
          <div className="border border-[var(--border-light)] rounded-lg p-4 bg-[var(--bg-primary)]">
            <img 
              src={testImageUrl1}
              alt="Test SVG UML Diagram"
              className="max-w-full h-auto rounded-lg border border-[var(--border-light)] shadow-sm"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoaded && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Image loaded successfully
              </div>
            )}
            {imageError && (
              <div className="mt-2 text-sm text-red-600">
                ❌ Image failed to load
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            Test PNG Image:
          </h4>
          <div className="border border-[var(--border-light)] rounded-lg p-4 bg-[var(--bg-primary)]">
            <img 
              src={testImageUrl2}
              alt="Test PNG UML Diagram"
              className="max-w-full h-auto rounded-lg border border-[var(--border-light)] shadow-sm"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            Test with Markdown-like Content:
          </h4>
          <div className="border border-[var(--border-light)] rounded-lg p-4 bg-[var(--bg-primary)]">
            <div 
              className="whitespace-pre-wrap text-[var(--text-primary)]"
              dangerouslySetInnerHTML={{
                __html: `This is a test message with a UML diagram:

![UML Diagram](${testImageUrl1})

The diagram should appear above.`
                  .replace(/\n/g, '<br>')
                  .replace(/!\[UML Diagram\]\((https:\/\/www\.plantuml\.com\/plantuml\/[^)]+)\)/g, '<div class="my-4"><img src="$1" alt="UML Diagram" class="max-w-full h-auto rounded-lg border border-[var(--border-light)] shadow-sm" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\'; console.error(\'Failed to load image:\', this.src)" onload="console.log(\'Image loaded successfully:\', this.src)" /><div class="hidden p-4 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-secondary)] text-sm"><strong>UML Diagram</strong><br/>Image failed to load. <a href="$1" target="_blank" class="text-[var(--accent-primary)] hover:underline">Click here to view</a></div></div>')
              }}
            />
          </div>
        </div>

        <div className="text-sm text-[var(--text-secondary)]">
          <p>Check the browser console for image loading logs.</p>
          <p>If images don't load, check:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Network connectivity to plantuml.com</li>
            <li>CORS settings</li>
            <li>Image URL format</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
