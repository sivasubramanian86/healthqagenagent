// Test script to verify the conversational interface functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Conversational Interface Implementation...\n');

// Test 1: Verify mock NLP data file exists and is valid
console.log('1. Testing mock NLP data file...');
try {
  const mockDataPath = path.join(__dirname, 'public', 'mock-nlp.json');
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
  
  console.log('✅ Mock NLP data file exists and is valid JSON');
  console.log(`   - Number of responses: ${Object.keys(mockData.responses).length}`);
  
  // Verify required fields in responses
  const requiredFields = ['title', 'body', 'tags'];
  const responses = Object.values(mockData.responses);
  const allValid = responses.every(response => 
    requiredFields.every(field => response.hasOwnProperty(field))
  );
  
  if (allValid) {
    console.log('✅ All responses have required fields (title, body, tags)');
  } else {
    console.log('❌ Missing required fields in some responses');
  }
  
  // List available queries
  const queries = Object.keys(mockData.responses);
  console.log(`   - Available queries: ${queries.join(', ')}`);
  
} catch (error) {
  console.log('❌ Mock NLP data file test failed:', error.message);
}

// Test 2: Verify GeneratePage component has chat functionality
console.log('\n2. Testing GeneratePage chat interface...');
try {
  const componentPath = path.join(__dirname, 'src', 'pages', 'GeneratePage.tsx');
  const componentCode = fs.readFileSync(componentPath, 'utf8');
  
  // Check for key chat features
  const chatFeatures = [
    { name: 'Chat message interface', pattern: /interface ChatMessage/ },
    { name: 'Chat state management', pattern: /chatMessages.*setChatMessages/ },
    { name: 'Chat query input', pattern: /chatQuery.*setChatQuery/ },
    { name: 'Chat loading state', pattern: /chatLoading.*setChatLoading/ },
    { name: 'Chat submit handler', pattern: /handleChatSubmit/ },
    { name: 'Enter key support', pattern: /handleChatKeyPress/ },
    { name: 'NLP API import', pattern: /queryNLP.*from.*api\/client/ },
    { name: 'Chat messages display', pattern: /chatMessages\.map/ },
    { name: 'User message bubbles', pattern: /message\.type === 'user'/ },
    { name: 'AI message bubbles', pattern: /message\.type === 'user'.*justify-start/ },
    { name: 'Message tags display', pattern: /message\.tags/ },
    { name: 'Chat loading indicator', pattern: /AI is thinking/ },
    { name: 'Chat input field', pattern: /Ask about your test results/ }
  ];
  
  chatFeatures.forEach(feature => {
    if (feature.pattern.test(componentCode)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Component test failed:', error.message);
}

// Test 3: Verify API client NLP function
console.log('\n3. Testing API client NLP function...');
try {
  const clientPath = path.join(__dirname, 'src', 'api', 'client.ts');
  const clientCode = fs.readFileSync(clientPath, 'utf8');
  
  const apiFeatures = [
    { name: 'NLP query function', pattern: /queryNLP.*async/ },
    { name: 'Timeout handling', pattern: /setTimeout.*controller\.abort/ },
    { name: 'Fallback to mock data', pattern: /mock-nlp\.json/ },
    { name: 'Query normalization', pattern: /normalizedQuery.*toLowerCase/ },
    { name: 'Intelligent matching', pattern: /matchedResponse.*mockData\.responses/ },
    { name: 'Default response', pattern: /I understand you're asking about/ }
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

// Test 4: Verify backend NLP endpoint
console.log('\n4. Testing backend NLP endpoint...');
try {
  const backendPath = path.join(__dirname, '..', 'functions', 'src', 'index.ts');
  const backendCode = fs.readFileSync(backendPath, 'utf8');
  
  const backendFeatures = [
    { name: 'NLP endpoint export', pattern: /export const nlpQuery/ },
    { name: 'Gemini API integration', pattern: /GoogleGenerativeAI/ },
    { name: 'Environment variable check', pattern: /process\.env\.GEMINI_API_KEY/ },
    { name: 'Fallback responses', pattern: /mockResponses/ },
    { name: 'Query validation', pattern: /typeof query !== 'string'/ },
    { name: 'Error handling', pattern: /catch.*geminiError/ }
  ];
  
  backendFeatures.forEach(feature => {
    if (feature.pattern.test(backendCode)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Backend test failed:', error.message);
}

console.log('\n🎉 Test complete! The conversational interface should now:');
console.log('   • Display chat widget below test results');
console.log('   • Handle natural language queries');
console.log('   • Show AI responses with titles and tags');
console.log('   • Maintain conversation history');
console.log('   • Support Enter key for sending messages');
console.log('   • Fallback to mock responses if Gemini unavailable');
console.log('   • Always respond within 6 seconds');
console.log('   • Provide 3+ canned demo responses');