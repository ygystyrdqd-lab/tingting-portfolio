from collections import deque
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageFilter


def remove_black_background(source: Path, destination: Path, threshold: int = 22) -> None:
    image = Image.open(source).convert("RGB")
    rgb = np.asarray(image, dtype=np.uint8)
    height, width = rgb.shape[:2]
    dark = rgb.max(axis=2) <= threshold
    background = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if dark[y, x] and not background[y, x]:
            background[y, x] = True
            queue.append((y, x))

    for x in range(width):
        seed(0, x)
        seed(height - 1, x)
    for y in range(height):
        seed(y, 0)
        seed(y, width - 1)

    while queue:
        y, x = queue.popleft()
        if y and dark[y - 1, x] and not background[y - 1, x]:
            background[y - 1, x] = True
            queue.append((y - 1, x))
        if y + 1 < height and dark[y + 1, x] and not background[y + 1, x]:
            background[y + 1, x] = True
            queue.append((y + 1, x))
        if x and dark[y, x - 1] and not background[y, x - 1]:
            background[y, x - 1] = True
            queue.append((y, x - 1))
        if x + 1 < width and dark[y, x + 1] and not background[y, x + 1]:
            background[y, x + 1] = True
            queue.append((y, x + 1))

    foreground = ~background
    hard_alpha = Image.fromarray((foreground * 255).astype(np.uint8), mode="L")
    softened = np.asarray(hard_alpha.filter(ImageFilter.GaussianBlur(1.15)), dtype=np.uint8)
    alpha = np.where(foreground, softened, 0).astype(np.uint8)

    output_rgb = rgb.astype(np.float32)
    edge = (alpha > 0) & (alpha < 252)
    scale = np.ones_like(alpha, dtype=np.float32)
    scale[edge] = np.minimum(255.0 / alpha[edge], 2.15)
    output_rgb = np.clip(output_rgb * scale[..., None], 0, 255).astype(np.uint8)

    rgba = np.dstack((output_rgb, alpha))
    destination.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode="RGBA").save(destination, optimize=True)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: remove_black_background.py SOURCE DESTINATION")
    remove_black_background(Path(sys.argv[1]), Path(sys.argv[2]))
