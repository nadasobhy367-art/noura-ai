import os
from pathlib import Path


def load_env_file(file_path: Path) -> None:
    if not file_path.exists():
        return

    for raw_line in file_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        if not key or key in os.environ:
            continue

        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]

        os.environ[key] = value


def load_config() -> dict:
    base_dir = Path(__file__).resolve().parent.parent
    repo_root = base_dir.parent

    load_env_file(repo_root / ".env")
    load_env_file(base_dir / ".env")

    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PYTHON_CHATBOT_PORT", "8000"))

    return {
        "HOST": host,
        "PORT": port,
        "OPENROUTER_API_URL": "https://openrouter.ai/api/v1/chat/completions",
        "OPENROUTER_API_KEY": (
            os.environ.get("OPENROUTER_API_KEY")
            or os.environ.get("REACT_APP_OPENROUTER_API_KEY")
            or ""
        ).strip(),
        "OPENROUTER_MODEL": (
            os.environ.get("OPENROUTER_MODEL")
            or os.environ.get("REACT_APP_OPENROUTER_MODEL")
            or "openai/gpt-4o-mini"
        ).strip(),
        "OPENROUTER_SITE_URL": (
            os.environ.get("OPENROUTER_SITE_URL")
            or os.environ.get("REACT_APP_OPENROUTER_SITE_URL")
            or f"http://{host}:{port}"
        ).strip(),
        "OPENROUTER_APP_NAME": (
            os.environ.get("OPENROUTER_APP_NAME")
            or os.environ.get("REACT_APP_OPENROUTER_APP_NAME")
            or "Noura AI Python Chatbot"
        ).strip(),
    }
