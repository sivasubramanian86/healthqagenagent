import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [fhirEndpoint, setFhirEndpoint] = useState('');
  const [projectId, setProjectId] = useState('healthqagenagent');
  const [datasetId, setDatasetId] = useState('healthqagen-dataset');
  const [storeId, setStoreId] = useState('healthqagen-fhirstore');
  const [saveDatasets, setSaveDatasets] = useState(true);
  const [useMocks, setUseMocks] = useState(false);
  const [seed, setSeed] = useState('demo-seed-123');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFhirEndpoint(settings.fhirEndpoint || '');
      setProjectId(settings.projectId || 'healthqagenagent');
      setDatasetId(settings.datasetId || 'healthqagen-dataset');
      setStoreId(settings.storeId || 'healthqagen-fhirstore');
      setSaveDatasets(settings.saveDatasets ?? true);
      setUseMocks(settings.useMocks ?? false);
      setSeed(settings.seed || 'demo-seed-123');
    }
  }, []);

  function handleSave() {
    const settings = {
      fhirEndpoint,
      projectId,
      datasetId,
      storeId,
      saveDatasets,
      useMocks,
      seed
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  }

  const ToggleSwitch = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <label className="block font-medium">{label}</label>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <ToggleSwitch
            enabled={theme === 'dark'}
            onChange={toggleTheme}
            label="Dark Mode"
            description="Switch between light and dark themes"
          />
        </div>

        {/* Demo Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Demo Configuration</h2>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={saveDatasets}
              onChange={setSaveDatasets}
              label="Save Datasets"
              description="Automatically save uploaded datasets for future use"
            />
            
            <ToggleSwitch
              enabled={useMocks}
              onChange={setUseMocks}
              label="Use Mock Data"
              description="Force use of demo data instead of live APIs"
            />
            
            <div>
              <label className="block font-medium mb-2">Demo Seed</label>
              <input 
                value={seed} 
                onChange={(e) => setSeed(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" 
                placeholder="Enter seed for reproducible demo data"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Used for generating consistent demo results</p>
            </div>
          </div>
        </div>

        {/* FHIR Configuration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">FHIR Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">FHIR Endpoint</label>
              <input 
                value={fhirEndpoint} 
                onChange={(e) => setFhirEndpoint(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" 
                placeholder="https://your-fhir-server.com/fhir"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Project ID</label>
              <input 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" 
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Dataset ID</label>
              <input 
                value={datasetId} 
                onChange={(e) => setDatasetId(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" 
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Store ID</label>
              <input 
                value={storeId} 
                onChange={(e) => setStoreId(e.target.value)} 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" 
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={handleSave} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
