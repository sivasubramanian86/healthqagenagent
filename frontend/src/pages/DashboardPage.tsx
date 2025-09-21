
import React, { useEffect, useState } from 'react';
import { getDashboardData, getTestResults } from '../api/client';
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
  const [testResults, setTestResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await getDashboardData();
        if (dashboardResponse.status === 'success') {
          setDashboardData(dashboardResponse.data);
        } else {
          setDashboardData(dashboardResponse.data);
          setError(dashboardResponse.message || 'An unknown error occurred.');
          console.warn('Using fallback data for dashboard.');
        }

        const testResultsResponse = await getTestResults();
        if (testResultsResponse.status === 'success' && testResultsResponse.data && Array.isArray(testResultsResponse.data.results)) {
            setTestResults(testResultsResponse.data.results);
        } else {
            console.warn('Could not fetch test results for dashboard chart.');
        }

      } catch (e: any) {
        setError(e.message || 'A critical error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const passCount = testResults.filter((r: any) => r.passed).length ?? 0;
  const failCount = testResults.filter((r: any) => !r.passed).length ?? 0;

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

      {error && <p className="mb-4 text-orange-500">Warning: {error}</p>}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : dashboardData ? (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPI title="Total Patients" value={dashboardData.fhirSummary?.patientCount?.toString() ?? 'N/A'} />
            <KPI title="Tests Generated" value={dashboardData.questions?.length?.toString() ?? 'N/A'} />
            <KPI title="Tests Evaluated" value={testResults?.length?.toString() ?? 'N/A'} />
          </section>

          <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h3 className="font-medium mb-2">Resource Counts</h3>
              {dashboardData.fhirSummary && <Bar data={resourceCountsData} />}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h3 className="font-medium mb-2">Result Distribution</h3>
              {(passCount > 0 || failCount > 0) && <Pie data={resultDistributionData} />}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Resource Counts</h2>
            <ul className="space-y-2">
              {dashboardData.fhirSummary ? (
                Object.entries(dashboardData.fhirSummary.resourceCounts).map(([k, v]: [string, any]) => (
                  <li key={k} className="bg-white dark:bg-gray-800 p-3 rounded shadow">{k}: {v}</li>
                ))
              ) : (
                <li>No resource data available.</li>
              )}
            </ul>
          </section>
        </>
      ) : (
        <p>No dashboard data available.</p>
      )}
    </div>
  );
}
