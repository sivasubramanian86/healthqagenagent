import axios from 'axios';

// Common type used across agents
export type FhirResource = { [key: string]: any };

export interface FhirSummary {
  patientCount: number;
  resourceCounts: Record<string, number>;
  resources: FhirResource[]; // Add resources array for compatibility
}

export class FhirAgent {
  /**
   * Bridge Mode: Calls Python FastAPI service for FHIR data analysis.
   * TODO: For Port Mode, translate the Python FHIR logic here.
   */
  async run(input: any): Promise<{ status: 'success' | 'error'; data: FhirSummary; message?: string }> {
    const fallback: FhirSummary = {
      patientCount: 42,
      resourceCounts: { Patient: 42, Observation: 120, Condition: 15 },
      resources: [
        { resourceType: 'Patient', id: 'p1', birthDate: '1980-01-01' },
        { resourceType: 'Observation', id: 'o1', code: 'blood-pressure', value: 120 }
      ]
    };

    try {
      const response = await axios.post(
        'https://fhir-service/run',
        input,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );

      const summary = response.data;
      if (!summary || typeof summary.patientCount !== 'number') {
        console.error('Invalid response from fhir-service:', summary);
        return { status: 'error', message: 'Invalid response from fhir-service', data: fallback };
      }

      return { status: 'success', data: summary };
    } catch (err: any) {
      let message = 'Unknown error in FhirAgent';
      if (err.code === 'ECONNABORTED') message = 'Timeout connecting to fhir-service';
      else if (err.response) message = `Service error: ${err.response.status} ${err.response.statusText}`;
      else if (err.request) message = 'Network error connecting to fhir-service';
      else if (err.message) message = err.message;
      console.error('FhirAgent error:', message, err);
      return { status: 'error', message, data: fallback };
    }
  }
}
