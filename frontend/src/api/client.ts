
export async function getFhirSummary() {
  console.log('[API] GET /api/fhir/summary');
  const res = await fetch('/api/fhir/summary');
  const text = await res.clone().text();
  console.log('[API] Response:', text);
  if (!res.ok) throw new Error('Failed to fetch FHIR summary');
  return res.json();
}


export async function generateTests(payload: any = {}) {
  console.log('[API] POST /api/tests/generate', payload);
  const res = await fetch('/api/tests/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.clone().text();
  console.log('[API] Response:', text);
  if (!res.ok) throw new Error('Failed to generate tests');
  return res.json();
}


export async function getTestResults() {
  console.log('[API] GET /api/tests/results');
  const res = await fetch('/api/tests/results');
  const text = await res.clone().text();
  console.log('[API] Response:', text);
  if (!res.ok) throw new Error('Failed to fetch test results');
  return res.json();
}
