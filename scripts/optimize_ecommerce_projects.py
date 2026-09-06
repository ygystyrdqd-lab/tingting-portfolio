from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "电商与活动视觉"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work"

ASSETS = (
    ("ecommerce-01", "项目卡片封面1.jpg", "cover.webp", (1600, 1000)),
    ("ecommerce-01", "二级详情页.jpg", "detail-01.webp", (850, 8037)),
    ("ecommerce-02", "项目卡片封面2.jpg", "cover.webp", (1600, 1000)),
    ("ecommerce-02", "精华液详情页.png", "detail-01.webp", (750, 10878)),
    ("ecommerce-03", "项目卡片封面3.jpg", "cover.webp", (1586, 992)),
    ("ecommerce-03", "投影仪详情页.png", "detail-01.webp", (750, 10728)),
)

for project_id, source_name, output_name, expected_size in ASSETS:
    source_path = SOURCE_ROOT / source_name
    output_dir = OUTPUT_ROOT / project_id
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / output_name

    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(
                f"{source_name}: expected {expected_size}, got {image.size}"
            )
        image.save(output_path, "WEBP", quality=90, method=6)
