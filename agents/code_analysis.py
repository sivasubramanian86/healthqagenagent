"""Code analysis agent: loads code and extracts symbols via Vertex AI code model."""
from __future__ import annotations

from typing import List

from common.models import CodeSymbol
from common.gcp_clients import get_storage_client, get_vertex_code_model
from common.security import redact_pii
import os
import ast
import tempfile


class CodeAnalysisAgent:
    """Loads code from Cloud Storage and uses Vertex AI code model to extract symbols."""
    def __init__(self, bucket_name: str = "", mock: bool = False, mock_dir: str | None = None):
        self.bucket_name = bucket_name
        self.storage = None
        self.vertex_model = None
        self.mock = mock
        self.mock_dir = mock_dir

    def _init_clients(self):
        # Skip initializing real clients when running in explicit mock mode
        if self.mock:
            return
        if self.storage is None:
            self.storage = get_storage_client()
        if self.vertex_model is None:
            # model id should be provided via config in real use
            self.vertex_model = get_vertex_code_model("code-bison")

    def load_code(self, path: str) -> str:
        """Load a file from Cloud Storage and return its content."""
        # If mock, prefer local mock_dir or local path
        if self.mock:
            local_path = path.replace("file://", "")
            if self.mock_dir and not os.path.isabs(local_path):
                local_path = os.path.join(self.mock_dir, local_path)
            with open(local_path, "r", encoding="utf-8") as fh:
                return fh.read()

        self._init_clients()

        # Support local file paths for demo mode: if bucket_name is falsy or path exists locally
        if not self.bucket_name or path.startswith(".") or path.startswith("/") or path.startswith("file:"):
            # normalize
            local_path = path.replace("file://", "")
            with open(local_path, "r", encoding="utf-8") as fh:
                return fh.read()

        bucket = self.storage.bucket(self.bucket_name)
        blob = bucket.blob(path)
        return blob.download_as_text()

    def extract_symbols(self, code: str) -> List[CodeSymbol]:
        """Use Vertex AI code model to extract functions/classes/endpoints.

        This is a placeholder that should call the model for structured extraction.
        """
        # If running in mock mode, extract symbols locally via ast and skip clients
        mock = self.mock or (os.getenv("MOCK_EXTERNAL_SERVICES", "true").lower() in ("1", "true", "yes"))
        symbols: List[CodeSymbol] = []
        if mock:
            try:
                tree = ast.parse(code)
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        snippet = ast.get_source_segment(code, node) or ""
                        snippet = redact_pii(snippet)
                        symbols.append(CodeSymbol(name=node.name, kind="function", start_line=node.lineno, code_snippet=snippet))
                    if isinstance(node, ast.ClassDef):
                        snippet = ast.get_source_segment(code, node) or ""
                        snippet = redact_pii(snippet)
                        symbols.append(CodeSymbol(name=node.name, kind="class", start_line=node.lineno, code_snippet=snippet))
            except Exception:
                # fallback empty
                return []
            return symbols

        # TODO: call Vertex AI model for structured extraction when not mocked
        return []
