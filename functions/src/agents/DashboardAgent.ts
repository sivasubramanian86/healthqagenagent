import axios from 'axios';
import { FhirAgent } from './FhirAgent';
import { TestGeneratorAgent } from './TestGeneratorAgent';
import { EvaluatorAgent } from './EvaluatorAgent';

export interface DashboardData {
  fhirSummary?: any;
  questions?: any[];
  results?: any[];
}

export class DashboardAgent {
  private fhirAgent = new FhirAgent();
  private testGenAgent = new TestGeneratorAgent();
  private evaluatorAgent = new EvaluatorAgent();

  /**
   * Bridge Mode: Aggregates data from multiple services
   */
  async run(input: any = {}): Promise<{ status: 'success' | 'error'; data: DashboardData; message?: string }> {
    const fallback: DashboardData = {
      fhirSummary: { patientCount: 42, resourceCounts: { Patient: 42 } },
      questions: [{ id: 'q1', question: 'Test question?', answer: '42' }],
      results: [{ id: 'q1', valid: true, reason: 'Passed' }]
    };

    try {
      // Get FHIR summary
      const fhirResult = await this.fhirAgent.run({});
      if (fhirResult.status === 'error') {
        return { status: 'error', message: fhirResult.message, data: fallback };
      }

      // Generate test questions using the FHIR resources
      const testResult = await this.testGenAgent.run({ fhirData: fhirResult.data.resources });
      if (testResult.status === 'error') {
        return { status: 'error', message: testResult.message, data: fallback };
      }

      // Evaluate results
      const evalResult = await this.evaluatorAgent.run(testResult.data);
      if (evalResult.status === 'error') {
        return { status: 'error', message: evalResult.message, data: fallback };
      }

      return {
        status: 'success',
        data: {
          fhirSummary: fhirResult.data,
          questions: testResult.data,
          results: evalResult.data
        }
      };
    } catch (err: any) {
      const message = 'Error aggregating dashboard data: ' + (err.message || 'Unknown error');
      console.error('DashboardAgent error:', message, err);
      return { status: 'error', message, data: fallback };
    }
  }
}
