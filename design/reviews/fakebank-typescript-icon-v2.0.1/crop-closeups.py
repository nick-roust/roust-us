from pathlib import Path
import json
import math
from PIL import Image

review = Path(__file__).resolve().parent
for phase in ["before", "after"]:
    for item in json.loads((review / (phase + ".json")).read_text()):
        if item["width"] not in [390, 1440]:
            continue
        row, icon = item["state"]["row"], item["state"]["icon"]
        with Image.open(review / f"{phase}-row-{item['width']}-{item['theme']}.png") as image:
            scale = image.width / (row["width"] + 12)
            x = (icon["x"] - row["x"] + 6) * scale
            y = (icon["y"] - row["y"] + 8) * scale
            box = (math.floor(x - 3 * scale), math.floor(y - 3 * scale),
                   math.ceil(x + (icon["width"] + 3) * scale),
                   math.ceil(y + (icon["height"] + 3) * scale))
            image.crop(box).save(review / f"{phase}-typescript-{item['width']}-{item['theme']}.png")
