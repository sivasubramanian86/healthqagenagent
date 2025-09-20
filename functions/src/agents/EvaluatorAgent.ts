import { safePost } from '../utils/http';
import { TestQuestion } from './TestGeneratorAgent';

export interface TestResult {
  id: string;
  valid: boolean;
  reason?: string;
}

/**
 * Evaluates test results for compliance and correctness.
 * 
 * Bridge Mode: Calls Python FastAPI service deployed at process.env.PY_EVALUATOR_URL
 * If PY_EVALUATOR_URL is not set, returns fallback dummy data.
 * 
 * Port Mode TODO: Inline the Python evaluation logic here:
 * 1. Validate answer format and constraints
 * 2. Check against reference data
 * 3. Generate feedback messages
 */
export class EvaluatorAgent {
  private readonly fallbackResults: TestResult[] = [
    { id: 'q1', valid: true, reason: 'Passed basic compliance' },
    { id: 'q2', valid: false, reason: 'Answer format incorrect' }
  ];

  async run(input: any[]): Promise<{ status: 'success' | 'error'; data: TestResult[]; message?: string }> {
    // Validate input
    if (!Array.isArray(input)) {
      return {
        status: 'error',
        message: 'Invalid input: must be an array',
        data: this.fallbackResults
      };
    }

    const result = await safePost<TestResult[]>(
      process.env.PY_EVALUATOR_URL,
      input,
      this.fallbackResults,
      {
        timeout: 5000,
        validateStatus: (status) => status === 200
      }
    );

    // Additional response validation
    if (result.status === 'success' && (!Array.isArray(result.data) || !result.data.every(
      (r: any) => r && typeof r.id === 'string' && typeof r.valid === 'boolean'
    ))) {
      console.error('Invalid response data structure:', result.data);
      return {
        status: 'error',
        message: 'Invalid response format from evaluator service',
        data: this.fallbackResults
      };
    }

    return result;
  }
}
