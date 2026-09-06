from collections import deque
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageFilter


def remove_light_checker_background(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGB")
    rgb = np.asarray(image, dtype=np.uint8)
    height, width = rgb.shape[:2]

    minimum = rgb.min(axis=2)
    chroma = rgb.max(axis=2) - minimum
    removable = (minimum >= 224) & (chroma <= 18)
    background = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if removable[y, x] and not background[y, x]:
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
        if y and removable[y - 1, x] and not background[y - 1, x]:
            background[y - 1, x] = True
            queue.append((y - 1, x))
        if y + 1 < height and removable[y + 1, x] and not background[y + 1, x]:
            background[y + 1, x] = True
            queue.append((y + 1, x))
        if x and removable[y, x - 1] and not background[y, x - 1]:
            background[y, x - 1] = True
            queue.append((y, x - 1))
        if x + 1 < width and removable[y, x + 1] and not background[y, x + 1]:
            background[y, x + 1] = True
            queue.append((y, x + 1))

    foreground = ~background
    hard_alpha = Image.fromarray((foreground * 255).astype(np.uint8), mode="L")
    softened = np.asarray(hard_alpha.filter(ImageFilter.GaussianBlur(1.0)), dtype=np.uint8)
    alpha = np.where(background, 0, softened).astype(np.uint8)

    output_rgb = rgb.astype(np.float32)
    edge = (alpha > 0) & (alpha < 252)
    edge_alpha = np.maximum(alpha[edge].astype(np.float32) / 255.0, 0.08)
    output_rgb[edge] = np.clip(
        (output_rgb[edge] - (1.0 - edge_alpha[:, None]) * 250.0)
        / edge_alpha[:, None],
        0,
        255,
    )

    rgba = np.dstack((output_rgb.astype(np.uint8), alpha))
    destination.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode="RGBA").save(destination, optimize=True)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: remove_light_checker_background.py SOURCE DESTINATION")
    remove_light_checker_background(Path(sys.argv[1]), Path(sys.argv[2]))
