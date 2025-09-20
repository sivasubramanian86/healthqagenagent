import React, { useEffect, useState } from 'react';
import { getFhirSummary } from '../api/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);


const KPI = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFhirSummary()
      .then(data => {
        setSummary(data);
        console.log('FHIR summary loaded', data);
      })
      .catch(err => {
        setError('Failed to load FHIR summary');
        setSummary({ patientCount: 0, resourceCounts: {} });
        console.error('Failed to load FHIR summary', err);
      });
  }, []);

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">HealthQAGenAgent</h1>
        <p className="text-gray-600 dark:text-gray-300">Dashboard — manage and generate FHIR testcases for your project.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPI title="Total Patients" value={summary?.patientCount?.toString() ?? '...'} />
        <KPI title="Tests Generated" value={summary?.resourceCounts?.Observation?.toString() ?? '...'} />
        <KPI title="Conditions" value={summary?.resourceCounts?.Condition?.toString() ?? '...'} />
      </section>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2">Tests by Resource Type</h3>
          {/* Chart remains dummy for now */}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2">Result Distribution</h3>
          {/* Chart remains dummy for now */}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Resource Counts</h2>
        <ul className="space-y-2">
          {summary?.resourceCounts
            ? Object.entries(summary.resourceCounts).map(([k, v]) => (
                <li key={k} className="bg-white dark:bg-gray-800 p-3 rounded shadow">{k}: {v}</li>
              ))
            : <li>Loading...</li>}
        </ul>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </section>
    </div>
  );
}
