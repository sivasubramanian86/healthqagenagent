"""ValidationAgent: runs tests and logs results/coverage to BigQuery."""
from __future__ import annotations

from typing import List
import subprocess

from common.models import GeneratedTest
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI()


class ValidationAgent:
    """Runs tests locally or via Cloud Build and logs metrics to BigQuery."""

    def __init__(self, bq_dataset: str = "healthqa_metrics", mock: bool = False):
        self.bq_dataset = bq_dataset
        self.bq = None
        self.mock = mock

    def _init_bq(self):
        if self.bq is None:
            from common.gcp_clients import get_bigquery_client
            self.bq = get_bigquery_client()

    def run_tests_locally(self, tests: List[GeneratedTest]) -> dict:
        # If mock mode, optionally run pytest on the tests folder and return a fake coverage
        if self.mock:
            # quick fake coverage value for the dry-run
            return {"passed": len(tests), "total": len(tests), "coverage": 0.82}

        # Non-mock path: try to run pytest to compute coverage (best-effort)
        try:
            import pytest
            # Run pytest programmatically on the generated tests
            paths = [t.metadata.get("path") for t in tests if t.metadata.get("path")]
            if not paths:
                return {"passed": 0, "total": 0, "coverage": 0.0}
            res = pytest.main(paths)
            # We don't compute real coverage here; return pass/fail
            return {"passed": len(tests) if res == 0 else 0, "total": len(tests), "coverage": 0.0}
        except Exception:
            return {"passed": 0, "total": len(tests), "coverage": 0.0}

    def log_results(self, results: dict) -> None:
        if self.mock:
            print("Skipping BigQuery logging in mock mode.")
            return
        self._init_bq()
        # TODO: insert rows into BigQuery; placeholder prints
        print("Logging results to BigQuery:", results)


class RunPayload(BaseModel):
    tests: List[GeneratedTest]


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.post("/run")
def run_tests(payload: RunPayload):
    agent = ValidationAgent(mock=True)
    results = agent.run_tests_locally(payload.tests)
    agent.log_results(results)
    return {"status": "success", "data": results}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
