#!/bin/bash
set -euo pipefail

# ==== CONFIG ====
PROJECT_ID="healthqagenagent"
LOCATION="us-central1"
DATASET_ID="healthqagen-dataset"
FHIR_STORE_ID="healthqagen-fhirstore"
LOCAL_DATA_DIR="synthea/output/fhir"   # Change if needed

# ==== GET TOKEN ====
echo "Ì¥ë Getting access token from gcloud..."
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

# ==== LOG FILES ====
SUCCESS_LOG="ingest_success.log"
FAIL_LOG="ingest_fail.log"
> "$SUCCESS_LOG"
> "$FAIL_LOG"

# ==== INGEST LOOP ====
echo "Ì∫Ä Starting ingestion from $LOCAL_DATA_DIR ..."
for file in "$LOCAL_DATA_DIR"/*.json; do
    [ -e "$file" ] || { echo "No JSON files found in $LOCAL_DATA_DIR"; exit 1; }

    # Detect resource type
    RESOURCE_TYPE=$(grep -m1 '"resourceType"' "$file" | sed 's/.*"resourceType"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

    echo "Ì≥Ñ File: $(basename "$file") ‚Äî Detected type: $RESOURCE_TYPE"

    if [[ "$RESOURCE_TYPE" == "Bundle" ]]; then
        # Send as a bundle to /fhir
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
          -X POST \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -H "Content-Type: application/fhir+json" \
          --data-binary @"$file" \
          "https://healthcare.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/datasets/${DATASET_ID}/fhirStores/${FHIR_STORE_ID}/fhir")
    else
        # Send as a single resource to /fhir/<ResourceType>
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
          -X POST \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -H "Content-Type: application/fhir+json" \
          --data-binary @"$file" \
          "https://healthcare.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/datasets/${DATASET_ID}/fhirStores/${FHIR_STORE_ID}/fhir/${RESOURCE_TYPE}")
    fi

    if [[ "$STATUS" -ge 200 && "$STATUS" -lt 300 ]]; then
        echo "‚úÖ Success ($STATUS): $file" | tee -a "$SUCCESS_LOG"
    else
        echo "‚ùå Fail ($STATUS): $file" | tee -a "$FAIL_LOG"
    fi
done

echo "ÌæØ Ingestion complete."
echo "   Successful uploads: $(wc -l < "$SUCCESS_LOG")"
echo "   Failed uploads: $(wc -l < "$FAIL_LOG")"
echo "Ì≥Ñ See $SUCCESS_LOG and $FAIL_LOG for details."

