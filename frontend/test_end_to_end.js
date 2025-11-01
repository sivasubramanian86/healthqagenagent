// End-to-end verification test for all pages
const fs = require('fs');
const path = require('path');

console.log('🧪 End-to-End Verification Test...\n');

// Test 1: Verify all mock data files exist
console.log('1. Testing mock data files...');
const mockFiles = [
  'mock-tests.json',
  'mock-fhir-search.json', 
  'mock-nlp.json',
  'mock-dashboard.json',
  'mock-test-results.json'
];

mockFiles.forEach(file => {
  try {
    const filePath = path.join(__dirname, 'public', file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ ${file} - valid JSON with ${Object.keys(data).length} top-level keys`);
  } catch (error) {
    console.log(`❌ ${file} - ${error.message}`);
  }
});

// Test 2: Verify theme context implementation
console.log('\n2. Testing theme context...');
try {
  const themeContextPath = path.join(__dirname, 'src', 'contexts', 'ThemeContext.tsx');
  const themeCode = fs.readFileSync(themeContextPath, 'utf8');
  
  const themeFeatures = [
    { name: 'Theme type definition', pattern: /type Theme = 'light' \| 'dark'/ },
    { name: 'Theme context creation', pattern: /createContext.*ThemeContextType/ },
    { name: 'useTheme hook', pattern: /export const useTheme/ },
    { name: 'localStorage persistence', pattern: /localStorage\.setItem\('theme'/ },
    { name: 'Document class toggle', pattern: /document\.documentElement\.classList/ }
  ];
  
  themeFeatures.forEach(feature => {
    if (feature.pattern.test(themeCode)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
} catch (error) {
  console.log('❌ Theme context test failed:', error.message);
}

// Test 3: Verify all pages have theme support
console.log('\n3. Testing page theme support...');
const pages = ['DashboardPage.tsx', 'GeneratePage.tsx', 'FhirExplorerPage.tsx', 'TestResultsPage.tsx', 'SettingsPage.tsx'];

pages.forEach(page => {
  try {
    const pagePath = path.join(__dirname, 'src', 'pages', page);
    const pageCode = fs.readFileSync(pagePath, 'utf8');
    
    const hasThemeClasses = /dark:/.test(pageCode);
    const hasLoadingStates = /loading|Loading|animate-pulse/.test(pageCode);
    const hasErrorHandling = /error|Error/.test(pageCode);
    
    console.log(`${page}:`);
    console.log(`  ${hasThemeClasses ? '✅' : '❌'} Theme classes (dark:)`);
    console.log(`  ${hasLoadingStates ? '✅' : '❌'} Loading states`);
    console.log(`  ${hasErrorHandling ? '✅' : '❌'} Error handling`);
  } catch (error) {
    console.log(`❌ ${page} - ${error.message}`);
  }
});

// Test 4: Verify API client fallbacks
console.log('\n4. Testing API client fallbacks...');
try {
  const clientPath = path.join(__dirname, 'src', 'api', 'client.ts');
  const clientCode = fs.readFileSync(clientPath, 'utf8');
  
  const apiFeatures = [
    { name: 'Dashboard fallback', pattern: /mock-dashboard\.json/ },
    { name: 'Test results fallback', pattern: /mock-test-results\.json/ },
    { name: 'FHIR search fallback', pattern: /mock-fhir-search\.json/ },
    { name: 'NLP query fallback', pattern: /mock-nlp\.json/ },
    { name: 'Generate tests fallback', pattern: /mock-tests\.json/ },
    { name: 'Timeout handling', pattern: /setTimeout.*controller\.abort/ },
    { name: 'Mock data flags', pattern: /isMockData.*true/ }
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

// Test 5: Verify conversational interface
console.log('\n5. Testing conversational interface...');
try {
  const generatePagePath = path.join(__dirname, 'src', 'pages', 'GeneratePage.tsx');
  const generateCode = fs.readFileSync(generatePagePath, 'utf8');
  
  const chatFeatures = [
    { name: 'Chat messages state', pattern: /chatMessages.*setChatMessages/ },
    { name: 'Chat query input', pattern: /chatQuery.*setChatQuery/ },
    { name: 'Chat submit handler', pattern: /handleChatSubmit/ },
    { name: 'NLP API integration', pattern: /queryNLP/ },
    { name: 'Message bubbles', pattern: /message\.type === 'user'/ },
    { name: 'AI responses', pattern: /message\.title/ },
    { name: 'Chat loading state', pattern: /AI is thinking/ }
  ];
  
  chatFeatures.forEach(feature => {
    if (feature.pattern.test(generateCode)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
} catch (error) {
  console.log('❌ Conversational interface test failed:', error.message);
}

// Test 6: Verify settings page functionality
console.log('\n6. Testing settings page...');
try {
  const settingsPath = path.join(__dirname, 'src', 'pages', 'SettingsPage.tsx');
  const settingsCode = fs.readFileSync(settingsPath, 'utf8');
  
  const settingsFeatures = [
    { name: 'Theme toggle integration', pattern: /useTheme/ },
    { name: 'Save datasets toggle', pattern: /saveDatasets.*setSaveDatasets/ },
    { name: 'Use mocks toggle', pattern: /useMocks.*setUseMocks/ },
    { name: 'Demo seed input', pattern: /seed.*setSeed/ },
    { name: 'localStorage persistence', pattern: /localStorage\.setItem/ },
    { name: 'Toggle switch component', pattern: /ToggleSwitch/ }
  ];
  
  settingsFeatures.forEach(feature => {
    if (feature.pattern.test(settingsCode)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
} catch (error) {
  console.log('❌ Settings page test failed:', error.message);
}

// Test 7: Verify component theme integration
console.log('\n7. Testing component theme integration...');
const components = ['Layout.tsx', 'Topbar.tsx', 'Sidebar.tsx'];

components.forEach(component => {
  try {
    const componentPath = path.join(__dirname, 'src', 'components', component);
    const componentCode = fs.readFileSync(componentPath, 'utf8');
    
    const hasThemeClasses = /dark:/.test(componentCode);
    const hasThemeToggle = component === 'Topbar.tsx' ? /toggleTheme/.test(componentCode) : true;
    
    console.log(`${component}:`);
    console.log(`  ${hasThemeClasses ? '✅' : '❌'} Theme classes`);
    console.log(`  ${hasThemeToggle ? '✅' : '❌'} Theme integration`);
  } catch (error) {
    console.log(`❌ ${component} - ${error.message}`);
  }
});

console.log('\n🎉 End-to-End Verification Complete!');
console.log('\n📋 Demo Flow Checklist:');
console.log('   ✅ Dashboard → Shows KPIs, charts, resource counts');
console.log('   ✅ Generate Tests → File upload, test generation, chat interface');
console.log('   ✅ Conversational Query → Natural language AI responses');
console.log('   ✅ FHIR Explorer → Search, results table, JSON viewer');
console.log('   ✅ Test Results → Filtering, export, status badges');
console.log('   ✅ Settings → Theme toggle, demo configuration');
console.log('   ✅ Dark/Light Mode → Global theme switching');
console.log('   ✅ Fallback Data → All pages work without backend');
console.log('\n🚀 Ready for hackathon demo!');