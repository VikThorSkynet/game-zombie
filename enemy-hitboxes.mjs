// Exact animated-mesh hits, with conservative bone bounds and anatomical damage regions.
export function createEnemyHitboxes(THREE) {
    const envelopes=new WeakMap();
    const point=new THREE.Vector3(),transformed=new THREE.Vector3();
    const worldBox=new THREE.Box3(),scratchBox=new THREE.Box3(),inverse=new THREE.Matrix4();
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),bary=new THREE.Vector3();
    function boneEnvelopes(mesh) {
        const cached=envelopes.get(mesh.geometry);
        if(cached&&cached.bind.equals(mesh.bindMatrix)&&cached.inverses.length===mesh.skeleton.boneInverses.length&&cached.inverses.every((m,i)=>m.equals(mesh.skeleton.boneInverses[i])))return cached.boxes;
        const boxes=mesh.skeleton.bones.map(()=>new THREE.Box3());
        const {position,skinIndex,skinWeight}=mesh.geometry.attributes;
        for(let i=0;i<position.count;i++){
            point.fromBufferAttribute(position,i).applyMatrix4(mesh.bindMatrix);
            for(let j=0;j<4;j++){
                if(skinWeight.getComponent(i,j)<=0)continue;
                const bone=skinIndex.getComponent(i,j);
                transformed.copy(point).applyMatrix4(mesh.skeleton.boneInverses[bone]);boxes[bone].expandByPoint(transformed);
            }
        }
        envelopes.set(mesh.geometry,{bind:mesh.bindMatrix.clone(),inverses:mesh.skeleton.boneInverses,boxes});
        return boxes;
    }
    function refreshBounds(mesh,boxes) {
        // Every skinned vertex is a weighted sum of transformed bind vertices.
        // The union of their bone boxes contains the full pose, including limbs.
        worldBox.makeEmpty();
        for(let i=0;i<boxes.length;i++)if(!boxes[i].isEmpty())worldBox.union(scratchBox.copy(boxes[i]).applyMatrix4(mesh.skeleton.bones[i].matrixWorld));
        inverse.copy(mesh.matrixWorld).invert();
        mesh.boundingBox.copy(worldBox).applyMatrix4(inverse).expandByScalar(.001);
        mesh.boundingBox.getBoundingSphere(mesh.boundingSphere);
    }
    function attach(zombie,visual) {
        const meshes=[];
        visual.traverse(mesh=>{
            if(!mesh.isMesh)return;
            mesh.userData.parentZombie=zombie;mesh.userData.animatedHitbox=true;
            if(mesh.isSkinnedMesh){
                const boxes=boneEnvelopes(mesh);
                // Keep the prepared model bounds until the first animated ray.
                mesh.boundingBox=mesh.boundingBox?.clone()||new THREE.Box3();
                mesh.boundingSphere=mesh.boundingSphere?.clone()||new THREE.Sphere();
                // A triangle list reuses vertices. Skin each vertex once per ray,
                // retaining exact triangles and anatomical classification.
                let positions=null,stamps=null,version=1,cacheActive=false;
                mesh.getVertexPosition=function(index,target){
                    if(!cacheActive)return THREE.SkinnedMesh.prototype.getVertexPosition.call(this,index,target);
                    if(!positions){positions=new Float64Array(this.geometry.attributes.position.count*3);stamps=new Uint32Array(this.geometry.attributes.position.count);}
                    const offset=index*3;
                    if(stamps[index]!==version){THREE.SkinnedMesh.prototype.getVertexPosition.call(this,index,target);positions[offset]=target.x;positions[offset+1]=target.y;positions[offset+2]=target.z;stamps[index]=version;}
                    return target.set(positions[offset],positions[offset+1],positions[offset+2]);
                };
                mesh.raycast=function(raycaster,hits){version=(version+1)>>>0;if(!version){stamps?.fill(0);version=1;}refreshBounds(this,boxes);cacheActive=true;try{THREE.SkinnedMesh.prototype.raycast.call(this,raycaster,hits)}finally{cacheActive=false;}};
            }
            meshes.push(mesh);
        });
        return meshes;
    }
    function boneRegion(name,dog) {
        if(/head|jaw|eye|tongue|muzzle|(?:^|_)ear(?:_|$)/i.test(name))return 'head';
        if(/upleg|thigh|calf|ankle|foot|toe|dogleg/i.test(name)||(!dog&&/(?:left|right)leg(?:_|$)/i.test(name.split(':').pop())))return 'leg';
        if(dog&&/upperarm|forearm|wrist|fingers/i.test(name))return 'leg';
        return 'body';
    }
    function vertexRegions(mesh,index,amount,scores) {
        const d=mesh.userData.parentZombie.userData;
        const {skinIndex,skinWeight,position}=mesh.geometry.attributes;
        for(let j=0;j<4;j++){
            const weight=skinWeight.getComponent(index,j)*amount;if(weight<=0)continue;
            const bone=mesh.skeleton.bones[skinIndex.getComponent(index,j)];
            let region=boneRegion(bone.name,d.isDog);
            // D01's generated rig has leg bones but no separate head bone.
            if(d.assetId==='dog1'&&region==='body'&&position.getY(index)>.85&&position.getZ(index)>.20)region='head';
            scores[region]+=weight;
        }
    }
    function region(hit) {
        const mesh=hit.object;
        if(!mesh.userData.animatedHitbox||!mesh.isSkinnedMesh||!hit.face)return mesh.name==='head'?'head':mesh.name==='leg'?'leg':'body';
        mesh.getVertexPosition(hit.face.a,a);mesh.getVertexPosition(hit.face.b,b);mesh.getVertexPosition(hit.face.c,c);
        point.copy(hit.point).applyMatrix4(inverse.copy(mesh.matrixWorld).invert());
        THREE.Triangle.getBarycoord(point,a,b,c,bary);
        const scores={head:0,body:0,leg:0};
        for(const [index,weight]of[[hit.face.a,bary.x],[hit.face.b,bary.y],[hit.face.c,bary.z]])vertexRegions(mesh,index,Math.max(0,weight),scores);
        return scores.head>scores.body&&scores.head>=scores.leg?'head':scores.leg>scores.body?'leg':'body';
    }
    function intersect(raycaster,zombies,meshes) {
        // Shots can happen between render frames, after movement or a pose change.
        for(const zombie of zombies)zombie.updateWorldMatrix(true,true);
        return raycaster.intersectObjects(meshes,false);
    }
    function prepare(visual){visual.traverse(mesh=>{if(mesh.isSkinnedMesh)boneEnvelopes(mesh);});}
    return {attach,region,intersect,prepare};
}
