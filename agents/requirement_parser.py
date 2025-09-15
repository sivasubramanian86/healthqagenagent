"""RequirementParserAgent: normalize and tag requirements using Vertex AI text model."""
from __future__ import annotations

from typing import List
import importlib
import os
from common.models import Requirement
from common.gcp_clients import get_vertex_text_model


# Attempt to import langdetect at runtime; if unavailable, fallback to a simple
# heuristic based on presence of Devanagari characters for Hindi detection.
_langdetect = importlib.util.find_spec("langdetect")
if _langdetect:
    from langdetect import detect  # type: ignore
else:
    detect = None


class RequirementParserAgent:
    """Parses and normalizes raw requirement text, detects language, and tags compliance refs."""

    def __init__(self, model_id: str = "text-bison", mock: bool = False, mock_dir: str | None = None):
        self.model_id = model_id
        self.model = None
        self.mock = mock
        self.mock_dir = mock_dir

    def _init_model(self):
        if self.model is None:
            self.model = get_vertex_text_model(self.model_id)

    def detect_language(self, text: str) -> str:
        """Detect language; returns 'hi' for Hindi or 'en' for English (fallback)."""
        try:
            if detect:
                lang = detect(text)
                return "hi" if lang.startswith("hi") else "en"
            # Fallback heuristic: if Devanagari characters present, treat as Hindi
            if any("\u0900" <= ch <= "\u097F" for ch in text):
                return "hi"
            return "en"
        except Exception:
            return "en"

    def normalize(self, raw_texts: List[str]) -> List[Requirement]:
        # If not in real mode, skip model initialization
        if not self.mock:
            self._init_model()
        results: List[Requirement] = []
        from pathlib import Path
        for t in raw_texts:
            lang = self.detect_language(t)
            # If mock mode, do simple normalization and tag common compliance refs
            mock = False
            try:
                mock = os.getenv("MOCK_EXTERNAL_SERVICES", "true").lower() in ("1", "true", "yes")
            except Exception:
                mock = True

            title = (t[:80] + "...") if len(t) > 80 else t
            from common.security import redact_pii

            req = Requirement(title=title, description=redact_pii(t))
            if mock:
                # naive compliance tagging: if 'patient' or 'PHI' in text, add HIPAA tag
                low = t.lower()
                if "patient" in low or "phi" in low:
                    req.tags.append("HIPAA")
                if "fhir" in low:
                    req.tags.append("FHIR")
                if any("\u0900" <= ch <= "\u097F" for ch in t):
                    req.tags.append("hindi")
            results.append(req)
        return results
