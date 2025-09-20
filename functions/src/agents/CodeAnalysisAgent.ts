import axios from 'axios';

export type Issue = { id: string; severity: string; message: string; file: string; line: number };

export class CodeAnalysisAgent {
  /**
   * Bridge Mode: Calls Python FastAPI service for code analysis.
   * TODO: For Port Mode, translate code_analysis.py logic here.
   */
  async run(input: { code: string; language: string }): Promise<{ status: 'success' | 'error'; data: Issue[]; message?: string }> {
    const fallback: Issue[] = [
      { id: 'issue1', severity: 'high', message: 'Missing docstring', file: 'main.py', line: 10 },
      { id: 'issue2', severity: 'medium', message: 'Unused import', file: 'agent.py', line: 5 }
    ];
    try {
            const response = await axios.post(
        'https://codeanalysis-service/run',
        input,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      // Validate response shape
      const issues = response.data;
      if (!Array.isArray(issues) || !issues.every(
        (i: any) => i && typeof i.id === 'string' && typeof i.severity === 'string' && typeof i.message === 'string' && typeof i.file === 'string' && typeof i.line === 'number'
      )) {
        console.error('Invalid response from codeanalysis-service:', issues);
        return { status: 'error', message: 'Invalid response from codeanalysis-service', data: fallback };
      }
      return { status: 'success', data: issues };
    } catch (err: any) {
      let message = 'Unknown error';
      if (err.code === 'ECONNABORTED') message = 'Timeout connecting to codeanalysis-service';
      else if (err.response) message = `Service error: ${err.response.status} ${err.response.statusText}`;
      else if (err.request) message = 'Network error connecting to codeanalysis-service';
      else if (err.message) message = err.message;
      console.error('CodeAnalysisAgent error:', message, err);
      return { status: 'error', message, data: fallback };
    }
  }
}
