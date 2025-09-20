
import { GoogleAuth } from 'google-auth-library';
import { logger } from 'firebase-functions/v1';

export type BugReport = {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
};

export class BugMinerAgent {
  private async getAuthenticatedClient(targetAudience: string) {
    const auth = new GoogleAuth();
    return auth.getIdTokenClient(targetAudience);
  }

  async run(input: { log: string }): Promise<{ status: 'success' | 'error'; data: BugReport[]; message?: string }> {
    const fallback: BugReport[] = [
      { id: 'bug1', title: 'UI Crash on Login', description: 'The app crashes when the user tries to log in with invalid credentials.', stepsToReproduce: ['Enter wrong password', 'Click login'], severity: 'critical' }
    ];

    const bugminerUrl = process.env.BUGMINER_URL;
    if (!bugminerUrl) {
      logger.warn('BUGMINER_URL not set, using fallback data');
      return { status: 'success', data: fallback };
    }

    try {
      const client = await this.getAuthenticatedClient(bugminerUrl);
      const response = await client.request({
        url: bugminerUrl,
        method: 'POST',
        data: input,
      });

      const reports = response.data as BugReport[];
      if (!Array.isArray(reports) || !reports.every(
        (r: any) => r && typeof r.id === 'string' && typeof r.title === 'string'
      )) {
        logger.error('Invalid response from bugminer-service:', reports);
        return { status: 'error', message: 'Invalid response from bugminer-service', data: fallback };
      }

      return { status: 'success', data: reports };
    } catch (err: any) {
      let message = 'Unknown error in BugMinerAgent';
      if (err.code === 'ECONNABORTED') message = 'Timeout connecting to bugminer-service';
      else if (err.response) message = `Service error: ${err.response.status} ${err.response.statusText}`;
      else if (err.request) message = 'Network error connecting to bugminer-service';
      else if (err.message) message = err.message;
      logger.error('BugMinerAgent error:', message, err);
      return { status: 'error', message, data: fallback };
    }
  }
}
