from __future__ import annotations

import hashlib
import os
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

# Installers are fetched only from official vendor endpoints and are launched
# interactively. Authenticode publisher verification is mandatory before launch.
CATALOG: list[dict[str, Any]] = [
    {
        "id": "vc-runtime-x64", "name": "Microsoft Visual C++ Runtime (x64)",
        "kind": "runtime", "publisher": "Microsoft Corporation",
        "description": "Библиотеки Visual C++, которые требуются многим играм и программам.",
        "applies": "Большинство 64-битных игр и приложений",
        "patterns": [r"Microsoft Visual C\+\+.*(2015|2017|2019|2022|v14).*\(x64\)"],
        "url": "https://aka.ms/vs/17/release/vc_redist.x64.exe", "format": "exe",
        "hosts": ["aka.ms", "download.visualstudio.microsoft.com"],
    },
    {
        "id": "vc-runtime-x86", "name": "Microsoft Visual C++ Runtime (x86)",
        "kind": "runtime", "publisher": "Microsoft Corporation",
        "description": "32-битные библиотеки Visual C++ для старых и современных приложений.",
        "applies": "32-битные игры и программы на Windows x64",
        "patterns": [r"Microsoft Visual C\+\+.*(2015|2017|2019|2022|v14).*\(x86\)"],
        "url": "https://aka.ms/vs/17/release/vc_redist.x86.exe", "format": "exe",
        "hosts": ["aka.ms", "download.visualstudio.microsoft.com"],
    },
    {
        "id": "dotnet10-x64", "name": ".NET 10 Desktop Runtime (x64)",
        "kind": "runtime", "publisher": "Microsoft Corporation",
        "description": "Среда запуска настольных программ, созданных для .NET 10.",
        "applies": "Только приложениям, которым нужен .NET 10",
        "patterns": [r"Microsoft Windows Desktop Runtime - 10\..*\(x64\)", r"Microsoft .NET Desktop Runtime - 10\..*\(x64\)"],
        "url": "https://aka.ms/dotnet/10.0/windowsdesktop-runtime-win-x64.exe", "format": "exe",
        "hosts": ["aka.ms", "builds.dotnet.microsoft.com", "download.visualstudio.microsoft.com"],
    },
    {
        "id": "dotnet10-x86", "name": ".NET 10 Desktop Runtime (x86)",
        "kind": "runtime", "publisher": "Microsoft Corporation",
        "description": "32-битная среда .NET 10 для программ, которым нужна именно x86-версия.",
        "applies": "32-битным приложениям .NET 10",
        "patterns": [r"Microsoft Windows Desktop Runtime - 10\..*\(x86\)", r"Microsoft .NET Desktop Runtime - 10\..*\(x86\)"],
        "url": "https://aka.ms/dotnet/10.0/windowsdesktop-runtime-win-x86.exe", "format": "exe",
        "hosts": ["aka.ms", "builds.dotnet.microsoft.com", "download.visualstudio.microsoft.com"],
    },
    {
        "id": "webview2", "name": "Microsoft Edge WebView2 Runtime",
        "kind": "runtime", "publisher": "Microsoft Corporation",
        "description": "Веб-компонент, используемый интерфейсами некоторых Windows-приложений.",
        "applies": "Приложениям со встроенными веб-страницами",
        "patterns": [r"Microsoft Edge WebView2 Runtime"],
        "url": "https://go.microsoft.com/fwlink/p/?LinkId=2124703", "format": "exe",
        "hosts": ["go.microsoft.com", "msedge.sf.dl.delivery.mp.microsoft.com", "msedge.api.cdp.microsoft.com"],
    },
    {
        "id": "chrome", "name": "Google Chrome (64-bit)",
        "kind": "utility", "publisher": "Google LLC",
        "description": "Веб-браузер Google Chrome.",
        "applies": "По желанию пользователя",
        "patterns": [r"Google Chrome"],
        "url": "https://dl.google.com/chrome/install/GoogleChromeStandaloneEnterprise64.msi", "format": "msi",
        "hosts": ["dl.google.com"],
    },
    {
        "id": "firefox", "name": "Mozilla Firefox (64-bit)",
        "kind": "utility", "publisher": "Mozilla Corporation",
        "description": "Веб-браузер Mozilla Firefox.",
        "applies": "По желанию пользователя",
        "patterns": [r"Mozilla Firefox"],
        "url": "https://download.mozilla.org/?product=firefox-latest&os=win64&lang=ru", "format": "exe",
        "hosts": ["download.mozilla.org", "download-installer.cdn.mozilla.net", "archive.mozilla.org"],
    },
    {
        "id": "steam", "name": "Steam",
        "kind": "gaming", "publisher": "Valve Corp.",
        "description": "Клиент Steam для установки и запуска игр.",
        "applies": "Только если пользуешься Steam",
        "patterns": [r"Steam"],
        "url": "https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe", "format": "exe",
        "hosts": ["cdn.akamai.steamstatic.com", "steamcdn-a.akamaihd.net"],
    },
    {
        "id": "discord", "name": "Discord",
        "kind": "utility", "publisher": "Discord Inc.",
        "description": "Приложение для голосового и текстового общения.",
        "applies": "По желанию пользователя",
        "patterns": [r"Discord"],
        "url": "https://discord.com/api/download?platform=win", "format": "exe",
        "hosts": ["discord.com", "stable.dl2.discordapp.net"],
    },
    {
        "id": "intel-dsa", "name": "Intel Driver & Support Assistant",
        "kind": "driver-tool", "publisher": "Intel Corporation",
        "description": "Официальная утилита Intel для определения подходящих обновлений устройств Intel. Не устанавливает драйверы AMD или Digma.",
        "applies": "Только для обнаруженных устройств Intel",
        "patterns": [r"Intel.*Driver.*Support Assistant"],
        "url": "https://dsadata.intel.com/installer/Intel-Driver-and-Support-Assistant-Installer.exe", "format": "exe",
        "hosts": ["dsadata.intel.com", "downloadmirror.intel.com"],
    },
]

