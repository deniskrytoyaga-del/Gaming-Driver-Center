# Gaming Driver Center (GDC)

A Windows desktop application concept for detecting PC hardware, checking driver versions, and guiding users to official driver updates.

## Current frontend status

The frontend is organized under `frontend/`:

- `index.html` — application markup
- `style.css` — premium dark gaming dashboard styles
- `script.js` — frontend interactions and demo state

The UI currently contains demonstration data and simulated scan/install flows. These must not be presented as real hardware detection or real driver installation until connected to the local Python backend.

## Planned architecture

- Frontend: HTML, CSS, JavaScript
- Desktop host: WebView2
- Local backend: Python API (FastAPI)
- Windows x64 packaging: PyInstaller, built with GitHub Actions

## Safety requirements

- Only use official hardware-vendor driver sources.
- Match exact device models and Hardware IDs before recommending drivers.
- Verify installer signatures and compatibility.
- Never disable Windows security or driver-signature checks.
- Require explicit user confirmation before launching any installer.
- Log scan and installation outcomes and handle failures clearly.

## Development status

This repository is being populated. The exact original `index.html` and `script.js` frontend files still need to be added; do not replace them with generated placeholders.
