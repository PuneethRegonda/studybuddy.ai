'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { extractComponentToTsx } from './json-to-tsx-utility';
import DynamicComponent from './DynamicComponent';

interface ReactEmbedViewerProps {
  jsonPath: string;
}

function ReactEmbedViewer({ jsonPath }: ReactEmbedViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [componentKey, setComponentKey] = useState<number>(0);

  useEffect(() => {
    const processComponent = async () => {
      try {
        // Get paths for the JSON and output TSX file
        const outputPath = "./app/ui/react-embed-component/DynamicComponent.tsx";
        
        // Convert the JSON to TSX
        const result = await extractComponentToTsx(jsonPath, outputPath);
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        // Force re-render by changing the key
        setComponentKey(prevKey => prevKey + 1);
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing component:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    processComponent();
  }, [jsonPath]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-red-500">
            <h3>Error loading component:</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        {isLoading ? (
          <p>Loading component...</p>
        ) : (
          <DynamicComponent key={componentKey} />
        )}
      </CardContent>
    </Card>
  );
}

export default ReactEmbedViewer;
