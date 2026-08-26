"""Render close-up reference views of the legal robot hands."""

# Connection map (reference render only, no geometry is created):
#   Forearm.L -> Hand.L -> left finger mesh segments
#   Forearm.R -> Hand.R -> right finger mesh segments

import sys
from pathlib import Path

import bpy
from mathutils import Vector


FINGER_NAMES = ("Index", "Middle", "Ring", "Pinky")


def look_at(camera, target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def setup_scene(model_path: Path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(model_path))

    world = bpy.data.worlds.new("HandReferenceWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.035, 0.025, 0.02, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.42
    bpy.context.scene.world = world

    for name, location, energy, size in (
        ("Key", (-1.8, -2.3, 3.6), 900, 2.0),
        ("Fill", (1.8, -1.5, 2.4), 650, 1.6),
        ("Rim", (0.0, 1.2, 2.8), 800, 1.4),
    ):
        light_data = bpy.data.lights.new(name, "AREA")
        light_data.energy = energy
        light_data.shape = "DISK"
        light_data.size = size
        light = bpy.data.objects.new(name, light_data)
        light.location = location
        bpy.context.collection.objects.link(light)
        look_at(light, (0, -0.18, 1.47))

    camera_data = bpy.data.cameras.new("HandReferenceCamera")
    camera_data.lens = 72
    camera = bpy.data.objects.new("HandReferenceCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 900
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    return camera


def pose_fingers():
    armature = bpy.data.objects.get("LegalRobotRig")
    if not armature:
        raise RuntimeError("LegalRobotRig was not found")
    for side, direction in (("L", 1.0), ("R", -1.0)):
        for digit in FINGER_NAMES:
            for segment, angle in ((1, 0.07), (2, 0.11)):
                bone = armature.pose.bones.get(f"{digit}.{segment:02d}.{side}")
                if bone:
                    bone.rotation_mode = "XYZ"
                    bone.rotation_euler.z = direction * angle
        for segment, angle in ((1, 0.05), (2, 0.08)):
            bone = armature.pose.bones.get(f"Thumb.{segment:02d}.{side}")
            if bone:
                bone.rotation_mode = "XYZ"
                bone.rotation_euler.z = direction * angle


def render_view(camera, output_dir: Path, name: str, location, target):
    camera.location = location
    look_at(camera, target)
    bpy.context.scene.render.filepath = str(output_dir / f"{name}.png")
    bpy.ops.render.render(write_still=True)


def main():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) not in (2, 3):
        raise SystemExit("Pass MODEL_PATH OUTPUT_DIR [pose] after --")
    model_path = Path(args[0]).resolve()
    output_dir = Path(args[1]).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    camera = setup_scene(model_path)
    if len(args) == 3 and args[2] == "pose":
        pose_fingers()

    views = (
        ("left-front", (-0.68, -1.15, 1.48), (-0.68, -0.18, 1.48)),
        ("left-side", (-1.62, -0.18, 1.48), (-0.68, -0.18, 1.48)),
        ("right-front", (0.68, -1.15, 1.48), (0.68, -0.18, 1.48)),
        ("right-side", (1.62, -0.18, 1.48), (0.68, -0.18, 1.48)),
    )
    for name, location, target in views:
        render_view(camera, output_dir, name, location, target)
        print(f"RENDERED={output_dir / (name + '.png')}")


if __name__ == "__main__":
    main()
