"""Small helper to query coverage metrics from BigQuery."""
from __future__ import annotations

from typing import Dict
from common.gcp_clients import get_bigquery_client


def query_latest_coverage(dataset: str = "healthqa_metrics") -> Dict[str, float]:
    bq = get_bigquery_client()
    query = f"""
    SELECT
      AVG(coverage) as avg_coverage,
      AVG(risk_score) as avg_risk
    FROM `{bq.project}.{dataset}.coverage_metrics`
    WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    """
    job = bq.query(query)
    row = next(job.result())
    return {"avg_coverage": float(row.avg_coverage or 0.0), "avg_risk": float(row.avg_risk or 0.0)}
