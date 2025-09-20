#!/bin/bash

# Kill any running uvicorn processes
pkill -f uvicorn

# Create a virtual environment
python3.11 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set the python path to include the root of the project
export PYTHONPATH=.

# Create a logs directory
mkdir -p logs

# Start the services in the background and log output
(cd fhir-service/app && PYTHONPATH=../.. uvicorn main:app --host 0.0.0.0 --port 8000) > logs/fhir-service.log 2>&1 &
(cd bugminer-service/app && PYTHONPATH=../.. uvicorn main:app --host 0.0.0.0 --port 8001) > logs/bugminer-service.log 2>&1 &
(cd code_analysis_service && PYTHONPATH=.. uvicorn main:app --host 0.0.0.0 --port 8002) > logs/code_analysis_service.log 2>&1 &
(cd evaluator-service/app && PYTHONPATH=../.. uvicorn main:app --host 0.0.0.0 --port 8003) > logs/evaluator-service.log 2>&1 &
(cd test-generator-service/app && PYTHONPATH=../.. uvicorn main:app --host 0.0.0.0 --port 8004) > logs/test-generator-service.log 2>&1 &

wait