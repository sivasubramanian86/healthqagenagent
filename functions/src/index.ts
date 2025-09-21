// Force redeploy

import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { DashboardAgent } from './agents/DashboardAgent';
import { FhirAgent } from './agents/FhirAgent';
import { TestGeneratorAgent } from './agents/TestGeneratorAgent';
import { EvaluatorAgent } from './agents/EvaluatorAgent';
import { BugMinerAgent } from './agents/BugMinerAgent';
import { CodeAnalysisAgent } from './agents/CodeAnalysisAgent';

// Set global runtime options for all functions
setGlobalOptions({ 
    timeoutSeconds: 120, 
    memory: '1GiB' 
});

// API Proxies
// These functions act as simple proxies that call the respective agent's run method.

export const dashboard = onRequest(async (req, res) => {
    try {
        const agent = new DashboardAgent();
        const result = await agent.run(req.body);
        res.set('Access-Control-Allow-Origin', '*'); // Add CORS headers
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Critical error in dashboard function:", error);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).json({ status: 'error', message: error.message, data: {} });
    }
});

export const fhirSummary = onRequest(async (req, res) => {
    try {
        const agent = new FhirAgent();
        const result = await agent.run(req.body);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Critical error in fhirSummary function:", error);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).json({ status: 'error', message: error.message, data: {} });
    }
});

export const generateTests = onRequest(async (req, res) => {
    try {
        const agent = new TestGeneratorAgent();
        const result = await agent.run(req.body);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Critical error in generateTests function:", error);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).json({ status: 'error', message: error.message, data: {} });
    }
});

export const testResults = onRequest(async (req, res) => {
    try {
        const agent = new EvaluatorAgent();
        const result = await agent.run(req.body);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Critical error in testResults function:", error);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).json({ status: 'error', message: error.message, data: {} });
    }
});

export const analyzeBug = onRequest(async (req, res) => {
    try {
        const agent = new BugMinerAgent();
        const result = await agent.run(req.body);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Critical error in analyzeBug function:", error);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).json({ status: 'error', message: error.message, data: {} });
    }
});

export const analyzeCode = onRequest(async (req, res) => {
    try {
        const agent = new CodeAnalysisAgent();
        const result = await agent.run(req.body);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Critical error in analyzeCode function:", error);
        res.set('Access-Control-Allow-Origin', '*');
        res.status(500).json({ status: 'error', message: error.message, data: {} });
    }
});
