import React, { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import 'react-json-view-lite/dist/index.css';

// react-json-view-lite can be shipped as CJS or ESM. Dynamically import and
// resolve the default export if present so the app works in both environments.
let JSONViewer: ComponentType<any> | null = null;

async function loadJSONViewer() {
  const mod = await import('react-json-view-lite');
  // prefer default, fall back to module itself
  return (mod && (mod.default || mod)) as any;
}

export default function FhirExplorerPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [, setViewerLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadJSONViewer().then((Comp) => {
      if (!mounted) return;
      JSONViewer = Comp;
      setViewerLoaded(true);
    }).catch(() => {
      // ignore; we'll render a fallback
    });
    return () => { mounted = false; };
  }, []);

  async function handleSearch() {
    // TODO: call FHIR store API
    setResult({ demo: 'result for ' + query });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">FHIR Data Explorer</h1>
      <div className="mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="p-2 border rounded w-full bg-white dark:bg-gray-700" placeholder="Patient ID or resource type" />
        <button onClick={handleSearch} className="mt-2 px-3 py-2 bg-indigo-600 text-white rounded">Search</button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        {result ? (
          JSONViewer ? <JSONViewer data={result} shouldInitiallyExpand={() => false} /> : <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <div>No results</div>
        )}
      </div>
    </div>
  );
}
