'use client'

import React, { useState, useEffect } from 'react';
import { transform } from '@babel/standalone';

export default function GeneratedUIPreview({ code }: { code: string }) {
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const transpileAndRender = async () => {
      try {
        // Transpile the code
        const { code: transpiledCode } = transform(code, {
          presets: ['react'],
          filename: 'component.tsx',
        });

        // Create a function from the transpiled code
        const createComponent = new Function('React', `
          ${transpiledCode}
          return Component;
        `);

        // Create the component
        const Component = createComponent(React);

        setPreviewComponent(() => Component);
        setError(null);
      } catch (err: any) {
        console.error('Error rendering preview:', err);
        setError(`Failed to render preview: ${err.message}`);
        setPreviewComponent(null);
      }
    };

    transpileAndRender();
  }, [code]);

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        <h3 className="font-bold mb-2">Error:</h3>
        <pre className="whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-200 rounded-lg p-4 mt-4">
      {PreviewComponent ? (
        <ErrorBoundary fallback={<div className="text-red-500">Error rendering component</div>}>
          <PreviewComponent />
        </ErrorBoundary>
      ) : (
        <p>Loading preview...</p>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error in preview component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}