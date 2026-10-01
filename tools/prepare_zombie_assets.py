"""Optimize gallery GLBs for waves while preserving rigs and animation clips.
Run with Blender --background --factory-startup --python tools/prepare_zombie_assets.py.
"""
import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=root/'assets/enemies/game';out.mkdir(parents=True,exist_ok=True)
for number in range(1,9):
 asset=f'z{number:02d}'
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(root/'assets/enemies'/f'{asset}.glb'))
 objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
 total=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects)
 ratio=min(1,12000/max(1,total))
 for obj in objects:
  if ratio<1:
   bpy.context.view_layer.objects.active=obj
   if obj.data.shape_keys:obj.shape_key_clear()
   mod=obj.modifiers.new('Wave budget','DECIMATE');mod.ratio=ratio
   # Apply before the armature, retaining skin weights.
   while obj.modifiers.find(mod.name)>0:bpy.ops.object.modifier_move_up(modifier=mod.name)
   bpy.ops.object.modifier_apply(modifier=mod.name)
 for image in bpy.data.images:
  if image.size[0] and max(image.size)>1024:
   scale=1024/max(image.size);image.scale(round(image.size[0]*scale),round(image.size[1]*scale))
 bpy.ops.export_scene.gltf(filepath=str(out/f'{asset}.glb'),export_format='GLB',export_animations=True,export_cameras=False,export_lights=False)
 print('PREPARED',asset,(out/f'{asset}.glb').stat().st_size)
