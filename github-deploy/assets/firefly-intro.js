(function(){
 'use strict';
 var base='assets/intro/',defaults={duration:4300,name:'邓俨轩',role:'数字媒体艺术 · DIGITAL MEDIA ART'};
 var fallbackPalette={
  "main": "#62d7d4",
  "glow": "#affff0",
  "particle": "#eae989",
  "core": "#effff1",
  "source": {
    "start": 175,
    "end": 203,
    "crop": [
      0,
      480,
      1280,
      170
    ],
    "method": "separate cyan/gold emissive mattes from lower combat arcs"
  },
  "placement": {
    "cyan": "upper / outer arc",
    "gold": "lower / inner arc"
  }
}, fallbackTrail={
  "frameWidth": 480,
  "frameHeight": 480,
  "frameCount": 36,
  "columns": 6,
  "rows": 6,
  "fps": 24,
  "duration": 1.5,
  "playbackOrder": [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35
  ],
  "anchor": {
    "x": 0.1,
    "y": 0.5
  },
  "blendMode": "screen",
  "alpha": "straight",
  "source": {
    "start": 175,
    "end": 203,
    "sampleFps": 1.2857142857142858,
    "retime": 18.666666666666668,
    "crop": [
      0,
      480,
      1280,
      170
    ]
  },
  "sword": {
    "width": 384,
    "height": 1536,
    "anchor": {
      "x": 0.5,
      "y": 0.88
    },
    "sourceTime": 115,
    "extractedBladeHeight": 236,
    "grip": "manually reconstructed because occluded by hand",
    "upscaled": true
  },
  "layers": {
    "cyan": {
      "y": 30,
      "height": 180
    },
    "gold": {
      "y": 270,
      "height": 180
    }
  }
};
 function image(src){return new Promise(function(resolve){var img=new Image();img.onload=function(){resolve(img);};img.onerror=function(){resolve(null);};img.src=src;});}
 function json(name,fallback){return fetch(base+name).then(function(r){if(!r.ok)throw Error(r.status);return r.json();}).catch(function(){return fallback;});}
 var ready=Promise.all([image(base+'sword.png'),image(base+'trail-spritesheet.webp').then(function(img){return img||image(base+'trail-spritesheet.png');}),json('palette.json',fallbackPalette),json('trail.json',fallbackTrail)]);
 function play(parent,done,options){
  var config=Object.assign({},defaults,window.FIREFLY_INTRO_CONFIG||{},options||{}),duration=Math.max(3000,Math.min(10000,Number(config.duration)||4300));
  var reduce=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:700px), (pointer:coarse)');
  var layer=document.createElement('div');layer.className='firefly-intro';layer.setAttribute('role','group');layer.setAttribute('aria-label','流萤斩击开场');
  var canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
  var title=document.createElement('div');title.className='firefly-title';var name=document.createElement('h2'),role=document.createElement('p');name.textContent=config.name;role.textContent=config.role;title.append(name,role);
  var skip=document.createElement('button');skip.type='button';skip.className='firefly-skip';skip.textContent='跳过动画';layer.append(canvas,title,skip);parent.append(layer);parent.classList.add('firefly-playing');skip.focus({preventScroll:true});
  var ctx=canvas.getContext('2d',{alpha:true}),frameId=0,finished=false,particles=[],history=[],w=0,h=0,dpr=1,mx=0,my=0,tx=0,ty=0,assets=null,start=0,burst=false,tiles=[],backdrop=document.createElement("canvas");
  function finish(){if(finished)return;finished=true;cancelAnimationFrame(frameId);particles.length=history.length=tiles.length=0;backdrop.width=backdrop.height=0;window.removeEventListener('resize',resize);layer.removeEventListener('pointermove',pointer);document.removeEventListener('keydown',key);reduce.removeEventListener('change',motion);layer.remove();done();}
  function key(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish();}}
  function pointer(e){tx=(e.clientX/w-.5)*10;ty=(e.clientY/h-.5)*8;}
  function motion(){if(reduce.matches){particles.length=history.length=0;start=performance.now();burst=true;}}
  function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,mobile.matches?1.25:2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
   backdrop.width=Math.ceil(w);backdrop.height=Math.ceil(h);var bg=backdrop.getContext('2d'),g=bg.createRadialGradient(w*.5,h*.42,0,w*.5,h*.42,Math.max(w,h)*.7);g.addColorStop(0,'#102e2d');g.addColorStop(.55,'#090c16');g.addColorStop(1,'#05070d');bg.fillStyle=g;bg.fillRect(0,0,w,h);
   var size=Math.max(mobile.matches?34:44,Math.ceil(Math.sqrt(w*h/(mobile.matches?280:600))));tiles=[];
   for(var y=0,row=0;y<h;y+=size,row++)for(var x=0,col=0;x<w;x+=size,col++){var seed=((col*73+row*137)%97)/97;tiles.push({x:x,y:y,w:Math.min(size,w-x),h:Math.min(size,h-y),delay:seed*.055,spin:(seed-.5)*1.2,fallStart:null});}
  }
  skip.addEventListener('click',function(e){e.stopPropagation();finish();});layer.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('keydown',key);window.addEventListener('resize',resize);reduce.addEventListener('change',motion);resize();
  function clamp(t){return Math.max(0,Math.min(1,t));}function ease(t){t=clamp(t);return t*t*(3-2*t);}function lerp(a,b,t){return a+(b-a)*t;}
  function emit(x,y,pal){var count=mobile.matches?36:90;for(var i=0;i<count;i++){var a=Math.random()*Math.PI*2,s=50+Math.random()*200;particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.75,age:0,size:1+Math.random()*2.3,color:i%3?pal.glow:pal.particle});}}
  var previous=0;
  function render(now){if(finished)return;var dt=Math.min(.035,(now-previous)/1000||0);previous=now;var staticMode=reduce.matches,total=staticMode?1800:duration,t=clamp((now-start)/total),pal=assets[2],manifest=assets[3],sword=assets[0],sheet=assets[1];
   ctx.clearRect(0,0,w,h);mx+=(tx-mx)*.08;my+=(ty-my)*.08;var length=Math.min(h*.67,w*(mobile.matches?1.12:.55),620),pivotX=w*.5,pivotY=h*.58,angle=.12,scale=1;
   if(!staticMode){var sweep=ease((t-.14)/.52);length=Math.hypot(w*.52,h*1.06)/.79;pivotX=w*.5;pivotY=h*1.04;angle=lerp(-1.95,1.95,sweep)+mx*.0005;scale=1;}
   // The grip stays at the bottom centre. Only the blade angle responds slightly to the pointer.
   layer.dataset.swordPivotX=pivotX.toFixed(2);layer.dataset.swordPivotY=pivotY.toFixed(2);layer.dataset.swordAngle=angle.toFixed(4);
   // Only the tiles cover the page: pixels cleared behind falling blocks expose the real resume.
   if(staticMode){ctx.drawImage(backdrop,0,0,w,h);}else{
    var elapsed=(now-start)/1000;
    tiles.forEach(function(tile){var cx=tile.x+tile.w/2,cy=tile.y+tile.h/2,tileAngle=Math.atan2(cx-pivotX,pivotY-cy);
     if(tile.fallStart===null&&t>=.14&&angle>=tileAngle)tile.fallStart=elapsed+tile.delay;
     var age=tile.fallStart===null?0:Math.max(0,elapsed-tile.fallStart),life=.58,fall=clamp(age/life);
     if(fall>=1)return;
     ctx.save();ctx.globalAlpha=1-Math.pow(fall,1.45);ctx.translate(cx+tile.spin*fall*12,cy+fall*fall*(h*.48+tile.h*3));ctx.rotate(tile.spin*fall);var shrink=1-fall*.5;ctx.scale(shrink,shrink);ctx.drawImage(backdrop,tile.x,tile.y,tile.w,tile.h,-tile.w/2,-tile.h/2,tile.w+.4,tile.h+.4);
     if(age>0){ctx.strokeStyle=pal.glow;ctx.globalAlpha*=.28*(1-fall);ctx.lineWidth=.7;ctx.strokeRect(-tile.w/2,-tile.h/2,tile.w,tile.h);}ctx.restore();
    });
   }
   var tipX=pivotX+Math.sin(angle)*length*.82,tipY=pivotY-Math.cos(angle)*length*.82;
   ctx.save();ctx.globalCompositeOperation='screen';
   // Combat reference 02:55–03:23: sharp cyan outer arc, golden crescent below it.
   if(!staticMode&&t>.14&&t<.82&&sheet){
    var active=t<.66,trailAngle=active?angle:1.95,fade=ease((t-.14)/.055)*(1-ease((t-.66)/.16));
    var time=(t-.14)/.68*manifest.duration,index=Math.min(manifest.frameCount-1,Math.floor(time*manifest.fps)),order=manifest.playbackOrder[index],fw=manifest.frameWidth,fh=manifest.frameHeight;
    var sx=(order%manifest.columns)*fw,sy=Math.floor(order/manifest.columns)*fh,segments=mobile.matches?20:32,outer=Math.min(length*.856,h*.98);
    var rings=[{r:outer*.98,span:1.46,width:length*.029,color:pal.main,key:'cyan',offset:-h*.025},{r:outer*.79,span:1.02,width:length*.045,color:pal.particle,key:'gold',offset:0}];
    rings.forEach(function(ring){var tail=Math.max(-1.95,trailAngle-ring.span),spanUsed=trailAngle-tail,steps=mobile.matches?28:44;
     function point(a,r){return [pivotX+Math.sin(a)*r,pivotY-Math.cos(a)*r+ring.offset];}
     function thickness(u){return ring.width*Math.pow(Math.sin(Math.PI*u*.92),.8);}
     ctx.save();ctx.globalAlpha=fade*.72;ctx.fillStyle=ring.color;ctx.beginPath();
     for(var i=0;i<=steps;i++){var u=i/steps,a=tail+spanUsed*u,p=point(a,ring.r+thickness(u)/2);if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}
     for(var i=steps;i>=0;i--){var u=i/steps,a=tail+spanUsed*u,p=point(a,ring.r-thickness(u)/2);ctx.lineTo(p[0],p[1]);}ctx.closePath();ctx.fill();
     var texture=manifest.layers[ring.key];
     for(var i=0;i<segments;i++){var u=(i+.5)/segments,a=tail+spanUsed*u,p=point(a,ring.r),arcWidth=ring.r*spanUsed/segments,thick=thickness(u);if(arcWidth<.1||thick<.1)continue;
      ctx.save();ctx.globalAlpha=fade*.62*Math.pow(u,.5);ctx.translate(p[0],p[1]);ctx.rotate(a);ctx.drawImage(sheet,sx+i*fw/segments,sy+texture.y,fw/segments,texture.height,-arcWidth/2,-thick,arcWidth+1.5,thick*2);ctx.restore();}
     ctx.beginPath();for(var i=0;i<=steps;i++){var u=i/steps,a=tail+spanUsed*u,p=point(a,ring.r+thickness(u)*.3);if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);}
     ctx.strokeStyle=ring.key==='cyan'?pal.glow:pal.core;ctx.lineWidth=ring.key==='cyan'?2.8:1.5;ctx.globalAlpha=fade*.85;ctx.stroke();ctx.restore();
    });
    if(active&&particles.length<(mobile.matches?48:110)&&Math.random()<.65){var a=angle-Math.random()*.35,r=outer*(.83+Math.random()*.17);particles.push({x:pivotX+Math.sin(a)*r,y:pivotY-Math.cos(a)*r,vx:-Math.cos(a)*(60+Math.random()*90),vy:-Math.sin(a)*70,life:.25+Math.random()*.5,age:0,size:.7+Math.random()*1.4,color:Math.random()<.4?pal.particle:pal.glow});}
   }
   if(!staticMode&&!burst&&t>.4){burst=true;emit(pivotX+Math.sin(angle)*length*.48,pivotY-Math.cos(angle)*length*.48,pal);}
   particles.forEach(function(p){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=28*dt;ctx.globalAlpha=Math.max(0,1-p.age/p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();});particles=particles.filter(function(p){return p.age<p.life;});ctx.restore();
   ctx.save();ctx.translate(pivotX,pivotY);ctx.rotate(angle);ctx.scale(scale,scale);ctx.globalAlpha=staticMode?1:1-ease((t-.65)/.08);if(sword){var sw=length*sword.width/sword.height;ctx.drawImage(sword,-sw*.5,-length*manifest.sword.anchor.y,sw,length);}ctx.restore();
   var titleAlpha=staticMode?ease(t/.3):ease((t-.76)/.1);title.style.opacity=titleAlpha;title.style.transform='translateY('+(staticMode?0:(1-titleAlpha)*16)+'px)';layer.style.opacity=1-ease((t-.9)/.1);
   if(t>=1)finish();else frameId=requestAnimationFrame(render);
  }
  ready.then(function(result){if(finished)return;assets=result;if(!ctx){finish();return;}start=previous=performance.now();frameId=requestAnimationFrame(render);});
  return {skip:finish};
 }
 window.FireflyIntro={ready:ready,play:play};
})();




