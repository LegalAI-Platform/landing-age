"""
Connection map / preservation plan:
- Existing Armature modifier -> existing skinned mesh: preserve unchanged.
- Existing bone hierarchy -> vertex groups: preserve names and normalized weights.
- No new geometry or joints are created; Decimate runs before Armature so the
  animated topology remains connected and Blender interpolates vertex weights.
"""

import os
import sys

import bpy


def args_after_separator():
    if "--" not in sys.argv:
        raise SystemExit("Expected input and output GLB paths after --")
    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) != 2:
        raise SystemExit("Usage: blender --background --python script.py -- input.glb output.glb")
    return tuple(os.path.abspath(path) for path in args)


def world_bounds(obj):
    points = [obj.matrix_world @ vertex.co for vertex in obj.data.vertices]
    return {
        "x": (min(point.x for point in points), max(point.x for point in points)),
        "y": (min(point.y for point in points), max(point.y for point in points)),
        "z": (min(point.z for point in points), max(point.z for point in points)),
    }


source_path, output_path = args_after_separator()
if not os.path.isfile(source_path):
    raise SystemExit(f"Input model does not exist: {source_path}")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source_path)

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
if not meshes or len(armatures) != 1:
    raise RuntimeError(f"Expected at least one mesh and one armature, found {len(meshes)} and {len(armatures)}")

before_vertices = sum(len(mesh.data.vertices) for mesh in meshes)
before_polygons = sum(len(mesh.data.polygons) for mesh in meshes)
preservation_checks = []

for mesh in meshes:
    mesh_before_vertices = len(mesh.data.vertices)
    mesh_before_bounds = world_bounds(mesh)
    mesh_before_groups = {group.name for group in mesh.vertex_groups}

    bpy.ops.object.select_all(action="DESELECT")
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = mesh

    # Tiny accent meshes (the eye highlight here) gain almost no bytes from
    # decimation and visibly lose their silhouette, so preserve them intact.
    if mesh_before_vertices < 1000:
        preservation_checks.append(
            (
                mesh.name,
                mesh_before_vertices,
                len(mesh.data.vertices),
                mesh_before_bounds,
                world_bounds(mesh),
                mesh_before_groups,
                {group.name for group in mesh.vertex_groups},
            )
        )
        continue

    modifier = mesh.modifiers.new(name="WebHeroDecimate", type="DECIMATE")
    modifier.decimate_type = "COLLAPSE"
    modifier.ratio = 0.34
    modifier.use_collapse_triangulate = True
    while mesh.modifiers.find(modifier.name) > 0:
        bpy.ops.object.modifier_move_up(modifier=modifier.name)
    bpy.ops.object.modifier_apply(modifier=modifier.name)

    preservation_checks.append(
        (
            mesh.name,
            mesh_before_vertices,
            len(mesh.data.vertices),
            mesh_before_bounds,
            world_bounds(mesh),
            mesh_before_groups,
            {group.name for group in mesh.vertex_groups},
        )
    )

for image in bpy.data.images:
    if image.size[0] > 1024 or image.size[1] > 1024:
        image.scale(1024, 1024)

after_vertices = sum(len(mesh.data.vertices) for mesh in meshes)
after_polygons = sum(len(mesh.data.polygons) for mesh in meshes)

if after_vertices >= before_vertices:
    raise RuntimeError("Decimate did not reduce vertex count")
for name, old_count, new_count, before_bounds, after_bounds, before_groups, after_groups in preservation_checks:
    drift = {
        axis: abs(
            (after_bounds[axis][1] - after_bounds[axis][0])
            - (before_bounds[axis][1] - before_bounds[axis][0])
        )
        for axis in ("x", "y", "z")
    }
    print(f"MESH_CHECK={name}:{old_count}->{new_count}:drift={drift}")
    if old_count >= 1000 and new_count >= old_count:
        raise RuntimeError(f"Decimate did not reduce vertex count for {name}")
    if not before_groups.issubset(after_groups):
        raise RuntimeError(f"Decimate removed one or more rig vertex groups from {name}")
    for axis in ("x", "y", "z"):
        before_size = before_bounds[axis][1] - before_bounds[axis][0]
        after_size = after_bounds[axis][1] - after_bounds[axis][0]
        if abs(before_size - after_size) > max(0.01, before_size * 0.015):
            raise RuntimeError(f"Unexpected {axis}-axis bounds drift for {name}")

os.makedirs(os.path.dirname(output_path), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format="GLB",
    export_yup=True,
    export_animations=True,
)

print(f"INPUT_VERTICES={before_vertices}")
print(f"OUTPUT_VERTICES={after_vertices}")
print(f"INPUT_POLYGONS={before_polygons}")
print(f"OUTPUT_POLYGONS={after_polygons}")
print(f"MESHES={len(meshes)}")
print(f"VERTEX_GROUPS={sum(len(mesh.vertex_groups) for mesh in meshes)}")
print(f"OUTPUT_MB={os.path.getsize(output_path) / 1024 / 1024:.2f}")
