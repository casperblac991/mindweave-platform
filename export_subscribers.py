#!/usr/bin/env python3
"""Export active MindWeave newsletter subscribers to a local CSV file.

Required environment variables:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

The service-role key is intentionally required at runtime and must never be
placed in HTML, JavaScript, Git, or a public hosting environment.
"""

import csv
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests


PAGE_SIZE = 1000


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def fetch_subscribers(base_url: str, service_key: str):
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Accept": "application/json",
    }
    rows = []
    offset = 0
    while True:
        response = requests.get(
            f"{base_url.rstrip('/')}/rest/v1/newsletter_subscribers",
            params={
                "select": "email,subscribed_at,source",
                "is_active": "eq.true",
                "order": "subscribed_at.desc",
                "limit": PAGE_SIZE,
                "offset": offset,
            },
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        page = response.json()
        if not isinstance(page, list):
            raise RuntimeError("Supabase returned an unexpected response")
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return rows


def main() -> int:
    try:
        base_url = require_env("SUPABASE_URL")
        service_key = require_env("SUPABASE_SERVICE_ROLE_KEY")
        output = Path(sys.argv[1] if len(sys.argv) > 1 else "subscribers_export.csv")
        rows = fetch_subscribers(base_url, service_key)
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("w", newline="", encoding="utf-8-sig") as handle:
            writer = csv.DictWriter(handle, fieldnames=["email", "subscribed_at", "source"])
            writer.writeheader()
            writer.writerows(rows)
        print(f"Exported {len(rows)} active subscribers to {output}")
        print(f"Export time: {datetime.now(timezone.utc).isoformat()}")
        return 0
    except requests.HTTPError as exc:
        print(f"Supabase request failed: {exc}", file=sys.stderr)
        if exc.response is not None:
            print(exc.response.text[:500], file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Export failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
