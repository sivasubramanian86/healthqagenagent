
import { GoogleAuth } from 'google-auth-library';
import { logger } from 'firebase-functions/v1';

// Common type used across agents
export type FhirResource = { [key: string]: any };

export interface FhirSummary {
  patientCount: number;
  resourceCounts: Record<string, number>;
  resources: FhirResource[];
}

export class FhirAgent {
  private async getAuthenticatedClient(targetAudience: string) {
    const auth = new GoogleAuth();
    return auth.getIdTokenClient(targetAudience);
  }

  async run(input: any): Promise<{ status: 'success' | 'error'; data: FhirSummary; message?: string }> {
    const fallback: FhirSummary = {
      patientCount: 42,
      resourceCounts: { Patient: 42, Observation: 120, Condition: 15 },
      resources: [
        { resourceType: 'Patient', id: 'p1', birthDate: '1980-01-01' },
        { resourceType: 'Observation', id: 'o1', code: 'blood-pressure', value: 120 }
      ]
    };

    const fhirUrl = process.env.FHIR_URL;
    if (!fhirUrl) {
      logger.warn('FHIR_URL not set, using fallback data');
      return { status: 'success', data: fallback };
    }

    try {
      const client = await this.getAuthenticatedClient(fhirUrl);
      const response = await client.request({
        url: fhirUrl,
        method: 'POST',
        data: input,
      });

      const summary = response.data as FhirSummary;
      if (!summary || typeof summary.patientCount !== 'number') {
        logger.error('Invalid response from fhir-service:', summary);
        return { status: 'error', message: 'Invalid response from fhir-service', data: fallback };
      }

      return { status: 'success', data: summary };
    } catch (err: any) {
      let message = 'Unknown error in FhirAgent';
      if (err.code === 'ECONNABORTED') message = 'Timeout connecting to fhir-service';
      else if (err.response) message = `Service error: ${err.response.status} ${err.response.statusText}`;
      else if (err.request) message = 'Network error connecting to fhir-service';
      else if (err.message) message = err.message;
      logger.error('FhirAgent error:', message, err);
      return { status: 'error', message, data: fallback };
    }
  }
}
