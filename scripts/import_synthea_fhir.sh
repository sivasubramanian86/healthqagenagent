#!/bin/bash
set -e

# ==== CONFIG ====
PROJECT_ID="healthqagenagent"
LOCATION="us-central1"
DATASET_ID="healthqagen-dataset"
FHIR_STORE_ID="healthqagen-fhirstore"
BUCKET_NAME="${PROJECT_ID}-synthea-data"

# ==== 1. Create GCS bucket for import ====
echo "Creating GCS bucket: gs://${BUCKET_NAME}..."
gcloud storage buckets create gs://${BUCKET_NAME} --location=${LOCATION} --project=${PROJECT_ID} || echo "Bucket may already exist."

# ==== 2. Clone Synthea ====
if [ ! -d "synthea" ]; then
  echo "Cloning Synthea..."
  git clone https://github.com/synthetichealth/synthea.git
fi

# ==== 3. Generate synthetic FHIR R4 data ====
cd synthea
echo "Generating synthetic patient data (FHIR R4)..."
./run_synthea -p 50  # Generates 50 synthetic patients; adjust as needed
cd ..

# ==== 4. Copy generated data to GCS ====
echo "Copying generated FHIR R4 data to GCS..."
gcloud storage cp synthea/output/fhir/* gs://${BUCKET_NAME}/synthea-data/ --project=${PROJECT_ID}

# ==== 5. Import data into FHIR store ====
echo "Importing data into Cloud Healthcare API FHIR store..."
gcloud healthcare fhir-stores import gcs ${FHIR_STORE_ID} \
  --dataset=${DATASET_ID} \
  --location=${LOCATION} \
  --gcs-uri=gs://${BUCKET_NAME}/synthea-data/* \
  --project=${PROJECT_ID}

echo "✅ Synthetic FHIR data import complete!"
