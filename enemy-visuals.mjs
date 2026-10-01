// Imported humanoid visuals. Gameplay and damage regions remain owned by the game.
export function createHumanoidVisuals(THREE, cloneSkeleton, scenes, clips) {
    const templates = new Map();
    const choices = {Normal:['z07','z08'],Corredor:['z02','z04','z06'],Bruto:['z05'],Atirador:['z03'],Detonador:['z03']};
    const counts = new Map();
    const v = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
    const localAxis = (bone,axis) => axis.clone().applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()).invert());
    function prepare(id) {
        const visual = scenes.get(id), holder = new THREE.Group();holder.add(visual);
        const nativeClips=(clips.get(id)||[]).map(source=>{
            const clip=source.clone();
            // Remove root travel: navigation, collisions and speed are controlled by gameplay.
            clip.tracks=clip.tracks.filter(track=>!track.name.endsWith('.position'));
            return clip;
        });
        if(nativeClips.length){const mixer=new THREE.AnimationMixer(visual);mixer.clipAction(nativeClips[0]).play();mixer.update(0);}
        holder.updateMatrixWorld(true);
        visual.traverse(o=>{if(o.isSkinnedMesh){o.computeBoundingBox();o.computeBoundingSphere();}});
        let box=new THREE.Box3().setFromObject(holder),size=box.getSize(v()),center=box.getCenter(v());
        const scale=2.7/size.y;
        holder.scale.setScalar(scale);holder.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
        const root=new THREE.Group();root.add(holder);root.updateMatrixWorld(true);
        let skinned=false;root.traverse(o=>{if(o.isSkinnedMesh)skinned=true;});
        if(!skinned) makeStaticRig(root);
        root.traverse(o=>{if(o.isMesh){o.geometry.userData.sharedEnemy=true;o.userData.importedEnemy=true;o.frustumCulled=false;}});
        templates.set(id,{root,clips:nativeClips,procedural:!nativeClips.length});
    }
    function makeStaticRig(root) {
        const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o)});
        const positions=[['Root',0,0,0],['Hips',0,1.32,0],['Head',0,2.32,0],['LeftUpLeg',.18,1.26,0],['RightUpLeg',-.18,1.26,0],['LeftArm',.34,2.12,0],['RightArm',-.34,2.12,0]];
        const bones=positions.map(([name,x,y,z])=>{const bone=new THREE.Bone();bone.name=name;bone.position.set(x,y,z);return bone});
        root.add(bones[0]);for(const b of bones.slice(1))bones[0].add(b);
        const skeleton=new THREE.Skeleton(bones);
        for(const mesh of meshes){
            const geometry=mesh.geometry.clone();geometry.applyMatrix4(mesh.matrixWorld);
            const a=geometry.attributes.position,indices=[],weights=[];
            for(let i=0;i<a.count;i++){
                const x=a.getX(i),y=a.getY(i),side=x>=0;
                let bone=1,weight=1;
                if(y<1.35){bone=side?3:4;weight=THREE.MathUtils.clamp((1.45-y)/.25,0,1)}
                else if(y>2.3&&Math.abs(x)<.35){bone=2;weight=THREE.MathUtils.clamp((y-2.25)/.15,0,1)}
                else if(Math.abs(x)>.34&&y>1.3){bone=side?5:6;weight=THREE.MathUtils.clamp((Math.abs(x)-.30)/.20,0,1)}
                indices.push(bone,1,0,0);weights.push(weight,1-weight,0,0);
            }
            geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
            const skin=new THREE.SkinnedMesh(geometry,mesh.material);root.add(skin);root.updateMatrixWorld(true);skin.bind(skeleton);mesh.removeFromParent();
        }
    }
    for(const id of ['z01','z02','z03','z04','z05','z06','z07','z08'])prepare(id);
    function create(type,forcedId) {
        const pool=choices[type]||choices.Normal,index=counts.get(type)||0;counts.set(type,index+1);
        const id=forcedId||pool[index%pool.length],template=templates.get(id),root=cloneSkeleton(template.root);
        // Some GLBs split one character into many meshes with identical rigs.
        // Share that instance's skeleton to avoid a bone texture per material part.
        const rigs=[];
        root.traverse(o=>{
            if(!o.isSkinnedMesh)return;
            const existing=rigs.find(r=>r.bones.length===o.skeleton.bones.length&&r.bones.every((bone,i)=>bone===o.skeleton.bones[i]&&r.boneInverses[i].equals(o.skeleton.boneInverses[i])));
            if(existing)o.skeleton=existing;else rigs.push(o.skeleton);
        });
        root.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of(Array.isArray(o.material)?o.material:[o.material])){
            if(id==='z03'){m.color.multiply(new THREE.Color(type==='Detonador'?0xffad6a:0x91df9e));m.emissive.set(type==='Detonador'?0x631800:0x063b0b);m.emissiveIntensity=.22;}
        }}});
        const mixer=template.clips.length?new THREE.AnimationMixer(root):null;
        if(mixer)mixer.clipAction(template.clips[0]).play();
        root.updateMatrixWorld(true);const joints=[];
        if(template.procedural)root.traverse(bone=>{
            if(!bone.isBone)return;
            const name=bone.name.split(':').pop().replace(/_\d+$/,'');
            if(!['LeftUpLeg','RightUpLeg','LeftArm','RightArm','Head'].includes(name))return;
            joints.push({bone,name,rest:bone.quaternion.clone(),x:localAxis(bone,v(1,0,0)),z:localAxis(bone,v(0,0,1)),side:bone.getWorldPosition(v()).x>=0?1:-1});
        });
        return {id,root,mixer,joints,time:Math.random()*6,procedural:template.procedural};
    }
    function update(model,delta,data,distance=10) {
        const rate=data.isBoss?.55:data.typeName==='Corredor'?1.65:data.typeName==='Bruto'?.75:1;
        model.time+=delta*rate;
        if(model.mixer)model.mixer.update(delta*rate*(data.legsDestroyed?.4:1));
        const swing=model.time*6;
        for(const joint of model.joints){
            const {bone,name,rest,x,z,side}=joint;bone.quaternion.copy(rest);
            if(name.includes('UpLeg'))bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(x,Math.sin(swing+(side>0?0:Math.PI))*.42));
            if(name.includes('Arm')){
                bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(z,-side*(model.id==='z08'?1.1:.48)));
                bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(x,(distance<3?-.9:-.38)+Math.sin(swing+(side>0?Math.PI:0))*.18));
            }
        }
        rootPose(model.root,data.legsDestroyed);
    }
    function rootPose(root,injured){root.scale.y=injured?.64:1;root.position.y=injured?.5:0;root.rotation.x=injured?.12:0;}
    function dispose(model){model.mixer?.stopAllAction();model.mixer?.uncacheRoot(model.root);const skeletons=new Set();model.root.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton)});for(const s of skeletons)s.dispose();}
    return {create,update,dispose,templates,reset(){counts.clear()}};
}
