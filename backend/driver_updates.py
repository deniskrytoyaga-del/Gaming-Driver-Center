from __future__ import annotations

import json
import subprocess
from typing import Any


def _run_windows_update(action: str) -> dict[str, Any]:
    """Use Microsoft's Windows Update Agent to inspect/install applicable DRIVER updates only."""
    if action not in {"check", "install"}:
        raise ValueError("Unsupported driver update action")

    install_block = r"""
$downloader = $session.CreateUpdateDownloader()
$downloader.Updates = $updates
$downloadResult = $downloader.Download()
$installer = $session.CreateUpdateInstaller()
$installer.Updates = $updates
$installer.AllowSourcePrompts = $false
$installResult = $installer.Install()
$items = @()
for ($i = 0; $i -lt $updates.Count; $i++) {
  $u = $updates.Item($i)
  $r = $installResult.GetUpdateResult($i)
  $items += [pscustomobject]@{
    title = $u.Title
    hresult = ('0x{0:X8}' -f $r.HResult)
    resultCode = [int]$r.ResultCode
    rebootRequired = [bool]$r.RebootRequired
  }
}
[pscustomobject]@{
  found = $updates.Count
  downloadResult = [int]$downloadResult.ResultCode
  installResult = [int]$installResult.ResultCode
  rebootRequired = [bool]$installResult.RebootRequired
  items = $items
} | ConvertTo-Json -Depth 5 -Compress
""" if action == "install" else r"""
$items = @()
for ($i = 0; $i -lt $updates.Count; $i++) {
  $u = $updates.Item($i)
  $items += [pscustomobject]@{
    title = $u.Title
    description = $u.Description
    updateId = $u.Identity.UpdateID
    driverManufacturer = $u.DriverManufacturer
    driverModel = $u.DriverModel
    driverProvider = $u.DriverProvider
    driverVerDate = if ($u.DriverVerDate) { $u.DriverVerDate.ToString('yyyy-MM-dd') } else { '' }
    driverVersion = $u.DriverVersion
  }
}
[pscustomobject]@{ found = $updates.Count; items = $items } | ConvertTo-Json -Depth 5 -Compress
"""

    script = r"""
$ErrorActionPreference = 'Stop'
$session = New-Object -ComObject Microsoft.Update.Session
$searcher = $session.CreateUpdateSearcher()
$result = $searcher.Search("IsInstalled=0 and IsHidden=0 and Type='Driver'")
$updates = New-Object -ComObject Microsoft.Update.UpdateColl
for ($i = 0; $i -lt $result.Updates.Count; $i++) {
  $u = $result.Updates.Item($i)
  if (-not $u.IsInstalled -and -not $u.IsHidden) { [void]$updates.Add($u) }
}
""" + install_block

    completed = subprocess.run(
        [
            "powershell.exe", "-NoProfile", "-NonInteractive",
            "-ExecutionPolicy", "RemoteSigned", "-Command", script,
        ],
        capture_output=True,
        text=True,
        timeout=900 if action == "install" else 180,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    if completed.returncode != 0:
        message = (completed.stderr or completed.stdout or "Windows Update driver operation failed").strip()
        raise RuntimeError(message[:700])
    raw = completed.stdout.strip()
    if not raw:
        return {"found": 0, "items": []}
    value = json.loads(raw)
    if isinstance(value, list):
        return value[0] if value else {"found": 0, "items": []}
    return value


def check_driver_updates() -> dict[str, Any]:
    result = _run_windows_update("check")
    items = result.get("items") or []
    return {
        "source": "Microsoft Windows Update",
        "found": len(items),
        "items": items,
        "message": "No applicable driver updates were offered by Windows Update." if not items else "Only driver updates matched by Windows Update for this PC are listed.",
    }


def install_all_driver_updates() -> dict[str, Any]:
    result = _run_windows_update("install")
    return {
        "source": "Microsoft Windows Update",
        "found": int(result.get("found") or 0),
        "downloadResult": result.get("downloadResult"),
        "installResult": result.get("installResult"),
        "rebootRequired": bool(result.get("rebootRequired")),
        "items": result.get("items") or [],
    }
