declare global {
  interface Window {
    mermaid: {
      initialize: (config: any) => void;
      run: () => Promise<void>;
    };
  }
}

export {};
