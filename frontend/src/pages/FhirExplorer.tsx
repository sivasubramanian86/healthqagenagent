import React, { useState } from 'react';

export default function FhirExplorer() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);

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
        <pre className="whitespace-pre-wrap">
          {result ? JSON.stringify(result, null, 2) : "No results"}
        </pre>
      </div>
    </div>
  );
}
