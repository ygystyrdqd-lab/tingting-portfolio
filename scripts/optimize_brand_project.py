from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "品牌视觉设计"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work" / "brand-01"

ASSETS = (
    ("项目卡片封面1.jpg", "cover.webp", (1600, 1000)),
    ("作品详情图1.jpg", "detail-01.webp", (1088, 9425)),
)

OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

for source_name, output_name, expected_size in ASSETS:
    source_path = SOURCE_ROOT / source_name
    output_path = OUTPUT_ROOT / output_name
    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(
                f"{source_name}: expected {expected_size}, got {image.size}"
            )
        image.save(output_path, "WEBP", quality=88, method=6)
