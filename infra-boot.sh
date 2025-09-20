#!/bin/bash
# infra-boot.sh: Script to test the HealthQAGenAgent API endpoints.

echo "Testing HealthQAGenAgent APIs..."

# --- Test FHIR Service ---
echo "
[1/5] Testing FHIR Service Endpoint..."
curl -X POST http://127.0.0.1:8000/run -H "Content-Type: application/json" -d '{}' && echo "
"

# --- Test Test Generation Service ---
echo "
[2/5] Testing Test Generation Endpoint..."
curl -X POST http://127.0.0.1:8004/generate_test -H "Content-Type: application/json" -d '{"intent": {"id": "1", "description": "test"}}' && echo "
"

# --- Test Test Results/Evaluation Service ---
echo "
[3/5] Testing Evaluator Service Endpoint..."
curl -X POST http://127.0.0.1:8003/run -H "Content-Type: application/json" -d '{"tests": []}' && echo "
"

# --- Test Bug Analysis Service ---
echo "
[4/5] Testing Bug Analysis Endpoint..."
curl -X POST http://127.0.0.1:8001/run -H "Content-Type: application/json" -d '{"mock": true, "mock_file": "bugminer-service/mock_jira_issues.json"}' && echo "
"

# --- Test Code Analysis Service ---
echo "
[5/5] Testing Code Analysis Endpoint..."
curl -X POST http://127.0.0.1:8002/run -H "Content-Type: application/json" -d '{"code": "def hello():\n  return \"world\""}' && echo "
"

echo "API test sequence complete."
