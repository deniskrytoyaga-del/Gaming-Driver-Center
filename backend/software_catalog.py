from __future__ import annotations

import json
import shutil
import subprocess
from typing import Any

# Only well-known package identifiers from the configured Windows Package Manager sources.
# No package is installed unless the user explicitly confirms it in the app.
CATALOG = [
    {"id":"Microsoft.VCRedist.2015+.x64","name":"Microsoft Visual C++ Redistributable 2015–2022 (x64)","kind":"runtime","applies":"Windows x64; many games and desktop apps","publisher":"Microsoft","description":"Библиотеки Visual C++, необходимые многим играм и программам.","winget":"Microsoft.VCRedist.2015+.x64"},
    {"id":"Microsoft.VCRedist.2015+.x86","name":"Microsoft Visual C++ Redistributable 2015–2022 (x86)","kind":"runtime","applies":"32-bit games and applications on Windows x64","publisher":"Microsoft","description":"32-битные библиотеки Visual C++ для старых и современных приложений.","winget":"Microsoft.VCRedist.2015+.x86"},
    {"id":"Microsoft.DotNet.DesktopRuntime.8","name":".NET Desktop Runtime 8","kind":"runtime","applies":"Apps built for .NET 8","publisher":"Microsoft","description":"Среда запуска настольных приложений .NET 8.","winget":"Microsoft.DotNet.DesktopRuntime.8"},
    {"id":"Microsoft.DotNet.DesktopRuntime.9","name":".NET Desktop Runtime 9","kind":"runtime","applies":"Apps built for .NET 9","publisher":"Microsoft","description":"Среда запуска настольных приложений .NET 9.","winget":"Microsoft.DotNet.DesktopRuntime.9"},
    {"id":"Microsoft.EdgeWebView2Runtime","name":"Microsoft Edge WebView2 Runtime","kind":"runtime","applies":"Apps that embed web content","publisher":"Microsoft","description":"Компонент для приложений со встроенным веб-интерфейсом.","winget":"Microsoft.EdgeWebView2Runtime"},
    {"id":"7zip.7zip","name":"7-Zip","kind":"utility","applies":"Windows x64","publisher":"Igor Pavlov","description":"Бесплатный архиватор для ZIP, 7z и других форматов.","winget":"7zip.7zip"},
    {"id":"RARLab.WinRAR","name":"WinRAR","kind":"utility","applies":"Windows x64","publisher":"win.rar GmbH","description":"Архиватор RAR и ZIP; после пробного периода нужна лицензия.","winget":"RARLab.WinRAR"},
    {"id":"Valve.Steam","name":"Steam","kind":"gaming","applies":"Windows gaming PC","publisher":"Valve","description":"Магазин и клиент для запуска игр Steam.","winget":"Valve.Steam"},
    {"id":"Discord.Discord","name":"Discord","kind":"utility","applies":"Windows desktop","publisher":"Discord Inc.","description":"Голосовое общение и текстовые сообщества.","winget":"Discord.Discord"},
]

def _winget_available() -> bool:
    return shutil.which("winget") is not None

def _installed_packages() -> dict[str, dict[str, str]] | None:
    if not _winget_available():
        return None
    try:
        proc = subprocess.run(
            ["winget", "list", "--accept-source-agreements", "--disable-interactivity", "--output", "json"],
            capture_output=True, text=True, timeout=45,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if proc.returncode != 0 or not proc.stdout.strip():
            return {}
        payload = json.loads(proc.stdout)
        rows: list[dict[str, Any]] = []
        if isinstance(payload, list):
            rows = payload
        elif isinstance(payload, dict):
            for source in payload.get("Sources", []):
                if isinstance(source, dict):
                    rows.extend(source.get("Packages", []))
            rows.extend(payload.get("Packages", []))
        installed: dict[str, dict[str, str]] = {}
        for row in rows:
            if not isinstance(row, dict):
                continue
            package_id = row.get("PackageIdentifier") or row.get("Id")
            if package_id:
                installed[str(package_id).casefold()] = {"version": str(row.get("Version") or "Неизвестно")}
        return installed
    except (OSError, subprocess.TimeoutExpired, json.JSONDecodeError):
        return {}

def get_software_catalog() -> dict[str, Any]:
    installed = _installed_packages()
    items = []
    for entry in CATALOG:
        item = dict(entry)
        match = installed.get(entry["winget"].casefold()) if installed is not None else None
        item["installed"] = bool(match) if installed is not None else None
        item["installedVersion"] = match["version"] if match else None
        item["status"] = ("Установлено" if match else "Не установлено") if installed is not None else "Проверка недоступна"
        item["installSupported"] = _winget_available()
        items.append(item)
    return {
        "source": "Windows Package Manager (winget)",
        "checked": installed is not None,
        "items": items,
        "note": "Поиск и установка выполняются через Windows Package Manager. Для установки требуется подтверждение пользователя; некоторые компоненты нужны только отдельным программам."
    }

def install_catalog_package(package_id: str) -> dict[str, Any]:
    if not _winget_available():
        raise RuntimeError("Windows Package Manager (winget) не найден. Обнови App Installer через Microsoft Store.")
    entry = next((x for x in CATALOG if x["id"] == package_id), None)
    if entry is None:
        raise ValueError("Этот пакет отсутствует в разрешённом каталоге.")
    command = [
        "winget", "install", "--id", entry["winget"], "--exact",
        "--silent", "--accept-package-agreements", "--accept-source-agreements",
        "--disable-interactivity",
    ]
    try:
        proc = subprocess.run(
            command, capture_output=True, text=True, timeout=1200,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("Установка превысила лимит времени. Проверь состояние программы в Windows.")
    output = (proc.stdout or "") + "\n" + (proc.stderr or "")
    if proc.returncode not in (0, 3010):
        raise RuntimeError((output.strip() or f"winget завершился с кодом {proc.returncode}")[-900:])
    return {
        "id": package_id,
        "name": entry["name"],
        "exitCode": proc.returncode,
        "rebootRequired": proc.returncode == 3010,
        "message": "Установка завершена." if proc.returncode == 0 else "Установка завершена; требуется перезагрузка Windows."
    }
