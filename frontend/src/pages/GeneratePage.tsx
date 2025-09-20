import React, { useState } from 'react';
import { generateTests } from '../api/client';

export default function GeneratePage() {
  const [resource, setResource] = useState('Patient');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const data = await generateTests({ resource, count });
      setResult(data);
      console.log('Tests generated', data);
      alert('Generated ' + count + ' test cases for ' + resource);
    } catch (err) {
      console.error('Failed to generate tests', err);
      alert('Failed to generate tests');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Generate Tests</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-md">
        <label className="block mb-2">Resource Type</label>
        <select value={resource} onChange={(e) => setResource(e.target.value)} className="w-full mb-4 p-2 border rounded bg-white dark:bg-gray-700">
          <option>Patient</option>
          <option>Observation</option>
          <option>Condition</option>
          <option>Encounter</option>
        </select>

        <label className="block mb-2">Number of test cases</label>
        <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full mb-4 p-2 border rounded bg-white dark:bg-gray-700" />

        <button onClick={handleGenerate} className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {result && <pre className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  );
}
