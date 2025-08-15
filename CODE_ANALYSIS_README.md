# Code Analysis Feature - Mistri App

## Overview

The Code Analysis feature provides comprehensive analysis capabilities for codebases from multiple sources including GitHub, GitLab, Bitbucket, and custom code uploads. The system supports both Low Level Design (LLD) and High Level Design (HLD) analysis along with additional code quality, security, and performance assessments.

## Features

### 🔗 Repository Connection
- **GitHub Integration**: Connect GitHub repositories via OAuth or personal access tokens
- **GitLab Integration**: Connect GitLab repositories with API access
- **Bitbucket Integration**: Connect Bitbucket repositories
- **Custom Code Upload**: Upload local code files for analysis
- **Repository Management**: View, manage, and disconnect connected repositories

### 📊 Analysis Types

#### 1. Low Level Design (LLD)
- **Component Analysis**: Detailed analysis of classes, methods, and data structures
- **Design Patterns**: Detection of common design patterns (Singleton, Factory, Observer, etc.)
- **Code Complexity**: Cyclomatic complexity and maintainability metrics
- **Method Signatures**: Analysis of method parameters and return types
- **Data Structures**: Identification and analysis of data structures used

#### 2. High Level Design (HLD)
- **System Architecture**: Analysis of overall system architecture
- **Component Relationships**: Mapping of component interactions and dependencies
- **Data Flow**: Visualization of data flow between components
- **Deployment Architecture**: Analysis of deployment patterns and infrastructure

#### 3. Code Quality Analysis
- **Code Smells**: Detection of common code smells and anti-patterns
- **Best Practices**: Compliance with language-specific best practices
- **Code Complexity**: Metrics for code complexity and maintainability
- **Performance Indicators**: Code-level performance analysis

#### 4. Security Analysis
- **Vulnerability Scanning**: Detection of common security vulnerabilities
- **Dependency Analysis**: Security assessment of third-party dependencies
- **Compliance Checks**: Industry-standard compliance validation
- **Threat Modeling**: Automated threat modeling and risk assessment

#### 5. Performance Analysis
- **Bottleneck Detection**: Identification of performance bottlenecks
- **Memory Usage**: Analysis of memory consumption patterns
- **CPU Profiling**: Performance profiling and optimization suggestions
- **Resource Utilization**: Analysis of resource usage patterns

#### 6. Database Analysis
- **Schema Analysis**: Database schema structure and relationships
- **Query Optimization**: SQL query performance analysis
- **Indexing Recommendations**: Database indexing optimization
- **Data Flow**: Database interaction patterns

## Architecture

### Frontend Components

```
src/components/codebase/
├── code-analysis-dashboard.tsx    # Main dashboard component
├── repository-connector.tsx       # Repository connection interface
├── analysis-types.tsx            # Analysis type selection
├── analysis-results.tsx          # Results display with tabs
├── analysis-stats.tsx            # Statistics overview
└── recent-analyses.tsx           # Analysis history
```

### API Structure

```
src/app/api/
├── repositories/
│   └── route.ts                  # Repository management
├── analysis/
│   ├── route.ts                  # Analysis operations
│   ├── [id]/route.ts            # Individual analysis
│   └── types/route.ts           # Analysis types
└── lib/api/
    └── code-analysis.ts         # API service functions
```

### Data Models

#### Repository
```typescript
interface Repository {
  id: string
  name: string
  provider: 'github' | 'gitlab' | 'bitbucket' | 'custom'
  url: string
  description?: string
  lastAnalyzed?: string
  status: 'connected' | 'disconnected' | 'analyzing'
}
```

#### Analysis Result
```typescript
interface AnalysisResult {
  id: string
  repositoryId: string
  analysisType: string
  status: 'pending' | 'analyzing' | 'completed' | 'failed'
  score: number
  issues: number
  recommendations: number
  startedAt: string
  completedAt?: string
  duration?: string
  results: {
    components?: ComponentAnalysis[]
    patterns?: string[]
    architecture?: ArchitectureAnalysis
    dataFlow?: string[]
    metrics?: AnalysisMetrics
  }
}
```

## Implementation Status

### ✅ Completed
- [x] UI Components and Layout
- [x] Repository Connection Interface
- [x] Analysis Type Selection
- [x] Results Display with Tabs
- [x] Statistics Dashboard
- [x] Recent Analyses History
- [x] API Route Structure
- [x] TypeScript Interfaces
- [x] Demo Data Integration

### 🔄 In Progress
- [ ] Backend API Implementation
- [ ] Database Schema Design
- [ ] Analysis Engine Integration
- [ ] Real-time Progress Updates
- [ ] Export Functionality

### 📋 TODO
- [ ] Authentication & Authorization
- [ ] GitHub/GitLab/Bitbucket API Integration
- [ ] File Upload Handling
- [ ] Analysis Job Queue
- [ ] WebSocket for Real-time Updates
- [ ] PDF/JSON Export
- [ ] Email Notifications
- [ ] User Permissions
- [ ] Rate Limiting
- [ ] Error Handling & Logging

## API Endpoints

### Repository Management
- `GET /api/repositories` - Get connected repositories
- `POST /api/repositories` - Connect new repository
- `DELETE /api/repositories/[id]` - Disconnect repository

### Analysis Operations
- `GET /api/analysis` - Get analysis history
- `POST /api/analysis` - Start new analysis
- `GET /api/analysis/[id]` - Get analysis result
- `DELETE /api/analysis/[id]` - Delete analysis
- `GET /api/analysis/types` - Get available analysis types

## Usage

### 1. Connect Repository
1. Navigate to the Code Analysis page
2. Click "Add New" in the Repository Connection section
3. Enter repository URL and select provider
4. Click "Connect Repository"

### 2. Select Analysis Type
1. Choose from available analysis types (LLD, HLD, etc.)
2. Review analysis features and estimated time
3. Click "Start Analysis"

### 3. View Results
1. Monitor analysis progress
2. View detailed results in tabs
3. Export results in various formats
4. Review recommendations and issues

## Technical Requirements

### Frontend
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Lucide React Icons
- React Hooks

### Backend (To be implemented)
- Node.js/Next.js API Routes
- Database (PostgreSQL/MongoDB)
- Job Queue (Redis/Bull)
- WebSocket Support
- File Storage (AWS S3/Local)

### External Integrations
- GitHub API
- GitLab API
- Bitbucket API
- Analysis Engines (SonarQube, ESLint, etc.)

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   ```env
   # Database
   DATABASE_URL=your_database_url
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   # GitLab OAuth
   GITLAB_CLIENT_ID=your_gitlab_client_id
   GITLAB_CLIENT_SECRET=your_gitlab_client_secret
   
   # Bitbucket OAuth
   BITBUCKET_CLIENT_ID=your_bitbucket_client_id
   BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support, please contact the development team or create an issue in the repository.
