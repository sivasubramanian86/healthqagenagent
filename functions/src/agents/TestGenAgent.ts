// This file is deprecated. Use TestGeneratorAgent.ts instead.
export interface TestQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  rationale: string;
}

// Re-export from TestGeneratorAgent to maintain backwards compatibility
export { TestGeneratorAgent as TestGenAgent } from './TestGeneratorAgent';
