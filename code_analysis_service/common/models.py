from __future__ import annotations

from datetime import datetime
from enum import Enum
import uuid
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from pydantic import ConfigDict


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class BugStatus(str, Enum):
    open = "open"
    triaged = "triaged"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class CodeSymbol(BaseModel):
    """Represents a code symbol (function, class, variable, etc.)."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    qualified_name: Optional[str] = None
    language: str = "python"
    kind: Optional[str] = None
    file_path: Optional[str] = None
    start_line: Optional[int] = None
    end_line: Optional[int] = None
    docstring: Optional[str] = None
    code_snippet: Optional[str] = None


class Requirement(BaseModel):
    """Represents a testing requirement or user story."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    source: Optional[str] = None
    severity: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BugItem(BaseModel):
    """Represents a discovered bug or issue."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    severity: Optional[str] = None
    status: BugStatus = BugStatus.open
    related_requirements: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


class TestIntent(BaseModel):
    """High-level intent describing the test to generate."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requirement_id: Optional[str] = None
    description: str
    priority: Priority = Priority.medium
    parameters: Dict[str, Any] = Field(default_factory=dict)
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GeneratedTest(BaseModel):
    """Represents a test artifact generated from a TestIntent."""

    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    intent_id: Optional[str] = None
    code: str
    language: str = "python"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_run_at: Optional[datetime] = None
    passed: Optional[bool] = None
