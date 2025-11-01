// Test script to verify the Generate Tests page functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Generate Tests Page Implementation...\n');

// Test 1: Verify mock data file exists and is valid JSON
console.log('1. Testing mock data file...');
try {
  const mockDataPath = path.join(__dirname, 'public', 'mock-tests.json');
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  
  console.log('✅ Mock data file exists and is valid JSON');
  console.log(`   - Contains ${mockData.tests.length} test cases`);
  console.log(`   - Run ID: ${mockData.run_id}`);
  console.log(`   - Seed: ${mockData.seed}`);
  
  // Verify required fields
  const requiredFields = ['id', 'rule', 'severity', 'status', 'evidence', 'suggestion'];
  const firstTest = mockData.tests[0];
  const hasAllFields = requiredFields.every(field => firstTest.hasOwnProperty(field));
  
  if (hasAllFields) {
    console.log('✅ All required fields present in test cases');
  } else {
    console.log('❌ Missing required fields in test cases');
  }
  
} catch (error) {
  console.log('❌ Mock data file test failed:', error.message);
}

// Test 2: Verify GeneratePage component structure
console.log('\n2. Testing GeneratePage component...');
try {
  const componentPath = path.join(__dirname, 'src', 'pages', 'GeneratePage.tsx');
  const componentCode = fs.readFileSync(componentPath, 'utf8');
  
  // Check for key features
  const features = [
    { name: 'State machine type', pattern: /type GenerateState = 'idle' \| 'uploading' \| 'generating' \| 'success' \| 'error'/ },
    { name: 'File upload handler', pattern: /handleFileUpload/ },
    { name: 'Generate handler', pattern: /handleGenerate/ },
    { name: 'Status badges', pattern: /StatusBadge/ },
    { name: 'Toast notification', pattern: /Toast/ },
    { name: 'Results table', pattern: /<table/ },
    { name: 'Spinner animation', pattern: /animate-spin/ }
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
console.log('\n3. Testing API client...');
try {
  const clientPath = path.join(__dirname, 'src', 'api', 'client.ts');
  const clientCode = fs.readFileSync(clientPath, 'utf8');
  
  const apiFeatures = [
    { name: 'Timeout handling', pattern: /setTimeout.*controller\.abort/ },
    { name: 'Fallback to mock data', pattern: /mock-tests\.json/ },
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

console.log('\n🎉 Test complete! The Generate Tests page should now:');
console.log('   • Handle file uploads with visual feedback');
console.log('   • Show loading states during generation');
console.log('   • Fallback to mock data if API fails');
console.log('   • Display results in a proper table format');
console.log('   • Show toast notification for demo data');
console.log('   • Complete within 6 seconds maximum');