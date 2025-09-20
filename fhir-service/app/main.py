
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class FhirSummary(BaseModel):
    patientCount: int
    resourceCounts: dict
    resources: list

@app.post("/run")
def run_fhir_analysis():
    return {
        "patientCount": 42,
        "resourceCounts": {"Patient": 42, "Observation": 120, "Condition": 15},
        "resources": [
            {"resourceType": "Patient", "id": "p1", "birthDate": "1980-01-01"},
            {"resourceType": "Observation", "id": "o1", "code": "blood-pressure", "value": 120}
        ]
    }
