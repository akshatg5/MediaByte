"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

const GeneratedUIPreview = ({ code }: { code: string }) => {
  const iFrameRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const iframe = iFrameRef.current;
    if (iframe) {
      setLoading(true);
      setError(null);
      const document = iframe.contentDocument;
      if (document) {
        try {
          const sanitizedCode = DOMPurify.sanitize(code);
          document.open();
          document.write(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <title>Generated UI Preview</title>
              </head>
              <body>
                <div id="root">${sanitizedCode}</div>
                <script>
                  window.onload = function() {
                    window.parent.postMessage({type: 'loaded'}, '*');
                  };
                  window.onerror = function(message, source, lineno, colno, error) {
                    window.parent.postMessage({type: 'error', message: message}, '*');
                    return true;
                  };
                </script>
              </body>
            </html>
          `);
          document.close();
        } catch (err) {
          setError("Failed to render preview");
          console.error(err);
        }
      }
    }
  }, [code]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'loaded') {
        setLoading(false);
      } else if (event.data.type === 'error') {
        setError(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="relative w-full h-96 border-2 border-blue-200 rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      <iframe
        ref={iFrameRef}
        className="w-full h-full"
        title="Generated UI Preview"
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default GeneratedUIPreview;
