# Gaming Driver Center (GDC)

A Windows desktop utility for local hardware and installed-driver inventory.

## Current working features

- Native Windows desktop window powered by pywebview.
- Local-only Flask API bound to 127.0.0.1.
- Read-only hardware inventory through Windows CIM/PowerShell: graphics adapters, CPU, memory, motherboard, disks and active network adapters.
- Installed Plug-and-Play driver inventory with provider, version, date, class, INF name and signature status.
- Frontend switches from demo inventory to live local inventory when the backend responds.
- GitHub Actions builds a Windows x64 executable folder artifact.

## Important limitations

This first functional build does **not** query vendor catalogues for latest driver versions, does not determine whether a driver update is available, and does not install, replace, or roll back drivers. The UI must not label an unknown version as up to date. Driver update discovery and installation need a later, separately reviewed implementation with official vendor sources, exact hardware-ID matching, signature checks and explicit user confirmation.

The application does not disable Windows security settings or alter the registry.

## Build locally

Requires 64-bit Windows 10/11 and Python 3.12.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python app.py
```

## Build using GitHub Actions

Open **Actions → Build Windows application → Run workflow**. After a successful run, download the `Gaming-Driver-Center-Windows-x64` artifact. Extract the ZIP and launch `GamingDriverCenter.exe`.

## Project structure

- `frontend/` — HTML, CSS and JavaScript UI
- `backend/system_info.py` — read-only Windows inventory
- `app.py` — local desktop host and API
- `tests/` — backend tests
- `.github/workflows/build-windows.yml` — Windows build pipeline
