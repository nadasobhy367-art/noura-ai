#!/usr/bin/env python3
"""Download model weight files from a Hugging Face repo or HTTP URLs.

Usage examples:
  HF repo (recommended):
    export HF_REPO_ID=your-username/your-model-repo
    python3 scripts/download_models.py --files python-detection/models/brain_best.pt python-detection/models/breast_best.pt

  Direct URLs:
    python3 scripts/download_models.py --urls https://example.com/brain_best.pt https://example.com/breast_best.pt
"""
import argparse
import os
from pathlib import Path

def download_from_urls(urls, out_dir):
    import requests

    out_dir.mkdir(parents=True, exist_ok=True)
    for url in urls:
        local_name = out_dir / Path(url).name
        print(f"Downloading {url} -> {local_name}")
        r = requests.get(url, stream=True)
        r.raise_for_status()
        with open(local_name, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)

def download_from_hf(repo_id, files, out_dir):
    from huggingface_hub import hf_hub_download

    out_dir.mkdir(parents=True, exist_ok=True)
    for f in files:
        print(f"Fetching {f} from {repo_id}")
        local_path = hf_hub_download(repo_id=repo_id, filename=Path(f).name)
        dest = out_dir / Path(f).name
        os.replace(local_path, dest)
        print(f"Saved to {dest}")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--urls", nargs="*", help="Direct HTTP URLs to download")
    p.add_argument("--files", nargs="*", help="Filenames to fetch from HF repo (keeps original name)")
    p.add_argument("--hf-repo", dest="hf_repo", help="Hugging Face repo id (user/repo)")
    p.add_argument("--out", default="python-detection/models", help="Output directory")
    args = p.parse_args()

    out_dir = Path(args.out)

    if args.urls:
        download_from_urls(args.urls, out_dir)
        return

    if args.hf_repo and args.files:
        download_from_hf(args.hf_repo, args.files, out_dir)
        return

    print("Nothing to do. Provide --urls or --hf-repo with --files.")

if __name__ == "__main__":
    main()
