from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT_ROOT.parent / "首屏图片"
OUTPUT_DIR = PROJECT_ROOT / "public" / "intro-cards"
TARGET_SIZE = (960, 1280)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for index in range(1, 6):
        source = SOURCE_DIR / f"{index}.jpg"
        output = OUTPUT_DIR / f"intro-card-{index:02d}.webp"
        with Image.open(source) as image:
            optimized = ImageOps.fit(
                image.convert("RGB"),
                TARGET_SIZE,
                method=Image.Resampling.LANCZOS,
                centering=(0.5, 0.5),
            )
            optimized.save(output, "WEBP", quality=86, method=6)
        print(f"{source.name} -> {output.name}")


if __name__ == "__main__":
    main()
