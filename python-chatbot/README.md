# Python Chatbot Copy

Standalone Python version of the Noura AI chatbot.

## Structure

- `app.py`: local entrypoint
- `noura_chatbot/__init__.py`: Flask app factory and routes
- `noura_chatbot/config.py`: environment/config loading
- `noura_chatbot/services/chat_service.py`: chatbot logic and AI provider integration
- `templates/index.html`: frontend UI
- `static/style.css`: frontend styling

## Run

```bash
cd python-chatbot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:8000`.

## Faster Run

From the repo root:

```bash
chmod +x start-python-chatbot.sh
./start-python-chatbot.sh
```

## Optional AI Setup

If you want real AI responses instead of fallback demo replies:

1. Copy `.env.example` to `.env`
2. Add your `OPENROUTER_API_KEY`
3. Run the app again

Example:

```bash
cd python-chatbot
cp .env.example .env
```

## Notes

- This version does not replace the current React app.
- It runs separately on its own port.
- If `OPENROUTER_API_KEY` is missing, the app uses the same demo-style fallback replies.
- The app reads `.env` from the repo root if present.
