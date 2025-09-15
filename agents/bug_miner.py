"""BugMinerAgent: fetch recent bugs from issue trackers like Jira or Azure DevOps.

This implementation provides minimal REST-based fetchers for Jira and Azure DevOps.
Credentials should be passed via the `config` dict or environment variables.
"""
from __future__ import annotations

from typing import List, Dict, Optional
import os
import requests

from common.models import BugItem


class BugMinerAgent:
    """Connects to Jira/Azure DevOps API to fetch recent bugs.

    Config examples (config dict):
      - Jira: {"provider": "jira", "base_url": "https://yourorg.atlassian.net", "email": "x@org", "api_token": "..."}
      - Azure DevOps: {"provider": "azure", "org": "org", "project": "proj", "pat": "..."}
    """

    def __init__(self, provider: str = "jira", config: Optional[Dict] = None, mock: bool = False, mock_file: str | None = None):
        self.provider = provider.lower()
        self.config = config or {}
        self.mock = mock
        self.mock_file = mock_file

    def fetch_recent_bugs(self, project: str = "", limit: int = 50) -> List[BugItem]:
        # In mock mode, read from a local JSON file if provided
        if self.mock and self.mock_file:
            try:
                import json
                with open(self.mock_file, 'r', encoding='utf-8') as fh:
                    data = json.load(fh)
                items: List[BugItem] = []
                from common.security import redact_pii
                for it in data.get('bugs', []):
                    items.append(BugItem(title=it.get('title',''), description=redact_pii(it.get('description',''))))
                return items
            except Exception:
                return []

        if self.provider == "jira":
            return self._fetch_jira_issues(limit=limit)
        if self.provider in ("azure", "azuredevops", "azure-devops"):
            return self._fetch_azure_work_items(project=project, limit=limit)
        return []

    def _fetch_jira_issues(self, limit: int = 50) -> List[BugItem]:
        base = self.config.get("base_url") or os.getenv("JIRA_BASE_URL")
        email = self.config.get("email") or os.getenv("JIRA_EMAIL")
        token = self.config.get("api_token") or os.getenv("JIRA_API_TOKEN")
        if not base or not token or not email:
            return []
        url = f"{base}/rest/api/2/search"
        jql = "issuetype=Bug ORDER BY updated DESC"
        params = {"jql": jql, "maxResults": limit}
        resp = requests.get(url, params=params, auth=(email, token), timeout=15)
        resp.raise_for_status()
        data = resp.json()
        issues = []
        from common.security import redact_pii
        for it in data.get("issues", []):
            fields = it.get("fields", {})
            issues.append(BugItem(title=fields.get("summary", ""), description=redact_pii(fields.get("description", ""))))
        return issues

    def _fetch_azure_work_items(self, project: str = "", limit: int = 50) -> List[BugItem]:
        org = self.config.get("org") or os.getenv("AZURE_ORG")
        pat = self.config.get("pat") or os.getenv("AZURE_DEVOPS_PAT")
        if not org or not pat or not project:
            return []
        # Query Work Items for bugs
        wiql = {
            "query": f"Select [System.Id],[System.Title],[System.State] From WorkItems Where [System.WorkItemType] = 'Bug' AND [System.TeamProject] = '{project}' ORDER BY [System.ChangedDate] DESC"
        }
        headers = {"Content-Type": "application/json"}
        resp = requests.post(f"https://dev.azure.com/{org}/{project}/_apis/wit/wiql?api-version=6.0", json=wiql, headers=headers, auth=("", pat), timeout=15)
        resp.raise_for_status()
        data = resp.json()
        ids = [str(i["id"]) for i in data.get("workItems", [])][:limit]
        if not ids:
            return []
        ids_str = ",".join(ids)
        resp2 = requests.get(f"https://dev.azure.com/{org}/{project}/_apis/wit/workitems?ids={ids_str}&api-version=6.0", auth=("", pat), timeout=15)
        resp2.raise_for_status()
        data2 = resp2.json()
        items = []
        from common.security import redact_pii
        for it in data2.get("value", []):
            fields = it.get("fields", {})
            items.append(BugItem(title=fields.get("System.Title", ""), description=redact_pii(fields.get("System.Description", ""))))
        return items

