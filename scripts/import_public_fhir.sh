#!/bin/bash
set -e

# ==== CONFIG ====
PROJECT_ID="healthqagenagent"
LOCATION="us-central1"
DATASET_ID="healthqagen-dataset"
FHIR_STORE_ID="healthqagen-fhirstore"
BUCKET_NAME="${PROJECT_ID}-synthea-data"

echo "Ì∫Ä Starting FHIR public dataset import for project: $PROJECT_ID"

# 1Ô∏è‚É£ Create bucket if not exists
if ! gcloud storage buckets describe gs://${BUCKET_NAME} --project=${PROJECT_ID} >/dev/null 2>&1; then
    echo "Ì≥¶ Creating bucket: gs://${BUCKET_NAME}"
    gcloud storage buckets create gs://${BUCKET_NAME} \
        --location=${LOCATION} \
        --project=${PROJECT_ID}
else
    echo "Ì≥¶ Bucket already exists: gs://${BUCKET_NAME}"
fi

# 2Ô∏è‚É£ Copy public sample data into your bucket
echo "Ì≥• Copying public FHIR R4 sample data into your bucket..."
gcloud storage cp -r gs://cloud-healthcare-data-public/fhir/r4/synthea-sample-data/* \
    gs://${BUCKET_NAME}/synthea-data/ \
    --project=${PROJECT_ID}

# 3Ô∏è‚É£ Grant Healthcare Service Agent read access
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format="value(projectNumber)")
SERVICE_AGENT="service-${PROJECT_NUMBER}@gcp-sa-healthcare.iam.gserviceaccount.com"

echo "Ì¥ë Granting storage.objectViewer role to Healthcare Service Agent..."
gcloud storage buckets add-iam-policy-binding gs://${BUCKET_NAME} \
    --member="serviceAccount:${SERVICE_AGENT}" \
    --role="roles/storage.objectViewer" \
    --project=${PROJECT_ID}

# 4Ô∏è‚É£ Import into FHIR store
echo "Ì≥§ Importing data into FHIR store..."
gcloud healthcare fhir-stores import gcs ${FHIR_STORE_ID} \
    --dataset=${DATASET_ID} \
    --location=${LOCATION} \
    --gcs-uri=gs://${BUCKET_NAME}/synthea-data/* \
    --content-structure=bundle \
    --project=${PROJECT_ID}

echo "‚úÖ Import complete! Your FHIR store now contains the public synthetic dataset."
