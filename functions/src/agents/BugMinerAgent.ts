import axios from 'axios';

export type BugReport = {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
};

export class BugMinerAgent {
  /**
   * Bridge Mode: Calls Python FastAPI service for bug analysis.
   * TODO: For Port Mode, translate bug_miner.py logic here.
   */
  async run(input: { log: string }): Promise<{ status: 'success' | 'error'; data: BugReport[]; message?: string }> {
    const fallback: BugReport[] = [
      { id: 'bug1', title: 'UI Crash on Login', description: 'The app crashes when the user tries to log in with invalid credentials.', stepsToReproduce: ['Enter wrong password', 'Click login'], severity: 'critical' }
    ];

    try {
      const response = await axios.post(
        'https://bugminer-service/run',
        input,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );

      const reports = response.data;
      if (!Array.isArray(reports) || !reports.every(
        (r: any) => r && typeof r.id === 'string' && typeof r.title === 'string'
      )) {
        console.error('Invalid response from bugminer-service:', reports);
        return { status: 'error', message: 'Invalid response from bugminer-service', data: fallback };
      }

      return { status: 'success', data: reports };
    } catch (err: any) {
      let message = 'Unknown error in BugMinerAgent';
      if (err.code === 'ECONNABORTED') message = 'Timeout connecting to bugminer-service';
      else if (err.response) message = `Service error: ${err.response.status} ${err.response.statusText}`;
      else if (err.request) message = 'Network error connecting to bugminer-service';
      else if (err.message) message = err.message;
      console.error('BugMinerAgent error:', message, err);
      return { status: 'error', message, data: fallback };
    }
  }
}
