import React from 'react';
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
  const recent = [
    { id: 't-1', text: 'Generated tests for Patient/123' },
    { id: 't-2', text: 'Generated tests for Observation/abc' },
    { id: 't-3', text: 'Generated tests for Condition/xyz' }
  ];

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">HealthQAGenAgent</h1>
        <p className="text-gray-600 dark:text-gray-300">Dashboard — manage and generate FHIR testcases for your project.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPI title="Total Patients" value="1,234" />
        <KPI title="Tests Generated" value="5,678" />
        <KPI title="Pass Rate" value="92%" />
      </section>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2">Tests by Resource Type</h3>
          <Bar
            data={{
              labels: ['Patient', 'Observation', 'Condition', 'Encounter', 'MedicationRequest'],
              datasets: [
                { label: 'Tests', data: [120, 90, 60, 75, 40], backgroundColor: 'rgba(99,102,241,0.8)' }
              ]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } }
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2">Result Distribution</h3>
          <Pie
            data={{
              labels: ['Pass', 'Fail', 'Skipped'],
              datasets: [
                { data: [920, 60, 18], backgroundColor: ['#10B981', '#EF4444', '#F59E0B'] }
              ]
            }}
            options={{ responsive: true }}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <ul className="space-y-2">
          {recent.slice(0, 5).map((r) => (
            <li key={r.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow">{r.text}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
