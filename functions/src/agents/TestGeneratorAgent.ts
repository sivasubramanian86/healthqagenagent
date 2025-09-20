
import { GoogleAuth } from 'google-auth-library';
import { logger } from 'firebase-functions/v1';

// Common types shared across agents
export type FhirResource = { [key: string]: any };

export type TestQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  rationale: string;
};

/**
 * Generates quiz questions from FHIR data.
 *
 * Bridge Mode: Calls Python FastAPI service deployed via process.env.TESTGEN_URL
 * Port Mode: If the URL is not set, runs simplified inline logic to generate a question.
 */
export class TestGeneratorAgent {
  private readonly fallbackQuestions: TestQuestion[] = [
    {
      id: 'q1',
      questionText: 'What is the primary diagnosis for Patient X?',
      options: ['Hypertension', 'Diabetes', 'Asthma', 'Fever'],
      correctAnswer: 'Diabetes',
      rationale: `The patient\'s record shows elevated blood sugar levels consistent with Diabetes.`
    }
  ];

  private async getAuthenticatedClient(targetAudience: string) {
    const auth = new GoogleAuth();
    return auth.getIdTokenClient(targetAudience);
  }

  async run(input: { fhirData: FhirResource[] }): Promise<{ status: 'success' | 'error'; data: TestQuestion[]; message?: string }> {
    const testGenUrl = process.env.TESTGEN_URL;

    // --- Port Mode --- 
    // If no URL is configured, run simplified logic directly in the function.
    if (!testGenUrl) {
      logger.info("TESTGEN_URL not set. Running in Port Mode (inline logic).");

      if (!input.fhirData || !Array.isArray(input.fhirData) || input.fhirData.length === 0) {
        logger.warn("Port Mode: No FHIR data provided. Returning fallback questions.");
        return { status: 'success', data: this.fallbackQuestions, message: 'Port Mode: No data provided.' };
      }

      try {
        const patient = input.fhirData.find(r => r.resourceType === 'Patient');
        const observation = input.fhirData.find(r => r.resourceType === 'Observation' && r.valueQuantity?.value);

        if (!patient || !observation) {
          logger.warn("Port Mode: Could not find a Patient and a valid Observation. Returning fallback questions.");
          return { status: 'success', data: this.fallbackQuestions, message: 'Port Mode: Insufficient data found.' };
        }

        const patientName = patient.name?.[0]?.given?.[0] ? `${patient.name[0].given[0]} ${patient.name[0].family || ''}`.trim() : `patient ${patient.id}`;
        const obsCodeText = observation.code?.text || 'the observation';
        const obsValue = observation.valueQuantity.value;
        const obsUnit = observation.valueQuantity.unit || '';
        const correctAnswer = `${obsValue} ${obsUnit}`.trim();

        // Generate plausible incorrect options and shuffle them
        const options = Array.from(new Set([
            correctAnswer,
            `${(obsValue * 0.85).toFixed(1)} ${obsUnit}`.trim(),
            `${(obsValue * 1.15).toFixed(1)} ${obsUnit}`.trim(),
            `Value not recorded`
        ])).sort(() => Math.random() - 0.5);

        const generatedQuestion: TestQuestion = {
            id: `port-mode-${new Date().getTime()}`,
            questionText: `For ${patientName}, what was the recorded value for '${obsCodeText}'?`,
            options,
            correctAnswer,
            rationale: `The patient\'s FHIR record (Observation/${observation.id}) shows a value of ${correctAnswer} for the code '${obsCodeText}'.`
        };

        logger.info("Port Mode: Successfully generated a question inline.");
        return {
            status: 'success',
            data: [generatedQuestion]
        };

      } catch (error: any) {
        logger.error("Port Mode: An unexpected error occurred during inline generation:", error);
        return { status: 'error', data: this.fallbackQuestions, message: `Port Mode Error: ${error.message}` };
      }
    }

    // --- Bridge Mode --- 
    // If URL is set, call the external Python service.
    if (!Array.isArray(input.fhirData)) {
      return {
        status: 'error',
        message: 'Invalid input: fhirData must be an array',
        data: this.fallbackQuestions
      };
    }

    try {
      logger.info(`Bridge Mode: Calling Test Generator service at ${testGenUrl}`)
      const client = await this.getAuthenticatedClient(testGenUrl);
      const response = await client.request({
        url: testGenUrl,
        method: "POST",
        data: input,
      });

      const questions = response.data as TestQuestion[];

      if (!Array.isArray(questions) || !questions.every(
        (q: any) => q && typeof q.id === 'string' && typeof q.questionText === 'string'
      )) {
        logger.error('Invalid response data structure from test-generator-service:', questions);
        return { status: 'error', message: 'Invalid response format from test generator service', data: this.fallbackQuestions };
      }
      
      return {
        status: 'success',
        data: questions,
      };
    } catch (error: any) {
      logger.error("Error calling test generator service:", error);
      return { status: 'error', message: error.message, data: this.fallbackQuestions };
    }
  }
}
