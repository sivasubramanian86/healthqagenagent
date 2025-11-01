import React, { useState } from 'react';
import { searchFhirResources } from '../api/client';

type SearchState = 'idle' | 'searching' | 'success' | 'error';

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
    <div className="flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">×</button>
    </div>
  </div>
);

const JSONViewer = ({ data, onClose }: { data: any; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Resource Details</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>
      <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  </div>
);

export default function FhirExplorerPage() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>('idle');
  const [results, setResults] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setState('searching');
    setResults([]);
    
    try {
      const response = await searchFhirResources(query);
      
      if (response.isMockData) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
      
      const resources = response.data?.entry?.map((entry: any) => entry.resource) || [];
      setResults(resources);
      setState('success');
    } catch (error) {
      console.error('Search failed:', error);
      setState('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getButtonText = () => {
    switch (state) {
      case 'searching': return 'Searching...';
      default: return 'Search';
    }
  };

  return (
    <div className="p-6">
      {showToast && (
        <Toast 
          message="Showing demo search results" 
          onClose={() => setShowToast(false)} 
        />
      )}
      
      {selectedResource && (
        <JSONViewer 
          data={selectedResource} 
          onClose={() => setSelectedResource(null)} 
        />
      )}
      
      <h1 className="text-2xl font-semibold mb-6">FHIR Data Explorer</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-3 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            placeholder="Enter resource type (e.g., Patient, Observation, Condition)"
          />
          <button 
            onClick={handleSearch}
            disabled={state === 'searching' || !query.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {state === 'searching' && (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {getButtonText()}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Search Results ({results.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resource Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Updated At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {results.map((resource, index) => (
                  <tr key={resource.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        resource.resourceType === 'Patient' ? 'bg-blue-100 text-blue-800' :
                        resource.resourceType === 'Observation' ? 'bg-green-100 text-green-800' :
                        resource.resourceType === 'Condition' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.resourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{resource.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resource.status === 'active' || resource.status === 'final' ? 'bg-green-100 text-green-800' :
                        resource.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {resource.meta?.lastUpdated ? formatDate(resource.meta.lastUpdated) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => setSelectedResource(resource)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {state === 'success' && results.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">No resources found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
