/* ═══════════════════════════════════════════════
   MINI MOVIE LOVE — script.js (Advanced Edition)
   ═══════════════════════════════════════════════ */

/* ── 1. SPARKLE CURSOR ── */
(function initSparkle() {
  var canvas  = document.getElementById('sparkleCanvas');
  var ctx     = canvas.getContext('2d');
  var W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    for (var i = 0; i < 3; i++) spawnParticle(mouse.x, mouse.y);
  });

  var colors = ['#e8b86d','#f5e6d3','#e0405a','#c8508a','#fff9f0'];

  function spawnParticle(x, y) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3 - 1.5,
      r:  Math.random() * 3 + 1,
      life: 1,
      decay: 0.025 + Math.random() * 0.04,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: Math.random() < 0.5 ? 'circle' : 'star',
      rot: Math.random() * Math.PI * 2,
    });
  }

  function drawStar(ctx, x, y, r, c) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(c.rot + performance.now() * 0.002);
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2;
      var ax = Math.cos(a) * r * 2, ay = Math.sin(a) * r * 2;
      var bx = Math.cos(a + Math.PI/4) * r, by = Math.sin(a + Math.PI/4) * r;
      if (i === 0) { ctx.moveTo(ax, ay); } else { ctx.lineTo(ax, ay); }
      ctx.lineTo(bx, by);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.05; // gravity
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      ctx.globalAlpha = p.life * p.life;
      ctx.fillStyle   = p.color;
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawStar(ctx, p.x, p.y, p.r, p);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── 2. SCROLL PROGRESS BAR ── */
(function initProgress() {
  var bar = document.getElementById('progressBar');
  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrollTop / docH * 100) + '%';
  }, { passive: true });
})();

/* ── 3. SCENE NAV DOTS ── */
(function initDots() {
  var dots  = document.querySelectorAll('.dot');
  var scenes = document.querySelectorAll('.scene');

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      var target = document.getElementById(dot.dataset.scene);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  var dotObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        dots.forEach(function(d) { d.classList.remove('active'); });
        var id = entry.target.id;
        var active = document.querySelector('.dot[data-scene="' + id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  scenes.forEach(function(s) { dotObserver.observe(s); });
})();

/* ── 4. STAR FIELD (intro) ── */
(function initStars() {
  var container = document.getElementById('starField');
  if (!container) return;
  for (var i = 0; i < 180; i++) {
    var star = document.createElement('div');
    star.classList.add('star');
    var size = Math.random() * 2.5 + 0.5;
    star.style.cssText = [
      'width:' + size + 'px',
      'height:' + size + 'px',
      'left:' + (Math.random() * 100) + '%',
      'top:' + (Math.random() * 100) + '%',
      'animation-duration:' + (2 + Math.random() * 5) + 's',
      'animation-delay:' + (Math.random() * 5) + 's',
    ].join(';');
    container.appendChild(star);
  }
})();

/* ── 5. INTRO TITLE CHAR ANIMATION ── */
(function initCharAnim() {
  var title = document.querySelector('.anim-chars');
  if (!title) return;
  var text = title.textContent;
  title.textContent = '';
  text.split('').forEach(function(ch, i) {
    var span = document.createElement('span');
    span.classList.add('char');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.transitionDelay = (0.6 + i * 0.07) + 's';
    title.appendChild(span);
  });
  // Trigger
  setTimeout(function() { title.classList.add('chars-visible'); }, 100);
})();

/* ── 6. SCROLL INTERSECTION → VISIBLE ── */
(function initScrollReveal() {
  var contents = document.querySelectorAll('.scene-content');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.closest('#scene-finale')) {
          revealFinaleName();
          startFloatingHearts();
          startFinaleParticles();
        }
      }
    });
  }, { threshold: 0.35 });
  contents.forEach(function(el) { observer.observe(el); });
})();

/* ── 7. PARALLAX ON SCROLL ── */
(function initParallax() {
  window.addEventListener('scroll', function() {
    var scrollY = window.scrollY;
    var kbEls = document.querySelectorAll('.ken-burns');
    kbEls.forEach(function(el) {
      var section = el.closest('.scene');
      if (!section) return;
      var rect = section.getBoundingClientRect();
      var ratio = rect.top / window.innerHeight;
      el.style.transform = 'translateY(' + (ratio * 40) + 'px) scale(1.12)';
    });
  }, { passive: true });
})();

