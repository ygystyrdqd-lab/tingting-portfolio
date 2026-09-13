import argparse
from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT_ROOT.parent / "首屏图片"
OUTPUT_DIR = PROJECT_ROOT / "public" / "intro-cards"
TARGET_SIZE = (960, 1280)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Optimize intro fan-card images")
    parser.add_argument("--index", type=int, choices=range(1, 6))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    indices = (args.index,) if args.index else range(1, 6)
    for index in indices:
        source = SOURCE_DIR / f"{index}.jpg"
        output = OUTPUT_DIR / f"intro-card-{index:02d}.webp"
        with Image.open(source) as image:
            optimized = ImageOps.fit(
                image.convert("RGB"),
                TARGET_SIZE,
                method=Image.Resampling.LANCZOS,
                centering=(0.5, 0.5),
            )
            optimized.save(output, "WEBP", quality=90, method=6)
        print(f"{source.name} -> {output.name}")


if __name__ == "__main__":
    main()
