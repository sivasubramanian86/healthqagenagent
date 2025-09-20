#!/bin/bash
set -e

BUCKET_PATH="gs://healthqagenagent-synthea-data/synthea-data"
BAD_FILES=()

echo "Ì¥ç Scanning bucket: $BUCKET_PATH"
# List only real objects, skip nulls
for f in $(gcloud storage ls "$BUCKET_PATH" --json | jq -r '.[] | select(.name != null) | .name'); do
    echo "Checking $f ..."
    gcloud storage cp "$f" /tmp/tmp.json --quiet
    if ! jq empty /tmp/tmp.json 2>/dev/null; then
        echo "‚ùå Invalid JSON: $f"
        BAD_FILES+=("$f")
    else
        echo "‚úÖ Valid JSON: $f"
    fi
done

# Summary of bad files
if [ ${#BAD_FILES[@]} -eq 0 ]; then
    echo "Ìæâ No invalid JSON files found."
else
    echo ""
    echo "Ì∫® Found ${#BAD_FILES[@]} invalid JSON file(s):"
    for bad in "${BAD_FILES[@]}"; do
        echo "   $bad"
    done
    echo ""
    echo "Ì∑ë Removing invalid files from bucket..."
    for bad in "${BAD_FILES[@]}"; do
        gcloud storage rm "$bad" --quiet
    done
    echo "‚úÖ Cleanup complete."
fi
