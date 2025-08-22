declare global {
  interface Window {
    mermaid: {
      render(diagramId: string, cleanDiagram: string): Promise<{ svg: string }>;
      initialize: (config: any) => void;
      run: () => Promise<void>;
    };
  }
}

export {};
