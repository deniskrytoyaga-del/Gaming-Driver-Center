from __future__ import annotations

import os
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any


def _windows_only() -> None:
    if os.name != "nt":
        raise RuntimeError("Эта функция доступна только в Windows.")


def _run_key_path() -> str:
    return r"Software\Microsoft\Windows\CurrentVersion\Run"


def _gamebar_key_path() -> str:
    return r"Software\Microsoft\GameBar"


def get_optimization_status() -> dict[str, Any]:
    _windows_only()
    import winreg

    result: dict[str, Any] = {"gameMode": None, "startup": False, "tempPath": tempfile.gettempdir()}
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, _gamebar_key_path()) as key:
            try:
                result["gameMode"] = bool(winreg.QueryValueEx(key, "AutoGameModeEnabled")[0])
            except OSError:
                result["gameMode"] = False
    except OSError:
        result["gameMode"] = False
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, _run_key_path()) as key:
            try:
                winreg.QueryValueEx(key, "GamingDriverCenter")
                result["startup"] = True
            except OSError:
                result["startup"] = False
    except OSError:
        result["startup"] = False
    return result


def set_game_mode(enabled: bool) -> dict[str, Any]:
    _windows_only()
    import winreg

    with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, _gamebar_key_path(), 0, winreg.KEY_SET_VALUE) as key:
        value = 1 if enabled else 0
        winreg.SetValueEx(key, "AutoGameModeEnabled", 0, winreg.REG_DWORD, value)
        winreg.SetValueEx(key, "AllowAutoGameMode", 0, winreg.REG_DWORD, value)
    return {
        "gameMode": bool(enabled),
        "message": "Игровой режим Windows включён." if enabled else "Игровой режим Windows выключен.",
    }


def set_startup(enabled: bool) -> dict[str, Any]:
    _windows_only()
    import winreg

    if not getattr(sys, "frozen", False):
        raise RuntimeError("Автозапуск доступен только в установленной версии приложения.")
    executable = Path(sys.executable).resolve()
    command = f'"{executable}"'
    with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, _run_key_path(), 0, winreg.KEY_SET_VALUE) as key:
        if enabled:
            winreg.SetValueEx(key, "GamingDriverCenter", 0, winreg.REG_SZ, command)
        else:
            try:
                winreg.DeleteValue(key, "GamingDriverCenter")
            except FileNotFoundError:
                pass
    return {
        "startup": bool(enabled),
        "message": "Запуск вместе с Windows включён." if enabled else "Запуск вместе с Windows выключен.",
    }


def clean_user_temp() -> dict[str, Any]:
    _windows_only()
    root = Path(tempfile.gettempdir()).resolve()
    removed_files = 0
    removed_dirs = 0
    freed = 0
    for child in root.iterdir():
        try:
            if child.is_symlink():
                continue
            resolved = child.resolve()
            if root not in resolved.parents:
                continue
            if child.is_file():
                size = child.stat().st_size
                child.unlink()
                removed_files += 1
                freed += size
            elif child.is_dir():
                before = sum(
                    p.stat().st_size for p in child.rglob("*")
                    if p.is_file() and not p.is_symlink()
                )
                shutil.rmtree(child)
                removed_dirs += 1
                freed += before
        except OSError:
            # Temporary files can be locked by running applications.
            continue
    return {
        "removedFiles": removed_files,
        "removedFolders": removed_dirs,
        "freedBytes": freed,
        "message": (
            f"Удалено файлов: {removed_files}, папок: {removed_dirs}. "
            f"Освобождено: {freed / (1024 * 1024):.1f} МБ."
        ),
    }
