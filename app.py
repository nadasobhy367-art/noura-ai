import os
from pathlib import Path

import gradio as gr

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "python-detection" / "models"
MODEL_FILES = {
    "brain": "brain_best.pt",
    "breast": "breast_best.pt",
    "lung": "lung_best.pt",
    "skin": "skin_best.pt",
}
MODEL_PATHS = {name: MODELS_DIR / filename for name, filename in MODEL_FILES.items()}


def download_models():
    auto_download = os.getenv("AUTO_DOWNLOAD_MODELS", "true").lower() not in ["0", "false", "no"]
    if not auto_download:
        return False

    hf_repo_id = os.getenv("HF_REPO_ID", "").strip()
    model_urls = os.getenv("MODEL_FILE_URLS", "").strip()
    if not hf_repo_id and not model_urls:
        return False

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    if hf_repo_id:
        try:
            from huggingface_hub import hf_hub_download
        except Exception:
            return False

        for name, path in MODEL_PATHS.items():
            if path.exists():
                continue
            print(f"Downloading {name} from HF repo {hf_repo_id}")
            local_path = hf_hub_download(repo_id=hf_repo_id, filename=path.name)
            os.replace(local_path, path)

        return True

    if model_urls:
        try:
            import requests
        except Exception:
            return False

        for url in [url.strip() for url in model_urls.split(",") if url.strip()]:
            filename = Path(url).name
            path = MODELS_DIR / filename
            if path.exists():
                continue
            print(f"Downloading {url} -> {path}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            with open(path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

        return True

    return False


def load_models():
    try:
        import torch
        from ultralytics import YOLO
    except Exception:
        return {}

    models = {}
    for name, path in MODEL_PATHS.items():
        if not path.exists():
            continue
        try:
            models[name] = YOLO(str(path))
            print(f"Loaded model: {name}")
        except Exception as exc:
            print(f"Failed to load {name}: {exc}")

    return models


download_models()
models = load_models()


with gr.Blocks(title="Noura AI Multi-Cancer Detection") as demo:
    gr.Markdown(
        "# Noura AI Multi-Cancer Detection\n"
        "A lightweight demo interface for showcasing the Noura AI workflow on Hugging Face Spaces."
    )

    with gr.Row():
        image_input = gr.Image(type="numpy", label="Medical Image")
        cancer_type = gr.Dropdown(
            choices=["brain", "breast", "lung", "skin"],
            value="breast",
            label="Cancer Type",
        )

    submit_btn = gr.Button("Run Detection")
    output_image = gr.Image(label="Prediction Output")
    output_text = gr.Textbox(label="Result", lines=8)


    def run_prediction(image, cancer_type):
        if image is None:
            return None, "Please upload an image first."

        if cancer_type not in models:
            return None, (
                f"Demo mode active for {cancer_type}.\n"
                "Model weights are not yet available or could not be loaded.\n"
                "Set HF_REPO_ID or MODEL_FILE_URLS in Space settings, then restart the Space."
            )

        try:
            result = models[cancer_type](image, conf=0.25, stream=False, verbose=False)[0]
            boxes = result.boxes
            output_img = result.plot()

            if boxes is None or len(boxes) == 0:
                message = "No suspicious region detected in this image."
            else:
                conf = float(boxes.conf.max().item()) if len(boxes.conf) > 0 else 0.0
                if conf >= 0.7:
                    risk = "High Risk"
                elif conf >= 0.4:
                    risk = "Medium Risk"
                else:
                    risk = "Low Risk"
                message = (
                    f"Detected cancer type: {cancer_type}\n"
                    f"Confidence: {conf:.3f}\n"
                    f"Risk level: {risk}\n"
                    "Please consult a specialist for confirmation."
                )

            return output_img, message
        except Exception as exc:
            return None, f"Prediction failed: {exc}"

    submit_btn.click(run_prediction, inputs=[image_input, cancer_type], outputs=[output_image, output_text])


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", "7860")))
