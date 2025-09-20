#!/bin/bash
set -euo pipefail

# ========= CONFIG =========
PROJECT_ID="healthqagenagent"
LOCATION="us-central1"
DATASET_ID="healthqagen-dataset"
FHIR_STORE_ID="healthqagen-fhirstore"
BUCKET_NAME="healthqagenagent-synthea-data"
GCS_PREFIX="synthea-data"
SYNTH_PATIENTS=40

# ========= FUNCTIONS =========
fail() { echo "âŒ $*" >&2; exit 1; }
info() { echo "í±‰ $*"; }

# ========= PRECHECKS =========
command -v java >/dev/null 2>&1 || fail "Java not found. Install JDK 11+ and retry."
command -v gcloud >/dev/null 2>&1 || fail "gcloud not found. Install Google Cloud SDK."
gcloud config set project "${PROJECT_ID}" >/dev/null

# ========= PREPARE SYNTHEA =========
if [ ! -d "synthea" ]; then
  info "Cloning Synthea..."
  git clone https://github.com/synthetichealth/synthea.git
fi

PROPS="synthea/src/main/resources/synthea.properties"
[ -f "$PROPS" ] || fail "Missing $PROPS"

info "Forcing FHIR R4 + transaction bundles in synthea.properties"
cp -n "$PROPS" "${PROPS}.bak" || true
# Disable DSTU2/STU3, enable R4, ensure exporter + transaction bundles
sed -i \
  -e 's/^exporter.fhir.export=.*/exporter.fhir.export=true/' \
  -e 's/^exporter.fhir.dstu2.export=.*/exporter.fhir.dstu2.export=false/' \
  -e 's/^exporter.fhir.stu3.export=.*/exporter.fhir.stu3.export=false/' \
  -e 's/^exporter.fhir.r4.export=.*/exporter.fhir.r4.export=true/' \
  -e 's/^exporter.fhir.transaction_bundle=.*/exporter.fhir.transaction_bundle=true/' \
  "$PROPS"

# Optional safety (add keys if missing)
grep -q '^exporter.fhir.export=' "$PROPS" || echo 'exporter.fhir.export=true' >> "$PROPS"
grep -q '^exporter.fhir.dstu2.export=' "$PROPS" || echo 'exporter.fhir.dstu2.export=false' >> "$PROPS"
grep -q '^exporter.fhir.stu3.export=' "$PROPS" || echo 'exporter.fhir.stu3.export=false' >> "$PROPS"
grep -q '^exporter.fhir.r4.export=' "$PROPS" || echo 'exporter.fhir.r4.export=true' >> "$PROPS"
grep -q '^exporter.fhir.transaction_bundle=' "$PROPS" || echo 'exporter.fhir.transaction_bundle=true' >> "$PROPS"

# ========= CLEAN LOCAL OUTPUTS =========
info "Cleaning local Synthea outputs..."
rm -rf synthea/output/fhir* || true

# ========= RUN SYNTHEA =========
info "Generating ${SYNTH_PATIENTS} patients (FHIR R4, transaction bundles)..."
pushd synthea >/dev/null
./run_synthea -p "${SYNTH_PATIENTS}"
popd >/dev/null

# ========= LOCATE OUTPUT FOLDER =========
OUT_R4="synthea/output/fhir_r4"
OUT_DSTU2="synthea/output/fhir"
OUT_ANY=""

if [ -d "$OUT_R4" ] && compgen -G "$OUT_R4/*.json" >/dev/null; then
  OUT_ANY="$OUT_R4"
  info "Detected R4 output at $OUT_R4"
elif [ -d "$OUT_DSTU2" ] && compgen -G "$OUT_DSTU2/*.json" >/dev/null; then
  OUT_ANY="$OUT_DSTU2"
  echo "âš ï¸ Warning: R4 folder not found; using $OUT_DSTU2. This may be DSTU2. Import may fail against an R4 store."
else
  fail "No FHIR JSON files found in synthea/output. Check Synthea run logs."
fi

# ========= QUICK CONTENT STRUCTURE DETECTION =========
FIRST_FILE="$(ls -1 "$OUT_ANY"/*.json | head -n 1)"
RESOURCE_TYPE="$(head -n 5 "$FIRST_FILE" | tr -d '\r' | grep -m1 '"resourceType"' || true)"

if echo "$RESOURCE_TYPE" | grep -q '"Bundle"'; then
  CONTENT_STRUCTURE="bundle"
elif echo "$RESOURCE_TYPE" | grep -q -E '"Patient"|"Observation"|"Encounter"|"Condition"'; then
  CONTENT_STRUCTURE="resource"
else
  # Default to bundle since we forced transaction_bundle=true
  CONTENT_STRUCTURE="bundle"
fi

info "Detected content-structure: $CONTENT_STRUCTURE"

# ========= UPLOAD TO GCS =========
info "Creating bucket if needed: gs://${BUCKET_NAME}"
gcloud storage buckets create "gs://${BUCKET_NAME}" --location="${LOCATION}" --project="${PROJECT_ID}" >/dev/null 2>&1 || true

info "Clearing old data in gs://${BUCKET_NAME}/${GCS_PREFIX}/"
gcloud storage rm -r "gs://${BUCKET_NAME}/${GCS_PREFIX}/**" --quiet >/dev/null 2>&1 || true

info "Uploading new data from $OUT_ANY to gs://${BUCKET_NAME}/${GCS_PREFIX}/"
gcloud storage cp "${OUT_ANY}"/* "gs://${BUCKET_NAME}/${GCS_PREFIX}/" --project="${PROJECT_ID}"

# ========= GRANT HEALTHCARE SERVICE AGENT ACCESS =========
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
SERVICE_AGENT="service-${PROJECT_NUMBER}@gcp-sa-healthcare.iam.gserviceaccount.com"

info "Granting roles/storage.objectViewer to ${SERVICE_AGENT}"
gcloud storage buckets add-iam-policy-binding "gs://${BUCKET_NAME}" \
  --member="serviceAccount:${SERVICE_AGENT}" \
  --role="roles/storage.objectViewer" \
  --project="${PROJECT_ID}" >/dev/null

# ========= IMPORT TO FHIR STORE =========
info "Importing into FHIR store ${FHIR_STORE_ID} (dataset ${DATASET_ID}, ${LOCATION})..."
gcloud healthcare fhir-stores import gcs "${FHIR_STORE_ID}" \
  --dataset="${DATASET_ID}" \
  --location="${LOCATION}" \
  --gcs-uri="gs://${BUCKET_NAME}/${GCS_PREFIX}/*" \
  --content-structure="${CONTENT_STRUCTURE}" \
  --project="${PROJECT_ID}"

echo "âœ… Done! Imported files from ${OUT_ANY} into ${FHIR_STORE_ID}."

# ========= OPTIONAL VERIFY (uncomment to enable) =========
# echo "Verifying Patient count (approx)..."
# gcloud healthcare fhir-stores execute-bundle "${FHIR_STORE_ID}" \
#   --dataset="${DATASET_ID}" \
#   --location="${LOCATION}" \
#   --bundle='{"resourceType":"Bundle","type":"batch","entry":[{"request":{"method":"GET","url":"Patient?_summary=count"}}]}' \
#   --project="${PROJECT_ID}"

