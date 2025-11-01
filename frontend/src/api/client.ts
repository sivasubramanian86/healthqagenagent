
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    const response = await fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('Dashboard API failed, using fallback data:', error.message);
    
    const mockResponse = await fetch('/mock-dashboard.json');
    const mockData = await mockResponse.json();
    return {
      status: 'success',
      data: mockData,
      isMockData: true
    };
  }
};

export const getFhirSummary = (fhirData: any) => post('/api/fhir/summary', fhirData);

export const generateTests = async (data: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  
  try {
    const response = await fetch('/api/tests/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('API call failed, using fallback data:', error.message);
    
    // Fallback to mock data
    const mockResponse = await fetch('/mock-tests.json');
    const mockData = await mockResponse.json();
    return {
      status: 'success',
      data: mockData,
      isMockData: true
    };
  }
};

export const searchFhirResources = async (query: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  
  try {
    const response = await fetch('/api/fhir/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('FHIR search API failed, using fallback data:', error.message);
    
    // Fallback to mock data
    const mockResponse = await fetch('/mock-fhir-search.json');
    const mockData = await mockResponse.json();
    return {
      status: 'success',
      data: mockData,
      isMockData: true
    };
  }
};

export const queryNLP = async (query: string, context: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  
  try {
    const response = await fetch('/api/nlp/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('NLP API failed, using fallback data:', error.message);
    
    // Fallback to mock data
    const mockResponse = await fetch('/mock-nlp.json');
    const mockData = await mockResponse.json();
    
    // Find matching response or use default
    const normalizedQuery = query.toLowerCase().trim();
    const matchedResponse = mockData.responses[normalizedQuery] || {
      title: "AI Assistant Response",
      body: `I understand you're asking about: "${query}". Based on your test results, I can help analyze compliance issues, summarize failures, and provide remediation guidance. Try asking: "Summarize top compliance failures" or "How to fix the failures".`,
      tags: ["general", "help"]
    };
    
    return {
      status: 'success',
      data: matchedResponse,
      isMockData: true
    };
  }
};

export const getTestResults = async (results?: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    const response = await fetch('/api/tests/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results || {}),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('Test results API failed, using fallback data:', error.message);
    
    const mockResponse = await fetch('/mock-test-results.json');
    const mockData = await mockResponse.json();
    return {
      status: 'success',
      data: mockData.results,
      isMockData: true
    };
  }
};
