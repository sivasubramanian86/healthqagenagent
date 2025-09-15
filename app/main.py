"""Minimal FastAPI healthcare sample app with FHIR-like endpoints.
Includes English and Hindi docstrings/comments.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from typing import Optional
from fastapi import Request

# Import Coordinator lazily to avoid import-time cloud client issues
try:
    from agents.coordinator import CoordinatorAgent
except Exception:  # pragma: no cover - best-effort import for demo
    CoordinatorAgent = None

app = FastAPI(title="HealthQASampleApp")

# Allow local frontend hosts used by Firebase emulator and simple static servers
origins = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Patient(BaseModel):
    id: str
    name: str
    age: int


class Observation(BaseModel):
    id: str
    patient_id: str
    code: str
    value: float


patients: List[Patient] = []
observations: List[Observation] = []


@app.get("/patients", response_model=List[Patient])
async def list_patients():
    """List patients. (English)

    रोगी सूची प्रदर्शित करें। (हिन्दी)
    """
    return patients


@app.post("/patients", response_model=Patient)
async def create_patient(p: Patient):
    """Create a new patient. (English)

    नया रोगी बनाएँ। (हिन्दी)
    """
    patients.append(p)
    return p


@app.get("/observations", response_model=List[Observation])
async def list_observations():
    """List observations. (English)

    अवलोकन सूची। (हिन्दी)
    """
    return observations


@app.post("/observations", response_model=Observation)
async def create_observation(o: Observation):
    """Create observation (FHIR-like JSON). (English)

    अवलोकन बनाएं (FHIR-समान JSON)। (हिन्दी)
    """
    observations.append(o)
    return o


class RunCoordinatorRequest(BaseModel):
    requirements: List[str]
    code_paths: Optional[List[str]] = None


@app.post("/run-coordinator")
async def run_coordinator(req: RunCoordinatorRequest, request: Request):
    """Trigger the Coordinator pipeline (demo-friendly).

    This endpoint is intentionally simple for the hackathon/demo flow.
    - In demo mode set env var MOCK_EXTERNAL_SERVICES=true and the Coordinator will run with mock clients.
    - This does not perform token verification; for production verify the caller's token.
    """
    if CoordinatorAgent is None:
        raise HTTPException(status_code=500, detail="Coordinator not available in this environment")

    storage_bucket = os.environ.get('STORAGE_BUCKET_NAME', '')
    coord = CoordinatorAgent(storage_bucket=storage_bucket)
    code_paths = req.code_paths or ["app/main.py"]
    generated = coord.run_end_to_end(req.requirements, code_paths)

    return {"generated_count": len(generated), "generated": [g.path for g in generated]} 
