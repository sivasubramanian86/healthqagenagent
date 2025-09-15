-- BigQuery schema for coverage metrics
-- Table: healthqa_metrics.coverage_metrics

CREATE TABLE IF NOT EXISTS `{{project}}.healthqa_metrics.coverage_metrics` (
  timestamp TIMESTAMP NOT NULL,
  requirement_id STRING,
  test_id STRING,
  coverage FLOAT64,
  risk_score FLOAT64,
  environment STRING,
  service_name STRING
);

*** Note: replace {{project}} with your GCP project id when running this DDL.