def _is_allowed_host(host: str, allowed: list[str]) -> bool:
    host = (host or "").lower().rstrip(".")
    return any(host == item or host.endswith("." + item) for item in allowed)

def _installed_programs() -> list[dict[str, str]]:
    if os.name != "nt":
        return []
    import winreg

    roots = [
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
        (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
    ]
    found: list[dict[str, str]] = []
    for root, path in roots:
        try:
            with winreg.OpenKey(root, path) as parent:
                count = winreg.QueryInfoKey(parent)[0]
                for index in range(count):
                    try:
                        sub_name = winreg.EnumKey(parent, index)
                        with winreg.OpenKey(parent, sub_name) as sub:
                            name = str(winreg.QueryValueEx(sub, "DisplayName")[0])
                            try:
                                version = str(winreg.QueryValueEx(sub, "DisplayVersion")[0])
                            except OSError:
                                version = ""
                            found.append({"name": name, "version": version})
                    except OSError:
                        continue
        except OSError:
            continue
    return found

def _find_installed(entry: dict[str, Any], programs: list[dict[str, str]]) -> dict[str, str] | None:
    import re
    patterns = [re.compile(p, re.IGNORECASE) for p in entry.get("patterns", [])]
    for program in programs:
        if any(pattern.search(program["name"]) for pattern in patterns):
            return program
    return None

def get_software_catalog() -> dict[str, Any]:
    checked = os.name == "nt"
    programs = _installed_programs() if checked else []
    items = []
    for entry in CATALOG:
        match = _find_installed(entry, programs) if checked else None
        item = {k: v for k, v in entry.items() if k not in {"patterns", "url", "hosts", "format"}}
        item.update({
            "installed": bool(match) if checked else None,
            "installedVersion": match["version"] if match else None,
            "status": ("Установлено" if match else "Не установлено") if checked else "Проверка доступна только в Windows",
            "installSupported": checked,
            "versionCheck": "Текущая версия читается из реестра Windows; автоматическое сравнение с последним релизом пока не поддерживается.",
        })
        items.append(item)
    return {
        "source": "Официальные установщики производителей + реестр Windows",
        "checked": checked,
        "items": items,
        "note": "Каталог показывает необязательные компоненты и программы. Не устанавливай всё подряд: ставь только то, что нужно твоим приложениям. Драйверы устройств проверяются отдельно через Windows Update.",
    }

def _verify_authenticode(path: Path, expected_publisher: str) -> str:
    if os.name != "nt":
        raise RuntimeError("Запуск установщиков поддерживается только в Windows.")
    script = (
        "$s=Get-AuthenticodeSignature -LiteralPath $env:GDC_INSTALLER; "
        "if($s.Status -ne 'Valid'){exit 10}; "
        "$subject=$s.SignerCertificate.Subject; "
        "if($subject -notlike ('*'+$env:GDC_EXPECTED_PUBLISHER+'*')){exit 11}; "
        "Write-Output $subject"
    )
    env = os.environ.copy()
    env["GDC_INSTALLER"] = str(path)
    env["GDC_EXPECTED_PUBLISHER"] = expected_publisher
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "RemoteSigned", "-Command", script],
        capture_output=True, text=True, timeout=30, env=env,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    if result.returncode != 0:
        raise RuntimeError("Цифровая подпись установщика недействительна или издатель не совпадает. Запуск заблокирован.")
    return result.stdout.strip()

def install_catalog_package(package_id: str) -> dict[str, Any]:
    if os.name != "nt":
        raise RuntimeError("Установка доступна только в Windows.")
    entry = next((x for x in CATALOG if x["id"] == package_id), None)
    if entry is None:
        raise ValueError("Программа отсутствует в разрешённом каталоге.")
    parsed = urlparse(entry["url"])
    if parsed.scheme != "https" or not _is_allowed_host(parsed.hostname or "", entry["hosts"]):
        raise RuntimeError("Адрес загрузки не прошёл проверку официального источника.")
    request = urllib.request.Request(entry["url"], headers={"User-Agent": "GamingDriverCenter/0.4"})
    target_dir = Path(tempfile.gettempdir()) / "GamingDriverCenter" / "Installers"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"{entry['id']}.{entry['format']}"
    digest = hashlib.sha256()
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            final_host = urlparse(response.geturl()).hostname or ""
            if not _is_allowed_host(final_host, entry["hosts"]):
                raise RuntimeError("Загрузка перенаправлена на неизвестный домен. Установщик заблокирован.")
            total = 0
            with target.open("wb") as output:
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > 1024 * 1024 * 1024:
                        raise RuntimeError("Размер установщика превышает безопасный лимит 1 ГБ.")
                    digest.update(chunk)
                    output.write(chunk)
        if total < 100_000:
            raise RuntimeError("Скачанный файл слишком мал и похож на страницу ошибки, а не на установщик.")
        signer = _verify_authenticode(target, entry["publisher"])
        if entry["format"] == "msi":
            process = subprocess.Popen(["msiexec.exe", "/i", str(target)])
        else:
            process = subprocess.Popen([str(target)])
    except Exception:
        try:
            target.unlink(missing_ok=True)
        except OSError:
            pass
        raise
    return {
        "id": package_id,
        "name": entry["name"],
        "launched": True,
        "processId": process.pid,
        "sha256": digest.hexdigest(),
        "signer": signer,
        "message": "Официальный установщик скачан, подпись издателя проверена и мастер установки запущен. Заверши установку в его окне, затем обнови каталог.",
    }
