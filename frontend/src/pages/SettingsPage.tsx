import React, { useState } from 'react';

export default function SettingsPage() {
  const [fhirEndpoint, setFhirEndpoint] = useState('');
  const [projectId, setProjectId] = useState('healthqagenagent');
  const [datasetId, setDatasetId] = useState('healthqagen-dataset');
  const [storeId, setStoreId] = useState('healthqagen-fhirstore');

  function handleSave() {
    // TODO: persist settings
    alert('Settings saved');
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-xl space-y-3">
        <div>
          <label className="block">FHIR Endpoint</label>
          <input value={fhirEndpoint} onChange={(e) => setFhirEndpoint(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label className="block">Project ID</label>
          <input value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label className="block">Dataset ID</label>
          <input value={datasetId} onChange={(e) => setDatasetId(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label className="block">Store ID</label>
          <input value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700" />
        </div>
        <div>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
