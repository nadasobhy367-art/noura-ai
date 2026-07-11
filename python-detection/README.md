# Cancer Detection API

FastAPI app for cancer detection using YOLO models.

## Setup

1. Place model files in `models/`:
   - brain_best.pt
   - lung_best.pt
   - breast_best.pt
   - skin_best.pt

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run locally:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8001 --reload
   ```

## Deployment

Use Docker:
```bash
docker build -t cancer-detection .
docker run -p 8000:8000 cancer-detection
```

Or deploy to Railway/Render/Heroku using this repo.

## API

- POST /predict: Upload image (multipart/form-data, field 'file')
- GET /: Health check