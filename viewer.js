
/* cw-lazydata: model data loads only when a 3D view opens */
window.cwData=function(src,name){ if(window[name]) return Promise.resolve(); window.__cwDL=window.__cwDL||{}; if(window.__cwDL[src]) return window.__cwDL[src];
  return window.__cwDL[src]=new Promise(function(res,rej){ var s=document.createElement('script'); s.src='/'+src+'?v=2'; s.onload=function(){ window[name]?res():rej(); }; s.onerror=function(){ window.__cwDL[src]=null; rej(); }; document.head.appendChild(s); }); };


/* cw-ml3d: MagLev interactive 3D viewer — shown as the "3D" view in the configurator, MagLev only */
(function(){
  var el=null, want='#ECECE8', st=null, loading=null;
  var REDUCE=false; try{ REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  function loadThree(){
    if(window.THREE) return Promise.resolve();
    if(loading) return loading;
    loading=new Promise(function(res,rej){
      var s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload=res; s.onerror=function(){ loading=null; rej(); };
      document.head.appendChild(s);
    });
    return loading;
  }
  function b64(s){ var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u.buffer; }
  function geo(d){
    var p=new Int16Array(b64(d.p)), ix=new Uint16Array(b64(d.i)), pos=new Float32Array(p.length);
    for(var k=0;k<p.length;k++) pos[k]=p[k]/100;
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setIndex(new THREE.BufferAttribute(ix,1));
    g=g.toNonIndexed(); g.computeVertexNormals(); return g;
  }
  function build(){
    var box=document.createElement('div'); box.className='ml3d-wrap';
    box.innerHTML='<div class="ml3d" role="img" aria-label="MagLev 3D model. Drag to turn it, pinch or scroll to zoom."><div class="ml3d-load">LOADING 3D…</div></div>'+
      '<div class="ml3d-ui"><span class="ml3d-name">Drag to turn · pinch to zoom</span>'+
      '<div class="ml3d-ctl"><button type="button" data-ml3t="lid" aria-pressed="false">Open lid</button><button type="button" data-ml3t="xray" aria-pressed="false">X-ray</button>'+
      '<button type="button" data-ml3t="spin" aria-pressed="'+(!REDUCE)+'">Spin</button></div></div>';
    box.addEventListener('click',function(e){
      var t=e.target.closest('[data-ml3t]');
      if(t){ var on=t.getAttribute('aria-pressed')!=='true'; t.setAttribute('aria-pressed',on);
        if(st){ if(t.dataset.ml3t==='lid') st.lidOpen=on; else if(t.dataset.ml3t==='xray') st.xray(on); else st.spin=on; } }
    });
    return box;
  }
  function init(box){
    var host=box.querySelector('.ml3d'), D=window.ML3D, T=THREE;
    var R=new T.WebGLRenderer({antialias:true,alpha:true});
    R.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); R.shadowMap.enabled=true; R.shadowMap.type=T.PCFSoftShadowMap; R.outputEncoding=T.sRGBEncoding;
    host.appendChild(R.domElement);
    var S=new T.Scene(), C=new T.PerspectiveCamera(30,1,1,3000);
    S.add(new T.HemisphereLight(0xffffff,0x8a90a0,.8));
    var key=new T.DirectionalLight(0xffffff,.85); key.position.set(160,320,-200); key.castShadow=true; key.shadow.mapSize.set(1024,1024);
    Object.assign(key.shadow.camera,{left:-130,right:130,top:130,bottom:-130,near:10,far:900}); key.shadow.bias=-.0005; key.shadow.radius=4; S.add(key);
    var fill=new T.DirectionalLight(0xdfe8ff,.35); fill.position.set(-200,120,180); S.add(fill);
    var gnd=new T.Mesh(new T.PlaneGeometry(700,700),new T.ShadowMaterial({opacity:.16})); gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; S.add(gnd);
    var mat=new T.MeshStandardMaterial({color:want,roughness:.55,metalness:0});
    var magM=new T.MeshStandardMaterial({color:0xc9ccd2,roughness:.25,metalness:.9});
    var grp=new T.Group(); S.add(grp);
    var bodies=[],edges=[],edgeM=new T.LineBasicMaterial({color:0x1f5fc2,transparent:true,opacity:.55});
    function mk(g,m){ var o=new T.Mesh(g,m); o.castShadow=true; o.receiveShadow=true;
      if(m===mat){ bodies.push(o); var e=new T.LineSegments(new T.EdgesGeometry(g,25),edgeM); e.visible=false; o.add(e); edges.push(e); } return o; }
    grp.add(mk(geo(D.tube),mat));
    var elev=mk(geo(D.elev),mat); grp.add(elev);
    var lid=new T.Group(); lid.add(mk(geo(D.lid),mat)); grp.add(lid);
    var LC={dark:0x2a2c31,blue:0x4285e0,red:0xd64034,yellow:0xf0be32,green:0x348c5a};
    D.logo.pieces.forEach(function(pc){
      var sh=new T.Shape(pc.p.map(function(q){ return new T.Vector2(q[0],q[1]); }));
      var g=new T.ExtrudeGeometry(sh,{depth:D.logo.z1-D.logo.z0,bevelEnabled:false}); g.rotateX(-Math.PI/2); g.translate(0,D.logo.z0,0);
      lid.add(mk(g,new T.MeshStandardMaterial({color:LC[pc.c],roughness:.5})));
    });
    var cg=new T.CylinderGeometry(3,3,5,32);
    [[0,0],[21,21],[-21,21],[-21,-21],[21,-21]].forEach(function(q){ var a=mk(cg,magM); a.position.set(q[0],5.3,-q[1]); grp.add(a);
      var b=mk(cg,magM); b.position.set(q[0],2.7,-q[1]); elev.add(b); });
    [[0,32.5],[0,-32.5],[32.5,0],[-32.5,0]].forEach(function(q){ var a=mk(cg,magM); a.position.set(q[0],130.3,-q[1]); grp.add(a);
      var b=mk(cg,magM); b.position.set(q[0],2.7,-q[1]); lid.add(b); });
    var s={xray:function(on){ mat.transparent=on; mat.opacity=on?.16:1; mat.depthWrite=!on; mat.side=on?T.DoubleSide:T.FrontSide; mat.needsUpdate=true;
      edges.forEach(function(e){ e.visible=on; }); bodies.forEach(function(o){ o.castShadow=!on; }); magM.emissive.setHex(on?0xff7a1a:0); magM.emissiveIntensity=on?.9:0; },R:R,S:S,C:C,mat:mat,lid:lid,elev:elev,host:host,theta:-.65,phi:1.12,rad:420,lidT:0,
      lidOpen:false,spin:!REDUCE,drag:null,last:0,running:false};
    // controls: drag to turn, wheel / pinch to zoom
    var pts={};
    host.addEventListener('pointerdown',function(e){ host.setPointerCapture(e.pointerId); pts[e.pointerId]=[e.clientX,e.clientY]; host.style.cursor='grabbing'; });
    host.addEventListener('pointermove',function(e){ if(!pts[e.pointerId]) return; var k=Object.keys(pts);
      if(k.length===1){ var dx=e.clientX-pts[e.pointerId][0], dy=e.clientY-pts[e.pointerId][1];
        s.theta-=dx*.01; s.phi=Math.min(1.5,Math.max(.2,s.phi-dy*.008)); s.touched=performance.now(); }
      else if(k.length===2){ var o=pts[k[0]===String(e.pointerId)?k[1]:k[0]];
        var d0=Math.hypot(pts[e.pointerId][0]-o[0],pts[e.pointerId][1]-o[1]), d1=Math.hypot(e.clientX-o[0],e.clientY-o[1]);
        if(d0>0) s.rad=Math.min(640,Math.max(200,s.rad*d0/d1)); }
      pts[e.pointerId]=[e.clientX,e.clientY]; });
    function up(e){ delete pts[e.pointerId]; host.style.cursor=''; }
    host.addEventListener('pointerup',up); host.addEventListener('pointercancel',up);
    host.addEventListener('wheel',function(e){ e.preventDefault(); s.rad=Math.min(640,Math.max(200,s.rad*(1+e.deltaY*.001))); },{passive:false});
    function size(){ var w=host.clientWidth||300, h=host.clientHeight||375; R.setSize(w,h,false); C.aspect=w/h; C.updateProjectionMatrix(); }
    if(window.ResizeObserver) new ResizeObserver(size).observe(host); else window.addEventListener('resize',size);
    size(); s.size=size;
    var ld=host.querySelector('.ml3d-load'); if(ld) ld.remove();
    return s;
  }
  function start(){
    if(!st||st.running) return; st.running=true; st.last=performance.now(); st.size();
    (function loop(now){
      if(!el||!el.isConnected){ st.running=false; return; }
      var dt=Math.min(.05,(now-st.last)/1000); st.last=now;
      if(st.spin&&!(st.touched&&now-st.touched<1500)) st.theta+=dt*.45;
      st.lidT+=((st.lidOpen?1:0)-st.lidT)*Math.min(1,dt*5);
      st.lid.position.y=133+st.lidT*48; st.lid.rotation.x=-.16*st.lidT;
      st.elev.position.y=36+(REDUCE?0:Math.sin(now/650)*2.5)+st.lidT*20;
      var tg=new THREE.Vector3(0,74+st.lidT*14,0);
      st.C.position.set(tg.x+st.rad*Math.sin(st.phi)*Math.sin(st.theta),tg.y+st.rad*Math.cos(st.phi),tg.z-st.rad*Math.sin(st.phi)*Math.cos(st.theta));
      st.C.lookAt(tg); st.R.render(st.S,st.C);
      requestAnimationFrame(loop);
    })(performance.now());
  }
  window.mountML3D=function(target,colour){
    if(colour){ want=colour; if(st) st.mat.color.set(colour); }
    if(!el) el=build();
    if(el.parentNode!==target){ target.innerHTML=''; target.appendChild(el); }
    if(st){ start(); return; }
    loadThree().then(function(){ return cwData('ml3d-data.js','ML3D'); }).then(function(){ if(!st) st=init(el); start(); })
      .catch(function(){ var l=el.querySelector('.ml3d-load'); if(l) l.textContent='3D VIEW COULD NOT LOAD — CHECK YOUR CONNECTION'; });
  };
})();



