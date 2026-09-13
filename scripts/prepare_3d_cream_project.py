import argparse
from pathlib import Path
import shutil

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "作品" / "4三维视觉"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work" / "3d-01"
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

IMAGES = (
    ("3MP4_0001.jpg", "cover.webp", (1920, 1080), (1600, 900), 90),
    ("白膜面霜.png", "process-white.webp", (960, 1280), None, 90),
    ("渲染面霜.png", "render.webp", (1086, 1448), (960, 1280), 92),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare 3D cream project media")
    parser.add_argument("--render-only", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    images = tuple(item for item in IMAGES if item[1] == "render.webp") if args.render_only else IMAGES
    for source_name, output_name, expected_size, target_size, quality in images:
        with Image.open(SOURCE_ROOT / source_name) as image:
            image = image.convert("RGB")
            if image.size != expected_size:
                raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
            if target_size:
                image = image.resize(target_size, Image.Resampling.LANCZOS)
            image.save(OUTPUT_ROOT / output_name, "WEBP", quality=quality, method=6)
    if not args.render_only:
        shutil.copy2(SOURCE_ROOT / "面霜视频终.mp4", OUTPUT_ROOT / "video.mp4")


if __name__ == "__main__":
    main()
