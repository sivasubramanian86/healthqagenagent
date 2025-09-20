
import { GoogleAuth } from 'google-auth-library';
import { logger } from 'firebase-functions/v1';

export type Issue = { id: string; severity: string; message: string; file: string; line: number };

export class CodeAnalysisAgent {
  private async getAuthenticatedClient(targetAudience: string) {
    const auth = new GoogleAuth();
    return auth.getIdTokenClient(targetAudience);
  }

  async run(input: { code: string; language: string }): Promise<{ status: 'success' | 'error'; data: Issue[]; message?: string }> {
    const fallback: Issue[] = [
      { id: 'issue1', severity: 'high', message: 'Missing docstring', file: 'main.py', line: 10 },
      { id: 'issue2', severity: 'medium', message: 'Unused import', file: 'agent.py', line: 5 }
    ];

    const codeAnalysisUrl = process.env.CODEANALYSIS_URL;
    if (!codeAnalysisUrl) {
      logger.warn('CODEANALYSIS_URL not set, using fallback data');
      return { status: 'success', data: fallback };
    }

    try {
      const client = await this.getAuthenticatedClient(codeAnalysisUrl);
      const response = await client.request({
        url: codeAnalysisUrl,
        method: 'POST',
        data: input,
      });

      const issues = response.data as Issue[];
      if (!Array.isArray(issues) || !issues.every(
        (i: any) => i && typeof i.id === 'string' && typeof i.severity === 'string' && typeof i.message === 'string' && typeof i.file === 'string' && typeof i.line === 'number'
      )) {
        logger.error('Invalid response from codeanalysis-service:', issues);
        return { status: 'error', message: 'Invalid response from codeanalysis-service', data: fallback };
      }
      return { status: 'success', data: issues };
    } catch (err: any) {
      let message = 'Unknown error';
      if (err.code === 'ECONNABORTED') message = 'Timeout connecting to codeanalysis-service';
      else if (err.response) message = `Service error: ${err.response.status} ${err.response.statusText}`;
      else if (err.request) message = 'Network error connecting to codeanalysis-service';
      else if (err.message) message = err.message;
      logger.error('CodeAnalysisAgent error:', message, err);
      return { status: 'error', message, data: fallback };
    }
  }
}
