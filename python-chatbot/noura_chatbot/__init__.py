from pathlib import Path

from flask import Flask, jsonify, render_template, request

from .config import load_config
from .services.chat_service import ChatService


def create_app() -> Flask:
    package_dir = Path(__file__).resolve().parent
    project_dir = package_dir.parent

    app = Flask(
        __name__,
        template_folder=str(project_dir / "templates"),
        static_folder=str(project_dir / "static"),
    )
    app.config.update(load_config())

    chat_service = ChatService(app.config)

    @app.get("/")
    def home():
        return render_template("index.html")

    @app.get("/api/health")
    def health():
        return jsonify(
            {
                "ok": True,
                "service": "noura-python-chatbot",
                "mode": chat_service.get_mode(),
                "now": chat_service.utc_now(),
            }
        )

    @app.get("/api/meta")
    def meta():
        return jsonify(
            {
                "ok": True,
                "assistantName": "Noura AI Assistant",
                "mode": chat_service.get_mode(),
                "quickActions": chat_service.get_quick_actions(),
            }
        )

    @app.post("/api/chat")
    def chat():
        payload = request.get_json(silent=True) or {}
        message = str(payload.get("message") or "").strip()
        history = payload.get("history") or []

        if not message:
            return jsonify(
                {"ok": False, "code": "INVALID_MESSAGE", "message": "Message is required"}
            ), 400

        if not isinstance(history, list):
            history = []

        status_code, data = chat_service.reply(message, history)
        return jsonify(data), status_code

    return app
