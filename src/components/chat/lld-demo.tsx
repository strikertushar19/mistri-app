"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface LLDDemoProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: number
  role: 'user' | 'bot'
  content: string
  hasDiagram?: boolean
  diagramCode?: string
}

export function LLDDemo({ isOpen, onClose }: LLDDemoProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'bot',
      content: `Welcome to the Low Level Design Demo! 🚀

I can show you various aspects of system design including:

• UML Diagrams (Class, Sequence, Component)
• Design Patterns (Singleton, Factory, Observer, etc.)
• System Architecture
• Database Schemas
• API Documentation

Use the commands on the left or type your request below!`
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeCommand, setActiveCommand] = useState<string | null>(null)
  const [mermaidLoaded, setMermaidLoaded] = useState(false)
  const [mermaidLoading, setMermaidLoading] = useState(false)

  // Load Mermaid script
  useEffect(() => {
    if (isOpen && !mermaidLoaded) {
      setMermaidLoading(true)
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js'
      script.onload = () => {
        if (window.mermaid) {
          window.mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            themeVariables: {
              primaryColor: '#667eea',
              primaryTextColor: '#2d3748',
              primaryBorderColor: '#667eea',
              lineColor: '#4a5568',
              secondaryColor: '#f7fafc',
              tertiaryColor: '#edf2f7'
            }
          })
          setMermaidLoaded(true)
          setMermaidLoading(false)
        }
      }
      script.onerror = () => {
        console.error('Failed to load Mermaid script')
        setMermaidLoading(false)
      }
      document.head.appendChild(script)
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }
  }, [isOpen, mermaidLoaded])

  // Render Mermaid diagrams when messages change
  useEffect(() => {
    if (mermaidLoaded) {
      const renderDiagrams = async () => {
        if (window.mermaid) {
          try {
            await window.mermaid.run()
          } catch (error) {
            console.error('Error rendering Mermaid diagrams:', error)
          }
        }
      }
      
      setTimeout(renderDiagrams, 100)
    }
  }, [messages, mermaidLoaded])

  const addMessage = (content: string, role: 'user' | 'bot' = 'bot', hasDiagram = false, diagramCode?: string) => {
    const newMessage: Message = {
      id: Date.now(),
      role,
      content,
      hasDiagram,
      diagramCode
    }
    setMessages(prev => [...prev, newMessage])
  }

  const executeCommand = (command: string) => {
    addMessage(command, 'user')
    setActiveCommand(command)
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      processCommand(command)
    }, 1500)
  }

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('architecture')) {
      const diagramCode = `graph TB
    A[Client Applications] --> B[Load Balancer]
    B --> C[API Gateway]
    C --> D[Authentication Service]
    C --> E[User Service]
    C --> F[Order Service]
    C --> G[Payment Service]
    E --> H[(User Database)]
    F --> I[(Order Database)]
    G --> J[(Payment Database)]
    D --> K[(Redis Cache)]
    L[Message Queue] --> E
    L --> F
    L --> G`
      
      addMessage(`🏛️ System Architecture Overview

Our system follows a microservices architecture pattern with the following key components:

📊 Architecture Metrics:
• 3 Core Services
• 4 Databases
• 99.9% Uptime Target

🏗️ Architecture Highlights:
• Microservices architecture for scalability
• Load balancer for high availability
• API Gateway for unified access point
• Redis for session management and caching
• Message queue for async communication`, 'bot', true, diagramCode)
    } else if (lowerCommand.includes('uml') || lowerCommand.includes('class diagram')) {
      const diagramCode = `classDiagram
    class User {
        +String userId
        +String email
        +String name
        +Date createdAt
        +login()
        +logout()
        +updateProfile()
    }
    class Order {
        +String orderId
        +String userId
        +Date orderDate
        +OrderStatus status
        +Double totalAmount
        +createOrder()
        +updateStatus()
        +calculateTotal()
    }
    class Product {
        +String productId
        +String name
        +Double price
        +Integer stock
        +String category
        +updateStock()
        +getDetails()
    }
    class OrderItem {
        +String itemId
        +String productId
        +Integer quantity
        +Double price
        +calculateSubtotal()
    }
    User ||--o{ Order : places
    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : includes`
      
      addMessage(`🏗️ Class Diagram - E-commerce System

Our e-commerce system consists of the following core classes:

👤 User Class:
• userId: String
• email: String
• name: String
• createdAt: Date
• Methods: login(), logout(), updateProfile()

🛒 Order Class:
• orderId: String
• userId: String
• orderDate: Date
• status: OrderStatus
• totalAmount: Double
• Methods: createOrder(), updateStatus(), calculateTotal()

📦 Product Class:
• productId: String
• name: String
• price: Double
• stock: Integer
• category: String
• Methods: updateStock(), getDetails()

🔗 Relationships:
• User ||--o{ Order : places (1:N)
• Order ||--o{ OrderItem : contains (1:N)
• Product ||--o{ OrderItem : includes (1:N)`, 'bot', true, diagramCode)
    } else if (lowerCommand.includes('design pattern')) {
      addMessage(`🎨 Design Patterns Implementation

Here are the key design patterns used in our system:

📋 Singleton Pattern
Ensures a class has only one instance and provides global access to it.

📋 Factory Pattern
Creates objects without specifying their concrete classes.

📋 Observer Pattern
Defines a subscription mechanism to notify multiple objects about events.

💡 Pattern Benefits:
• Singleton: Memory efficiency, global state management
• Factory: Loose coupling, easy extension
• Observer: Event-driven architecture, decoupling`)
    } else if (lowerCommand.includes('database')) {
      const diagramCode = `erDiagram
    USER {
        uuid user_id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        datetime created_at
        datetime updated_at
    }
    ORDER {
        uuid order_id PK
        uuid user_id FK
        decimal total_amount
        string status
        datetime order_date
        datetime updated_at
    }
    PRODUCT {
        uuid product_id PK
        string name
        decimal price
        integer stock_quantity
        string category
        text description
        datetime created_at
    }
    ORDER_ITEM {
        uuid item_id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
    }
    USER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : includes`
      
      addMessage(`🗃️ Database Schema Design

Our database follows a normalized design with the following key tables:

👥 Users Table:
• user_id (UUID, Primary Key)
• email (VARCHAR(255), Unique)
• password_hash (VARCHAR(255))
• first_name (VARCHAR(100))
• last_name (VARCHAR(100))
• created_at (TIMESTAMP)

🛒 Orders Table:
• order_id (UUID, Primary Key)
• user_id (UUID, Foreign Key)
• total_amount (DECIMAL)
• status (VARCHAR)
• order_date (TIMESTAMP)

📦 Products Table:
• product_id (UUID, Primary Key)
• name (VARCHAR)
• price (DECIMAL)
• stock_quantity (INTEGER)
• category (VARCHAR)
• description (TEXT)
• created_at (TIMESTAMP)

🔗 Relationships:
• USER ||--o{ ORDER : places
• ORDER ||--o{ ORDER_ITEM : contains
• PRODUCT ||--o{ ORDER_ITEM : includes

📈 Performance Indexes:
• idx_users_email ON users(email)
• idx_orders_user_id ON orders(user_id)
• idx_orders_date ON orders(order_date)`, 'bot', true, diagramCode)
    } else if (lowerCommand.includes('api')) {
      const diagramCode = `graph LR
    subgraph "API Gateway"
        A[Load Balancer]
        B[Rate Limiter]
        C[Auth Middleware]
    end
    
    subgraph "Services"
        D[User Service]
        E[Order Service]
        F[Payment Service]
        G[Notification Service]
    end
    
    subgraph "Databases"
        H[(User DB)]
        I[(Order DB)]
        J[(Payment DB)]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    D --> H
    E --> I
    F --> J`
      
      addMessage(`🔗 REST API Endpoints

Our API follows RESTful design principles with the following endpoints:

👤 User Management:
GET    /api/v1/users          # Get all users
GET    /api/v1/users/:id      # Get user by ID
POST   /api/v1/users          # Create new user
PUT    /api/v1/users/:id      # Update user
DELETE /api/v1/users/:id      # Delete user

🛒 Order Management:
GET    /api/v1/orders         # Get all orders
GET    /api/v1/orders/:id     # Get order by ID
POST   /api/v1/orders         # Create new order
PUT    /api/v1/orders/:id     # Update order status
GET    /api/v1/users/:id/orders # Get user's orders

🔐 Authentication:
POST   /api/v1/auth/login     # User login
POST   /api/v1/auth/logout    # User logout
POST   /api/v1/auth/refresh   # Refresh token
POST   /api/v1/auth/forgot    # Password reset

📋 API Standards:
• RESTful design principles
• JWT token-based authentication
• Rate limiting (100 req/min per IP)
• CORS enabled for web clients
• Swagger/OpenAPI documentation`, 'bot', true, diagramCode)
    } else if (lowerCommand.includes('sequence')) {
      const diagramCode = `sequenceDiagram
    participant C as Client
    participant AG as API Gateway
    participant AS as Auth Service
    participant OS as Order Service
    participant PS as Payment Service
    participant DB as Database
    participant MQ as Message Queue
    
    C->>AG: POST /orders
    AG->>AS: Validate token
    AS-->>AG: Token valid
    AG->>OS: Create order
    OS->>DB: Save order
    DB-->>OS: Order saved
    OS->>PS: Process payment
    PS->>PS: Validate payment
    PS-->>OS: Payment successful
    OS->>MQ: Publish order event
    OS-->>AG: Order created
    AG-->>C: 201 Created
    MQ->>OS: Update inventory
    MQ->>OS: Send confirmation email`
      
      addMessage(`⏱️ Sequence Diagram - Order Processing

The order processing flow follows this sequence:

1. Client sends POST /orders request
2. API Gateway receives and validates request
3. Authentication Service validates JWT token
4. Order Service creates order in database
5. Payment Service processes payment
6. Message Queue publishes order event
7. Inventory Service updates stock
8. Email Service sends confirmation

🔄 Process Flow:
• Client authentication validation
• Order creation and persistence
• Payment processing
• Event-driven notifications
• Inventory management

This ensures reliable, scalable order processing with proper error handling and rollback mechanisms.`, 'bot', true, diagramCode)
    } else if (lowerCommand.includes('component')) {
      const diagramCode = `graph TB
    subgraph "Frontend Layer"
        A[React Components]
        B[Redux Store]
        C[API Client]
    end
    
    subgraph "API Layer"
        D[Controllers]
        E[Middleware]
        F[Validators]
    end
    
    subgraph "Business Layer"
        G[Services]
        H[Business Logic]
        I[DTOs]
    end
    
    subgraph "Data Layer"
        J[Repositories]
        K[Models]
        L[Database]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> J
    J --> K
    K --> L`
      
      addMessage(`🔧 Component Architecture

Our application follows a layered architecture with clear separation of concerns:

🎨 Frontend Layer:
• React Components (UI)
• Redux Store (State Management)
• API Client (HTTP Communication)

🔌 API Layer:
• Controllers (Request Handling)
• Middleware (Authentication, Validation)
• Validators (Input Validation)

⚙️ Business Layer:
• Services (Business Logic)
• Business Logic (Core Rules)
• DTOs (Data Transfer Objects)

💾 Data Layer:
• Repositories (Data Access)
• Models (Data Structure)
• Database (Persistence)

📊 Architecture Metrics:
• 4 Layers
• 12 Components
• 95% Test Coverage

This layered approach ensures maintainability, testability, and scalability.`, 'bot', true, diagramCode)
    } else {
      addMessage("I can help you with system architecture, UML diagrams, design patterns, database schemas, and API documentation. Try one of the commands from the sidebar!")
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return
    
    addMessage(inputValue, 'user')
    const message = inputValue
    setInputValue("")
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      processCommand(message)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-7xl h-[90vh] bg-[var(--bg-primary)] rounded-3xl shadow-2xl flex overflow-hidden border border-[var(--border-light)]">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-6 flex flex-col">
          <div className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏗️ LLD Demo Bot
          </div>
          
          {/* Quick Commands */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
              Quick Commands
            </div>
            {[
              { icon: '🏛️', label: 'System Architecture', command: 'show system architecture' },
              { icon: '📊', label: 'UML Diagrams', command: 'show uml diagrams' },
              { icon: '🎨', label: 'Design Patterns', command: 'show design patterns' },
              { icon: '🗃️', label: 'Database Schema', command: 'show database schema' },
              { icon: '🔗', label: 'API Endpoints', command: 'show api endpoints' },
              { icon: '🏗️', label: 'Class Diagrams', command: 'show class diagrams' },
              { icon: '⏱️', label: 'Sequence Diagrams', command: 'show sequence diagrams' },
              { icon: '🔧', label: 'Components', command: 'show component architecture' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => executeCommand(item.command)}
                className={`w-full p-3 mb-2 bg-[var(--interactive-bg-secondary-default)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg cursor-pointer text-sm transition-all duration-300 text-left hover:bg-[var(--interactive-bg-secondary-hover)] hover:transform hover:-translate-y-0.5 ${
                  activeCommand === item.command ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600' : ''
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* System Metrics */}
          <div className="mt-auto">
            <div className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
              System Metrics
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-light)] text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-xs text-[var(--text-secondary)]">Components</div>
              </div>
              <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-light)] text-center">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-xs text-[var(--text-secondary)]">Patterns</div>
              </div>
              <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-light)] text-center">
                <div className="text-2xl font-bold text-blue-600">15</div>
                <div className="text-xs text-[var(--text-secondary)]">APIs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Low Level Design Demo
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Interactive system architecture and design pattern showcase
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-secondary)]">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      }`}>
                        {message.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {message.role === 'user' ? 'You' : 'LLD Assistant'}
                      </span>
                    </div>
                    <div className={`p-5 rounded-2xl shadow-md border border-[var(--border-light)] ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-10' 
                        : 'bg-[var(--bg-primary)] text-[var(--text-primary)] ml-10'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.hasDiagram && message.diagramCode && (
                        <div className="mt-4 p-4 bg-[var(--bg-elevated-secondary)] rounded-xl border-2 border-[var(--border-light)] overflow-x-auto shadow-sm">
                          <div className="text-xs text-[var(--text-secondary)] mb-2 font-medium">
                            📊 Interactive Diagram
                          </div>
                          {mermaidLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <div className="w-4 h-4 border-2 border-[var(--border-light)] border-t-blue-600 rounded-full animate-spin"></div>
                                <span>Loading diagram...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mermaid">
                              {message.diagramCode}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl mr-12">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-center text-sm font-semibold mr-3">
                        🤖
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">LLD Assistant</span>
                    </div>
                    <div className="p-5 rounded-2xl shadow-md border border-[var(--border-light)] bg-[var(--bg-primary)] ml-10">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <div className="w-4 h-4 border-2 border-[var(--border-light)] border-t-blue-600 rounded-full animate-spin"></div>
                        <span>Generating design documentation...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-light)]">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about system design, UML diagrams, patterns..."
                className="flex-1 p-3 border-2 border-[var(--border-light)] rounded-xl text-base outline-none transition-colors focus:border-blue-600 bg-[var(--bg-elevated-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none rounded-xl cursor-pointer font-semibold transition-all duration-200 ${
                  inputValue.trim() && !isLoading 
                    ? 'hover:transform hover:-translate-y-0.5' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
