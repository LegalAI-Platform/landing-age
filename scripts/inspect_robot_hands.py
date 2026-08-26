"""Inspect disconnected hand components in the legal robot GLB."""

# Connection map (inspection phase, no geometry is created):
#   Forearm.L -> Hand.L -> future left finger roots
#   Forearm.R -> Hand.R -> future right finger roots
# Finger joints will overlap their adjacent mesh segments at their measured bounds.

import json
import sys
from pathlib import Path

import bpy


def import_model(path: Path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    return bpy.data.objects["LegalRobot_Meshy"]


def component_report(obj, group_name: str):
    mesh = obj.data
    group_index = obj.vertex_groups[group_name].index
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

    weights = {}
    for vertex in mesh.vertices:
        weights[vertex.index] = next(
            (membership.weight for membership in vertex.groups if membership.group == group_index),
            0.0,
        )

    components = {}
    for vertex in mesh.vertices:
        components.setdefault(find(vertex.index), []).append(vertex.index)

    matrix = obj.matrix_world
    report = []
    for indices in components.values():
        hand_weights = [weights[index] for index in indices]
        if max(hand_weights, default=0.0) < 0.1:
            continue
        points = [matrix @ mesh.vertices[index].co for index in indices]
        bounds = {
            axis: [round(min(getattr(point, axis) for point in points), 5), round(max(getattr(point, axis) for point in points), 5)]
            for axis in "xyz"
        }
        report.append(
            {
                "vertices": len(indices),
                "weighted_vertices": sum(weight > 0.1 for weight in hand_weights),
                "max_weight": round(max(hand_weights), 4),
                "bounds": bounds,
                "center": [round(sum(getattr(point, axis) for point in points) / len(points), 5) for axis in "xyz"],
            }
        )

    report.sort(key=lambda item: (-item["max_weight"], -item["weighted_vertices"], -item["vertices"]))
    return report


def main():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if not args:
        raise SystemExit("Pass the GLB path after --")
    model = import_model(Path(args[0]).resolve())
    result = {side: component_report(model, f"Hand.{side}") for side in ("L", "R")}
    print("HAND_COMPONENT_REPORT=" + json.dumps(result, separators=(",", ":")))


if __name__ == "__main__":
    main()
