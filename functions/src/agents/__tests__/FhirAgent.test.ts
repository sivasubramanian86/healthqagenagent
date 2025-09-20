import { FhirAgent } from '../FhirAgent';

describe('FhirAgent', () => {
  it('returns fallback data on error', async () => {
    const agent = new FhirAgent();
    const result = await agent.run({});
    expect(result).toEqual({
      status: 'error',
      message: expect.any(String),
      data: {
        patientCount: 42,
        resourceCounts: { Patient: 42, Observation: 120, Condition: 15 }
      }
    });
  });
});
