"use client"

import { AnalysisResponse } from "@/components/chat/analysis-response"

const testContent = `{
  "analysis_type": "lld_analysis",
  "repository_overview": {
    "name": "Mistri-website",
    "description": "A Next.js website showcasing code analysis features with Supabase integration for a waitlist.",
    "main_technology": "Next.js, React, Tailwind CSS, Lucide-React, Framer Motion, Supabase"
  },
  "system_architecture": {
    "overview": "The system is a client-server architecture. The client-side is built with Next.js and React, handling UI rendering and user interactions. The server-side interacts with Supabase for waitlist management.",
    "components": [
      {
        "name": "UI Component Layer",
        "purpose": "Handles user interface rendering and interactions.",
        "responsibilities": [
          "Rendering website pages",
          "Handling user input",
          "Displaying animations and visual effects"
        ],
        "dependencies": ["Next.js", "React", "Tailwind CSS", "Lucide-React", "Framer Motion", "UI Component Library"]
      },
      {
        "name": "API Interaction Layer",
        "purpose": "Communicates with the Supabase database.",
        "responsibilities": [
          "Fetching waitlist data",
          "Adding new waitlist entries",
          "Managing database interactions"
        ],
        "dependencies": ["Supabase JS Client Library"]
      },
      {
        "name": "Supabase Database",
        "purpose": "Stores and manages the waitlist data.",
        "responsibilities": [
          "Storing waitlist entries",
          "Providing data to API layer"
        ],
        "dependencies": []
      }
    ],
    "data_flow": "Users interact with the UI components. UI components trigger API calls to interact with Supabase. Supabase responds with data to the UI components. Data is persisted in Supabase."
  },
  "detailed_design": {
    "classes": [
      {
        "name": "WaitlistEntry",
        "purpose": "Represents a single waitlist entry.",
        "attributes": ["Id: number", "Name: string", "Email: string", "Created_at: string"],
        "methods": [],
        "relationships": []
      },
      {
        "name": "WaitlistService",
        "purpose": "Handles interactions with Supabase for waitlist management.",
        "attributes": ["supabaseClient: SupabaseClient"],
        "methods": ["addEntry(entry: WaitlistEntry): Promise<void>", "getEntries(): Promise<WaitlistEntry[]>"],
        "relationships": []
      }
    ],
    "interfaces": [],
    "data_structures": []
  },
  "design_patterns": [
    {
      "pattern": "Model-View-Controller (MVC)",
      "description": "The website uses an MVC-like pattern where components handle the view and potentially controller aspects, while services manage model operations (database interactions).",
      "benefits": [
        "Separation of concerns",
        "Improved code organization",
        "Easier maintainability"
      ],
      "location": "throughout the app folder"
    }
  ],
  "algorithms": [],
  "error_handling": {
    "strategies": ["Try-catch blocks for asynchronous operations", "Error messages displayed to the user"],
    "exceptions": ["Network errors", "Database errors"]
  },
  "security_considerations": [
    "Use of environment variables to store sensitive data (Supabase API key)",
    "Input validation for waitlist form"
  ],
  "performance_considerations": [
    "Optimization of data fetching using Supabase's efficient query methods",
    "Lazy loading for large components"
  ],
  "recommendations": [
    "Implement client-side input validation before API calls",
    "Add authentication to Admin Waitlist page",
    "Implement comprehensive logging and monitoring"
  ],
  "plantuml_diagrams": {
    "class_diagram": "@startuml\\nclass WaitlistEntry {\\n  -Id: number\\n  -Name: string\\n  -Email: string\\n  -Created_at: string\\n}\\nclass WaitlistService {\\n  -supabaseClient: SupabaseClient\\n  +addEntry(entry: WaitlistEntry): Promise<void>\\n  +getEntries(): Promise<WaitlistEntry[]>\\n}\\n@enduml",
    "component_diagram": "@startuml\\n[UI Component Layer] --> [API Interaction Layer]\\n[API Interaction Layer] --> [Supabase Database]\\n@enduml",
    "sequence_diagram": "@startuml\\nactor User\\nUser -> UI Component Layer: Submits waitlist form\\nUI Component Layer -> API Interaction Layer: Send waitlist data\\nAPI Interaction Layer -> Supabase Database: Insert entry\\nSupabase Database -> API Interaction Layer: Success/Failure\\nAPI Interaction Layer -> UI Component Layer: Response\\nUI Component Layer -> User: Displays message\\n@enduml",
    "activity_diagram": "@startuml\\nstart\\n:User submits waitlist form;\\n:UI Component Layer validates input;\\nif (valid input) then (yes)\\n  :API Interaction Layer sends to Supabase;\\n  :Supabase Database inserts entry;\\n  :API Interaction Layer returns success/error;\\n  :UI Component Layer displays message;\\nelse (no)\\n  :UI Component Layer displays error message;\\nend\\nstop\\n@enduml"
  }
}`

export function TestAnalysis() {
  return (
    <div className="p-4">
      <h2>Test Analysis Response</h2>
      <AnalysisResponse content={testContent} />
    </div>
  )
}
