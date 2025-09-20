/**
 * Firebase Functions for Health QA Generation
 * 
 * Required environment variables for Bridge Mode:
 * - PY_TESTGEN_URL: URL for the test generator Python service
 * - PY_EVALUATOR_URL: URL for the test evaluator Python service
 * - PY_BUGMINER_URL: URL for the bug analysis Python service
 * - PY_CODEANALYSIS_URL: URL for the code analysis Python service
 * - PY_FHIR_URL: URL for the FHIR processing Python service
 * 
 * If any URL is not configured, the corresponding agent will use
 * Port Mode (if implemented) or return fallback dummy data.
 */

import * as functions from "firebase-functions";
import { FhirAgent } from "./agents/FhirAgent";
import { TestGeneratorAgent } from "./agents/TestGeneratorAgent";
import { EvaluatorAgent } from "./agents/EvaluatorAgent";
import { BugMinerAgent } from "./agents/BugMinerAgent";
import { CodeAnalysisAgent } from "./agents/CodeAnalysisAgent";

// Initialize environment variables from Firebase config
process.env.PY_FHIR_URL = functions.config().python?.fhir_url;
process.env.PY_TESTGEN_URL = functions.config().python?.testgen_url;
process.env.PY_EVALUATOR_URL = functions.config().python?.evaluator_url;
process.env.PY_BUGMINER_URL = functions.config().python?.bugminer_url;
process.env.PY_CODEANALYSIS_URL = functions.config().python?.codeanalysis_url;

// Log configuration status
console.log('Service URLs configured:', {
  fhir: process.env.PY_FHIR_URL ? '✓' : '✗',
  testgen: process.env.PY_TESTGEN_URL ? '✓' : '✗',
  evaluator: process.env.PY_EVALUATOR_URL ? '✓' : '✗',
  bugminer: process.env.PY_BUGMINER_URL ? '✓' : '✗',
  codeanalysis: process.env.PY_CODEANALYSIS_URL ? '✓' : '✗'
});

const fhirAgent = new FhirAgent();
const testGenAgent = new TestGeneratorAgent();
const evaluatorAgent = new EvaluatorAgent();
const bugMinerAgent = new BugMinerAgent();
const codeAnalysisAgent = new CodeAnalysisAgent();

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
