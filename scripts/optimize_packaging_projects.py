from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "包装与物料"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work"

ASSETS = (
    ("packaging-01", "项目图封面1.jpg", "cover.webp", (1600, 1000), None),
    ("packaging-01", "面膜包装.jpg", "detail-01.webp", (1086, 5240), None),
    ("packaging-02", "项目图封面2.jpg", "cover.webp", (1600, 1000), None),
    ("packaging-02", "企业画册排版.jpg", "detail-01.webp", (4200, 12600), 1800),
)

for project_id, source_name, output_name, expected_size, target_width in ASSETS:
    source_path = SOURCE_ROOT / source_name
    output_dir = OUTPUT_ROOT / project_id
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / output_name

    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
        if target_width:
            target_height = round(image.height * target_width / image.width)
            image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
        image.save(output_path, "WEBP", quality=90, method=6)
