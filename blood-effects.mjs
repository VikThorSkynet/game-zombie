// Bounded blood marks, drawn in one batch and cleared on restart/area travel.
export function createBloodEffects(THREE, lowQuality) {
    const capacity=lowQuality?40:80, marks=[];
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff';
    ctx.beginPath();
    for(let i=0;i<32;i++){const angle=i*Math.PI/16,r=28+Math.sin(i*7.13)*9;const x=64+Math.cos(angle)*r,y=64+Math.sin(angle)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    ctx.closePath();ctx.fill();
    for(let i=0;i<24;i++){const angle=i*2.399,r=34+(i%5)*5;ctx.beginPath();ctx.ellipse(64+Math.cos(angle)*r,64+Math.sin(angle)*r,1+i%3,2+i%4,angle,0,Math.PI*2);ctx.fill();}
    const texture=new THREE.CanvasTexture(canvas);texture.userData.sharedSurface=true;
    const material=new THREE.MeshBasicMaterial({map:texture,color:0x750817,transparent:true,opacity:.82,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,side:THREE.DoubleSide});
    const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,capacity);mesh.name='blood-marks';mesh.frustumCulled=false;mesh.count=0;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const dummy=new THREE.Object3D();let cursor=0;
    function write(index){const mark=marks[index],fade=Math.min(1,mark.life/5);dummy.position.copy(mark.position);dummy.rotation.set(-Math.PI/2,0,mark.rotation);dummy.scale.setScalar(mark.size*Math.sqrt(Math.max(0,fade)));dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);}
    function spawn(scene,point,heavy=false){
        if(mesh.parent!==scene){clear();scene.add(mesh)}
        const index=marks.length<capacity?marks.length:cursor++%capacity;
        marks[index]={position:new THREE.Vector3(point.x,.068,point.z),size:heavy?1.4:THREE.MathUtils.randFloat(.45,.8),rotation:Math.random()*Math.PI*2,life:heavy?45:28};
        write(index);mesh.count=marks.length;mesh.instanceMatrix.needsUpdate=true;
    }
    function update(delta){if(!delta||!marks.length)return;for(let i=0;i<marks.length;i++){marks[i].life=Math.max(0,marks[i].life-delta);write(i)}mesh.instanceMatrix.needsUpdate=true;}
    function clear(){marks.length=0;cursor=0;mesh.count=0;mesh.removeFromParent();}
    return {spawn,update,clear,mesh,capacity,get active(){return marks.filter(m=>m.life>0).length},texture};
}
