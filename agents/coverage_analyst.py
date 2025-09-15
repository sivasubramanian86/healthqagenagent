"""CoverageAnalystAgent: query BigQuery for risk-weighted coverage metrics."""
from __future__ import annotations

from typing import Dict

from common.gcp_clients import get_bigquery_client


class CoverageAnalystAgent:
    """Queries BigQuery to compute risk-weighted coverage metrics."""

    def __init__(self, dataset: str = "healthqa_metrics", mock: bool = False, mock_file: str | None = None):
        self.dataset = dataset
        self.bq = None
        self.mock = mock
        self.mock_file = mock_file

    def _init_bq(self):
        if self.bq is None:
            self.bq = get_bigquery_client()

    def get_coverage_metrics(self) -> Dict[str, float]:
        # If mock and a local file is provided, read metrics from it
        if self.mock and self.mock_file:
            try:
                import json
                with open(self.mock_file, 'r', encoding='utf-8') as fh:
                    data = json.load(fh)
                return {"coverage": float(data.get("coverage", 0.0)), "risk_score": float(data.get("risk_score", 0.0))}
            except Exception:
                return {"coverage": 0.0, "risk_score": 0.0}

        self._init_bq()
        # Placeholder: run a query against BigQuery and return metrics
        return {"coverage": 0.0, "risk_score": 0.0}
