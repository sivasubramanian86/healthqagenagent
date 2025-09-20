
import { GoogleAuth } from 'google-auth-library';
import { logger } from 'firebase-functions/v1';

export interface TestResult {
  id: string;
  valid: boolean;
  reason?: string;
}

export class EvaluatorAgent {
  private readonly fallbackResults: TestResult[] = [
    { id: 'q1', valid: true, reason: 'Passed basic compliance' },
    { id: 'q2', valid: false, reason: 'Answer format incorrect' }
  ];

  private async getAuthenticatedClient(targetAudience: string) {
    const auth = new GoogleAuth();
    return auth.getIdTokenClient(targetAudience);
  }

  async run(input: any[]): Promise<{ status: 'success' | 'error'; data: TestResult[]; message?: string }> {
    if (!Array.isArray(input)) {
      return {
        status: 'error',
        message: 'Invalid input: must be an array',
        data: this.fallbackResults
      };
    }

    const evaluatorUrl = process.env.EVALUATOR_URL;
    if (!evaluatorUrl) {
      logger.warn('EVALUATOR_URL not set, using fallback data');
      return { status: 'success', data: this.fallbackResults };
    }

    try {
      const client = await this.getAuthenticatedClient(evaluatorUrl);
      const response = await client.request({
        url: evaluatorUrl,
        method: 'POST',
        data: input,
      });

      const results = response.data as TestResult[];
      if (!Array.isArray(results) || !results.every(
        (r: any) => r && typeof r.id === 'string' && typeof r.valid === 'boolean'
      )) {
        logger.error('Invalid response data structure:', results);
        return {
          status: 'error',
          message: 'Invalid response format from evaluator service',
          data: this.fallbackResults
        };
      }

      return { status: 'success', data: results };
    } catch (error) {
      logger.error('Error calling evaluator service:', error);
      return { status: 'error', data: this.fallbackResults };
    }
  }
}
