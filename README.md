# Gaming Driver Center

Windows x64 desktop utility for hardware and driver inventory, with a cautious software prerequisite catalogue.

## Current capabilities
- Local desktop app (pywebview + Flask bound to 127.0.0.1).
- Read-only Windows CIM hardware and Plug-and-Play driver inventory.
- Driver updates discovered from Microsoft Windows Update only; vendor catalogue comparisons are not yet implemented.
- Software catalogue detects a small curated set of packages through winget. It does not install anything yet.
- Settings are stored separately in %APPDATA%\\GamingDriverCenter.
- Windows installer uses PyInstaller onedir + Inno Setup; app files live under Program Files.

## Important limitations
A missing catalogue entry is not proof that a component is required. DirectX legacy runtime is intentionally not offered as a blanket recommendation. Driver signature metadata and latest vendor versions are not yet fully verified for every device. The app must not label an unchecked driver as up to date.

No driver or software is installed automatically. Driver installation is a separate Windows Update operation and should only be started after the user reviews it. Ask an adult before installing system drivers or software.

## Build locally
Requires 64-bit Windows 10/11 and Python 3.12.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python app.py
```

## Installer
GitHub Actions builds `GamingDriverCenter-Setup.exe` after tests pass. The installer creates Start Menu and optional desktop shortcuts. User settings are stored outside the install directory and survive app updates.

## Project layout
- `frontend/`: UI
- `backend/system_info.py`: read-only hardware and driver inventory
- `backend/driver_updates.py`: Microsoft Windows Update driver discovery
- `backend/software_catalog.py`: curated software/runtime detection
- `installer/GDC.iss`: Inno Setup definition
