"""Entry point to run the CoordinatorAgent end-to-end in demo mode."""
from __future__ import annotations

import os
import argparse
from agents.coordinator import CoordinatorAgent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--requirements", nargs='*', help="Inline requirement texts")
    parser.add_argument("--code", nargs='*', help="Paths to code files (local or GCS)")
    args = parser.parse_args()

    bucket = os.getenv("STORAGE_BUCKET_NAME", "")
    coord = CoordinatorAgent(storage_bucket=bucket)

    reqs = args.requirements or ["Patient lookup must be fast and secure"]
    codes = args.code or ["app/main.py"]

    generated = coord.run_end_to_end(reqs, codes)

    print(f"Generated {len(generated)} tests")
    for g in generated:
        print("-", g.metadata.get("path"))


if __name__ == "__main__":
    main()
