import bpy,sys,math,argparse
from pathlib import Path
from mathutils import Matrix,Vector
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'tools'));from convert_weapon_assets import pbr_material
parser=argparse.ArgumentParser();parser.add_argument('--source-dir',type=Path,default=Path.home()/'Downloads/Assets')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
src=args.source_dir;out=root/'assets'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.wm.obj_import(filepath=str(src/'AK47 asset fuzil/AK47/scenes/AK47.obj'))
p=src/'AK47 asset fuzil/AK47/sourceimages/1st Texture';m=pbr_material('AK47',bpy.data.images.load(str(p/'color.tga')),bpy.data.images.load(str(p/'normal.tga')),metallic=.55,roughness=.55)
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 o.data.materials.clear();o.data.materials.append(m)
 o.data.transform(o.matrix_world);o.matrix_world=Matrix.Identity(4)
 # Baked OBJ: barrel along X, width along Y, height along Z.
 o.data.transform(Matrix(((0,-1,0,0),(1,0,0,0),(0,0,1,0),(0,0,0,1))))
 coords=[v.co for v in o.data.vertices];lo=Vector([min(v[i] for v in coords) for i in range(3)]);hi=Vector([max(v[i] for v in coords) for i in range(3)]);print('AK bounds',lo[:],hi[:]);center=(lo+hi)/2;s=1.15/(hi.y-lo.y);o.data.transform(Matrix.Scale(s,4)@Matrix.Translation(-center))
 mod=o.modifiers.new('Game mesh','DECIMATE');mod.ratio=min(1,18000/(sum(len(p.vertices)-2 for p in o.data.polygons)));bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
front=max(v.co.y for v in o.data.vertices);rim=[v.co for v in o.data.vertices if v.co.y>front-.003];muzzle=sum(rim,Vector())/len(rim)
bpy.ops.object.empty_add();bpy.context.object.name='MuzzleSocket';bpy.context.object.location=muzzle
bpy.ops.export_scene.gltf(filepath=str(out/'weapons/ak47.glb'),export_format='GLB')
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.wm.obj_import(filepath=str(src/'Mystery box Asset/Weapon box.obj'))
p=src/'Mystery box Asset';load=lambda suffix:bpy.data.images.load(str(p/('Weapon box_'+suffix+'.tga')))
m=pbr_material('Mystery box',load('Albedo'),load('Normal'),metallic_image=load('Metallic'),roughness_image=load('Roughness'))
for o in bpy.context.scene.objects:
 if o.type=='MESH':
  o.data.materials.clear();o.data.materials.append(m);o.data.transform(Matrix.Scale(2.5,4));bpy.context.view_layer.objects.active=o;o.select_set(True)
  bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='LOOSE');bpy.ops.object.mode_set(mode='OBJECT')
import bmesh
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=next(o for o in bpy.context.scene.objects if o.type=='MESH');bpy.ops.object.join()
base=bpy.context.object;base.data.transform(base.matrix_world);base.matrix_world=Matrix.Identity(4)
lid=base.copy();lid.data=base.data.copy();bpy.context.collection.objects.link(lid)
for obj,upper in [(base,False),(lid,True)]:
 bm=bmesh.new();bm.from_mesh(obj.data)
 bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.00001,plane_co=(0,0,.30),plane_no=(0,0,1),clear_inner=upper,clear_outer=not upper)
 bm.to_mesh(obj.data);bm.free();obj.data.transform(Matrix.Translation((0,0,.5)))
 obj.name='CrateLid' if upper else 'CrateBody'
 if upper:
  pivot=Vector((0,.625,.8));obj.data.transform(Matrix.Translation(-pivot));obj.location=pivot
(out/'props').mkdir(exist_ok=True);bpy.ops.export_scene.gltf(filepath=str(out/'props/mystery-box.glb'),export_format='GLB')

# Gallery-only conversion; preserve the downloaded humanoid until its role is chosen.
bpy.ops.wm.read_factory_settings(use_empty=True)
p=src/'pci6t5z5j3-PhychoZombie/PhychoZombie'
bpy.ops.import_scene.fbx(filepath=str(p/'Phychozomb.fbx'))
for material in bpy.data.materials:
 material.use_nodes=True
 shader=material.node_tree.nodes.get('Principled BSDF')
 if shader:
  texture=material.node_tree.nodes.new('ShaderNodeTexImage')
  texture.image=bpy.data.images.load(str(p/'Phychozomb_color.jpg'),check_existing=True)
  material.node_tree.links.new(texture.outputs['Color'],shader.inputs['Base Color'])
bpy.ops.export_scene.gltf(filepath=str(out/'enemies/z08.glb'),export_format='GLB')
