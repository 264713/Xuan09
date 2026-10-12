(function () {
  'use strict';
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var canvas = document.createElement('canvas');
  canvas.id = 'cursorStarlight';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1100;';
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.appendChild(canvas);
  var particles = [], frame = 0, previous = null, lastEmit = 0;
  var colors = ['205,239,255', '215,197,255', '255,246,214'];
  function enabled() { return fine.matches && !reduced.matches && !document.hidden; }
  function resize() {
    var ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function clear() {
    cancelAnimationFrame(frame); frame = 0; particles.length = 0; previous = null;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  function sync() { canvas.hidden = !enabled(); if (!enabled()) clear(); }
  function draw(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter(function (p) { return now - p.born < p.life; });
    particles.forEach(function (p) {
      var t = Math.max(0, (now - p.born) / p.life);
      var x = p.x + p.vx * t, y = p.y + p.vy * t + 9 * t * t;
      var radius = p.size * (1 - t * .7);
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.angle + t * .5);
      ctx.fillStyle = 'rgba(' + p.color + ',' + ((1 - t) * (1 - t) * .8) + ')';
      ctx.shadowColor = 'rgba(' + p.color + ',.55)'; ctx.shadowBlur = 5;
      ctx.beginPath();
      if (p.star) {
        for (var i = 0; i < 8; i++) {
          var a = i * Math.PI / 4, r = i % 2 ? radius * .24 : radius;
          if (!i) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
      } else ctx.arc(0, 0, radius * .4, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    });
    frame = particles.length ? requestAnimationFrame(draw) : 0;
  }
  window.addEventListener('pointermove', function (event) {
    if (!enabled() || event.pointerType !== 'mouse') return;
    var now = performance.now();
    if (!previous) { previous = { x: event.clientX, y: event.clientY }; return; }
    var dx = event.clientX - previous.x, dy = event.clientY - previous.y;
    var distance = Math.hypot(dx, dy);
    if (distance < 3 || now - lastEmit < 22) return;
    var count = Math.min(4, Math.max(1, Math.ceil(distance / 12)));
    for (var i = 0; i < count; i++) {
      var fraction = (i + 1) / (count + 1);
      particles.push({
        x: previous.x + dx * fraction, y: previous.y + dy * fraction,
        vx: -dx / distance * 9 + (Math.random() - .5) * 22,
        vy: -dy / distance * 9 + (Math.random() - .5) * 18,
        born: now, life: 450 + Math.random() * 350,
        size: 2 + Math.random() * 3, star: Math.random() > .45,
        angle: Math.random() * Math.PI, color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    if (particles.length > 80) particles.splice(0, particles.length - 80);
    previous = { x: event.clientX, y: event.clientY }; lastEmit = now;
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', function () { previous = null; });
  window.addEventListener('blur', clear);
  window.addEventListener('resize', function () { clear(); resize(); });
  document.addEventListener('visibilitychange', sync);
  fine.addEventListener('change', sync); reduced.addEventListener('change', sync);
  window.addEventListener('beforeprint', clear);
  resize(); sync();
})();
