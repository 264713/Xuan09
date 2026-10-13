(function () {
  'use strict';
  var mobile = matchMedia('(max-width:900px), (hover:none) and (pointer:coarse)');
  var reduce = matchMedia('(prefers-reduced-motion:reduce)');
  var fine = matchMedia('(hover:hover) and (pointer:fine)');
  var entered = false, mayEnter = false;
  var posterGeneration = 0;
  var scene = document.createElement('div'); scene.id = 'scene'; scene.setAttribute('aria-hidden','true'); document.body.prepend(scene);
  function prepareImage(src, success) { return new Promise(function (resolve) { var image = new Image(), done = false; var timer = setTimeout(finish,8000); function finish() { if (!done) { done=true;clearTimeout(timer);resolve(); } } image.onload=function(){ (image.decode ? image.decode() : Promise.resolve()).then(function(){if(success)success();finish();},finish); }; image.onerror=finish; image.src=src; }); }
  function preparePoster() { var generation=++posterGeneration; var src=mobile.matches?'assets/background-mobile.webp':'assets/desktop-poster.webp'; return prepareImage(src,function(){if(generation===posterGeneration){scene.style.setProperty('--scene-poster','url("'+new URL(src,document.baseURI).href+'")');scene.classList.add('has-poster');}}); }
  mobile.addEventListener('change',function(){preparePoster();});
  // Audio is independent of the static background and never blocks entry.
  var music = new Audio('assets/background-audio.m4a');
  music.loop = true; music.preload = 'auto'; music.volume = .01;
  var musicEnabled = true, musicReady = false, musicFailed = false, volumeFrame = 0;
  var musicButton = document.createElement('button');
  musicButton.id = 'musicToggle'; musicButton.type = 'button'; musicButton.hidden = true;
  document.body.appendChild(musicButton);
  function syncMusic() {
    var playing = !music.paused;
    musicButton.textContent = musicFailed ? '重试音乐' : playing ? '关闭音乐' : '播放音乐';
    musicButton.setAttribute('aria-pressed', String(playing));
  }
  function playMusic() {
    if (!musicEnabled || document.hidden) return;
    if (music.error) music.load();
    var result = music.play();
    if (result) result.catch(function (error) {
      if (error.name !== 'AbortError') musicFailed = true;
      syncMusic();
    });
  }
  music.addEventListener('playing', function () {
    musicFailed = false; cancelAnimationFrame(volumeFrame);
    var from = music.volume, started = performance.now();
    function ramp(now) {
      if (music.paused) return;
      var t = Math.max(0, Math.min(1, (now - started) / 2000));
      music.volume = from + (.7 - from) * t;
      if (t < 1) volumeFrame = requestAnimationFrame(ramp);
    }
    volumeFrame = requestAnimationFrame(ramp); syncMusic();
  });
  music.addEventListener('pause', function () { cancelAnimationFrame(volumeFrame); syncMusic(); });
  music.addEventListener('error', function () { musicFailed = true; syncMusic(); });
  musicButton.addEventListener('click', function () {
    if (!music.paused) { musicEnabled = false; music.pause(); }
    else { musicEnabled = true; music.volume = .01; playMusic(); }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) music.pause();
    else if (musicReady && musicEnabled) playMusic();
  });
  syncMusic();
  var screen=document.createElement('div');screen.id='welcomeScreen';screen.tabIndex=-1;screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-labelledby','welcomeTitle');
  screen.innerHTML='<span class="welcome-corner">DENG YANXUAN / PORTFOLIO</span><div class="welcome-center"><p class="welcome-kicker">WELCOME TO MY WORLD</p><h2 class="welcome-name" id="welcomeTitle">邓俨轩</h2><p class="welcome-subtitle">DIGITAL MEDIA ART</p></div><div class="welcome-bottom"><div class="welcome-progress" role="progressbar" aria-label="页面准备进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="progress-track" cx="32" cy="32" r="28"/><circle class="progress-fill" cx="32" cy="32" r="28" pathLength="100"/></svg><span id="welcomePercent">0%</span></div><button id="welcomeEnter" type="button" disabled><span id="welcomeStatus">点击任意位置，继续探索</span><span class="welcome-arrow" aria-hidden="true">↑</span></button></div>';
  document.body.appendChild(screen);document.documentElement.classList.add('welcome-locked');
  var saved=[];Array.prototype.forEach.call(document.body.children,function(node){if(node!==screen&&!/^(SCRIPT|STYLE|LINK)$/.test(node.tagName)){saved.push({node:node,inert:node.inert});node.inert=true;}});screen.focus({preventScroll:true});
  var fillTexts=screen.querySelectorAll('.welcome-name,.welcome-corner,.welcome-kicker,.welcome-subtitle,#welcomePercent,#welcomeStatus,.welcome-arrow'), panFrame=0,x=0,y=0,tx=0,ty=0;
  function sizeFill(){fillTexts.forEach(function(text){text.style.setProperty('--welcome-fill-width',Math.ceil(Math.max(text.clientWidth+40,(text.clientHeight+40)*2.5))+'px');});}
  var observer=new ResizeObserver(sizeFill);fillTexts.forEach(function(text){observer.observe(text);});sizeFill();
  function paint(){x+=(tx-x)*.12;y+=(ty-y)*.12;var done=Math.abs(tx-x)+Math.abs(ty-y)<.03;if(done){x=tx;y=ty;}screen.style.setProperty('--welcome-pan-x',x.toFixed(2)+'px');screen.style.setProperty('--welcome-pan-y',y.toFixed(2)+'px');panFrame=done?0:requestAnimationFrame(paint);}
  function schedule(){if(!panFrame)panFrame=requestAnimationFrame(paint);}
  function reset(){tx=ty=0;if(reduce.matches||mobile.matches||!fine.matches)x=y=0;schedule();}
  screen.addEventListener('pointermove',function(e){if(entered||mobile.matches||reduce.matches||!fine.matches||e.pointerType!=='mouse')return;tx=-Math.max(-1,Math.min(1,e.clientX/innerWidth*2-1))*14;ty=-Math.max(-1,Math.min(1,e.clientY/innerHeight*2-1))*10;schedule();});
  screen.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);reduce.addEventListener('change',reset);mobile.addEventListener('change',reset);
  var button=document.getElementById('welcomeEnter'),progress=screen.querySelector('.welcome-progress'),value=0;
  function setProgress(n){value=n;progress.setAttribute('aria-valuenow',n);progress.style.setProperty('--progress',n);document.getElementById('welcomePercent').textContent=n+'%';}
  function delay(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}
  async function advance(to,ms){var from=value;for(var i=from+1;i<=to;i++){await delay(ms/(to-from));setProgress(i);}}
  async function ready(){await advance(69,650);musicReady=true;playMusic();await advance(78,220);await delay(250);await advance(91,280);await delay(250);await advance(100,220);await delay(250);screen.classList.add('is-ready');await delay(500);mayEnter=true;button.disabled=false;screen.classList.add('can-enter');}
  var domReady=document.readyState==='loading'?new Promise(function(r){document.addEventListener('DOMContentLoaded',r,{once:true});}):Promise.resolve();
  Promise.all([domReady,prepareImage('assets/avatar.jpg'),window.FireflyIntro.ready,document.fonts?document.fonts.ready:Promise.resolve(),prepareImage('assets/welcome-text.webp',function(){screen.classList.add('has-image');}),preparePoster()]).then(ready);
  function enter(){if(entered||!mayEnter)return;entered=true;musicButton.hidden=false;playMusic();cancelAnimationFrame(panFrame);observer.disconnect();window.removeEventListener('blur',reset);reduce.removeEventListener('change',reset);mobile.removeEventListener('change',reset);document.documentElement.classList.add('entering-resume');window.FireflyIntro.play(screen,function(){screen.remove();document.documentElement.classList.remove('welcome-locked','entering-resume');saved.forEach(function(item){item.node.inert=item.inert;});var target=document.querySelector('.brand');if(target)target.focus({preventScroll:true});});}
  screen.addEventListener('click',enter);screen.addEventListener('keydown',function(e){if(entered)return;if(['Enter',' ','Escape'].indexOf(e.key)!==-1){e.preventDefault();enter();}if(e.key==='Tab'){e.preventDefault();(mayEnter?button:screen).focus();}});
  var touchY=null;screen.addEventListener('touchstart',function(e){touchY=e.touches[0].clientY;},{passive:true});screen.addEventListener('touchend',function(e){if(touchY!==null&&touchY-e.changedTouches[0].clientY>45)enter();touchY=null;},{passive:true});
})();

