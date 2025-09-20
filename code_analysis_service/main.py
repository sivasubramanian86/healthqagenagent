
from __future__ import annotations

from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os
import ast

from common.models import CodeSymbol
from common.security import redact_pii

app = FastAPI()


class CodeAnalysisAgent:
    """Loads code and extracts symbols via Vertex AI code model."""

    def __init__(self, mock: bool = False):
        self.mock = mock

    def extract_symbols(self, code: str) -> List[CodeSymbol]:
        """Use Vertex AI code model to extract functions/classes/endpoints.

        This is a placeholder that should call the model for structured extraction.
        """
        symbols: List[CodeSymbol] = []
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    snippet = ast.get_source_segment(code, node) or ""
                    snippet = redact_pii(snippet)
                    symbols.append(
                        CodeSymbol(
                            name=node.name,
                            kind="function",
                            start_line=node.lineno,
                            code_snippet=snippet,
                        )
                    )
                if isinstance(node, ast.ClassDef):
                    snippet = ast.get_source_segment(code, node) or ""
                    snippet = redact_pii(snippet)
                    symbols.append(
                        CodeSymbol(
                            name=node.name,
                            kind="class",
                            start_line=node.lineno,
                            code_snippet=snippet,
                        )
                    )
        except Exception:
            return []
        return symbols


class RunPayload(BaseModel):
    code: str


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.post("/run")
def run_code_analysis(payload: RunPayload):
    agent = CodeAnalysisAgent()
    symbols = agent.extract_symbols(payload.code)
    return {"status": "success", "data": symbols}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
