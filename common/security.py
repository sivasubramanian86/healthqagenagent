"""Security utilities for detecting and redacting PHI/PII in generated tests.

Functions:
- redact_pii(text) -> str: returns a redacted copy of text with common PHI patterns masked
- deny_real_phi_in_tests(code) -> None: raises ValueError if PHI patterns are detected
"""
from __future__ import annotations

import re
from typing import Pattern

# Basic regex patterns to catch common PHI/PII items. These are intentionally
# conservative and designed to catch obvious cases; do not rely on them as a
# sole compliance mechanism.

# Email addresses
_EMAIL_RE: Pattern = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

# US phone numbers (very permissive)
_PHONE_RE: Pattern = re.compile(r"\b(?:\+1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b")

# SSN-like patterns (XXX-XX-XXXX)
_SSN_RE: Pattern = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")

# Medical Record Number (very generic alpha-numeric sequence, tuned conservatively)
_MRN_RE: Pattern = re.compile(r"\bMRN[:#\s]*[A-Za-z0-9-]{4,20}\b", re.IGNORECASE)

# Dates in common formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
_DATE_RE: Pattern = re.compile(r"\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{2,4})\b")


def redact_pii(text: str) -> str:
    """Return a copy of `text` with detected PHI/PII masked.

    Masks emails, phone numbers, SSNs, MRNs and dates. Returns the redacted string.
    """
    if not text:
        return text

    redacted = _EMAIL_RE.sub("[REDACTED_EMAIL]", text)
    redacted = _PHONE_RE.sub("[REDACTED_PHONE]", redacted)
    redacted = _SSN_RE.sub("[REDACTED_SSN]", redacted)
    redacted = _MRN_RE.sub("[REDACTED_MRN]", redacted)
    redacted = _DATE_RE.sub("[REDACTED_DATE]", redacted)
    return redacted


def _contains_phi(text: str) -> bool:
    """Return True if any PHI/PII pattern is found in text."""
    if not text:
        return False
    checks = [_EMAIL_RE, _PHONE_RE, _SSN_RE, _MRN_RE, _DATE_RE]
    for p in checks:
        if p.search(text):
            return True
    return False


def deny_real_phi_in_tests(code: str) -> None:
    """Raise ValueError if code contains real PHI/PII patterns.

    This function is meant to be used as a guard before persisting or executing
    generated tests. It intentionally errs on the side of caution and will
    raise if any common PHI-like patterns are detected.
    """
    if _contains_phi(code):
        raise ValueError(
            "Generated test contains patterns that resemble real PHI/PII. "
            "Refuse to save or execute unredacted PHI."
        )
