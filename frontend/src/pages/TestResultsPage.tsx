
import React, { useEffect, useState } from 'react';
import { getTestResults } from '../api/client';

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    Pass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Fail: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
      {status}
    </span>
  );
};

export default function TestResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [runInfo, setRunInfo] = useState<any>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      setLoading(true);
      try {
        const response = await getTestResults();
        setResults(response.data);
        if (response.isMockData) {
          setError('Using demo data - backend unavailable');
        }
      } catch (err) {
        setError('Failed to load test results');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  useEffect(() => {
    let filtered = results;
    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (severityFilter !== 'All') {
      filtered = filtered.filter(r => r.severity === severityFilter);
    }
    setFilteredResults(filtered);
  }, [results, statusFilter, severityFilter]);

  const exportCSV = () => {
    const headers = ['ID', 'Rule', 'Severity', 'Status', 'Rationale', 'Evidence', 'Suggestion'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(r => [
        r.id, r.rule, r.severity, r.status, 
        `"${r.rationale}"`, `"${r.evidence}"`, `"${r.suggestion}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Test Results</h1>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Test Results</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Run ID: demo-run-67890 | Seed: xyz789abc123 | {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {error && <p className="mb-4 text-blue-600 dark:text-blue-400">ℹ️ {error}</p>}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="All">All Status</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Warn">Warn</option>
              </select>
              
              <select 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="All">All Severity</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <button 
              onClick={exportCSV}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rationale</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{result.id}</td>
                  <td className="px-6 py-4 text-sm">{result.rule}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.severity === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      result.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {result.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={result.status} />
                  </td>
                  <td className="px-6 py-4 text-sm max-w-md truncate" title={result.rationale}>{result.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredResults.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No results match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