/* cw-cv3d: CubeVault interactive 3D viewer — the "3D" view in the configurator for CubeVault (reuses MagLev's elevator, lid and logo data) */
(function(){
  var el=null, want='#ECECE8', st=null, loading=null;
  var REDUCE=false; try{ REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  function loadThree(){
    if(window.THREE) return Promise.resolve();
    if(window.__cwThreeLoading) return window.__cwThreeLoading;
    if(loading) return loading;
    loading=window.__cwThreeLoading=new Promise(function(res,rej){
      var s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload=res; s.onerror=function(){ loading=null; window.__cwThreeLoading=null; rej(); };
      document.head.appendChild(s);
    });
    return loading;
  }
  function b64(s){ var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u.buffer; }
  function geo(d){
    var p=new Int16Array(b64(d.p)), ix=new Uint16Array(b64(d.i)), pos=new Float32Array(p.length);
    for(var k=0;k<p.length;k++) pos[k]=p[k]/100;
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setIndex(new THREE.BufferAttribute(ix,1));
    g=g.toNonIndexed(); g.computeVertexNormals(); return g;
  }
  function build(){
    var box=document.createElement('div'); box.className='ml3d-wrap';
    box.innerHTML='<div class="ml3d" role="img" aria-label="CubeVault 3D model. Drag to turn it, pinch or scroll to zoom."><div class="ml3d-load">LOADING 3D…</div></div>'+
      '<div class="ml3d-ui"><span class="ml3d-name">Drag to turn · pinch to zoom</span>'+
      '<div class="ml3d-ctl"><button type="button" data-ml3t="drawer" aria-pressed="false">Open drawer</button><button type="button" data-ml3t="lid" aria-pressed="false">Open lid</button><button type="button" data-ml3t="xray" aria-pressed="false">X-ray</button>'+
      '<button type="button" data-ml3t="spin" aria-pressed="'+(!REDUCE)+'">Spin</button></div></div>';
    box.addEventListener('click',function(e){
      var t=e.target.closest('[data-ml3t]');
      if(t){ var on=t.getAttribute('aria-pressed')!=='true'; t.setAttribute('aria-pressed',on);
        if(st){ if(t.dataset.ml3t==='lid') st.lidOpen=on; else if(t.dataset.ml3t==='drawer') st.drOpen=on; else if(t.dataset.ml3t==='xray') st.xray(on); else st.spin=on; } }
    });
    return box;
  }
  function init(box){
    var host=box.querySelector('.ml3d'), D=window.ML3D, V=window.CV3D, T=THREE;
    var R=new T.WebGLRenderer({antialias:true,alpha:true});
    R.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); R.shadowMap.enabled=true; R.shadowMap.type=T.PCFSoftShadowMap; R.outputEncoding=T.sRGBEncoding;
    host.appendChild(R.domElement);
    var S=new T.Scene(), C=new T.PerspectiveCamera(30,1,1,3000);
    S.add(new T.HemisphereLight(0xffffff,0x8a90a0,.8));
    var key=new T.DirectionalLight(0xffffff,.85); key.position.set(160,320,-200); key.castShadow=true; key.shadow.mapSize.set(1024,1024);
    Object.assign(key.shadow.camera,{left:-130,right:130,top:130,bottom:-130,near:10,far:900}); key.shadow.bias=-.0005; key.shadow.radius=4; S.add(key);
    var fill=new T.DirectionalLight(0xdfe8ff,.35); fill.position.set(-200,120,180); S.add(fill);
    var gnd=new T.Mesh(new T.PlaneGeometry(700,700),new T.ShadowMaterial({opacity:.16})); gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; S.add(gnd);
    var mat=new T.MeshStandardMaterial({color:want,roughness:.55,metalness:0});
    var magM=new T.MeshStandardMaterial({color:0xc9ccd2,roughness:.25,metalness:.9});
    var grp=new T.Group(); S.add(grp);
    var bodies=[],edges=[],edgeM=new T.LineBasicMaterial({color:0x1f5fc2,transparent:true,opacity:.55});
    function mk(g,m){ var o=new T.Mesh(g,m); o.castShadow=true; o.receiveShadow=true;
      if(m===mat){ bodies.push(o); var e=new T.LineSegments(new T.EdgesGeometry(g,25),edgeM); e.visible=false; o.add(e); edges.push(e); } return o; }
    grp.add(mk(geo(V.tube),mat));
    var drw=mk(geo(V.drawer),mat); drw.position.y=2.3; grp.add(drw);
    var elev=mk(geo(D.elev),mat); grp.add(elev);
    var lid=new T.Group(); lid.add(mk(geo(D.lid),mat)); grp.add(lid);
    var LC={dark:0x2a2c31,blue:0x4285e0,red:0xd64034,yellow:0xf0be32,green:0x348c5a};
    D.logo.pieces.forEach(function(pc){
      var sh=new T.Shape(pc.p.map(function(q){ return new T.Vector2(q[0],q[1]); }));
      var g=new T.ExtrudeGeometry(sh,{depth:D.logo.z1-D.logo.z0,bevelEnabled:false}); g.rotateX(-Math.PI/2); g.translate(0,D.logo.z0,0);
      lid.add(mk(g,new T.MeshStandardMaterial({color:LC[pc.c],roughness:.5})));
    });
    var cg=new T.CylinderGeometry(3,3,5,32);
    [[0,0],[21,21],[-21,21],[-21,-21],[21,-21]].forEach(function(q){ var a=mk(cg,magM); a.position.set(q[0],47.3,-q[1]); grp.add(a);
      var b=mk(cg,magM); b.position.set(q[0],2.7,-q[1]); elev.add(b); });
    [[0,32.5],[0,-32.5],[32.5,0],[-32.5,0]].forEach(function(q){ var a=mk(cg,magM); a.position.set(q[0],172.3,-q[1]); grp.add(a);
      var b=mk(cg,magM); b.position.set(q[0],2.7,-q[1]); lid.add(b); });
    [14,-14].forEach(function(x){ var a=mk(cg,magM); a.rotation.x=Math.PI/2; a.position.set(x,22,31.1); grp.add(a);
      var b=mk(cg,magM); b.rotation.x=Math.PI/2; b.position.set(x,19.7,25.6); drw.add(b); });
    var s={xray:function(on){ mat.transparent=on; mat.opacity=on?.16:1; mat.depthWrite=!on; mat.side=on?T.DoubleSide:T.FrontSide; mat.needsUpdate=true;
      edges.forEach(function(e){ e.visible=on; }); bodies.forEach(function(o){ o.castShadow=!on; }); magM.emissive.setHex(on?0xff7a1a:0); magM.emissiveIntensity=on?.9:0; },R:R,S:S,C:C,mat:mat,lid:lid,elev:elev,drw:drw,host:host,theta:-.65,phi:1.12,rad:500,lidT:0,drT:0,drOpen:false,
      lidOpen:false,spin:!REDUCE,drag:null,last:0,running:false};
    // controls: drag to turn, wheel / pinch to zoom
    var pts={};
    host.addEventListener('pointerdown',function(e){ host.setPointerCapture(e.pointerId); pts[e.pointerId]=[e.clientX,e.clientY]; host.style.cursor='grabbing'; });
    host.addEventListener('pointermove',function(e){ if(!pts[e.pointerId]) return; var k=Object.keys(pts);
      if(k.length===1){ var dx=e.clientX-pts[e.pointerId][0], dy=e.clientY-pts[e.pointerId][1];
        s.theta-=dx*.01; s.phi=Math.min(1.5,Math.max(.2,s.phi-dy*.008)); s.touched=performance.now(); }
      else if(k.length===2){ var o=pts[k[0]===String(e.pointerId)?k[1]:k[0]];
        var d0=Math.hypot(pts[e.pointerId][0]-o[0],pts[e.pointerId][1]-o[1]), d1=Math.hypot(e.clientX-o[0],e.clientY-o[1]);
        if(d0>0) s.rad=Math.min(760,Math.max(240,s.rad*d0/d1)); }
      pts[e.pointerId]=[e.clientX,e.clientY]; });
    function up(e){ delete pts[e.pointerId]; host.style.cursor=''; }
    host.addEventListener('pointerup',up); host.addEventListener('pointercancel',up);
    host.addEventListener('wheel',function(e){ e.preventDefault(); s.rad=Math.min(760,Math.max(240,s.rad*(1+e.deltaY*.001))); },{passive:false});
    function size(){ var w=host.clientWidth||300, h=host.clientHeight||375; R.setSize(w,h,false); C.aspect=w/h; C.updateProjectionMatrix(); }
    if(window.ResizeObserver) new ResizeObserver(size).observe(host); else window.addEventListener('resize',size);
    size(); s.size=size;
    var ld=host.querySelector('.ml3d-load'); if(ld) ld.remove();
    return s;
  }
  function start(){
    if(!st||st.running) return; st.running=true; st.last=performance.now(); st.size();
    (function loop(now){
      if(!el||!el.isConnected){ st.running=false; return; }
      var dt=Math.min(.05,(now-st.last)/1000); st.last=now;
      if(st.spin&&!(st.touched&&now-st.touched<1500)) st.theta+=dt*.45;
      st.lidT+=((st.lidOpen?1:0)-st.lidT)*Math.min(1,dt*5);
      st.drT+=((st.drOpen?1:0)-st.drT)*Math.min(1,dt*5); st.drw.position.z=-st.drT*40;
      st.lid.position.y=175+st.lidT*48; st.lid.rotation.x=-.16*st.lidT;
      st.elev.position.y=78+(REDUCE?0:Math.sin(now/650)*2.5)+st.lidT*20;
      var tg=new THREE.Vector3(0,90+st.lidT*14,0);
      st.C.position.set(tg.x+st.rad*Math.sin(st.phi)*Math.sin(st.theta),tg.y+st.rad*Math.cos(st.phi),tg.z-st.rad*Math.sin(st.phi)*Math.cos(st.theta));
      st.C.lookAt(tg); st.R.render(st.S,st.C);
      requestAnimationFrame(loop);
    })(performance.now());
  }
  window.mountCV3D=function(target,colour){
    if(colour){ want=colour; if(st) st.mat.color.set(colour); }
    if(!el) el=build();
    if(el.parentNode!==target){ target.innerHTML=''; target.appendChild(el); }
    if(st){ start(); return; }
    loadThree().then(function(){ return Promise.all([cwData('ml3d-data.js','ML3D'),cwData('cv3d-data.js','CV3D')]); }).then(function(){ if(!st) st=init(el); start(); })
      .catch(function(){ var l=el.querySelector('.ml3d-load'); if(l) l.textContent='3D VIEW COULD NOT LOAD — CHECK YOUR CONNECTION'; });
  };
})();
