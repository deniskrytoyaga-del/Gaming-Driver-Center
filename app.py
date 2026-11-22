from __future__ import annotations
import os, threading, webbrowser
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from waitress import serve
import webview
from backend.system_info import collect_system, build_payload
from backend.driver_updates import check_driver_updates, install_all_driver_updates

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"
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
    return jsonify({"ok": True, "mode": "local-read-only", "version": "0.1.0"})

@app.get("/api/driver-updates")
def driver_updates():
    try:
        return jsonify({"ok": True, "data": check_driver_updates()})
    except Exception as exc:
        app.logger.exception("Driver update check failed")
        return jsonify({"ok": False, "error": str(exc)[:700]}), 500


@app.post("/api/driver-updates/install-all")
def install_all():
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
