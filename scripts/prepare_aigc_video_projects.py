from pathlib import Path
import shutil

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "AIGC视频广告"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work"

PROJECTS = (
    ("aigc-video-01", "精华液广告 (1)-封面.jpg", "精华液广告.mp4"),
    ("aigc-video-02", "投影仪-封面.jpg", "投影仪广告.mp4"),
)

for project_id, cover_name, video_name in PROJECTS:
    output_dir = OUTPUT_ROOT / project_id
    output_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(SOURCE_ROOT / cover_name) as image:
        image = image.convert("RGB")
        if image.size != (2560, 1440):
            raise ValueError(f"{cover_name}: expected (2560, 1440), got {image.size}")
        image = image.resize((1600, 900), Image.Resampling.LANCZOS)
        image.save(output_dir / "cover.webp", "WEBP", quality=90, method=6)

    shutil.copy2(SOURCE_ROOT / video_name, output_dir / "video.mp4")
