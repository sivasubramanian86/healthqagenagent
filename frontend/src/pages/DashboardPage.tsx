
import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../api/client';
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
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getDashboardData();
        setDashboardData(response.data);
        if (response.isMockData) {
          setError('Using demo data - backend unavailable');
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <section className="mb-6">
          <h1 className="text-2xl font-semibold">HealthQAGenAgent</h1>
          <p className="text-gray-600 dark:text-gray-300">Dashboard — manage and generate FHIR testcases for your project.</p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const resourceCountsData = {
    labels: dashboardData?.fhirSummary ? Object.keys(dashboardData.fhirSummary.resourceCounts) : [],
    datasets: [
      {
        label: '# of Resources',
        data: dashboardData?.fhirSummary ? Object.values(dashboardData.fhirSummary.resourceCounts) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const passCount = dashboardData?.results?.filter((r: any) => r.valid).length ?? 0;
  const failCount = dashboardData?.results?.filter((r: any) => !r.valid).length ?? 0;

  const resultDistributionData = {
    labels: ['Pass', 'Fail'],
    datasets: [
      {
        label: 'Test Result Distribution',
        data: [passCount, failCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">HealthQAGenAgent</h1>
        <p className="text-gray-600 dark:text-gray-300">Dashboard — manage and generate FHIR testcases for your project.</p>
      </section>

      {error && <p className="mb-4 text-blue-600 dark:text-blue-400">ℹ️ {error}</p>}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPI title="Total Patients" value={dashboardData?.fhirSummary?.patientCount?.toString() ?? '...'} />
        <KPI title="Tests Generated" value={dashboardData?.questions?.length?.toString() ?? '...'} />
        <KPI title="Tests Evaluated" value={dashboardData?.results?.length?.toString() ?? '...'} />
      </section>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2">Tests by Resource Type</h3>
          {dashboardData?.fhirSummary && <Bar data={resourceCountsData} />}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-medium mb-2">Result Distribution</h3>
          {dashboardData?.results && <Pie data={resultDistributionData} />}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Resource Counts</h2>
        <ul className="space-y-2">
          {dashboardData?.fhirSummary
            ? Object.entries(dashboardData.fhirSummary.resourceCounts).map(([k, v]: [string, any]) => (
                <li key={k} className="bg-white dark:bg-gray-800 p-3 rounded shadow">{k}: {v}</li>
              ))
            : <li>Loading...</li>}
        </ul>
      </section>
    </div>
  );
}
