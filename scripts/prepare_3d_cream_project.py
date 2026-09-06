from pathlib import Path
import shutil

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "三维视觉"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work" / "3d-01"
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

IMAGES = (
    ("3MP4_0001.jpg", "cover.webp", (1920, 1080), (1600, 900)),
    ("白膜面霜.png", "process-white.webp", (960, 1280), None),
    ("渲染面霜.png", "render.webp", (960, 1280), None),
)

for source_name, output_name, expected_size, target_size in IMAGES:
    with Image.open(SOURCE_ROOT / source_name) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
        if target_size:
            image = image.resize(target_size, Image.Resampling.LANCZOS)
        image.save(OUTPUT_ROOT / output_name, "WEBP", quality=90, method=6)

shutil.copy2(SOURCE_ROOT / "面霜视频终.mp4", OUTPUT_ROOT / "video.mp4")
