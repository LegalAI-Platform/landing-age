"""Add deformable finger chains to the legal robot and export a new GLB."""

# Connection map:
#   Forearm.L -> Hand.L -> {Index, Middle, Ring, Pinky}.01.L -> .02.L
#   Forearm.L -> Hand.L -> Thumb.01.L -> Thumb.02.L
#   Forearm.R -> Hand.R -> {Index, Middle, Ring, Pinky}.01.R -> .02.R
#   Forearm.R -> Hand.R -> Thumb.01.R -> Thumb.02.R
# Each child bone starts exactly at its parent tail. Finger roots begin inside the
# palm by at least 0.01m so the skinned pieces remain visually connected.

import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector


FINGER_NAMES = ("Index", "Middle", "Ring", "Pinky")
FINGER_Z = (1.535, 1.445, 1.275)
THUMB_Z = (1.545, 1.455, 1.37)


def import_model(path: Path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    return bpy.data.objects["LegalRobotRig"], bpy.data.objects["LegalRobot_Meshy"]


def add_chain(armature, side: str, digit: str, points):
    parent = armature.data.edit_bones[f"Hand.{side}"]
    for index, (head, tail) in enumerate(zip(points, points[1:]), start=1):
        bone = armature.data.edit_bones.new(f"{digit}.{index:02d}.{side}")
        bone.head = head
        bone.tail = tail
        bone.parent = parent
        bone.use_connect = index > 1
        bone.use_deform = True
        bone.align_roll(Vector((0.0, 1.0, 0.0)))
        parent = bone


def add_finger_bones(armature, lane_centers):
    bpy.context.view_layer.objects.active = armature
    armature.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    for side in ("L", "R"):
        sign = -1.0 if side == "L" else 1.0
        for digit, lane_y in zip(FINGER_NAMES, lane_centers[side]):
            points = [Vector((sign * 0.71, lane_y, z)) for z in FINGER_Z]
            add_chain(armature, side, digit, points)
        thumb_points = (
            Vector((sign * 0.665, -0.205, THUMB_Z[0])),
            Vector((sign * 0.625, -0.245, THUMB_Z[1])),
            Vector((sign * 0.61, -0.275, THUMB_Z[2])),
        )
        add_chain(armature, side, "Thumb", thumb_points)
    bpy.ops.object.mode_set(mode="OBJECT")
    armature.select_set(False)


def original_weights(mesh_obj, group_name: str):
    group_index = mesh_obj.vertex_groups[group_name].index
    return {
        vertex.index: next(
            (membership.weight for membership in vertex.groups if membership.group == group_index),
            0.0,
        )
        for vertex in mesh_obj.data.vertices
    }


def kmeans(values, count=4, iterations=24):
    low, high = min(values), max(values)
    centers = [low + (high - low) * (index + 0.5) / count for index in range(count)]
    for _ in range(iterations):
        clusters = [[] for _ in centers]
        for value in values:
            nearest = min(range(len(centers)), key=lambda index: abs(value - centers[index]))
            clusters[nearest].append(value)
        updated = [sum(cluster) / len(cluster) if cluster else centers[index] for index, cluster in enumerate(clusters)]
        if max(abs(a - b) for a, b in zip(updated, centers)) < 1e-7:
            break
        centers = updated
    return sorted(centers)


def measure_lanes(mesh_obj):
    lanes = {}
    for side in ("L", "R"):
        sign = -1.0 if side == "L" else 1.0
        weights = original_weights(mesh_obj, f"Hand.{side}")
        values = [
            vertex.co.y
            for vertex in mesh_obj.data.vertices
            if weights[vertex.index] >= 0.5
            and sign * vertex.co.x >= 0.67
            and 1.275 <= vertex.co.z <= 1.51
            and -0.315 <= vertex.co.y <= -0.08
        ]
        if len(values) < 100:
            raise RuntimeError(f"Not enough long-finger vertices for side {side}: {len(values)}")
        lanes[side] = kmeans(values)
    return lanes


def connected_components(mesh):
    parent = list(range(len(mesh.vertices)))
    rank = [0] * len(mesh.vertices)

    def find(index):
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(a, b):
        root_a, root_b = find(a), find(b)
        if root_a == root_b:
            return
        if rank[root_a] < rank[root_b]:
            root_a, root_b = root_b, root_a
        parent[root_b] = root_a
        if rank[root_a] == rank[root_b]:
            rank[root_a] += 1

    for edge in mesh.edges:
        union(edge.vertices[0], edge.vertices[1])

    components = {}
    for vertex in mesh.vertices:
        components.setdefault(find(vertex.index), []).append(vertex.index)
    return list(components.values())


def assign_finger_weights(mesh_obj, lane_centers):
    assignment_counts = {}
    components = connected_components(mesh_obj.data)
    deform_groups = {
        bone.name
        for bone in mesh_obj.parent.data.bones
        if bone.use_deform
    }
    for side in ("L", "R"):
        sign = -1.0 if side == "L" else 1.0
        hand_name = f"Hand.{side}"
        weights = original_weights(mesh_obj, hand_name)
        component_assignments = {}

        def queue(group_name, vertex_indices):
            component_assignments.setdefault(group_name, []).append(vertex_indices)

        for indices in components:
            if max((weights[index] for index in indices), default=0.0) < 0.1:
                continue
            points = [mesh_obj.data.vertices[index].co for index in indices]
            x = sum(point.x for point in points) / len(points)
            y = sum(point.y for point in points) / len(points)
            z = sum(point.z for point in points) / len(points)
            z_min = min(point.z for point in points)
            z_max = max(point.z for point in points)
            outward_x = sign * x

            if outward_x >= 0.67 and 1.25 <= z_min and z_max <= 1.60 and -0.32 <= y <= -0.075:
                lane_index = min(range(4), key=lambda index: abs(y - lane_centers[side][index]))
                segment = 1 if z >= 1.43 else 2
                queue(f"{FINGER_NAMES[lane_index]}.{segment:02d}.{side}", indices)
            elif 0.58 <= outward_x < 0.67 and 1.33 <= z_min and z_max <= 1.59 and -0.32 <= y <= -0.075:
                segment = 1 if z >= THUMB_Z[1] else 2
                queue(f"Thumb.{segment:02d}.{side}", indices)

        assignments = {
            group_name: [
                vertex_index
                for component in sorted(group_components, key=len, reverse=True)[:2]
                for vertex_index in component
            ]
            for group_name, group_components in component_assignments.items()
        }

        reassigned = sorted({index for indices in assignments.values() for index in indices})
        for deform_name in deform_groups:
            group = mesh_obj.vertex_groups.get(deform_name)
            if group and reassigned:
                group.remove(reassigned)
        for group_name, indices in assignments.items():
            group = mesh_obj.vertex_groups.get(group_name) or mesh_obj.vertex_groups.new(name=group_name)
            group.add(indices, 1.0, "REPLACE")
            assignment_counts[group_name] = len(indices)

    expected = {
        f"{digit}.{segment:02d}.{side}"
        for side in ("L", "R")
        for digit in (*FINGER_NAMES, "Thumb")
        for segment in (1, 2)
    }
    missing = sorted(expected - assignment_counts.keys())
    if missing:
        raise RuntimeError(f"Finger groups without vertices: {missing}")
    return assignment_counts


def export_model(output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_animations=False,
        export_skins=True,
        export_all_influences=True,
    )


def main():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) != 2:
        raise SystemExit("Pass INPUT_GLB OUTPUT_GLB after --")
    input_path, output_path = map(lambda value: Path(value).resolve(), args)
    armature, mesh_obj = import_model(input_path)
    lane_centers = measure_lanes(mesh_obj)
    add_finger_bones(armature, lane_centers)
    counts = assign_finger_weights(mesh_obj, lane_centers)
    export_model(output_path)
    print("FINGER_LANES=" + json.dumps(lane_centers, separators=(",", ":")))
    print("FINGER_WEIGHT_COUNTS=" + json.dumps(counts, separators=(",", ":")))
    print(f"RIGGED_MODEL={output_path}")


if __name__ == "__main__":
    main()
