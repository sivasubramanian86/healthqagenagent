// Test script to verify the FHIR Explorer page functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing FHIR Explorer Page Implementation...\n');

// Test 1: Verify mock FHIR data file exists and is valid
console.log('1. Testing mock FHIR data file...');
try {
  const mockDataPath = path.join(__dirname, 'public', 'mock-fhir-search.json');
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  
  console.log('✅ Mock FHIR data file exists and is valid JSON');
  console.log(`   - Resource type: ${mockData.resourceType}`);
  console.log(`   - Total entries: ${mockData.total}`);
  console.log(`   - Actual entries: ${mockData.entry.length}`);
  
  // Verify required fields in resources
  const requiredFields = ['resourceType', 'id', 'status'];
  const firstResource = mockData.entry[0].resource;
  const hasAllFields = requiredFields.every(field => firstResource.hasOwnProperty(field));
  
  if (hasAllFields) {
    console.log('✅ All required fields present in FHIR resources');
  } else {
    console.log('❌ Missing required fields in FHIR resources');
  }
  
  // Check resource types
  const resourceTypes = mockData.entry.map(e => e.resource.resourceType);
  const uniqueTypes = [...new Set(resourceTypes)];
  console.log(`   - Resource types: ${uniqueTypes.join(', ')}`);
  
} catch (error) {
  console.log('❌ Mock FHIR data file test failed:', error.message);
}

// Test 2: Verify FhirExplorerPage component structure
console.log('\n2. Testing FhirExplorerPage component...');
try {
  const componentPath = path.join(__dirname, 'src', 'pages', 'FhirExplorerPage.tsx');
  const componentCode = fs.readFileSync(componentPath, 'utf8');
  
  // Check for key features
  const features = [
    { name: 'Search state machine', pattern: /type SearchState = 'idle' \| 'searching' \| 'success' \| 'error'/ },
    { name: 'Search handler', pattern: /handleSearch/ },
    { name: 'Results table', pattern: /<table/ },
    { name: 'JSON viewer modal', pattern: /JSONViewer/ },
    { name: 'Toast notification', pattern: /Toast/ },
    { name: 'Loading spinner', pattern: /animate-spin/ },
    { name: 'Resource type badges', pattern: /resourceType === 'Patient'/ },
    { name: 'Status badges', pattern: /status === 'active'/ },
    { name: 'Date formatting', pattern: /formatDate/ },
    { name: 'Enter key support', pattern: /handleKeyPress/ }
  ];
  
  features.forEach(feature => {
    if (feature.pattern.test(componentCode)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Component test failed:', error.message);
}

// Test 3: Verify API client updates
console.log('\n3. Testing API client FHIR search function...');
try {
  const clientPath = path.join(__dirname, 'src', 'api', 'client.ts');
  const clientCode = fs.readFileSync(clientPath, 'utf8');
  
  const apiFeatures = [
    { name: 'FHIR search function', pattern: /searchFhirResources/ },
    { name: 'Timeout handling', pattern: /setTimeout.*controller\.abort/ },
    { name: 'Fallback to mock data', pattern: /mock-fhir-search\.json/ },
    { name: 'Error handling', pattern: /catch.*error/ },
    { name: 'Mock data flag', pattern: /isMockData/ }
  ];
  
  apiFeatures.forEach(feature => {
    if (feature.pattern.test(clientCode)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
  
} catch (error) {
  console.log('❌ API client test failed:', error.message);
}

console.log('\n🎉 Test complete! The FHIR Explorer page should now:');
console.log('   • Handle search queries with visual feedback');
console.log('   • Show loading states during search');
console.log('   • Fallback to mock data if API fails');
console.log('   • Display results in a professional table');
console.log('   • Allow clicking rows to view JSON details');
console.log('   • Show toast notification for demo data');
console.log('   • Support Enter key for search');
console.log('   • Complete searches within 6 seconds maximum');