/* ── 8. FIREFLIES (scene 4) ── */
(function initFireflies() {
  var container = document.getElementById('fireflies');
  if (!container) return;
  for (var i = 0; i < 30; i++) {
    var ff = document.createElement('div');
    ff.classList.add('firefly');
    var dx  = (Math.random() - 0.5) * 200 + 'px';
    var dy  = (Math.random() - 0.5) * 200 + 'px';
    var dx2 = (Math.random() - 0.5) * 300 + 'px';
    var dy2 = (Math.random() - 0.5) * 300 + 'px';
    ff.style.cssText = [
      'left:' + (Math.random() * 100) + '%',
      'top:' + (Math.random() * 100) + '%',
      '--dx:' + dx, '--dy:' + dy,
      '--dx2:' + dx2, '--dy2:' + dy2,
      'animation-duration:' + (4 + Math.random() * 6) + 's',
      'animation-delay:' + (Math.random() * 5) + 's',
    ].join(';');
    container.appendChild(ff);
  }
})();

/* ── 9. FLOATING HEARTS ── */
var heartsInterval = null;

function startFloatingHearts() {
  if (heartsInterval) return;
  var container = document.getElementById('heartsContainer');
  var emojis = ['❤', '🤍', '✨', '💕', '❤'];

  heartsInterval = setInterval(function() {
    var h = document.createElement('div');
    h.classList.add('floating-heart');
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left  = (Math.random() * 100) + 'vw';
    h.style.fontSize  = (10 + Math.random() * 28) + 'px';
    h.style.animationDuration = (5 + Math.random() * 7) + 's';
    h.style.filter = 'drop-shadow(0 0 6px rgba(220,60,80,0.6))';
    container.appendChild(h);
    setTimeout(function() { if (h.parentNode) h.parentNode.removeChild(h); }, 12000);
  }, 500);
}

/* ── 10. FINALE NAME REVEAL ── */
function revealFinaleName() {
  var name = document.getElementById('finaleName');
  if (name && !name.classList.contains('revealed')) {
    setTimeout(function() { name.classList.add('revealed'); }, 200);
  }
}

/* ── 11. FINALE PARTICLE CANVAS ── */
var finaleStarted = false;

function startFinaleParticles() {
  if (finaleStarted) return;
  finaleStarted = true;

  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, pts = [];

  function resize() {
    var section = canvas.closest('.scene');
    if (!section) return;
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var colors2 = ['rgba(232,184,109,', 'rgba(245,230,211,', 'rgba(220,80,100,', 'rgba(200,130,160,'];

  function spawn() {
    pts.push({
      x: Math.random() * W,
      y: H + 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(0.6 + Math.random() * 1.4),
      r: 1.5 + Math.random() * 3,
      life: 1,
      decay: 0.004 + Math.random() * 0.006,
      color: colors2[Math.floor(Math.random() * colors2.length)],
    });
  }

  setInterval(spawn, 80);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = pts.length - 1; i >= 0; i--) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) { pts.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle   = p.color + p.life + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── 12. MUSIC PLAYER ── */
(function initMusic() {
  var audio   = document.getElementById('bgMusic');
  var btn     = document.getElementById('musicBtn');
  var icon    = document.getElementById('musicIcon');
  var playing = false;

  function setPlayingUI() {
    btn.querySelector('#musicIcon').outerHTML =
      '<span class="music-bars" id="musicIcon"><span></span><span></span><span></span><span></span></span>';
    icon = document.getElementById('musicIcon');
  }
  function setPausedUI() {
    btn.querySelector('#musicIcon').outerHTML =
      '<span class="music-icon-paused" id="musicIcon">♪</span>';
    icon = document.getElementById('musicIcon');
  }
  function tryPlay() {
    if (!playing) {
      audio.play().then(function() { playing = true; setPlayingUI(); }).catch(function(){});
    }
  }

  btn.addEventListener('click', function() {
    if (playing) { audio.pause(); playing = false; setPausedUI(); }
    else         { tryPlay(); }
  });

  document.addEventListener('scroll',  function handler() { tryPlay(); document.removeEventListener('scroll', handler); }, { passive:true, once:true });
  document.addEventListener('keydown', function handler() { tryPlay(); document.removeEventListener('keydown', handler); }, { once:true });
})();
