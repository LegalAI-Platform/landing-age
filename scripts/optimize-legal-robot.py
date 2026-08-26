import io
import json
import os
import struct
import sys

from PIL import Image
import numpy as np


JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942


def script_args():
    args = sys.argv[1:]
    if "--" in args:
        args = args[args.index("--") + 1 :]
    if len(args) != 2:
        raise SystemExit("Usage: python optimize-legal-robot.py source.glb output.glb")
    return tuple(os.path.abspath(path) for path in args)


def read_glb(path):
    data = open(path, "rb").read()
    magic, version, declared_length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF" or version != 2 or declared_length != len(data):
        raise ValueError("Invalid GLB 2.0 file")

    offset = 12
    document = None
    binary = None
    while offset < len(data):
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        payload = data[offset + 8 : offset + 8 + chunk_length]
        if chunk_type == JSON_CHUNK:
            document = json.loads(payload.rstrip(b" \x00").decode("utf-8"))
        elif chunk_type == BIN_CHUNK:
            binary = payload
        offset += 8 + chunk_length

    if document is None or binary is None:
        raise ValueError("GLB must contain JSON and BIN chunks")
    return document, binary


def resize_png(payload, name):
    with Image.open(io.BytesIO(payload)) as source:
        if source.width <= 2048 and source.height <= 2048:
            return payload
        resized = source.resize((2048, 2048), Image.Resampling.LANCZOS)
        texture_name = name.lower()
        if not any(token in texture_name for token in ("normal", "roughness", "metallic")):
            target_mode = "RGBA" if "A" in resized.getbands() else "RGB"
            pixels = np.asarray(resized.convert(target_mode)).copy()
            rgb = pixels[..., :3].astype(np.float32)
            red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
            luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
            warm_fabric = (
                (red > green * 1.035)
                & (green > blue * 1.035)
                & (luminance > 24)
                & (luminance < 190)
            )
            graded = rgb * np.array([0.68, 0.55, 0.47], dtype=np.float32)
            pixels[..., :3] = np.where(warm_fabric[..., None], graded, rgb).clip(0, 255).astype(np.uint8)
            resized = Image.fromarray(pixels, target_mode)
        output = io.BytesIO()
        options = {"format": "PNG", "optimize": True, "compress_level": 9}
        if source.info.get("icc_profile"):
            options["icc_profile"] = source.info["icc_profile"]
        resized.save(output, **options)
        return output.getvalue()


def align4(buffer):
    padding = (-len(buffer)) % 4
    if padding:
        buffer.extend(b"\x00" * padding)


def write_glb(path, document, binary):
    json_payload = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_payload += b" " * ((-len(json_payload)) % 4)

    binary = bytearray(binary)
    align4(binary)
    total_length = 12 + 8 + len(json_payload) + 8 + len(binary)
    with open(path, "wb") as handle:
        handle.write(struct.pack("<4sII", b"glTF", 2, total_length))
        handle.write(struct.pack("<II", len(json_payload), JSON_CHUNK))
        handle.write(json_payload)
        handle.write(struct.pack("<II", len(binary), BIN_CHUNK))
        handle.write(binary)


source_path, output_path = script_args()
document, original_binary = read_glb(source_path)
replacements = {}

for image in document.get("images", []):
    view_index = image["bufferView"]
    view = document["bufferViews"][view_index]
    start = view.get("byteOffset", 0)
    payload = original_binary[start : start + view["byteLength"]]
    replacements[view_index] = resize_png(payload, image.get("name", ""))

new_binary = bytearray()
ordered_views = sorted(enumerate(document["bufferViews"]), key=lambda item: item[1].get("byteOffset", 0))
for view_index, view in ordered_views:
    align4(new_binary)
    start = view.get("byteOffset", 0)
    payload = replacements.get(view_index, original_binary[start : start + view["byteLength"]])
    view["byteOffset"] = len(new_binary)
    view["byteLength"] = len(payload)
    new_binary.extend(payload)

document["buffers"][0]["byteLength"] = len(new_binary)
os.makedirs(os.path.dirname(output_path), exist_ok=True)
write_glb(output_path, document, new_binary)

print(f"OPTIMIZED_ROBOT={output_path}")
print(f"SIZE_MB={os.path.getsize(output_path) / 1024 / 1024:.2f}")
