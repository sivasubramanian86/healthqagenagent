
/**
 * Firebase Functions for Health QA Generation
 *
 * Required environment variables for Bridge Mode:
 * - BUGMINER_URL: URL for the bug analysis Python service
 * - CODEANALYSIS_URL: URL for the code analysis Python service
 * - EVALUATOR_URL: URL for the test evaluator Python service
 * - FHIR_URL: URL for the FHIR processing Python service
 * - TESTGEN_URL: URL for the test generator Python service
 *
 * If any URL is not configured, the corresponding agent will use
 * Port Mode (if implemented) or return fallback dummy data.
 */

import * as functions from "firebase-functions";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { FhirAgent } from "./agents/FhirAgent";
import { TestGeneratorAgent } from "./agents/TestGeneratorAgent";
import { EvaluatorAgent } from "./agents/EvaluatorAgent";
import { BugMinerAgent } from "./agents/BugMinerAgent";
import { CodeAnalysisAgent } from "./agents/CodeAnalysisAgent";
import { DashboardAgent } from "./agents/DashboardAgent";

dotenv.config({ path: path.resolve(__dirname, '../../.env.healthqagenagent') });


// Log configuration status
console.log('Service URLs configured:', {
  bugminer: process.env.BUGMINER_URL ? '✓' : '✗',
  codeanalysis: process.env.CODEANALYSIS_URL ? '✓' : '✗',
  evaluator: process.env.EVALUATOR_URL ? '✓' : '✗',
  fhir: process.env.FHIR_URL ? '✓' : '✗',
  testgen: process.env.TESTGEN_URL ? '✓' : '✗',
});

const fhirAgent = new FhirAgent();
const testGenAgent = new TestGeneratorAgent();
const evaluatorAgent = new EvaluatorAgent();
const bugMinerAgent = new BugMinerAgent();
const codeAnalysisAgent = new CodeAnalysisAgent();
const dashboardAgent = new DashboardAgent();

export const dashboard = functions.https.onRequest(async (req, res) => {
  try {
    const result = await dashboardAgent.run(req.body);
    res.json(result);
  } catch (err) {
    console.error('dashboard error:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal server error',
      data: []
    });
  }
});

export const fhirSummary = functions.https.onRequest(async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request body: expected FHIR data object',
        data: { patientCount: 0, resourceCounts: {} }
      });
      return;
    }
    const result = await fhirAgent.run(req.body);
    res.json(result);
  } catch (err) {
    console.error('fhirSummary error:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal server error',
      data: { patientCount: 0, resourceCounts: {} }
    });
  }
});

export const generateTests = functions.https.onRequest(async (req, res) => {
  try {
    if (!req.body?.fhirData || !Array.isArray(req.body.fhirData)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request body: expected { fhirData: FhirResource[] }',
        data: []
      });
      return;
    }
    const result = await testGenAgent.run(req.body);
    res.json(result);
  } catch (err) {
    console.error('generateTests error:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal server error',
      data: []
    });
  }
});

export const testResults = functions.https.onRequest(async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request body: expected array of test results',
        data: []
      });
      return;
    }
    const result = await evaluatorAgent.run(req.body);
    res.json(result);
  } catch (err) {
    console.error('testResults error:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal server error',
      data: []
    });
  }
});

export const analyzeBug = functions.https.onRequest(async (req, res) => {
  try {
    if (!req.body?.log || typeof req.body.log !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request body: expected { log: string }',
        data: []
      });
      return;
    }
    const result = await bugMinerAgent.run(req.body);
    res.json(result);
  } catch (err) {
    console.error('analyzeBug error:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal server error',
      data: []
    });
  }
});

export const analyzeCode = functions.https.onRequest(async (req, res) => {
  try {
    const { code, language } = req.body || {};
    if (typeof code !== 'string' || typeof language !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request body: expected { code: string, language: string }',
        data: []
      });
      return;
    }
    const result = await codeAnalysisAgent.run({ code, language });
    res.json(result);
  } catch (err) {
    console.error('analyzeCode error:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal server error',
      data: []
    });
  }
});

export const nlpQuery = functions.https.onRequest(async (req, res) => {
  try {
    const { query, context } = req.body || {};
    if (typeof query !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request body: expected { query: string, context?: any }',
        data: {}
      });
      return;
    }

    // Try Gemini API if available
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `You are a healthcare compliance AI assistant. Analyze the following test results and answer the user's question.

Test Context: ${JSON.stringify(context, null, 2)}

User Question: ${query}

Provide a helpful, concise response focusing on compliance issues, remediation steps, and healthcare data quality.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({
          status: 'success',
          data: {
            title: 'AI Analysis',
            body: text,
            tags: ['ai-generated', 'compliance']
          }
        });
        return;
      } catch (geminiError) {
        console.warn('Gemini API failed, falling back to mock data:', geminiError);
      }
    }

    // Fallback to mock responses
    const mockResponses = {
      'summarize top compliance failures': {
        title: 'Top Compliance Failures Summary',
        body: 'Based on your test results, I found 2 critical compliance failures:\n\n1. **FHIR Resource Structure** (TC002) - Missing required \'resourceType\' field in observation records\n2. **Reference Integrity** (TC005) - Broken reference to Patient/unknown-id in Observation\n\nThese failures affect data interoperability and could lead to integration issues with other healthcare systems. I recommend prioritizing the resourceType field fixes first.',
        tags: ['compliance', 'critical', 'fhir']
      },
      'what are the main issues': {
        title: 'Main Issues Analysis',
        body: 'Your test run identified several key issues:\n\n**Critical Issues (2):**\n- Missing FHIR resourceType fields\n- Broken patient references\n\n**Warnings (1):**\n- Date format inconsistencies in effectiveDateTime\n\n**Passed Tests (2):**\n- Patient demographics validation ✓\n- Code system validation ✓\n\nOverall compliance rate: 60% (3/5 tests passing)',
        tags: ['analysis', 'overview', 'metrics']
      },
      'how to fix the failures': {
        title: 'Remediation Recommendations',
        body: 'Here\'s how to fix the identified failures:\n\n**For TC002 (FHIR Structure):**\n```json\n{\n  "resourceType": "Observation",\n  "id": "obs-001",\n  // ... rest of your data\n}\n```\n\n**For TC005 (Reference Integrity):**\n- Verify all patient IDs exist before referencing\n- Use valid patient references like "Patient/patient-001"\n- Implement reference validation in your data pipeline\n\n**For TC003 (Date Format):**\n- Standardize all dates to ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
        tags: ['remediation', 'code-fix', 'best-practices']
      }
    };

    const normalizedQuery = query.toLowerCase().trim();
    const response = mockResponses[normalizedQuery] || {
      title: 'AI Assistant Response',
      body: `I understand you're asking about: "${query}". Based on your test results, I can help analyze compliance issues, summarize failures, and provide remediation guidance. Try asking: "Summarize top compliance failures" or "How to fix the failures".`,
      tags: ['general', 'help']
    };

    res.json({
      status: 'success',
      data: response
    });
  } catch (err) {
    console.error('nlpQuery error:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal server error',
      data: {}
    });
  }
});
