import bpy
import numpy as np


SOURCE_PATH = r"C:\Users\10\.codex\generated_images\01a03f54-4884-7162-9249-b1edd7285e73\exec-32d9eaf2-eef0-471c-ba75-1fdc63e2475c.png"
OUTPUT_PATH = r"C:\Users\10\OneDrive - MTI (Faculty Of Computers & Artificial Intelligent)\Desktop\Legal landing page\public\ambient-gold-edge-light.png"


source = bpy.data.images.load(SOURCE_PATH, check_existing=False)
width, height = source.size
pixels = np.asarray(source.pixels[:], dtype=np.float32).reshape(height, width, 4)
rgb = pixels[:, :, :3]

# Convert the black backing plate into true transparency while preserving
# the original gold fire colors and their soft edge falloff.
alpha = np.max(rgb, axis=2)
transparent = alpha <= 0.004
safe_alpha = np.maximum(alpha, 0.004)
color = np.clip(rgb / safe_alpha[:, :, None], 0.0, 1.0)
color[transparent] = 0.0
alpha[transparent] = 0.0
rgba = np.dstack((color, alpha)).astype(np.float32)

result = bpy.data.images.new(
    "ambient-gold-fire-edges",
    width=width,
    height=height,
    alpha=True,
    float_buffer=False,
)
result.colorspace_settings.name = "sRGB"
result.pixels.foreach_set(rgba.ravel())
result.filepath_raw = OUTPUT_PATH
result.file_format = "PNG"
result.save()
