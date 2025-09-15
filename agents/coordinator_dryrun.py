"""Dry-run coordinator that uses local mock data and mock-mode agents to run an end-to-end pipeline.

Steps:
- Loads mock requirements, mock app code, and mock bugs.
- Instantiates agents in mock mode and runs the pipeline.
- Asserts expected outcomes and prints SELF-TEST PASSED/FAILED.
"""
from __future__ import annotations

import os
import json
import shutil
from pathlib import Path

from agents.code_analysis import CodeAnalysisAgent
from agents.requirement_parser import RequirementParserAgent
from agents.bug_miner import BugMinerAgent
from agents.test_generator import TestGeneratorAgent
from agents.validation import ValidationAgent
from agents.traceability import TraceabilityAgent
from agents.coverage_analyst import CoverageAnalystAgent


MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"
GENERATED_DIR = Path(__file__).resolve().parent.parent / "tests" / "generated"
TRACE_PATH = Path(__file__).resolve().parent.parent / "traceability_dryrun.csv"


def load_mock_requirements(mock_dir: Path):
    reqs = []
    for p in [mock_dir / "requirements.txt", mock_dir / "requirements_hi.txt"]:
        if p.exists():
            reqs.extend([l.strip() for l in p.read_text(encoding='utf-8').splitlines() if l.strip()])
    return reqs


def run_dryrun():
    # Prepare: ensure mock dir exists
    if not MOCK_DIR.exists():
        raise SystemExit("mock_data directory missing; run prepare_mock_data first")

    # Cleanup previous generated artifacts
    if GENERATED_DIR.exists():
        shutil.rmtree(GENERATED_DIR)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    if TRACE_PATH.exists():
        TRACE_PATH.unlink()

    # Load mock artifacts
    code_path = str(MOCK_DIR / "app_mock.py")
    requirements = load_mock_requirements(MOCK_DIR)
    bugs_file = str(MOCK_DIR / "bugs.json")

    # Instantiate agents in mock mode
    code_agent = CodeAnalysisAgent(bucket_name="", mock=True, mock_dir=str(MOCK_DIR))
    req_agent = RequirementParserAgent(mock=True, mock_dir=str(MOCK_DIR))
    bug_agent = BugMinerAgent(provider="mock", mock=True, mock_file=bugs_file)
    test_gen = TestGeneratorAgent()
    test_gen.mock = True
    validator = ValidationAgent(mock=True)
    trace = TraceabilityAgent()
    coverage = CoverageAnalystAgent(mock=True, mock_file=str(MOCK_DIR / "coverage_metrics.json"))

    # Run pipeline
    print("Parsing requirements...")
    reqs = req_agent.normalize(requirements)

    print("Analyzing code...")
    code = code_agent.load_code(code_path)
    symbols = code_agent.extract_symbols(code)

    print("Fetching bugs...")
    bugs = bug_agent.fetch_recent_bugs()

    print("Planning and generating tests...")
    intents = test_gen.plan_tests(symbols, reqs, bugs)
    generated = []
    for it in intents:
        g = test_gen.generate_test(it)
        generated.append(g)

    print("Validating tests...")
    results = validator.run_tests_locally(generated)
    validator.log_results(results)

    print("Exporting traceability...")
    trace.export_csv(generated, reqs, path=str(TRACE_PATH))

    metrics = coverage.get_coverage_metrics()

    # Assertions
    try:
        assert len(generated) >= 2, f"Expected >=2 generated tests, got {len(generated)}"
        assert float(results.get("coverage", 0.0)) > 0.5, f"Coverage too low: {results.get('coverage')}"
        assert TRACE_PATH.exists(), "Traceability CSV missing"
        # check rows > 1
        rows = [l for l in TRACE_PATH.read_text(encoding='utf-8').splitlines() if l.strip()]
        assert len(rows) > 1, "Traceability CSV has <= 1 rows"
    except AssertionError as e:
        print("SELF-TEST FAILED:\n", str(e))
        return 1

    print("SELF-TEST PASSED")
    print(f"Generated tests: {len(generated)}")
    print(f"Coverage (reported): {results.get('coverage')}")
    print(f"Traceability CSV: {TRACE_PATH}")

    # Cleanup
    try:
        shutil.rmtree(MOCK_DIR)
        shutil.rmtree(GENERATED_DIR)
        if TRACE_PATH.exists():
            TRACE_PATH.unlink()
    except Exception:
        pass

    return 0


if __name__ == '__main__':
    raise SystemExit(run_dryrun())
