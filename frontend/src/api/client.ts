
const post = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request to ${url} failed with status ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const getDashboardData = async () => {
  try {
    return await post('/api/dashboard', {});
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return {
        status: 'error',
        message: error.message || 'Failed to fetch dashboard data.',
        data: {
            fhirSummary: { patientCount: 0, resourceCounts: {} },
            questions: [],
            results: []
        }
    };
  }
};

export const getFhirSummary = (fhirData: any) => post('/api/fhir/summary', fhirData);

export const generateTests = (resourceType: string, count: number) => post('/api/tests/generate', { resourceType, count });

export const getTestResults = (results: any) => post('/api/tests/results', results);
