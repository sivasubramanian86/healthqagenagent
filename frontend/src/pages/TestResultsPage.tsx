
import React, { useEffect, useState } from 'react';
import { getTestResults } from '../api/client';

export default function TestResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      const response = await getTestResults();
      if (response.status === 'success') {
        setResults(response.data);
      } else {
        setResults(response.data);
        setError(response.message || 'An unknown error occurred.');
        console.warn('Using fallback data for test results.');
      }
    };

    fetchTestResults();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Test Results</h1>
      {error && <p className="mb-4 text-orange-500">Warning: {error}</p>}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
