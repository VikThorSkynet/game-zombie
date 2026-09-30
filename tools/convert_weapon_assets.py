"""Run with Blender 4.5+:
blender --background --factory-startup --python tools/convert_weapon_assets.py -- \
  --beretta-dir "path/to/Pistol Beretta" --thompson-dir "path/to/Thompson II"

Exports static, self-contained GLBs; original downloads are never modified.
"""
import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


def pbr_material(name, color_image=None, normal_image=None, metallic=0.0,
                 roughness=0.5, metallic_image=None, roughness_image=None):
    material = bpy.data.materials.new(name + '_game')
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    shader = nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (0.045, 0.045, 0.045, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    for image, socket, colorspace in [
        (color_image, 'Base Color', 'sRGB'),
        (metallic_image, 'Metallic', 'Non-Color'),
        (roughness_image, 'Roughness', 'Non-Color'),
        (normal_image, 'Normal', 'Non-Color'),
    ]:
        if image is None:
            continue
        image.colorspace_settings.name = colorspace
        if max(image.size) > 1024:
            ratio = 1024 / max(image.size)
            image.scale(max(1, round(image.size[0] * ratio)),
                        max(1, round(image.size[1] * ratio)))
        texture = nodes.new('ShaderNodeTexImage')
        texture.image = image
        output = texture.outputs['Color']
        if socket == 'Normal':
            normal = nodes.new('ShaderNodeNormalMap')
            normal.inputs['Strength'].default_value = 0.65
            links.new(output, normal.inputs['Color'])
            output = normal.outputs['Normal']
        links.new(output, shader.inputs[socket])
    return material


def export_model(output, length, flip=False, muzzle=None, muzzle_mesh=None):
    objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    # Bake transforms/modifiers, cap subdivision, and keep only model geometry.
    for obj in objects:
        for modifier in obj.modifiers:
            if modifier.type == 'SUBSURF':
                modifier.levels = modifier.render_levels = 1
        bpy.context.view_layer.update()
        mesh = bpy.data.meshes.new_from_object(
            obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        mesh.transform(obj.matrix_world)
        obj.modifiers.clear()
        obj.data = mesh
        obj.parent = None
        obj.matrix_world = Matrix.Identity(4)
        mesh.calc_loop_triangles()
        if len(mesh.loop_triangles) > 12000:
            modifier = obj.modifiers.new('Game optimization', 'DECIMATE')
            modifier.ratio = 12000 / len(mesh.loop_triangles)
            bpy.context.view_layer.update()
            mesh = bpy.data.meshes.new_from_object(
                obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
            obj.modifiers.clear()
            obj.data = mesh
        # The Beretta faces -Y; Thompson faces +Y. GLB forward is -Z.
        if flip:
            mesh.transform(Matrix.Rotation(math.pi, 4, 'Z'))
    coords = [v.co for obj in objects for v in obj.data.vertices]
    low = Vector([min(v[i] for v in coords) for i in range(3)])
    high = Vector([max(v[i] for v in coords) for i in range(3)])
    center = (low + high) / 2
    scale = length / (high.y - low.y)
    transform = Matrix.Scale(scale, 4) @ Matrix.Translation(-center)
    if muzzle_mesh:
        # Old blend bound_box values can be stale until modifiers are evaluated.
        barrel = next(obj for obj in objects if obj.name == muzzle_mesh)
        front_y = max(v.co.y for v in barrel.data.vertices)
        rim = [v.co.copy() for v in barrel.data.vertices if abs(v.co.y - front_y) < 0.0001]
        source_muzzle = sum(rim, Vector()) / len(rim)
    else:
        source_muzzle = Vector(muzzle)
        if flip:
            source_muzzle = Matrix.Rotation(math.pi, 4, 'Z') @ source_muzzle
    for obj in objects:
        obj.data.transform(transform)
    # Static geometry can be submitted once per material instead of per component.
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    merged = bpy.context.object
    merged.name = output.stem + '_model'
    objects = [merged]
    bpy.ops.object.empty_add(type='PLAIN_AXES')
    socket = bpy.context.object
    socket.name = 'MuzzleSocket'
    socket.location = transform @ source_muzzle
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects + [socket]:
        obj.select_set(True)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output), export_format='GLB', use_selection=True,
        export_apply=False, export_animations=False, export_cameras=False,
        export_lights=False, export_image_format='AUTO', export_yup=True)
    triangles = sum(len(obj.data.loop_triangles) for obj in objects)
    print(f'EXPORTED {output.name}: {output.stat().st_size:,} bytes; {triangles:,} triangles')


def beretta(directory, output):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # The FBX has its magazine seated; the blend is an exploded editing pose.
    bpy.ops.import_scene.fbx(filepath=str(directory / 'Beretta Pistol.fbx'))
    load = lambda suffix: bpy.data.images.load(str(directory / f'Berreta M9_Material_{suffix}.png'))
    material = pbr_material('Beretta', load('BaseColor'), load('Normal'),
                            metallic_image=load('Metallic'), roughness_image=load('Roughness'))
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            obj.data.materials.clear()
            obj.data.materials.append(material)
    export_model(output, 0.62, flip=True, muzzle=(0, -3.3865, 1.66))


def thompson(directory, output):
    bpy.ops.wm.open_mainfile(filepath=str(directory / 'M1A1 Thompson II.blend'),
                             load_ui=False, use_scripts=False)
    # Exclude the presentation backdrop and spare magazine below the weapon.
    for obj in list(bpy.data.objects):
        if obj.type != 'MESH' or obj.name in {'Plane', 'Cube.008'}:
            bpy.data.objects.remove(obj, do_unlink=True)
    replacements = {}
    for obj in bpy.context.scene.objects:
        for index, original in enumerate(obj.data.materials):
            if original is None:
                continue
            if original.name not in replacements:
                images = [node.image for node in original.node_tree.nodes
                          if node.type == 'TEX_IMAGE' and node.image] if original.use_nodes else []
                color = next((im for im in images if '_COL_' in im.name or 'seamless-wood' in im.name), None)
                normal = next((im for im in images if '_NRM_' in im.name or 'NormalMap' in im.name), None)
                wood = original.name == 'wood'
                replacements[original.name] = pbr_material(
                    original.name, color, normal, metallic=0.0 if wood else 0.75,
                    roughness=0.7 if wood else 0.42)
            obj.data.materials[index] = replacements[original.name]
    export_model(output, 1.10, muzzle_mesh='Cylinder')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--beretta-dir', type=Path, required=True)
    parser.add_argument('--thompson-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path,
                        default=Path(__file__).resolve().parents[1] / 'assets' / 'weapons')
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    beretta(args.beretta_dir, args.output_dir / 'beretta.glb')
    thompson(args.thompson_dir, args.output_dir / 'thompson.glb')
