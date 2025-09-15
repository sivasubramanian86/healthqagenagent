"""CoordinatorAgent: orchestrates all agents end-to-end."""
from __future__ import annotations

from typing import List

from common.models import Requirement, CodeSymbol, BugItem, GeneratedTest
from agents.requirement_parser import RequirementParserAgent
from agents.code_analysis import CodeAnalysisAgent
from agents.bug_miner import BugMinerAgent
from agents.test_generator import TestGeneratorAgent
from agents.validation import ValidationAgent
from agents.traceability import TraceabilityAgent


class CoordinatorAgent:
    """Orchestrates loading requirements, generating tests, validating, and exporting traceability."""

    def __init__(self, storage_bucket: str, bq_dataset: str = "healthqa_metrics"):
        self.code_analyzer = CodeAnalysisAgent(storage_bucket)
        self.req_parser = RequirementParserAgent()
        self.bug_miner = BugMinerAgent()
        self.test_generator = TestGeneratorAgent()
        self.validator = ValidationAgent(bq_dataset)
        self.traceability = TraceabilityAgent()

    def run_end_to_end(self, requirement_texts: List[str], code_paths: List[str]) -> List[GeneratedTest]:
        # Parse requirements
        requirements = self.req_parser.normalize(requirement_texts)

        # Load and analyze code
        symbols = []
        for p in code_paths:
            code = self.code_analyzer.load_code(p)
            symbols.extend(self.code_analyzer.extract_symbols(code))

        # Fetch bugs
        bugs = self.bug_miner.fetch_recent_bugs(project="")

        # Plan and generate tests
        intents = self.test_generator.plan_tests(symbols, requirements, bugs)
        generated: List[GeneratedTest] = []
        for it in intents:
            gen = self.test_generator.generate_test(it)
            generated.append(gen)

        # Validate tests (placeholder)
        results = self.validator.run_tests_locally(generated)
        self.validator.log_results(results)

        # Export traceability
        self.traceability.export_csv(generated, requirements, path="traceability.csv")

        return generated
