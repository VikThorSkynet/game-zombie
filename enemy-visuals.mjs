// Imported humanoid visuals. Gameplay and damage regions remain owned by the game.
export function createHumanoidVisuals(THREE, cloneSkeleton, scenes, clips) {
    const templates = new Map();
    const materialVariants=new WeakMap();
    const choices = {Normal:['z07','z08'],Corredor:['z02','z04','z06'],Bruto:['z05'],Atirador:['z03'],Detonador:['z03']};
    const counts = new Map();
    const v = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
    const localAxis = (bone,axis) => axis.clone().applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()).invert());
    function prepare(id) {
        const visual = scenes.get(id), holder = new THREE.Group();holder.add(visual);
        visual.traverse(b=>{if(b.isBone)b.userData.crawlRest=b.quaternion.toArray()});
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
        root.traverse(o=>{if(o.isMesh){
            if(o.isSkinnedMesh&&!o.boundingBox){o.computeBoundingBox();o.computeBoundingSphere();}
            o.geometry.userData.sharedEnemy=true;o.userData.importedEnemy=true;o.frustumCulled=false;
        }});
        templates.set(id,{root,clips:nativeClips,procedural:!nativeClips.length,crawl:prepareCrawl(root)});
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
                if(Math.abs(x)>.42&&y>.8){bone=side?5:6;weight=THREE.MathUtils.clamp((Math.abs(x)-.30)/.20,0,1)}
                else if(y<1.35){bone=side?3:4;weight=THREE.MathUtils.clamp((1.45-y)/.25,0,1)}
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
        function sharedMaterial(source){
            let variants=materialVariants.get(source);if(!variants){variants=new Map();materialVariants.set(source,variants);}
            const key=id==='z03'?(type==='Detonador'?'exploder':'shooter'):'base';
            if(!variants.has(key)){
                const m=source.clone();m.userData.sharedEnemyMaterial=true;
                if(id==='z03'){m.color.multiply(new THREE.Color(type==='Detonador'?0xffad6a:0x91df9e));m.emissive.set(type==='Detonador'?0x631800:0x063b0b);m.emissiveIntensity=.22;}
                variants.set(key,m);
            }
            return variants.get(key);
        }
        root.traverse(o=>{if(o.isMesh)o.material=Array.isArray(o.material)?o.material.map(sharedMaterial):sharedMaterial(o.material);});
        const mixer=template.clips.length?new THREE.AnimationMixer(root):null;
        if(mixer)mixer.clipAction(template.clips[0]).play();
        root.updateMatrixWorld(true);const joints=[];
        if(template.procedural)root.traverse(bone=>{
            if(!bone.isBone)return;
            const name=bone.name.split(':').pop().replace(/^mixamorig[_]?/i,'').replace(/_\d+$/,'');
            if(!['LeftUpLeg','RightUpLeg','LeftArm','RightArm','Head'].includes(name))return;
            joints.push({bone,name,rest:bone.quaternion.clone(),x:localAxis(bone,v(1,0,0)),z:localAxis(bone,v(0,0,1)),side:bone.getWorldPosition(v()).x>=0?1:-1});
        });
        const crawl={...template.crawl,bones:[]};root.traverse(b=>{if(b.isBone)crawl.bones.push(b)});
        return {id,root,mixer,joints,crawl,fall:0,time:Math.random()*6,procedural:template.procedural};
    }
    function prepareCrawl(root) {
        const bones=[];root.traverse(b=>{if(b.isBone)bones.push(b)});
        const rest=bones.map(b=>b.quaternion.clone()),arms=[];
        for(const b of bones)if(b.userData.crawlRest)b.quaternion.fromArray(b.userData.crawlRest);
        root.updateMatrixWorld(true);
        // Aim limbs in the normalized character frame before laying the body down.
        // Using bone directions handles the different axis conventions of the GLBs.
        for(const bone of bones){
            const name=bone.name.split(':').pop().replace(/^mixamorig[_]?/i,'').replace(/_\d+$/,'');
            const arm=/^(Left|Right)Arm$|ArmUpper/.test(name),fore=/ForeArm/.test(name);
            const thigh=/UpLeg|Thigh/i.test(name),calf=/^(Left|Right)Leg$|Calf/i.test(name);
            const torso=/Hips$|^walk$|Spine\d*$|Ribcage$|Neck$/i.test(name);
            const child=bone.children.find(c=>c.isBone&&c.position.lengthSq()>1e-8);
            const side=bone.getWorldPosition(v()).x>=0?1:-1;
            if((arm||fore||thigh||calf||torso)&&child){
                root.updateMatrixWorld(true);
                const direction=child.getWorldPosition(v()).sub(bone.getWorldPosition(v())).normalize();
                const target=torso?v(0,1,0):arm?v(side*.18,.7,.55):fore?v(side*.08,.9,.22):thigh?v(side*.08,-1,-.08):v(0,-1,.18);
                const world=bone.getWorldQuaternion(new THREE.Quaternion());
                world.premultiply(new THREE.Quaternion().setFromUnitVectors(direction,target.normalize()));
                bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
            }else if(arm){
                // Simple rigs used by the static assets have no elbow child.
                const centroid=v(),point=v();let total=0;root.updateMatrixWorld(true);
                root.traverse(m=>{if(!m.isSkinnedMesh)return;const index=m.skeleton.bones.indexOf(bone);if(index<0)return;const {skinIndex,skinWeight,position}=m.geometry.attributes;
                    for(let i=0;i<position.count;i++)for(let j=0;j<4;j++)if(skinIndex.getComponent(i,j)===index){const w=skinWeight.getComponent(i,j);if(w>0){centroid.addScaledVector(m.getVertexPosition(i,point).applyMatrix4(m.matrixWorld),w);total+=w;}}
                });
                if(total){const direction=centroid.multiplyScalar(1/total).sub(bone.getWorldPosition(v())).normalize();const world=bone.getWorldQuaternion(new THREE.Quaternion());world.premultiply(new THREE.Quaternion().setFromUnitVectors(direction,v(side*.25,.9,.3).normalize()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));}
            }
            if(/Head(?:$|_)/i.test(name))bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(localAxis(bone,v(1,0,0)),-1.1));
            if(arm||fore)arms.push({index:bones.indexOf(bone),side,axis:localAxis(bone,v(1,0,0)),amount:fore?.22:.16});
        }
        const pose=bones.map(b=>b.quaternion.clone());
        root.rotation.x=1.5;root.updateMatrixWorld(true);
        const bounds=new THREE.Box3(),point=v();
        for(const phase of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
            for(const arm of arms)bones[arm.index].quaternion.copy(pose[arm.index]).multiply(new THREE.Quaternion().setFromAxisAngle(arm.axis,Math.sin(phase+arm.side*Math.PI/2)*arm.amount));
            root.updateMatrixWorld(true);root.traverse(m=>{if(m.isSkinnedMesh){for(let i=0;i<m.geometry.attributes.position.count;i++)bounds.expandByPoint(m.getVertexPosition(i,point).applyMatrix4(m.matrixWorld));}});
        }
        const height=-bounds.min.y+.025;
        root.rotation.x=0;bones.forEach((b,i)=>b.quaternion.copy(rest[i]));root.updateMatrixWorld(true);
        return {bones,rest,pose,arms,height};
    }
    function update(model,delta,data,distance=10) {
        const rate=data.isBoss?.55:data.typeName==='Corredor'?1.65:data.typeName==='Bruto'?.75:1;
        model.time+=delta*rate;
        if(model.procedural)model.crawl.bones.forEach((b,i)=>b.quaternion.copy(model.crawl.rest[i]));
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
        model.fall=THREE.MathUtils.clamp(model.fall+(data.legsDestroyed?delta/.75:-delta/.75),0,1);
        const blend=model.fall*model.fall*(3-2*model.fall),crawl=model.crawl;
        if(blend>0){
            for(let i=0;i<crawl.bones.length;i++){
                const target=crawl.pose[i].clone(),arm=crawl.arms.find(a=>a.index===i);
                if(arm)target.multiply(new THREE.Quaternion().setFromAxisAngle(arm.axis,Math.sin(model.time*4+arm.side*Math.PI/2)*arm.amount));
                crawl.bones[i].quaternion.slerp(target,blend);
            }
        }
        // Keep original proportions. The fall changes orientation and joints, never scale.
        model.root.scale.set(1,1,1);
        model.root.rotation.x=1.5*blend;
        model.root.position.set(0,(crawl.height+Math.sin(model.time*8)*.012)*blend,-1.3*blend);
    }
    function dispose(model){model.mixer?.stopAllAction();model.mixer?.uncacheRoot(model.root);const skeletons=new Set();model.root.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton)});for(const s of skeletons)s.dispose();}
    return {create,update,dispose,templates,reset(){counts.clear()}};
}
