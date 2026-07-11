from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import uuid
import os
import torch

# Ultralytics 8.0.3 expects the pre-PyTorch-2.6 torch.load behavior.
# These local checkpoint files are part of this project, so we explicitly allow full loads.
_torch_load = torch.load


def _torch_load_compatible(*args, **kwargs):
    kwargs.setdefault("weights_only", False)
    return _torch_load(*args, **kwargs)


torch.load = _torch_load_compatible

from ultralytics import YOLO

app = FastAPI(title="Cancer Detection API")

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["https://nadasobhy367-art.github.io"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# =========================
# Load Models
# (ضعي ملفات الـ weights في فولدر models/ جنب main.py)
# models/
#   brain_best.pt
#   lung_best.pt
#   breast_best.pt
#   skin_best.pt
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

models = {}

SCAN_TYPE_TO_MODEL = {
    "brain": "brain",
    "breast": "breast",
    "lung": "lung",
    "skin": "skin",
}

# Load models safely
for name in ["brain", "lung", "breast", "skin"]:
    model_path = os.path.join(MODELS_DIR, f"{name}_best.pt")
    if os.path.exists(model_path):
        try:
            models[name] = YOLO(model_path)
            print(f"Loaded model: {name}")
        except Exception as e:
            print(f"FAILED to load {name} model: {e}")
    else:
        print(f"Model file not found: {model_path}")

if not models:
    print("WARNING: No AI models loaded. Run: pip install -U ultralytics")

UPLOAD_DIR = os.path.join(BASE_DIR, "temp_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# Helpers
# =========================
def get_risk_level(conf: float) -> str:
    if conf >= 0.7:
        return "High Risk"
    elif conf >= 0.4:
        return "Medium Risk"
    else:
        return "Low Risk"


def get_recommendation(cancer_type: str, risk: str) -> str:
    if cancer_type == "uncertain":
        return "Please consult a specialist."
    if risk == "High Risk":
        return f"High probability of {cancer_type}. Immediate consultation recommended."
    elif risk == "Medium Risk":
        return f"Possible signs of {cancer_type}. Further tests recommended."
    else:
        return "Low risk detected. Regular monitoring advised."


# =========================
# Predict Logic
# =========================
def predict_image(image_path: str, scan_type: str | None = None) -> dict:
    if not models:
        raise HTTPException(
            status_code=503,
            detail="No AI models are loaded. Upgrade ultralytics: pip install -U ultralytics",
        )

    scan_key = (scan_type or "").strip().lower()
    model_name = SCAN_TYPE_TO_MODEL.get(scan_key)
    models_to_run = (
        {model_name: models[model_name]} if model_name and model_name in models else models
    )

    results_list = []

    for name, model in models_to_run.items():
        r = model.predict(source=image_path, conf=0.25, verbose=False)
        boxes = r[0].boxes
        if boxes is not None and len(boxes) > 0:
            conf = boxes.conf.max().item()
            results_list.append({"model": name, "confidence": float(conf)})

    if not results_list:
        return {
            "cancer_type": "uncertain",
            "confidence": 0.0,
            "risk_level": "Unknown",
            "recommendation": get_recommendation("uncertain", "Low Risk"),
            "top2": [],
        }

    results_list.sort(key=lambda x: x["confidence"], reverse=True)
    best = results_list[0]
    best_conf = best["confidence"]
    risk = get_risk_level(best_conf)

    if best_conf < 0.4:
        return {
            "cancer_type": "uncertain",
            "confidence": round(best_conf, 3),
            "risk_level": "Low Risk",
            "recommendation": get_recommendation("uncertain", "Low Risk"),
            "top2": results_list[:2],
        }

    return {
        "cancer_type": best["model"],
        "confidence": round(best_conf, 3),
        "risk_level": risk,
        "recommendation": get_recommendation(best["model"], risk),
        "top2": results_list[:2],
    }


# =========================
# Endpoint
# =========================
@app.post("/predict")
async def predict(file: UploadFile = File(...), scan_type: str | None = None):
    # validate image type
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg", "image/bmp"):
        raise HTTPException(status_code=400, detail="Only image files are accepted (jpg, png, bmp).")

    # save temp file
    ext = os.path.splitext(file.filename)[-1] or ".jpg"
    temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = predict_image(temp_path, scan_type=scan_type)
        return JSONResponse(content=result)

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/")
def health():
    return {
        "status": "ok",
        "message": "Cancer Detection API is running.",
        "loaded_models": sorted(models.keys()),
        "model_count": len(models),
    }
