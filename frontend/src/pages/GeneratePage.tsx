
import React, { useState } from 'react';
import { generateTests } from '../api/client';

// Simple Modal Component
const AuditTrailModal = ({ content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-xl font-semibold mb-4">Compliance Audit Trail</h3>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm">
          <p className="font-semibold">Data Source:</p>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(content.sourceData, null, 2)}</pre>
          <p className="font-semibold mt-4">Compliance Note:</p>
          <p>{content.complianceNote}</p>
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default function GeneratePage() {
  const [fhirData, setFhirData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    let parsedFhirData;
    try {
      parsedFhirData = JSON.parse(fhirData);
    } catch (e) {
      setError('Invalid JSON format for FHIR data.');
      setLoading(false);
      return;
    }

    const response = await generateTests({ fhirData: parsedFhirData });

    if (response.status === 'success') {
      // Mocking audit trail data for demonstration
      const augmentedData = {
        questions: response.data.questions,
        auditData: response.data.questions.map(q => ({
          sourceData: { resourceType: 'Observation', value: 'Mocked for UI' },
          complianceNote: 'No PHI was used in this generation. This is a mock audit trail.'
        }))
      };
      setResult(augmentedData);
    } else {
      setResult(response.data);
      setError(response.message || 'An unknown error occurred.');
    }

    setLoading(false);
  }
  
  const showAuditTrail = (index) => {
    setModalContent(result.auditData[index]);
    setIsModalOpen(true);
  };

  return (
    <div>
      {isModalOpen && <AuditTrailModal content={modalContent} onClose={() => setIsModalOpen(false)} />}
      <h1 className="text-2xl font-semibold mb-4">Generate Tests from FHIR Data</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-2xl">
        <textarea
          value={fhirData}
          onChange={(e) => setFhirData(e.target.value)}
          className="w-full h-64 mb-4 p-2 border rounded bg-white dark:bg-gray-700 font-mono text-sm"
          placeholder='[
  { "resourceType": "Patient", "id": "example", ... },
  { "resourceType": "Observation", "id": "obs1", ... }
]'
        />

        <button onClick={handleGenerate} className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Tests'}
        </button>

        {error && <p className="mt-4 text-orange-500">Warning: {error}</p>}

        {result && result.questions && (
          <div>
            <h2 className="text-xl font-semibold mt-4">Generated Tests:</h2>
            <ul className="list-disc pl-5 mt-2">
              {result.questions.map((q, index) => (
                <li key={index} className="mb-2">
                  {q.question}
                  <button onClick={() => showAuditTrail(index)} className="ml-2 text-xs text-indigo-500 hover:underline">[Audit Trail]</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
