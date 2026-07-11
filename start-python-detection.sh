#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DETECTION_DIR="$ROOT_DIR/python-detection"
VENV_DIR="$DETECTION_DIR/.venv"

cd "$DETECTION_DIR"
export MPLCONFIGDIR="${MPLCONFIGDIR:-/tmp/matplotlib-noura-ai}"

if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
  source "$VENV_DIR/bin/activate"
  pip install -r requirements.txt
else
  source "$VENV_DIR/bin/activate"
fi

uvicorn main:app --host 127.0.0.1 --port 8001
