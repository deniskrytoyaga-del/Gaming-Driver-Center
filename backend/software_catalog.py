from __future__ import annotations
import json
import shutil
import subprocess
from typing import Any

# Curated prerequisites and utilities. Applicability is conservative; no software is
# installed automatically. Official winget IDs are used only for detection metadata.
CATALOG = [
 {"id":"Microsoft.VCRedist.2015+.x64","name":"Microsoft Visual C++ Redistributable 2015–2022 (x64)","kind":"runtime","applies":"Windows x64","publisher":"Microsoft Corporation","url":"https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist","winget":"Microsoft.VCRedist.2015+.x64"},
 {"id":"Microsoft.DotNet.DesktopRuntime.8","name":".NET Desktop Runtime 8","kind":"runtime","applies":"Windows x64; приложения на .NET 8","publisher":"Microsoft Corporation","url":"https://dotnet.microsoft.com/en-us/download/dotnet/8.0","winget":"Microsoft.DotNet.DesktopRuntime.8"},
 {"id":"Microsoft.EdgeWebView2Runtime","name":"Microsoft Edge WebView2 Runtime","kind":"runtime","applies":"Приложения, использующие WebView2","publisher":"Microsoft Corporation","url":"https://developer.microsoft.com/en-us/microsoft-edge/webview2/","winget":"Microsoft.EdgeWebView2Runtime"},
 {"id":"7zip.7zip","name":"7-Zip","kind":"utility","applies":"Windows x64","publisher":"Igor Pavlov","url":"https://www.7-zip.org/","winget":"7zip.7zip"},
 {"id":"RARLab.WinRAR","name":"WinRAR","kind":"utility","applies":"Windows x64; условно-бесплатная лицензия","publisher":" win.rar GmbH","url":"https://www.win-rar.com/","winget":"RARLab.WinRAR"},
]

def _winget_list() -> dict[str, dict[str, str]]:
    if not shutil.which("winget"):
        return {}
    try:
        p = subprocess.run(["winget","list","--accept-source-agreements","--disable-interactivity","--output","json"], capture_output=True, text=True, timeout=35)
        if p.returncode != 0 or not p.stdout.strip():
            return {}
        data = json.loads(p.stdout)
        rows = data if isinstance(data, list) else data.get("Sources", [])
        found = {}
        for row in rows:
            if not isinstance(row, dict): continue
            package_id = row.get("PackageIdentifier") or row.get("Id")
            if package_id:
                found[str(package_id).lower()] = {"version":str(row.get("Version") or "Неизвестно")}
        return found
    except Exception:
        return {}

def get_software_catalog() -> dict[str, Any]:
    installed = _winget_list()
    items = []
    for entry in CATALOG:
        match = installed.get(entry["winget"].lower())
        item = dict(entry)
        item["installed"] = bool(match)
        item["installedVersion"] = match["version"] if match else None
        item["status"] = "Установлено" if match else ("Не обнаружено" if shutil.which("winget") else "Проверка недоступна: winget не найден")
        item["installSupported"] = bool(shutil.which("winget"))
        items.append(item)
    return {"source":"Windows Package Manager (winget)","checked":bool(shutil.which("winget")),"items":items,
            "note":"Это базовый каталог совместимых по ОС пакетов. Отсутствие пакета в списке не означает, что он обязателен. Установка пока не запускается из приложения."}
