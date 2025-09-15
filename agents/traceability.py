"""TraceabilityAgent: exports CSV mapping tests to requirements and compliance refs."""
from __future__ import annotations

import csv
from typing import List

from common.models import GeneratedTest, Requirement


class TraceabilityAgent:
    """Exports mappings between tests and requirements to CSV."""

    def export_csv(self, tests: List[GeneratedTest], requirements: List[Requirement], path: str) -> None:
        with open(path, "w", newline='', encoding='utf-8') as fh:
            writer = csv.writer(fh)
            writer.writerow(["test_id", "requirement_id", "requirement_title"])
            req_map = {r.id: r for r in requirements}
            for t in tests:
                req = req_map.get(t.intent_id)
                writer.writerow([t.id, t.intent_id, req.title if req else ""]) 
