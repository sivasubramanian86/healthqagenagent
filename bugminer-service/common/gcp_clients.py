"""
Helper functions to initialize Google Cloud clients and Vertex AI model handles.

Environment variables used:
- PROJECT_ID: Google Cloud project id
- REGION: Default region for services
- VERTEX_LOCATION: Location for Vertex AI resources (e.g. "us-central1")

This module exposes:
- get_vertex_text_model(model_id: str)
- get_vertex_code_model(model_id: str)
- get_storage_client()
- get_bigquery_client()
- get_secret_manager_client()
- get_healthcare_client()

These helpers return initialized client instances ready for use.
"""
from typing import Optional, Any
import os
import importlib


def _env_var(name: str, default: Optional[str] = None) -> str:
    val = os.getenv(name, default)
    if val is None:
        raise EnvironmentError(f"Required environment variable '{name}' is not set")
    return val


def get_project_id() -> str:
    return _env_var("PROJECT_ID")


def get_region() -> str:
    return _env_var("REGION")


def get_vertex_location() -> str:
    # fall back to REGION if VERTEX_LOCATION is not set
    return os.getenv("VERTEX_LOCATION") or get_region()


# Vertex AI helpers
def _initialize_vertex_ai():
    # Allow skipping Vertex initialization in mock/demo mode
    if os.getenv("MOCK_EXTERNAL_SERVICES", "false").lower() in ("1", "true", "yes"):
        return
    project = get_project_id()
    location = get_vertex_location()
    # Lazy import so this module can be imported in environments without
    # the Vertex AI SDK installed.
    aiplatform = importlib.import_module("google.cloud.aiplatform")
    aiplatform.init(project=project, location=location)


def get_vertex_text_model(model_id: str):
    """Return a Vertex AI Text model handle.

    model_id: the resource name or ID of the model to use. This may be a
    model resource name like 'projects/{project}/locations/{location}/models/{model}'
    or a short id depending on the Vertex AI SDK usage.
    """
    # If mocked, return a lightweight placeholder object
    if os.getenv("MOCK_EXTERNAL_SERVICES", "false").lower() in ("1", "true", "yes"):
        class _MockModel:
            def __init__(self, name):
                self.name = name

            def predict(self, *args, **kwargs):
                return {"output": "mock"}

        return _MockModel(model_id)

    _initialize_vertex_ai()
    aiplatform = importlib.import_module("google.cloud.aiplatform")
    # The aiplatform.Model wrapper accepts a model_name / resource name.
    return aiplatform.Model(model_name=model_id)


def get_vertex_code_model(model_id: str):
    """Return a Vertex AI Code model handle (same Model wrapper works for code models).

    model_id: model identifier or full resource name
    """
    if os.getenv("MOCK_EXTERNAL_SERVICES", "false").lower() in ("1", "true", "yes"):
        class _MockModel:
            def __init__(self, name):
                self.name = name

            def predict(self, *args, **kwargs):
                return {"output": "mock"}

        return _MockModel(model_id)

    _initialize_vertex_ai()
    aiplatform = importlib.import_module("google.cloud.aiplatform")
    return aiplatform.Model(model_name=model_id)


# Storage client
def get_storage_client() -> Any:
    # Mock mode: return a lightweight local filesystem wrapper
    if os.getenv("MOCK_EXTERNAL_SERVICES", "false").lower() in ("1", "true", "yes"):
        class _LocalStorageMock:
            def bucket(self, name):
                class _Bucket:
                    def __init__(self, root="."):
                        self.root = root

                    def blob(self, path):
                        class _Blob:
                            def __init__(self, path):
                                self.path = path

                            def download_as_text(self):
                                with open(self.path, "r", encoding="utf-8") as fh:
                                    return fh.read()

                        return _Blob(path)

                return _Bucket()

        return _LocalStorageMock()

    project = get_project_id()
    storage = importlib.import_module("google.cloud.storage")
    return storage.Client(project=project)


# BigQuery client
def get_bigquery_client() -> Any:
    # Mock BigQuery client that prints queries
    if os.getenv("MOCK_EXTERNAL_SERVICES", "false").lower() in ("1", "true", "yes"):
        class _MockBQ:
            def __init__(self):
                self.project = os.getenv("PROJECT_ID", "demo-project")

            def query(self, q):
                print("[MOCK BQ] QUERY:\n", q)
                class _Job:
                    def result(self):
                        return iter([type("R", (), {"avg_coverage": 100.0, "avg_risk": 0.0})()])

                return _Job()

        return _MockBQ()

    project = get_project_id()
    bigquery = importlib.import_module("google.cloud.bigquery")
    return bigquery.Client(project=project)


# Secret Manager client
def get_secret_manager_client() -> Any:
    if os.getenv("MOCK_EXTERNAL_SERVICES", "false").lower() in ("1", "true", "yes"):
        class _MockSM:
            def access_secret_version(self, name: str):
                class _R:
                    payload = type("P", (), {"data": b""})()

                return _R()

        return _MockSM()

    secretmanager = importlib.import_module("google.cloud.secretmanager")
    return secretmanager.SecretManagerServiceClient()


# Cloud Healthcare client
def get_healthcare_client() -> Any:
    """Return a Google API client for the Cloud Healthcare API using googleapiclient.discovery.

    See: https://cloud.google.com/healthcare/docs/reference/rest
    This returns a discovery-based client which can be used to access datasets, FHIR stores, etc.
    """
    # Use googleapiclient.discovery to build the healthcare service client.
    discovery = importlib.import_module("googleapiclient.discovery")
    return discovery.build("healthcare", "v1")
