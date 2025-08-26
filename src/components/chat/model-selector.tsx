"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { chatApi, ModelInfo } from "@/lib/api/chat"
import { cn } from "@/lib/utils"

interface ModelSelectorProps {
  selectedModel: string
  onModelSelect: (model: string) => void
  className?: string
}

export function ModelSelector({ selectedModel, onModelSelect, className }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true)
        const availableModels = await chatApi.getAvailableModels()
        setModels(availableModels)
      } catch (error) {
        console.error("Failed to load models:", error)
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [])

  const getModelDisplayName = (model: string) => {
    // Extract a shorter, more readable name
    if (model.includes('gpt-4o-mini')) return 'GPT-4o Mini'
    if (model.includes('gpt-4o')) return 'GPT-4o'
    if (model.includes('gpt-4')) return 'GPT-4'
    if (model.includes('gpt-3.5')) return 'GPT-3.5 Turbo'
    if (model.includes('claude-3-7-sonnet')) return 'Claude 3.7 Sonnet'
    if (model.includes('claude-3-5-sonnet')) return 'Claude 3.5 Sonnet'
    if (model.includes('claude-3-opus')) return 'Claude 3 Opus'
    if (model.includes('claude-3-haiku')) return 'Claude 3 Haiku'
    if (model.includes('deepseek')) return 'DeepSeek'
    if (model.includes('gemini-2.5-pro')) return 'Gemini 2.5 Pro'
    if (model.includes('gemini-2.5-flash')) return 'Gemini 2.5 Flash'
    if (model.includes('gemini-2.0-flash')) return 'Gemini 2.0 Flash'
    if (model.includes('gemini-1.5-flash')) return 'Gemini 1.5 Flash'
    return model
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return '🤖'
      case 'anthropic':
        return '🧠'
      case 'deepseek':
        return '🔍'
      case 'google':
        return '🌟'
      default:
        return '🤖'
    }
  }

  const getModelCost = (model: string) => {
    // Approximate cost indicators
    if (model.includes('opus') || model.includes('gpt-4o') || model.includes('gemini-2.5-pro')) {
      return '💎' // Expensive
    }
    if (model.includes('sonnet') || model.includes('gpt-4') || model.includes('gemini-2.5-flash')) {
      return '💰' // Medium
    }
    if (model.includes('haiku') || model.includes('gpt-3.5') || model.includes('gemini-1.5-flash')) {
      return '💵' // Cheap
    }
    return '💵'
  }

  const getModelSpeed = (model: string) => {
    // Speed indicators
    if (model.includes('flash') || model.includes('haiku') || model.includes('gpt-3.5')) {
      return '⚡' // Fast
    }
    if (model.includes('sonnet') || model.includes('gpt-4o')) {
      return '🏃' // Medium
    }
    if (model.includes('opus') || model.includes('gpt-4') || model.includes('pro')) {
      return '🐌' // Slow
    }
    return '🏃'
  }

  if (loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("w-40", className)}
        disabled
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Loading models...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("w-40 justify-between", className)}
        >
          <div className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="truncate">{getModelDisplayName(selectedModel)}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 p-1 bg-[var(--bg-elevated-secondary)] border border-token-border-light shadow-lg rounded-xl animate-in slide-in-from-top-2 duration-200" 
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          AI Models
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="h-px bg-token-border-light my-1" />
        
        {models.map((provider) => (
          <div key={provider.provider}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                {getProviderIcon(provider.provider)} {provider.provider}
              </DropdownMenuLabel>
              
              {provider.models.map((model) => (
                <DropdownMenuItem
                  key={model}
                  onClick={() => onModelSelect(model)}
                  className={cn(
                    "group cursor-pointer mx-1 my-0.5 px-3 py-2.5 rounded-lg text-[var(--text-primary)] text-sm hover:bg-[var(--interactive-bg-secondary-hover)] focus:bg-[var(--interactive-bg-secondary-hover)] transition-colors duration-150",
                    selectedModel === model && "bg-[var(--interactive-bg-secondary-hover)] border border-[var(--border-primary)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">
                        {selectedModel === model ? "✓" : "○"}
                      </span>
                      <span className="font-medium">{getModelDisplayName(model)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <span title="Cost">{getModelCost(model)}</span>
                      <span title="Speed">{getModelSpeed(model)}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            
            {provider.provider !== models[models.length - 1]?.provider && (
              <DropdownMenuSeparator className="h-px bg-token-border-light my-1" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
