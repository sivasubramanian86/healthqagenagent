
import React, { useEffect, useState } from 'react';
import { getTestResults } from '../api/client';

interface TestResult {
  testName: string;
  passed: boolean;
  details?: string;
}

export default function TestResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await getTestResults();
        if (response.status === 'success' && response.data && Array.isArray(response.data.results)) {
          setResults(response.data.results);
        } else {
          // Handle cases where the data structure is not as expected
          setError('Failed to fetch or parse test results.');
          console.warn('API response for test results was not in the expected format:', response);
        }
      } catch (e: any) {
        setError('An error occurred while fetching test results.');
        console.error(e);
      }
    };

    fetchTestResults();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Test Results</h1>
      {error && <p className="mb-4 text-red-500">Error: {error}</p>}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Test Name</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{r.testName}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${r.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {r.passed ? 'Passed' : 'Failed'}
                  </span>
                </td>
                <td className="p-2">{r.details || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
