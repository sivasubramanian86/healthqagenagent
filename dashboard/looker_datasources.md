# Looker Studio / Data Studio Datasource Guide

This document explains how to connect BigQuery tables produced by HealthQAGenAgent to Looker Studio (formerly Data Studio).

1. In the Google Cloud Console, open BigQuery.
2. Locate the dataset (default: `healthqa_metrics`) and the `coverage_metrics` table (see `infra/bq_schema.sql`).
3. Open Looker Studio and create a new Data Source.
4. Choose the BigQuery connector and select the project, dataset, and table.
5. Configure any required field types (DATE, STRING, NUMERIC) and save the data source.

Suggested charts:
- Time series of risk-weighted coverage
- Table of requirement -> test coverage percentage
- Filters for environment and service

Security:
- Use a service account with least-privilege to connect Looker Studio to BigQuery for automated dashboards.
- Do not expose PHI in dashboards; use aggregated/anonymous fields only.
