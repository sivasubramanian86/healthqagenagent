#!/bin/bash
set -euo pipefail

PROJECT_ID="healthqagenagent"
LOCATION="us-central1"
DATASET_ID="healthqagen-dataset"
FHIR_STORE_ID="healthqagen-fhirstore"
LOCAL_DATA_DIR="synthea/output/fhir"
PARALLEL_JOBS=5

ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

SUCCESS_LOG="ingest_success.log"
FAIL_LOG="ingest_fail.log"
SKIP_LOG="ingest_skipped.log"
> "$SUCCESS_LOG"
> "$FAIL_LOG"
> "$SKIP_LOG"

process_resource() {
    file="$1"
    tmpfile="$2"

    RES_TYPE=$(jq -r '.resourceType' "$tmpfile")
    RES_ID=$(jq -r '.id // empty' "$tmpfile")

    if [[ -n "$RES_ID" ]]; then
        STATUS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          "https://healthcare.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/datasets/${DATASET_ID}/fhirStores/${FHIR_STORE_ID}/fhir/${RES_TYPE}/${RES_ID}")
        if [[ "$STATUS_CHECK" == "200" ]]; then
            echo "⏩ Skipped (exists): $RES_TYPE/$RES_ID from $(basename "$file")" >> "$SKIP_LOG"
            rm -f "$tmpfile"
            return
        fi
    fi

    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/fhir+json" \
      --data-binary @"$tmpfile" \
      "https://healthcare.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/datasets/${DATASET_ID}/fhirStores/${FHIR_STORE_ID}/fhir/${RES_TYPE}")

    rm -f "$tmpfile"

    if [[ "$STATUS" -ge 200 && "$STATUS" -lt 300 ]]; then
        echo "✅ $RES_TYPE from $(basename "$file")" >> "$SUCCESS_LOG"
    else
        echo "❌ $RES_TYPE from $(basename "$file") — $STATUS" >> "$FAIL_LOG"
    fi
}

export -f process_resource
export PROJECT_ID LOCATION DATASET_ID FHIR_STORE_ID ACCESS_TOKEN SUCCESS_LOG FAIL_LOG SKIP_LOG

find "$LOCAL_DATA_DIR" -type f -name "*.json" | while read -r file; do
    TYPE=$(grep -m1 '"resourceType"' "$file" | sed 's/.*"resourceType"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    if [[ "$TYPE" == "Bundle" ]]; then
        jq -c '.entry[].resource' "$file" | while read -r resource; do
            TMPFILE=$(mktemp)
            echo "$resource" > "$TMPFILE"
            echo "$file $TMPFILE"
        done
    else
        TMPFILE=$(mktemp)
        cp "$file" "$TMPFILE"
        echo "$file $TMPFILE"
    fi
done | xargs -n 2 -P "$PARALLEL_JOBS" bash -c 'process_resource "$@"' _

