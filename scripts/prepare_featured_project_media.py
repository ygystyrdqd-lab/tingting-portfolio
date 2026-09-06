from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "项目"
PUBLIC_ROOT = PROJECT_ROOT / "public" / "work"

IMAGES = (
    ("IP封面.jpg", "ip-visual-01/cover.webp", (2400, 1200), (1600, 800)),
    ("花小灵IP设计.jpg", "ip-visual-01/detail-01.webp", (1920, 2987), None),
    ("电商封面.jpg", "campaign-visual-01/cover.webp", (2400, 1200), (1600, 800)),
    ("投影仪首图1.png", "campaign-visual-01/detail-01.webp", (1254, 1254), None),
    ("投影仪首图2.png", "campaign-visual-01/detail-02.webp", (1254, 1254), None),
    ("投影仪电商网站.png", "campaign-visual-01/detail-03.webp", (1920, 6000), None),
    ("AIGC工作流封面.jpg", "aigc-workflow-01/cover.webp", (2400, 1200), (1600, 800)),
    ("合成1.png", "aigc-workflow-01/detail-01.webp", (2000, 2000), None),
)

for source_name, public_name, expected_size, target_size in IMAGES:
    output_path = PUBLIC_ROOT / public_name
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE_ROOT / source_name) as image:
        if image.size != expected_size:
            raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
        image = image.convert("RGB")
        if target_size:
            image = image.resize(target_size, Image.Resampling.LANCZOS)
        image.save(output_path, "WEBP", quality=90, method=6)
