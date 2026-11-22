from __future__ import annotations
import json, os, sys, threading
from pathlib import Path
from flask import Flask, jsonify, send_from_directory, request
from waitress import serve
import webview
from backend.system_info import collect_system, build_payload
from backend.driver_updates import check_driver_updates, install_all_driver_updates
from backend.software_catalog import get_software_catalog

def resource_path(relative: str) -> Path:
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return base / relative

ROOT = resource_path("")
FRONTEND = resource_path("frontend")
APP_DATA = Path(os.environ.get("APPDATA", Path.home())) / "GamingDriverCenter"
APP_DATA.mkdir(parents=True, exist_ok=True)
SETTINGS_FILE = APP_DATA / "settings.json"
app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")

@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response

@app.get("/")
def index():
    return send_from_directory(FRONTEND, "index.html")

@app.get("/api/health")
def health():
    return jsonify({"ok": True, "mode": "local-read-only", "version": "0.2.0"})

@app.get("/api/software-catalog")
def software_catalog():
    try:
        return jsonify({"ok": True, "data": get_software_catalog()})
    except Exception as exc:
        app.logger.exception("Software catalogue scan failed")
        return jsonify({"ok": False, "error": str(exc)[:500]}), 500

@app.get("/api/settings")
def get_settings():
    try:
        return jsonify(json.loads(SETTINGS_FILE.read_text("utf-8")) if SETTINGS_FILE.exists() else {"language":"ru"})
    except Exception:
        return jsonify({"language":"ru"})

@app.post("/api/settings")
def save_settings():
    payload = request.get_json(silent=True) or {}
    safe = {k:v for k,v in payload.items() if k in {"language","accent","glass","toasts"}}
    SETTINGS_FILE.write_text(json.dumps(safe, ensure_ascii=False, indent=2), encoding="utf-8")
    return jsonify({"ok": True})

@app.get("/api/driver-updates")
def driver_updates():
    try:
        return jsonify({"ok": True, "data": check_driver_updates()})
    except Exception as exc:
        app.logger.exception("Driver update check failed")
        return jsonify({"ok": False, "error": str(exc)[:700]}), 500

@app.post("/api/driver-updates/install-all")
def install_all():
    if request.headers.get("X-GDC-Confirm") != "1" or request.host != "127.0.0.1:8765":
        return jsonify({"ok": False, "error": "Local confirmation required"}), 403
    try:
        return jsonify({"ok": True, "data": install_all_driver_updates()})
    except Exception as exc:
        app.logger.exception("Driver update installation failed")
        return jsonify({"ok": False, "error": str(exc)[:700]}), 500

@app.get("/api/system")
def system():
    try:
        return jsonify({"ok": True, "data": build_payload(collect_system())})
    except Exception as exc:
        app.logger.exception("Hardware scan failed")
        return jsonify({"ok": False, "error": str(exc)[:400]}), 500

def run_server():
    serve(app, host="127.0.0.1", port=8765, threads=4)

if __name__ == "__main__":
    threading.Thread(target=run_server, daemon=True).start()
    webview.create_window("Gaming Driver Center", "http://127.0.0.1:8765", width=1440, height=900, min_size=(1050, 680))
    webview.start()
