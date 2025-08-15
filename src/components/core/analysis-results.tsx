'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Code, 
  GitBranch, 
  FileText, 
  Layers, 
  TestTube, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface AnalysisResult {
  id: string;
  task_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  result: any;
}

interface AnalysisResultsProps {
  jobId: string;
  className?: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ jobId, className = '' }) => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('schema');

  useEffect(() => {
    fetchResults();
  }, [jobId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
              const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${API_BASE_URL}/repo/job/${jobId}/results`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-results-${jobId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Results downloaded');
  };

  const getTaskIcon = (taskType: string) => {
    const icons: Record<string, React.ReactNode> = {
      schema_extraction: <Database className="h-4 w-4" />,
      api_specification: <Code className="h-4 w-4" />,
      uml_generation: <GitBranch className="h-4 w-4" />,
      erd_generation: <Database className="h-4 w-4" />,
      ats_extraction: <FileText className="h-4 w-4" />,
      architecture_summary: <Layers className="h-4 w-4" />,
      design_pattern_detector: <Code className="h-4 w-4" />,
      unit_test_analyzer: <TestTube className="h-4 w-4" />,
    };
    return icons[taskType] || <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSchemaExtraction = (result: any) => {
    if (!result || (!result.schemas && !result.database_structures)) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No schema data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {/* Database Structures */}
        {result.database_structures && Array.isArray(result.database_structures) && result.database_structures.map((table: any, index: number) => (
          <Card key={`db-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Table: {table.name || 'Unnamed Table'}
              </CardTitle>
              <CardDescription>
                Database table structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {table.columns && Array.isArray(table.columns) && table.columns.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Columns:</h4>
                    <div className="grid gap-2">
                      {table.columns.map((column: any, colIndex: number) => (
                        <div key={colIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{column.name}</span>
                            <span className="text-gray-500 ml-2">({column.type})</span>
                          </div>
                          <div className="flex gap-1">
                            {column.primaryKey && (
                              <Badge variant="default" className="text-xs">Primary Key</Badge>
                            )}
                            {column.unique && (
                              <Badge variant="secondary" className="text-xs">Unique</Badge>
                            )}
                            {column.nullable === false && (
                              <Badge variant="outline" className="text-xs">Not Null</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Schemas */}
        {Array.isArray(result.schemas) && result.schemas.map((schema: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {schema.name || 'Unnamed Schema'}
              </CardTitle>
              <CardDescription>
                {schema.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schema.file_path && (
                  <div className="text-sm text-gray-600">
                    <strong>File:</strong> {schema.file_path}
                  </div>
                )}
                {schema.fields && Array.isArray(schema.fields) && schema.fields.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Fields:</h4>
                    <div className="grid gap-2">
                      {schema.fields.map((field: any, fieldIndex: number) => (
                        <div key={fieldIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{field.name}</span>
                            <span className="text-gray-500 ml-2">({field.type})</span>
                          </div>
                          <div className="flex gap-1">
                            {field.constraints && (
                              <Badge variant="secondary" className="text-xs">
                                {field.constraints}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {schema.relationships && Array.isArray(schema.relationships) && schema.relationships.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Relationships:</h4>
                    <div className="space-y-1">
                      {schema.relationships.map((rel: any, relIndex: number) => (
                        <div key={relIndex} className="text-sm text-gray-600">
                          {rel.model} ({rel.type})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAPISpecification = (result: any) => {
    if (!result || !result.endpoints) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No API specification data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {Array.isArray(result.endpoints) && result.endpoints.map((endpoint: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                <Badge variant="outline">{endpoint.method}</Badge>
                <span className="font-mono text-sm">{endpoint.path}</span>
              </CardTitle>
              <CardDescription>
                {endpoint.handler || 'No handler specified'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpoint.file_path && (
                  <div className="text-sm text-gray-600">
                    <strong>File:</strong> {endpoint.file_path}
                  </div>
                )}
                {endpoint.security && (
                  <Badge variant="secondary">{endpoint.security}</Badge>
                )}
                {endpoint.parameters && Array.isArray(endpoint.parameters) && endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Parameters:</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param: any, paramIndex: number) => (
                        <div key={paramIndex} className="p-2 bg-gray-50 rounded">
                          <div className="font-medium">{param.name}</div>
                          <div className="text-sm text-gray-600">{param.description}</div>
                          {param.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {endpoint.response && (
                  <div>
                    <h4 className="font-medium mb-2">Response:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderUMLGeneration = (result: any) => {
    if (!result || !result.classes) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No UML data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {Array.isArray(result.classes) && result.classes.map((cls: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {cls.name || 'Unnamed Class'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cls.attributes && Array.isArray(cls.attributes) && cls.attributes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attributes:</h4>
                    <div className="grid gap-2">
                      {cls.attributes.map((attr: any, attrIndex: number) => (
                        <div key={attrIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{attr.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{attr.type}</span>
                            <Badge variant="outline" className="text-xs">{attr.visibility}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {cls.methods && Array.isArray(cls.methods) && cls.methods.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Methods:</h4>
                    <div className="space-y-2">
                      {cls.methods.map((method: any, methodIndex: number) => (
                        <div key={methodIndex} className="p-2 bg-gray-50 rounded">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-600">
                            Return: {method.returnType || 'void'}
                          </div>
                          {method.parameters && Array.isArray(method.parameters) && method.parameters.length > 0 && (
                            <div className="text-sm text-gray-600">
                              Parameters: {method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ')}
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs mt-1">{method.visibility}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {result.relationships && Array.isArray(result.relationships) && result.relationships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.relationships.map((rel: any, relIndex: number) => (
                  <div key={relIndex} className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">{rel.source}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{rel.target}</span>
                    <Badge variant="outline" className="ml-2">{rel.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderERDGeneration = (result: any) => {
    if (!result || !result.entities) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No ERD data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {Array.isArray(result.entities) && result.entities.map((entity: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {entity.name || 'Unnamed Entity'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entity.attributes && Array.isArray(entity.attributes) && entity.attributes.length > 0 && (
                <div className="space-y-2">
                  {entity.attributes.map((attr: any, attrIndex: number) => (
                    <div key={attrIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{attr.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{attr.type}</span>
                        {attr.isPrimaryKey && <Badge variant="default" className="text-xs">PK</Badge>}
                        {attr.isForeignKey && <Badge variant="secondary" className="text-xs">FK</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {result.relationships && Array.isArray(result.relationships) && result.relationships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.relationships.map((rel: any, relIndex: number) => (
                  <div key={relIndex} className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">{rel.source}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{rel.target}</span>
                    <Badge variant="outline" className="ml-2">{rel.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderArchitectureSummary = (result: any) => {
    if (!result) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No architecture data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {result.summary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{result.summary}</p>
            </CardContent>
          </Card>
        )}
        
        {result.tech_stack && Array.isArray(result.tech_stack) && result.tech_stack.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.tech_stack.map((tech: string, index: number) => (
                  <Badge key={index} variant="outline">{tech}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {result.components && Array.isArray(result.components) && result.components.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.components.map((comp: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{comp.name}</h4>
                      <Badge variant="outline">{comp.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comp.description}</p>
                    {comp.depends_on && Array.isArray(comp.depends_on) && comp.depends_on.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Dependencies: {comp.depends_on.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {result.patterns && Array.isArray(result.patterns) && result.patterns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Design Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.patterns.map((pattern: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{pattern.name}</div>
                    <div className="text-sm text-gray-600">{pattern.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderDesignPatterns = (result: any) => {
    // Handle the new structure where design patterns might be in raw_result
    let patterns = result.patterns;
    
    if (!patterns && result.raw_result) {
      try {
        // Try to parse the raw_result if it's a JSON string
        const parsed = JSON.parse(result.raw_result);
        patterns = parsed.patterns;
      } catch (e) {
        // If parsing fails, show the raw result
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Design Patterns (Raw Result)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {result.raw_result}
              </pre>
            </CardContent>
          </Card>
        );
      }
    }
    
    if (!patterns) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No design patterns data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {Array.isArray(result.patterns) && result.patterns.map((pattern: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {pattern.name || 'Unnamed Pattern'}
              </CardTitle>
              <CardDescription>
                {pattern.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pattern.components && Array.isArray(pattern.components) && pattern.components.length > 0 && (
                <div className="space-y-2">
                  {pattern.components.map((comp: any, compIndex: number) => (
                    <div key={compIndex} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">{comp.name}</div>
                      <div className="text-sm text-gray-600">Type: {comp.type}</div>
                      {comp.location && (
                        <div className="text-sm text-gray-600">Location: {comp.location}</div>
                      )}
                      {comp.code_snippet && (
                        <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {comp.code_snippet}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderUnitTests = (result: any) => {
    if (!result) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No unit test data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {result.coverage && (
          <Card>
            <CardHeader>
              <CardTitle>Test Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Coverage Percentage:</span>
                  <Badge variant="outline">{result.coverage.coverage_percentage || 0}%</Badge>
                </div>
                {result.coverage.functions_covered && Array.isArray(result.coverage.functions_covered) && (
                  <div>
                    <h4 className="font-medium mb-2">Functions Covered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.coverage.functions_covered.map((func: string, index: number) => (
                        <Badge key={index} variant="default" className="text-xs">{func}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.coverage.functions_uncovered && Array.isArray(result.coverage.functions_uncovered) && (
                  <div>
                    <h4 className="font-medium mb-2">Functions Uncovered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.coverage.functions_uncovered.map((func: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">{func}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {result.tests && Array.isArray(result.tests) && result.tests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.tests.map((test: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{test.testName}</h4>
                      <Badge variant="outline">Score: {test.score || 'N/A'}</Badge>
                    </div>
                    {test.coveredFunctions && Array.isArray(test.coveredFunctions) && (
                      <div className="text-sm text-gray-600 mb-2">
                        Covers: {test.coveredFunctions.join(', ')}
                      </div>
                    )}
                    {test.assertions && Array.isArray(test.assertions) && (
                      <div className="text-sm text-gray-600 mb-2">
                        Assertions: {test.assertions.join(', ')}
                      </div>
                    )}
                    {test.improvements && (
                      <div className="text-sm text-gray-600">
                        Improvements: {test.improvements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {result.recommendations && Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderASTExtraction = (result: any) => {
    if (!result || !result.pipelines) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No AST data available</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {Array.isArray(result.pipelines) && result.pipelines.map((pipeline: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {pipeline.name || 'Unnamed Pipeline'}
              </CardTitle>
              <CardDescription>
                {pipeline.description || 'No description available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pipeline.file_path && (
                <div className="text-sm text-gray-600 mb-3">
                  <strong>File:</strong> {pipeline.file_path}
                </div>
              )}
              {pipeline.steps && Array.isArray(pipeline.steps) && pipeline.steps.length > 0 && (
                <div className="space-y-3">
                  {pipeline.steps.map((step: any, stepIndex: number) => (
                    <div key={stepIndex} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium mb-2">{step.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      {step.commands && Array.isArray(step.commands) && step.commands.length > 0 && (
                        <div className="space-y-1">
                          {step.commands.map((cmd: string, cmdIndex: number) => (
                            <div key={cmdIndex} className="text-xs font-mono bg-gray-100 p-1 rounded">
                              {cmd}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const getTabContent = (taskType: string, result: any) => {
    try {
      switch (taskType) {
        case 'schema_extraction':
          return renderSchemaExtraction(result);
        case 'api_specification':
          return renderAPISpecification(result);
        case 'uml_generation':
          return renderUMLGeneration(result);
        case 'erd_generation':
          return renderERDGeneration(result);
        case 'architecture_summary':
          return renderArchitectureSummary(result);
        case 'design_pattern_detector':
          return renderDesignPatterns(result);
        case 'unit_test_analyzer':
          return renderUnitTests(result);
        case 'ats_extraction':
          return renderASTExtraction(result);
        default:
          return (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Unknown analysis type: {taskType}</AlertDescription>
            </Alert>
          );
      }
    } catch (error) {
      console.error(`Error rendering ${taskType}:`, error);
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error rendering {taskType} analysis. Please check the console for details.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('Raw result:', result)}
              >
                Log Raw Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
  };

  const getTabLabel = (taskType: string) => {
    const labels: Record<string, string> = {
      schema_extraction: 'Schema',
      api_specification: 'API',
      uml_generation: 'UML',
      erd_generation: 'ERD',
      architecture_summary: 'Architecture',
      design_pattern_detector: 'Patterns',
      unit_test_analyzer: 'Tests',
      ats_extraction: 'AST',
    };
    return labels[taskType] || taskType;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading analysis results: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchResults}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No analysis results found for this job.</AlertDescription>
      </Alert>
    );
  }

  const completedResults = results.filter(r => r && r.status === 'completed');
  const processingResults = results.filter(r => r && r.status === 'processing');
  const failedResults = results.filter(r => r && r.status === 'failed');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <p className="text-gray-600">Job ID: {jobId}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadResults}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{completedResults.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Processing</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{processingResults.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{failedResults.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Tabs */}
      {completedResults.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            {completedResults.filter(result => result && result.task_type).map((result) => (
              <TabsTrigger 
                key={result.task_type} 
                value={result.task_type}
                className="flex items-center gap-2"
              >
                {getTaskIcon(result.task_type)}
                {getTabLabel(result.task_type)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {completedResults.filter(result => result && result.task_type).map((result) => (
            <TabsContent key={result.task_type} value={result.task_type} className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTaskIcon(result.task_type)}
                    <h3 className="text-lg font-semibold">{getTabLabel(result.task_type)} Analysis</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                      {result.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(result.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {getTabContent(result.task_type, result.result)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Processing Results */}
      {processingResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Processing Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processingResults.filter(result => result && result.task_type).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <div className="flex items-center gap-2">
                    {getTaskIcon(result.task_type)}
                    <span className="font-medium">{getTabLabel(result.task_type)}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {getStatusIcon(result.status)}
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Results */}
      {failedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Failed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {failedResults.filter(result => result && result.task_type).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div className="flex items-center gap-2">
                    {getTaskIcon(result.task_type)}
                    <span className="font-medium">{getTabLabel(result.task_type)}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {getStatusIcon(result.status)}
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResults; 