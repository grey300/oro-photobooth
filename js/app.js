(function () {
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */
  var LAYOUTS = {
    '1x2': { count: 2, cols: 1, label: '1 × 2' },
    '1x3': { count: 3, cols: 1, label: '1 × 3' },
    '1x4': { count: 4, cols: 1, label: '1 × 4' },
    '2x2': { count: 4, cols: 2, label: '2 × 2' },
    '2x3': { count: 6, cols: 2, label: '2 × 3' },
    '2x4': { count: 8, cols: 2, label: '2 × 4' },
    '3x3': { count: 9, cols: 3, label: '3 × 3' }
  };

  var FILTERS = {
    none:  { cssFilter: 'none', overlay: 'transparent', blend: 'normal', opacity: 0 },
    warm:  { cssFilter: 'brightness(1.1) saturate(1.35) sepia(0.18) contrast(1.03)', overlay: '#ff9d52', blend: 'soft-light', opacity: 0.22 },
    cold:  { cssFilter: 'brightness(1.05) contrast(1.15) saturate(0.85)', overlay: '#4fa6ff', blend: 'soft-light', opacity: 0.28 },
    fiji:  { cssFilter: 'saturate(1.45) contrast(1.05) brightness(1.12) sepia(0.08)', overlay: '#ff6fa5', blend: 'soft-light', opacity: 0.18 },
    canon: { cssFilter: 'brightness(1.16) contrast(0.92) saturate(1.08)', overlay: '#ffe8c2', blend: 'soft-light', opacity: 0.3 }
  };

  var SOLID_COLORS = [
    { id: 'white',    label: 'White',         value: '#ffffff' },
    { id: 'pink',     label: 'Pink',          value: '#ffc4d6' },
    { id: 'sky',      label: 'Sky Blue',      value: '#bfe3ff' },
    { id: 'purple',   label: 'Purple',        value: '#d9c6ff' },
    { id: 'butter',   label: 'Butter Yellow', value: '#fff1b8' },
    { id: 'mint',     label: 'Mint',          value: '#c9f0dd' },
    { id: 'peach',    label: 'Peach',         value: '#ffd8c2' },
    { id: 'rose',     label: 'Rose',          value: '#f7a8b8' },
    { id: 'cream',    label: 'Cream',         value: '#fff8e7' },
    { id: 'charcoal', label: 'Charcoal',      value: '#2b2b3c' }
  ];

  // Pattern frames carry `stripe`/`dots` params mirroring their CSS so the
  // export can redraw them natively — html2canvas can't render
  // repeating-linear-gradient or sized radial-gradient backgrounds.
  var STRIPE_PATTERNS = [
    { id: 'sky-pink',    label: 'Sky Blue + Pink',      css: 'repeating-linear-gradient(45deg,#bfe3ff 0px,#bfe3ff 16px,#ffc4d6 16px,#ffc4d6 32px)', stripe: { c1: '#bfe3ff', c2: '#ffc4d6', size: 16 } },
    { id: 'butter-pink', label: 'Butter Yellow + Pink', css: 'repeating-linear-gradient(45deg,#fff1b8 0px,#fff1b8 16px,#ffc4d6 16px,#ffc4d6 32px)', stripe: { c1: '#fff1b8', c2: '#ffc4d6', size: 16 } },
    { id: 'blue-white',  label: 'Blue + White',         css: 'repeating-linear-gradient(45deg,#bfe3ff 0px,#bfe3ff 16px,#ffffff 16px,#ffffff 32px)', stripe: { c1: '#bfe3ff', c2: '#ffffff', size: 16 } },
    { id: 'mint-white',  label: 'Mint + White',         css: 'repeating-linear-gradient(45deg,#c9f0dd 0px,#c9f0dd 16px,#ffffff 16px,#ffffff 32px)', stripe: { c1: '#c9f0dd', c2: '#ffffff', size: 16 } },
    { id: 'lav-white',   label: 'Lavender + White',     css: 'repeating-linear-gradient(45deg,#d9c6ff 0px,#d9c6ff 16px,#ffffff 16px,#ffffff 32px)', stripe: { c1: '#d9c6ff', c2: '#ffffff', size: 16 } },
    { id: 'peach-cream', label: 'Peach + Cream',        css: 'repeating-linear-gradient(45deg,#ffd8c2 0px,#ffd8c2 16px,#fff8e7 16px,#fff8e7 32px)', stripe: { c1: '#ffd8c2', c2: '#fff8e7', size: 16 } },
    { id: 'candy-cane',  label: 'Candy Cane',           css: 'repeating-linear-gradient(45deg,#ff8fa8 0px,#ff8fa8 16px,#ffffff 16px,#ffffff 32px)', stripe: { c1: '#ff8fa8', c2: '#ffffff', size: 16 } }
  ];

  var DOT_PATTERNS = [
    { id: 'dot-pink',   label: 'Pink Dots',   css: 'radial-gradient(circle, #ff8fb1 30%, transparent 32%) 0 0/22px 22px, #fff5f8', dots: { color: '#ff8fb1', bg: '#fff5f8', cell: 22, radius: 5 } },
    { id: 'dot-blue',   label: 'Sky Dots',    css: 'radial-gradient(circle, #5fb6ff 30%, transparent 32%) 0 0/22px 22px, #eef8ff', dots: { color: '#5fb6ff', bg: '#eef8ff', cell: 22, radius: 5 } },
    { id: 'dot-purple', label: 'Purple Dots', css: 'radial-gradient(circle, #b48bff 30%, transparent 32%) 0 0/22px 22px, #f6f0ff', dots: { color: '#b48bff', bg: '#f6f0ff', cell: 22, radius: 5 } },
    { id: 'dot-gold',   label: 'Gold Dots',   css: 'radial-gradient(circle, #f3c969 30%, transparent 32%) 0 0/22px 22px, #fffaf0', dots: { color: '#f3c969', bg: '#fffaf0', cell: 22, radius: 5 } },
    { id: 'dot-mint',   label: 'Mint Dots',   css: 'radial-gradient(circle, #5fd6a2 30%, transparent 32%) 0 0/22px 22px, #effaf4', dots: { color: '#5fd6a2', bg: '#effaf4', cell: 22, radius: 5 } },
    { id: 'dot-coral',  label: 'Coral Dots',  css: 'radial-gradient(circle, #ff7f66 30%, transparent 32%) 0 0/22px 22px, #fff3ef', dots: { color: '#ff7f66', bg: '#fff3ef', cell: 22, radius: 5 } },
    { id: 'dot-ink',    label: 'Ink Dots',    css: 'radial-gradient(circle, #3a3a4c 30%, transparent 32%) 0 0/22px 22px, #f2f2f7', dots: { color: '#3a3a4c', bg: '#f2f2f7', cell: 22, radius: 5 } }
  ];

  var CHECKER_PATTERNS = [
    { id: 'check-pink',   label: 'Pink Check',   css: 'conic-gradient(#ffc4d6 90deg, #ffffff 90deg 180deg, #ffc4d6 180deg 270deg, #ffffff 270deg) 0 0/28px 28px', checker: { c1: '#ffc4d6', c2: '#ffffff', cell: 14 } },
    { id: 'check-sky',    label: 'Sky Check',    css: 'conic-gradient(#bfe3ff 90deg, #ffffff 90deg 180deg, #bfe3ff 180deg 270deg, #ffffff 270deg) 0 0/28px 28px', checker: { c1: '#bfe3ff', c2: '#ffffff', cell: 14 } },
    { id: 'check-butter', label: 'Butter Check', css: 'conic-gradient(#fff1b8 90deg, #ffffff 90deg 180deg, #fff1b8 180deg 270deg, #ffffff 270deg) 0 0/28px 28px', checker: { c1: '#fff1b8', c2: '#ffffff', cell: 14 } },
    { id: 'check-retro',  label: 'Retro Check',  css: 'conic-gradient(#2b2b3c 90deg, #fff8e7 90deg 180deg, #2b2b3c 180deg 270deg, #fff8e7 270deg) 0 0/28px 28px', checker: { c1: '#2b2b3c', c2: '#fff8e7', cell: 14 } }
  ];

  var ALL_PATTERNS = STRIPE_PATTERNS.concat(DOT_PATTERNS).concat(CHECKER_PATTERNS);

  // Each item is [emoji, search keywords].
  var STICKER_CATEGORIES = [
    { name: 'Hearts', items: [
      ['💖','sparkling heart pink love'], ['💕','two hearts pink love'], ['❤️','red heart love'],
      ['💗','growing heart pink love'], ['💘','heart arrow cupid love'], ['💝','heart ribbon gift love'],
      ['💞','revolving hearts love'], ['🧡','orange heart love'], ['💛','yellow heart love'],
      ['💚','green heart love'], ['💙','blue heart love'], ['💜','purple heart love'], ['🖤','black heart love']
    ]},
    { name: 'Stars & Sparkles', items: [
      ['⭐','star yellow'], ['🌟','glowing star shine'], ['💫','dizzy star swirl halo'], ['✨','sparkles shine glitter'],
      ['🌠','shooting star wish'], ['🎇','sparkler firework'], ['🎆','fireworks celebration']
    ]},
    { name: 'Party', items: [
      ['🎉','party popper confetti celebrate'], ['🎊','confetti ball party'], ['🎈','balloon party birthday'],
      ['🎂','birthday cake party'], ['🎁','gift present box'], ['🪩','disco ball mirror dance'], ['🥳','party face celebrate hat']
    ]},
    { name: 'Weather & Sky', items: [
      ['☁️','cloud white sky'], ['⛅','sun behind cloud sky'], ['🌥️','cloudy sun sky'], ['🌈','rainbow colorful sky'],
      ['☀️','sun sunny bright'], ['🌙','moon crescent night'], ['⚡','lightning bolt thunder'], ['❄️','snowflake snow winter cold'],
      ['🔥','fire flame hot lit'], ['💧','water drop rain']
    ]},
    { name: 'Flowers & Nature', items: [
      ['🌸','cherry blossom pink flower'], ['🌺','hibiscus red flower'], ['🌷','tulip pink flower'],
      ['🌼','daisy blossom yellow flower'], ['🌻','sunflower yellow flower'], ['🌹','rose red flower'],
      ['💐','bouquet flowers'], ['🍀','clover luck four leaf'], ['🌿','herb leaf green plant'],
      ['🌵','cactus desert plant'], ['🌴','palm tree beach tropical']
    ]},
    { name: 'Cute Things', items: [
      ['🎀','ribbon bow pink'], ['🪢','knot rope'], ['👑','crown king queen royal'], ['💎','gem diamond jewel'],
      ['🕶️','sunglasses cool shades'], ['🧸','teddy bear plush toy'], ['🫧','bubbles soap'], ['🍭','lollipop candy sweet']
    ]},
    { name: 'Animals', items: [
      ['🦋','butterfly wings'], ['🐱','cat kitten meow'], ['🐶','dog puppy woof'], ['🐰','rabbit bunny'],
      ['🐼','panda bear'], ['🐨','koala bear'], ['🦊','fox'], ['🐸','frog green'], ['🐥','chick baby bird'],
      ['🦄','unicorn magic'], ['🐢','turtle slow'], ['🐙','octopus sea'], ['🦖','dinosaur trex']
    ]},
    { name: 'Faces', items: [
      ['😊','smile happy blush'], ['😄','grin happy laugh'], ['🥰','smiling hearts love adore'],
      ['😎','cool sunglasses'], ['🤩','star struck wow excited'], ['😋','yummy tongue tasty'],
      ['😜','wink tongue silly'], ['🤪','zany crazy silly goofy'], ['😇','angel halo innocent'],
      ['😏','smirk sly'], ['🙃','upside down silly'], ['😭','crying sob tears'], ['🤯','mind blown explode'],
      ['😴','sleep zzz tired'], ['🤓','nerd glasses geek'], ['😈','devil purple evil grin']
    ]},
    { name: 'Hands', items: [
      ['👍','thumbs up like good'], ['✌️','peace victory'], ['🤘','rock horns metal'], ['🤙','call me shaka hang loose'],
      ['👏','clap applause'], ['🙌','raised hands hooray praise'], ['💪','muscle strong flex'],
      ['🫶','heart hands love'], ['🤞','fingers crossed luck'], ['👋','wave hello hi bye']
    ]},
    { name: 'Food & Drink', items: [
      ['🍕','pizza slice'], ['🍔','burger hamburger'], ['🍟','fries chips'], ['🌮','taco mexican'],
      ['🍩','donut doughnut sweet'], ['🍦','ice cream soft serve'], ['🧁','cupcake muffin sweet'],
      ['🍓','strawberry fruit red'], ['🍉','watermelon fruit'], ['🍒','cherries fruit red'],
      ['🥑','avocado green'], ['☕','coffee tea cup hot'], ['🧋','boba bubble tea milk'], ['🍿','popcorn movie snack']
    ]},
    { name: 'Fun & Games', items: [
      ['📸','camera photo flash'], ['🎧','headphones music'], ['🎮','game controller video games'],
      ['🎸','guitar rock music'], ['🎤','microphone sing karaoke'], ['🎨','art palette paint'],
      ['🏀','basketball hoops'], ['⚾','baseball'], ['🎾','tennis ball'], ['🚀','rocket space launch'],
      ['✈️','airplane travel fly'], ['💯','hundred perfect score'], ['💬','speech bubble chat'], ['💤','zzz sleep']
    ]},
    { name: 'Trending — Football Fever', items: [
      ['⚽','football soccer ball'], ['🏆','trophy winner champion cup'], ['🥅','goal net'],
      ['🏅','medal winner sports'], ['📣','megaphone cheer'], ['🧤','gloves goalkeeper keeper']
    ]}
  ];

  var STEP_ORDER = ['layout', 'camera', 'customize', 'export'];

  /* ============================================================
     STATE
     ============================================================ */
  function defaultState() {
    return {
      page: 'landing',
      prevPage: null,
      layout: null,
      filter: 'none',
      bg: 'none',
      burst: false,
      framePad: 16,
      mirrored: true,
      stream: null,
      photos: [],
      frame: { type: 'solid', value: '#ffffff' },
      stickers: [],
      texts: [],
      dateStampOn: true,
      selectedId: null,
      capturing: false,
      exportDataURL: null
    };
  }

  var state = defaultState();
  var audioCtx = null;

  /* ============================================================
     UTILITIES
     ============================================================ */
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function uid() { return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function formatDateStamp() {
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var d = new Date();
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  function updateAllProgressDots() {
    ['progress-dots', 'progress-dots-2', 'progress-dots-3', 'progress-dots-4'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '';
      var currentIdx = STEP_ORDER.indexOf(state.page);
      STEP_ORDER.forEach(function (step, i) {
        var dot = document.createElement('span');
        dot.className = 'dot' + (i <= currentIdx ? ' filled' : '') + (i === currentIdx ? ' current' : '');
        el.appendChild(dot);
      });
    });
  }

  function goToPage(name) {
    var prev = state.page;
    state.prevPage = prev;
    if (prev === 'camera' && name !== 'camera') stopCamera();

    $all('.page').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('page-' + name).classList.add('active');
    state.page = name;
    updateAllProgressDots();

    if (name === 'camera')    { resetCaptureUI(); initCamera(); }
    if (name === 'customize') { buildStripSlots(); ensureDateStamp(); applyFrame(); renderStickerLayer(); renderTextLayer(); }
    if (name === 'export')    { generateExportImage(); }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ============================================================
     PAGE 1 — LANDING
     ============================================================ */
  document.getElementById('btn-start').addEventListener('click', function () {
    goToPage('layout');
  });

  /* ============================================================
     PAGE 2 — LAYOUT SELECTION
     ============================================================ */
  $all('.layout-card').forEach(function (card) {
    card.addEventListener('click', function () {
      $all('.layout-card').forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      state.layout = card.getAttribute('data-layout');
      setTimeout(function () { goToPage('camera'); }, 480);
    });
  });

  /* ============================================================
     PAGE 3 — CAMERA
     ============================================================ */
  var videoEl      = document.getElementById('video-preview');
  var filterOverlay = document.getElementById('filter-overlay');
  var flashLayer   = document.getElementById('flash-layer');
  var countdownNum = document.getElementById('countdown-num');
  var shotIndicator = document.getElementById('shot-indicator');
  var cameraStatus = document.getElementById('camera-status');
  var btnCapture   = document.getElementById('btn-capture');
  var thumbRow     = document.getElementById('thumb-row');
  var cameraSub    = document.getElementById('camera-sub');

  function resetCaptureUI() {
    state.photos = [];
    state.capturing = false;
    thumbRow.innerHTML = '';
    shotIndicator.classList.remove('show');
    btnCapture.disabled = false;
    btnCapture.textContent = '📸 Say Datshi!';
    countdownNum.textContent = '';
    cameraSub.textContent = "Pick a filter, then say Datshi when you're ready.";
  }

  function applyFilterToPreview(key) {
    var f = FILTERS[key];
    videoEl.style.filter = f.cssFilter;
    filterOverlay.style.background = f.overlay;
    filterOverlay.style.mixBlendMode = f.blend;
    filterOverlay.style.opacity = f.opacity;
  }

  $all('#filter-row .filter-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $all('#filter-row .filter-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      state.filter = chip.getAttribute('data-filter');
      applyFilterToPreview(state.filter);
    });
  });

  function showCameraStatus(html) {
    cameraStatus.innerHTML = html;
    cameraStatus.style.display = 'flex';
  }
  function hideCameraStatus() { cameraStatus.style.display = 'none'; }

  function initCamera() {
    showCameraStatus('<div class="spinner"></div><p style="font-size:.85rem;color:var(--text-mid);">Waking up the camera…</p>');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraError({ name: 'NotSupportedError' });
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'user' } }, audio: false })
      .then(function (stream) { onCameraReady(stream, true); })
      .catch(function () {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
          .then(function (stream) { onCameraReady(stream, false); })
          .catch(function () {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
              .then(function (stream) { onCameraReady(stream, true); })
              .catch(function (err) { showCameraError(err); });
          });
      });
  }

  function onCameraReady(stream, mirrored) {
    state.stream = stream;
    state.mirrored = mirrored;
    videoEl.srcObject = stream;
    videoEl.classList.toggle('mirrored', !!mirrored);
    segCanvas.classList.toggle('mirrored', !!mirrored);
    var p = videoEl.play();
    if (p && p.catch) p.catch(function () {});
    applyFilterToPreview(state.filter);
    hideCameraStatus();
    updateBgPreview();
    if (state.bg !== 'none' && segmenter) startSegLoop();
  }

  function showCameraError(err) {
    var name = err && err.name ? err.name : '';
    var msg = "We couldn't reach your camera. Please check your device and try again.";
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      msg = 'Camera access was denied. Please allow camera permissions in your browser settings, then try again.';
    } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      msg = 'No camera was found on this device.';
    } else if (name === 'NotSupportedError') {
      msg = "Camera access isn't supported in this browser.";
    }
    showCameraStatus(
      '<div class="camera-error-box"><strong>Camera unavailable</strong>' + msg + '</div>' +
      '<button class="btn-retry" id="btn-camera-retry">Try Again</button>'
    );
    var retryBtn = document.getElementById('btn-camera-retry');
    if (retryBtn) retryBtn.addEventListener('click', function () { initCamera(); });
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach(function (t) { t.stop(); });
      state.stream = null;
    }
  }

  /* ── Background replacement (MediaPipe selfie segmentation) ── */
  var segCanvas = document.getElementById('seg-preview');
  var segCtx = segCanvas.getContext('2d');
  var segmenter = null, segFailed = false, segLoopRunning = false, segBusy = false;

  function drawScene(ctx, w, h, name) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    if (name === 'sunset') {
      g.addColorStop(0, '#2b1a5e'); g.addColorStop(0.5, '#c2426d'); g.addColorStop(0.8, '#ff8c5a'); g.addColorStop(1, '#ffcf70');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,236,170,0.9)';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.8, Math.min(w, h) * 0.14, 0, Math.PI * 2); ctx.fill();
    } else if (name === 'ocean') {
      g.addColorStop(0, '#8fdcf5'); g.addColorStop(0.5, '#2a9fd8'); g.addColorStop(1, '#04537f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.12; ctx.fillStyle = '#ffffff';
      for (var i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.25 + i * 0.3), h * (0.25 + i * 0.22), w * 0.35, h * 0.05, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (name === 'night') {
      g.addColorStop(0, '#070b26'); g.addColorStop(1, '#232c63');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      for (var s = 0; s < 90; s++) {
        // deterministic pseudo-random star field
        var sx = ((s * 1237) % 997) / 997 * w;
        var sy = ((s * 761) % 991) / 991 * h * 0.92;
        ctx.globalAlpha = 0.35 + ((s * 37) % 60) / 100;
        ctx.fillRect(sx, sy, 1.5 + (s % 3), 1.5 + (s % 3));
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#f4f1de';
      ctx.beginPath(); ctx.arc(w * 0.82, h * 0.16, Math.min(w, h) * 0.09, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#151b45';
      ctx.beginPath(); ctx.arc(w * 0.79, h * 0.135, Math.min(w, h) * 0.075, 0, Math.PI * 2); ctx.fill();
    }
  }

  function onSegResults(results) {
    var w = results.image.width, h = results.image.height;
    if (segCanvas.width !== w || segCanvas.height !== h) { segCanvas.width = w; segCanvas.height = h; }
    segCtx.save();
    segCtx.clearRect(0, 0, w, h);
    // person = mask ∩ frame
    segCtx.drawImage(results.segmentationMask, 0, 0, w, h);
    segCtx.globalCompositeOperation = 'source-in';
    segCtx.drawImage(results.image, 0, 0, w, h);
    // background behind the person
    segCtx.globalCompositeOperation = 'destination-over';
    if (state.bg === 'blur') {
      segCtx.filter = 'blur(16px)';
      // draw slightly oversized so the blur doesn't show transparent edges
      segCtx.drawImage(results.image, -w * 0.05, -h * 0.05, w * 1.1, h * 1.1);
      segCtx.filter = 'none';
    } else {
      drawScene(segCtx, w, h, state.bg);
    }
    segCtx.restore();
  }

  function bgActive() {
    return state.bg !== 'none' && !!segmenter && segCanvas.width > 0;
  }

  function updateBgPreview() {
    var active = state.bg !== 'none' && !!segmenter;
    segCanvas.style.display = active ? 'block' : 'none';
    videoEl.style.visibility = active ? 'hidden' : 'visible';
  }

  function ensureSegmenter() {
    if (segmenter || segFailed) return !!segmenter;
    if (!window.SelfieSegmentation) { segFailed = true; return false; }
    try {
      segmenter = new window.SelfieSegmentation({
        locateFile: function (f) { return 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/' + f; }
      });
      segmenter.setOptions({ modelSelection: 1 });
      segmenter.onResults(onSegResults);
      return true;
    } catch (e) {
      segFailed = true;
      segmenter = null;
      return false;
    }
  }

  function segFrame() {
    if (state.bg === 'none' || state.page !== 'camera' || !state.stream || !segmenter) {
      segLoopRunning = false;
      updateBgPreview();
      return;
    }
    if (videoEl.readyState >= 2 && !segBusy) {
      segBusy = true;
      segmenter.send({ image: videoEl })
        .then(function () { segBusy = false; requestAnimationFrame(segFrame); })
        .catch(function () { segBusy = false; requestAnimationFrame(segFrame); });
    } else {
      requestAnimationFrame(segFrame);
    }
  }

  function startSegLoop() {
    if (segLoopRunning) return;
    segLoopRunning = true;
    requestAnimationFrame(segFrame);
  }

  $all('.bg-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var bg = chip.getAttribute('data-bg');
      if (bg !== 'none' && !ensureSegmenter()) {
        cameraSub.textContent = 'Background effects need an internet connection — try again later.';
        return;
      }
      $all('.bg-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      state.bg = bg;
      updateBgPreview();
      if (bg !== 'none') startSegLoop();
    });
  });

  function playShutterSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      function click(start, f1, f2, gain, dur) {
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(f1, now + start);
        o.frequency.exponentialRampToValueAtTime(f2, now + start + dur);
        g.gain.setValueAtTime(gain, now + start);
        g.gain.exponentialRampToValueAtTime(0.001, now + start + dur + 0.01);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + start);
        o.stop(now + start + dur + 0.02);
      }
      click(0, 1800, 600, 0.16, 0.05);
      click(0.09, 1200, 400, 0.13, 0.06);
    } catch (e) {}
  }

  function runCountdown() {
    var seq = [3, 2, 1];
    var i = 0;
    return new Promise(function (resolve) {
      function step() {
        if (i >= seq.length) { countdownNum.textContent = ''; resolve(); return; }
        countdownNum.textContent = seq[i];
        countdownNum.classList.remove('pop');
        void countdownNum.offsetWidth;
        countdownNum.classList.add('pop');
        i++;
        setTimeout(step, 1000);
      }
      step();
    });
  }

  function cropAndCapture() {
    // When background replacement is on, capture the composited canvas
    // instead of the raw video.
    var useSeg = bgActive();
    var source = useSeg ? segCanvas : videoEl;
    var vw = useSeg ? segCanvas.width  : (videoEl.videoWidth || 640);
    var vh = useSeg ? segCanvas.height : (videoEl.videoHeight || 480);
    var targetAR = 4 / 3;
    var srcAR = vw / vh;
    var sx = 0, sy = 0, sw = vw, sh = vh;
    if (srcAR > targetAR) { sw = vh * targetAR; sx = (vw - sw) / 2; }
    else                  { sh = vw / targetAR; sy = (vh - sh) / 2; }
    var outW = 640, outH = 480;
    var off = document.createElement('canvas');
    off.width = outW; off.height = outH;
    var ctx = off.getContext('2d');
    var f = FILTERS[state.filter];
    ctx.save();
    ctx.filter = f.cssFilter;
    if (state.mirrored) { ctx.translate(outW, 0); ctx.scale(-1, 1); }
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, outW, outH);
    ctx.restore();
    if (f.opacity > 0) {
      ctx.save();
      ctx.globalAlpha = f.opacity;
      try { ctx.globalCompositeOperation = f.blend; } catch (e) {}
      ctx.fillStyle = f.overlay;
      ctx.fillRect(0, 0, outW, outH);
      ctx.restore();
    }
    return off.toDataURL('image/jpeg', 0.92);
  }

  function flashAndShutter() {
    playShutterSound();
    flashLayer.classList.remove('flashing');
    void flashLayer.offsetWidth;
    flashLayer.classList.add('flashing');
  }

  function addThumb(src) {
    var img = document.createElement('img');
    img.src = src;
    thumbRow.appendChild(img);
  }

  function startCaptureSequence() {
    if (state.capturing || !state.layout) return;
    state.capturing = true;
    state.photos = [];
    thumbRow.innerHTML = '';
    btnCapture.disabled = true;
    btnCapture.textContent = 'Capturing…';
    shotIndicator.classList.add('show');
    $all('.filter-chip').forEach(function (c) { c.disabled = true; });

    var total = LAYOUTS[state.layout].count;
    var i = 0;

    function takeShot() {
      shotIndicator.textContent = 'Shot ' + (i + 1) + ' of ' + total;
      flashAndShutter();
      state.photos.push(cropAndCapture());
      addThumb(state.photos[state.photos.length - 1]);
      i++;
    }

    function nextShot() {
      if (i >= total) { finishSequence(); return; }
      shotIndicator.textContent = 'Shot ' + (i + 1) + ' of ' + total;
      cameraSub.textContent = 'Hold that pose…';
      runCountdown().then(function () {
        takeShot();
        setTimeout(nextShot, 120);
      });
    }

    // Burst: one countdown, then all shots rapid-fire.
    function burstShots() {
      if (i >= total) { finishSequence(); return; }
      takeShot();
      setTimeout(burstShots, 550);
    }

    function finishSequence() {
      cameraSub.textContent = 'All done! Building your strip…';
      btnCapture.textContent = '📸 Say Datshi!';
      $all('.filter-chip').forEach(function (c) { c.disabled = false; });
      state.capturing = false;
      setTimeout(function () { goToPage('customize'); }, 500);
    }

    if (state.burst) {
      cameraSub.textContent = 'Get ready — burst incoming!';
      runCountdown().then(burstShots);
    } else {
      nextShot();
    }
  }

  document.getElementById('burst-toggle').addEventListener('click', function () {
    state.burst = !state.burst;
    this.classList.toggle('on', state.burst);
  });

  btnCapture.addEventListener('click', function () {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
    startCaptureSequence();
  });

  /* ============================================================
     PAGE 4 — CUSTOMIZATION
     ============================================================ */
  var stripCanvas  = document.getElementById('strip-canvas');
  var photoSlots   = document.getElementById('photo-slots');
  var stickerLayer = document.getElementById('sticker-layer');
  var textLayer    = document.getElementById('text-layer');

  function buildStripSlots() {
    photoSlots.className = 'photo-slots layout-' + state.layout;
    Object.keys(LAYOUTS).forEach(function (key) { stripCanvas.classList.remove('layout-' + key); });
    if (LAYOUTS[state.layout].cols > 1) stripCanvas.classList.add('layout-' + state.layout);
    photoSlots.innerHTML = state.photos.map(function (src, i) {
      return '<div class="photo-slot"><img src="' + src + '" alt="Photo ' + (i + 1) + '"/></div>';
    }).join('');
  }

  function applyFrame() {
    stripCanvas.style.background = state.frame.type === 'solid' ? state.frame.value : state.frame.css;
    var pad = state.framePad;
    stripCanvas.style.padding = pad + 'px ' + pad + 'px ' + Math.max(6, pad - 2) + 'px';
  }

  document.getElementById('border-width-input').addEventListener('input', function () {
    state.framePad = parseInt(this.value, 10);
    applyFrame();
  });

  /* Tabs */
  $all('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      $all('.tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var name = tab.getAttribute('data-tab');
      $all('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      document.getElementById('tab-' + name).classList.add('active');
    });
  });

  /* Frame swatches */
  (function buildFrameSwatches() {
    var solidWrap = document.getElementById('solid-swatches');
    SOLID_COLORS.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'swatch';
      b.style.background = c.value;
      b.title = c.label;
      b.setAttribute('aria-label', c.label);
      if (c.id === 'white') b.classList.add('active');
      b.addEventListener('click', function () {
        state.frame = { type: 'solid', value: c.value };
        applyFrame();
        $all('.swatch, .pattern-swatch').forEach(function (s) { s.classList.remove('active'); });
        b.classList.add('active');
      });
      solidWrap.appendChild(b);
    });

    STRIPE_PATTERNS.forEach(function (p) {
      document.getElementById('stripe-swatches').appendChild(makePatternSwatch(p));
    });
    DOT_PATTERNS.forEach(function (p) {
      document.getElementById('dot-swatches').appendChild(makePatternSwatch(p));
    });
    CHECKER_PATTERNS.forEach(function (p) {
      document.getElementById('checker-swatches').appendChild(makePatternSwatch(p));
    });

    function makePatternSwatch(p) {
      var item = document.createElement('div');
      item.className = 'pattern-item';
      var b = document.createElement('button');
      b.className = 'pattern-swatch';
      b.style.background = p.css;
      b.title = p.label;
      b.setAttribute('aria-label', p.label);
      b.addEventListener('click', function () {
        state.frame = { type: 'pattern', css: p.css, id: p.id };
        applyFrame();
        $all('.swatch, .pattern-swatch').forEach(function (s) { s.classList.remove('active'); });
        b.classList.add('active');
      });
      var label = document.createElement('div');
      label.className = 'pattern-label';
      label.textContent = p.label;
      item.appendChild(b);
      item.appendChild(label);
      return item;
    }
  }());

  /* Sticker library */
  function makeStickerBtn(emoji) {
    var b = document.createElement('button');
    b.className = 'sticker-btn';
    b.textContent = emoji;
    b.type = 'button';
    b.addEventListener('click', function () { addSticker(emoji); });
    return b;
  }

  (function buildStickerLibrary() {
    var wrap = document.getElementById('sticker-categories');
    STICKER_CATEGORIES.forEach(function (cat) {
      var section = document.createElement('div');
      section.className = 'sticker-category';
      var h = document.createElement('p');
      h.className = 'sticker-cat-name';
      h.textContent = cat.name;
      var grid = document.createElement('div');
      grid.className = 'sticker-grid';
      cat.items.forEach(function (item) {
        grid.appendChild(makeStickerBtn(item[0]));
      });
      section.appendChild(h);
      section.appendChild(grid);
      wrap.appendChild(section);
    });
  }());

  /* Sticker search */
  document.getElementById('sticker-search').addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    var resultsWrap = document.getElementById('sticker-search-results');
    var resultsGrid = document.getElementById('sticker-results-grid');
    var categories  = document.getElementById('sticker-categories');
    if (!q) {
      resultsWrap.style.display = 'none';
      categories.style.display = '';
      return;
    }
    resultsGrid.innerHTML = '';
    var seen = {};
    STICKER_CATEGORIES.forEach(function (cat) {
      cat.items.forEach(function (item) {
        var emoji = item[0], keywords = item[1];
        if (seen[emoji]) return;
        if (keywords.indexOf(q) !== -1 || cat.name.toLowerCase().indexOf(q) !== -1) {
          seen[emoji] = true;
          resultsGrid.appendChild(makeStickerBtn(emoji));
        }
      });
    });
    if (!resultsGrid.children.length) {
      var empty = document.createElement('p');
      empty.className = 'sticker-cat-name';
      empty.textContent = 'No stickers found for “' + q + '”';
      resultsGrid.appendChild(empty);
    }
    resultsWrap.style.display = '';
    categories.style.display = 'none';
  });

  function addSticker(emoji) {
    var id = uid();
    var jitter = (Math.random() * 16) - 8;
    state.stickers.push({ id: id, emoji: emoji, xPct: clamp(50 + jitter, 15, 85), yPct: clamp(50 + jitter, 15, 85), scale: 1, rotation: 0 });
    renderStickerLayer();
    selectItem(id);
  }

  function renderStickerLayer() {
    stickerLayer.innerHTML = '';
    state.stickers.forEach(function (st) {
      var el = document.createElement('div');
      el.className = 'sticker' + (state.selectedId === st.id ? ' selected' : '');
      el.dataset.id = st.id;
      el.style.left = st.xPct + '%';
      el.style.top  = st.yPct + '%';
      el.style.transform = 'translate(-50%,-50%) rotate(' + st.rotation + 'deg) scale(' + st.scale + ')';
      el.innerHTML =
        '<span class="sticker-emoji">' + st.emoji + '</span>' +
        '<button class="elem-delete" type="button" aria-label="Remove sticker">×</button>' +
        '<div class="handle handle-rotate" title="Rotate"></div>' +
        '<div class="handle handle-resize" title="Resize"></div>';
      stickerLayer.appendChild(el);

      attachDrag(el, st, function () { updateStickerTransform(el, st); });
      el.querySelector('.elem-delete').addEventListener('click', function (ev) {
        ev.stopPropagation();
        state.stickers = state.stickers.filter(function (s) { return s.id !== st.id; });
        if (state.selectedId === st.id) state.selectedId = null;
        renderStickerLayer();
        updateTextEditorPanel();
      });
      attachResizeHandle(el.querySelector('.handle-resize'), st, function () { updateStickerTransform(el, st); });
      attachRotateHandle(el.querySelector('.handle-rotate'), st, function () { updateStickerTransform(el, st); });
    });
  }

  function updateStickerTransform(el, st) {
    el.style.left = st.xPct + '%';
    el.style.top  = st.yPct + '%';
    el.style.transform = 'translate(-50%,-50%) rotate(' + st.rotation + 'deg) scale(' + st.scale + ')';
  }

  /* Text elements */
  function ensureDateStamp() {
    var existing = state.texts.find(function (t) { return t.isDate; });
    if (state.dateStampOn && !existing) {
      state.texts.push({ id: 'datestamp', text: formatDateStamp(), xPct: 50, yPct: 93, font: 'modern', color: '#5b4b2a', size: 14, isDate: true });
    } else if (!state.dateStampOn && existing) {
      state.texts = state.texts.filter(function (t) { return !t.isDate; });
    } else if (existing) {
      existing.text = formatDateStamp();
    }
  }

  document.getElementById('date-toggle').addEventListener('click', function () {
    state.dateStampOn = !state.dateStampOn;
    this.classList.toggle('on', state.dateStampOn);
    ensureDateStamp();
    renderTextLayer();
  });

  document.getElementById('btn-add-caption').addEventListener('click', addCaptionFromInput);
  document.getElementById('caption-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addCaptionFromInput();
  });

  function addCaptionFromInput() {
    var input = document.getElementById('caption-input');
    var val = input.value.trim();
    if (!val) return;
    var id = uid();
    state.texts.push({ id: id, text: val, xPct: 50, yPct: 50, font: 'cute', color: '#3a2e1f', size: 22, isDate: false });
    input.value = '';
    renderTextLayer();
    selectItem(id);
  }

  function renderTextLayer() {
    textLayer.innerHTML = '';
    state.texts.forEach(function (tx) {
      var el = document.createElement('div');
      el.className = 'text-elem font-' + tx.font + (state.selectedId === tx.id ? ' selected' : '');
      el.dataset.id = tx.id;
      el.style.left     = tx.xPct + '%';
      el.style.top      = tx.yPct + '%';
      el.style.color    = tx.color;
      el.style.fontSize = tx.size + 'px';
      el.innerHTML = '<span class="text-content"></span><button class="elem-delete" type="button" aria-label="Remove text">×</button>';
      el.querySelector('.text-content').textContent = tx.text;
      textLayer.appendChild(el);

      attachDrag(el, tx, function () { updateTextPosition(el, tx); });
      el.querySelector('.elem-delete').addEventListener('click', function (ev) {
        ev.stopPropagation();
        state.texts = state.texts.filter(function (t) { return t.id !== tx.id; });
        if (tx.isDate) { state.dateStampOn = false; document.getElementById('date-toggle').classList.remove('on'); }
        if (state.selectedId === tx.id) state.selectedId = null;
        renderTextLayer();
        updateTextEditorPanel();
      });
    });
  }

  function updateTextPosition(el, tx) {
    el.style.left = tx.xPct + '%';
    el.style.top  = tx.yPct + '%';
  }

  /* Selection, drag, resize, rotate */
  function selectItem(id) {
    state.selectedId = id;
    $all('.sticker, .text-elem').forEach(function (el) {
      el.classList.toggle('selected', el.dataset.id === id);
    });
    updateTextEditorPanel();
  }

  function clearSelection() {
    state.selectedId = null;
    $all('.sticker, .text-elem').forEach(function (el) { el.classList.remove('selected'); });
    updateTextEditorPanel();
  }

  stripCanvas.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('.sticker, .text-elem')) clearSelection();
  });

  function attachDrag(el, item, onChange) {
    var dragging = false, pid = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.handle, .elem-delete')) return;
      e.preventDefault();
      dragging = true;
      pid = e.pointerId;
      try { el.setPointerCapture(pid); } catch (err) {}
      selectItem(item.id);
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var rect = stripCanvas.getBoundingClientRect();
      item.xPct = clamp(((e.clientX - rect.left) / rect.width)  * 100, 3, 97);
      item.yPct = clamp(((e.clientY - rect.top)  / rect.height) * 100, 3, 97);
      onChange();
    });
    function end() { dragging = false; try { el.releasePointerCapture(pid); } catch (err) {} }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  function attachResizeHandle(handle, st, onChange) {
    handle.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); e.preventDefault();
      var pid = e.pointerId;
      try { handle.setPointerCapture(pid); } catch (err) {}
      var rect = stripCanvas.getBoundingClientRect();
      var cx = rect.left + (st.xPct / 100) * rect.width;
      var cy = rect.top  + (st.yPct / 100) * rect.height;
      var startDist  = Math.max(10, Math.hypot(e.clientX - cx, e.clientY - cy));
      var startScale = st.scale;
      function move(ev) {
        st.scale = clamp(startScale * (Math.hypot(ev.clientX - cx, ev.clientY - cy) / startDist), 0.4, 3);
        onChange();
      }
      function up() { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); try { handle.releasePointerCapture(pid); } catch (err) {} }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  }

  function attachRotateHandle(handle, st, onChange) {
    handle.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); e.preventDefault();
      var pid = e.pointerId;
      try { handle.setPointerCapture(pid); } catch (err) {}
      var rect = stripCanvas.getBoundingClientRect();
      var cx = rect.left + (st.xPct / 100) * rect.width;
      var cy = rect.top  + (st.yPct / 100) * rect.height;
      var startAngle    = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      var startRotation = st.rotation;
      function move(ev) {
        st.rotation = Math.round(startRotation + (Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI)) - startAngle);
        onChange();
      }
      function up() { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); try { handle.releasePointerCapture(pid); } catch (err) {} }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  }

  /* Text editor panel */
  var textEditor = document.getElementById('text-editor');

  function getSelectedText() { return state.texts.find(function (t) { return t.id === state.selectedId; }); }

  function updateTextEditorPanel() {
    var tx = getSelectedText();
    if (!tx) { textEditor.classList.add('disabled'); return; }
    textEditor.classList.remove('disabled');
    $all('.font-btn').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-font') === tx.font); });
    document.getElementById('text-color-input').value = tx.color;
    document.getElementById('text-size-input').value  = tx.size;
  }

  $all('.font-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var tx = getSelectedText(); if (!tx) return;
      tx.font = b.getAttribute('data-font');
      renderTextLayer(); selectItem(tx.id);
    });
  });

  document.getElementById('text-color-input').addEventListener('input', function () {
    var tx = getSelectedText(); if (!tx) return;
    tx.color = this.value; renderTextLayer(); selectItem(tx.id);
  });

  document.getElementById('text-size-input').addEventListener('input', function () {
    var tx = getSelectedText(); if (!tx) return;
    tx.size = parseInt(this.value, 10); renderTextLayer(); selectItem(tx.id);
  });

  document.getElementById('btn-delete-text').addEventListener('click', function () {
    var tx = getSelectedText(); if (!tx) return;
    state.texts = state.texts.filter(function (t) { return t.id !== tx.id; });
    if (tx.isDate) { state.dateStampOn = false; document.getElementById('date-toggle').classList.remove('on'); }
    state.selectedId = null;
    renderTextLayer(); updateTextEditorPanel();
  });

  document.getElementById('btn-retake-inline').addEventListener('click', function () { goToPage('camera'); });

  // Capture the strip WHILE still on the customize page, then navigate
  document.getElementById('btn-to-export').addEventListener('click', function () {
    clearSelection();
    stripCanvas.classList.add('export-mode');

    function afterCapture(dataURL) {
      stripCanvas.classList.remove('export-mode');
      state.exportDataURL = dataURL;
      goToPage('export');
    }

    if (window.html2canvas) {
      window.html2canvas(stripCanvas, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: function (doc) {
          var clone = doc.getElementById('strip-canvas');
          if (!clone) return;
          // html2canvas renders the neumorphic inset box-shadow as a solid
          // dark ring around the strip — drop it from the capture.
          clone.style.boxShadow = 'none';
          // It also can't render the pattern-frame gradients — blank the
          // background (leaving it transparent) so the pattern can be
          // redrawn natively underneath after capture.
          if (state.frame.type === 'pattern') clone.style.background = 'none';
        }
      })
        .then(function (canvas) {
          paintOverlaysOnCanvas(canvas);
          if (state.frame.type === 'pattern') paintPatternFrame(canvas);
          afterCapture(canvas.toDataURL('image/png'));
        })
        .catch(function () { afterCapture(renderFallbackCanvas()); });
    } else {
      afterCapture(renderFallbackCanvas());
    }
  });

  /* ============================================================
     PAGE 5 — EXPORT
     ============================================================ */
  var exportSpinner = document.getElementById('export-spinner');
  var exportImg     = document.getElementById('export-img');

  function generateExportImage() {
    // Image already captured before navigation — just display it
    exportSpinner.style.display = 'none';
    if (state.exportDataURL) {
      exportImg.src = state.exportDataURL;
      exportImg.style.display = 'block';
    }
  }

  // Repaints stickers and text natively onto the captured canvas. Both DOM
  // layers are hidden during capture (html2canvas misplaces scaled/rotated
  // elements); painting stickers first, then text, preserves the on-screen
  // stacking order (.sticker-layer sits below .text-layer).
  var TEXT_FONTS = {
    cute:   { weight: '700', family: "'Caveat', cursive" },
    modern: { weight: '700', family: "'DM Sans', system-ui, sans-serif" },
    future: { weight: '600', family: "'Orbitron', sans-serif", spacing: 0.05 },
    novel:  { weight: '600', family: "'EB Garamond', Georgia, serif", italic: true }
  };

  function paintOverlaysOnCanvas(canvas) {
    if (!state.stickers.length && !state.texts.length) return;
    var ctx = canvas.getContext('2d');
    // html2canvas leaves the context transform however the last element it
    // drew left it (not identity) — reset before doing our own coordinate math.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var k = canvas.width / stripCanvas.offsetWidth;
    var w = canvas.width, h = canvas.height;
    var r = 12 * k; // matches .strip-canvas border-radius

    // Clip to the strip's rounded bounds so overlays dragged near an edge
    // can never bleed outside the frame in the export.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.clip();

    state.stickers.forEach(function (st) {
      ctx.save();
      ctx.translate((st.xPct / 100) * w, (st.yPct / 100) * h);
      ctx.rotate((st.rotation * Math.PI) / 180);
      ctx.font = Math.round(35.2 * k * st.scale) + 'px serif'; // 2.2rem, as on screen
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      // Center the actual glyph bounds on the anchor point, matching where
      // the emoji visually sits in its flex-centered DOM box.
      var m = ctx.measureText(st.emoji);
      ctx.fillText(st.emoji, 0, (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
      ctx.restore();
    });

    state.texts.forEach(function (tx) {
      var f = TEXT_FONTS[tx.font] || TEXT_FONTS.modern;
      var size = tx.size * k;
      ctx.save();
      ctx.font = (f.italic ? 'italic ' : '') + f.weight + ' ' + size + 'px ' + f.family;
      if (f.spacing && 'letterSpacing' in ctx) ctx.letterSpacing = (size * f.spacing) + 'px';
      ctx.fillStyle = tx.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx.text, (tx.xPct / 100) * w, (tx.yPct / 100) * h);
      ctx.restore();
    });

    ctx.restore();
  }

  // Redraws the selected pattern frame natively beneath the captured strip.
  // The capture leaves the frame area transparent (see onclone above), so
  // painting with 'destination-over' fills exactly that area.
  function paintPatternFrame(canvas) {
    var p = ALL_PATTERNS.find(function (q) { return q.id === state.frame.id; });
    if (!p) return;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var k = canvas.width / stripCanvas.offsetWidth;
    var w = canvas.width, h = canvas.height;
    var r = 12 * k; // matches .strip-canvas border-radius

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.clip();
    ctx.globalCompositeOperation = 'destination-over';

    if (p.stripe) {
      var sw = p.stripe.size * k;
      var diag = Math.sqrt(w * w + h * h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-Math.PI / 4); // 45° stripes, matching the CSS gradient
      var n = Math.ceil(diag / sw) + 1;
      for (var i = -n; i <= n; i++) {
        ctx.fillStyle = ((i % 2) + 2) % 2 === 0 ? p.stripe.c1 : p.stripe.c2;
        ctx.fillRect(i * sw, -diag, sw, diag * 2);
      }
    } else if (p.dots) {
      // destination-over paints *behind* what's already there, so draw the
      // dots first and the background color after (it lands behind the dots).
      var cell = p.dots.cell * k, rad = p.dots.radius * k;
      ctx.fillStyle = p.dots.color;
      for (var y = cell / 2; y < h; y += cell) {
        for (var x = cell / 2; x < w; x += cell) {
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = p.dots.bg;
      ctx.fillRect(0, 0, w, h);
    } else if (p.checker) {
      var sq = p.checker.cell * k;
      for (var row = 0; row * sq < h; row++) {
        for (var col = 0; col * sq < w; col++) {
          ctx.fillStyle = (row + col) % 2 === 0 ? p.checker.c1 : p.checker.c2;
          ctx.fillRect(col * sq, row * sq, sq, sq);
        }
      }
    }

    ctx.restore();
  }

  function renderFallbackCanvas() {
    var scale = 3;
    var w = stripCanvas.offsetWidth * scale;
    var h = stripCanvas.offsetHeight * scale;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d');
    ctx.fillStyle = state.frame.type === 'solid' ? state.frame.value : '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.font = (16 * scale) + 'px sans-serif';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('ORO Photobooth', w / 2, 30 * scale);
    var imgs = photoSlots.querySelectorAll('img');
    var pad = 16 * scale, gap = 8 * scale;
    var cols = LAYOUTS[state.layout] ? LAYOUTS[state.layout].cols : 1;
    imgs.forEach(function (img, i) {
      var col   = i % cols;
      var row   = Math.floor(i / cols);
      var cellW = (w - pad * 2 - gap * (cols - 1)) / cols;
      var cellH = cellW * 0.75;
      ctx.drawImage(img, pad + col * (cellW + gap), 50 * scale + row * (cellH + gap), cellW, cellH);
    });
    return c.toDataURL('image/png');
  }

  function downloadStrip() {
    if (!state.exportDataURL) return;
    var a = document.createElement('a');
    a.href = state.exportDataURL;
    a.download = 'oro-photobooth-strip.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  document.getElementById('btn-download').addEventListener('click', downloadStrip);

  /* ── Share sheet ── */
  var shareBackdrop = document.getElementById('share-backdrop');
  var SHARE_TEXT = 'Made with ORO Photobooth ✨';
  // Only pass a link to web intents when the app is actually hosted somewhere.
  var SHARE_URL = /^https?:/i.test(location.href) ? location.href : '';

  function stripAsFile() {
    return fetch(state.exportDataURL)
      .then(function (r) { return r.blob(); })
      .then(function (blob) { return new File([blob], 'oro-photobooth-strip.png', { type: 'image/png' }); });
  }

  function openShareSheet() {
    if (!state.exportDataURL) return;
    // Native share only where the browser can actually share files
    var nativeBtn = document.getElementById('share-native');
    var canNative = !!(navigator.share && navigator.canShare && window.File);
    nativeBtn.style.display = canNative ? '' : 'none';
    shareBackdrop.hidden = false;
  }

  function closeShareSheet() { shareBackdrop.hidden = true; }

  document.getElementById('btn-share').addEventListener('click', openShareSheet);
  document.getElementById('share-close').addEventListener('click', closeShareSheet);
  shareBackdrop.addEventListener('click', function (e) { if (e.target === shareBackdrop) closeShareSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !shareBackdrop.hidden) closeShareSheet(); });

  var SHARE_INTENTS = {
    facebook: function () {
      return SHARE_URL
        ? 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SHARE_URL)
        : 'https://www.facebook.com/';
    },
    threads:  function () { return 'https://www.threads.net/intent/post?text=' + encodeURIComponent(SHARE_TEXT + (SHARE_URL ? ' ' + SHARE_URL : '')); },
    x:        function () { return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(SHARE_TEXT) + (SHARE_URL ? '&url=' + encodeURIComponent(SHARE_URL) : ''); },
    whatsapp: function () { return 'https://wa.me/?text=' + encodeURIComponent(SHARE_TEXT + (SHARE_URL ? ' ' + SHARE_URL : '')); },
    instagram: function () { return 'https://www.instagram.com/'; },
    tiktok:    function () { return 'https://www.tiktok.com/upload'; }
  };

  $all('.share-app').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-share');

      if (kind === 'native') {
        stripAsFile().then(function (file) {
          var payload = { files: [file], title: 'ORO Photobooth', text: SHARE_TEXT };
          if (navigator.canShare && !navigator.canShare(payload)) payload = { title: 'ORO Photobooth', text: SHARE_TEXT };
          return navigator.share(payload);
        }).then(closeShareSheet).catch(function () {});
        return;
      }

      if (kind === 'copy') {
        var original = btn.textContent;
        stripAsFile().then(function (file) {
          if (!navigator.clipboard || !window.ClipboardItem) throw new Error('unsupported');
          return navigator.clipboard.write([new window.ClipboardItem({ 'image/png': file })]);
        }).then(function () {
          btn.lastChild.textContent = 'Copied!';
          setTimeout(function () { btn.lastChild.textContent = 'Copy Image'; }, 2000);
        }).catch(function () {
          btn.lastChild.textContent = 'Copy unavailable';
          setTimeout(function () { btn.lastChild.textContent = 'Copy Image'; }, 2000);
        });
        return;
      }

      // Web intents can't attach a local image — save the PNG first so the
      // user can attach it in the app, then open the platform.
      downloadStrip();
      window.open(SHARE_INTENTS[kind](), '_blank', 'noopener');
    });
  });

  /* GIF / Boomerang export */
  function buildAnimatedGIF(frames, interval, filename, btn) {
    if (!window.gifshot) {
      btn.textContent = 'GIF unavailable offline';
      setTimeout(function () { btn.textContent = btn.dataset.label; }, 2500);
      return;
    }
    var original = btn.dataset.label;
    btn.disabled = true;
    btn.textContent = 'Building…';
    window.gifshot.createGIF({
      images: frames,
      interval: interval,
      gifWidth: 480,
      gifHeight: 360,
      numWorkers: 2
    }, function (result) {
      btn.disabled = false;
      btn.textContent = original;
      if (result.error) return;
      var a = document.createElement('a');
      a.href = result.image;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  document.getElementById('btn-gif').addEventListener('click', function () {
    if (!state.photos.length) return;
    buildAnimatedGIF(state.photos.slice(), 0.4, 'oro-photobooth.gif', this);
  });

  document.getElementById('btn-boomerang').addEventListener('click', function () {
    if (!state.photos.length) return;
    // forward then reverse (without repeating the endpoints) = boomerang loop
    var frames = state.photos.concat(state.photos.slice(1, -1).reverse());
    buildAnimatedGIF(frames, 0.18, 'oro-photobooth-boomerang.gif', this);
  });

  ['btn-gif', 'btn-boomerang'].forEach(function (id) {
    var b = document.getElementById(id);
    b.dataset.label = b.textContent;
  });

  document.getElementById('btn-retake').addEventListener('click', function () { goToPage('camera'); });

  document.getElementById('btn-restart').addEventListener('click', function () {
    stopCamera();
    state = defaultState();
    $all('.layout-card').forEach(function (c) { c.classList.remove('selected'); });
    $all('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
    document.querySelector('.filter-chip[data-filter="none"]').classList.add('active');
    document.getElementById('date-toggle').classList.add('on');
    document.getElementById('caption-input').value = '';
    document.getElementById('burst-toggle').classList.remove('on');
    $all('.bg-chip').forEach(function (c) { c.classList.remove('active'); });
    document.querySelector('.bg-chip[data-bg="none"]').classList.add('active');
    updateBgPreview();
    document.getElementById('border-width-input').value = 16;
    var search = document.getElementById('sticker-search');
    search.value = '';
    search.dispatchEvent(new Event('input'));
    stickerLayer.innerHTML = '';
    textLayer.innerHTML = '';
    photoSlots.innerHTML = '';
    stripCanvas.style.background = '#ffffff';
    $all('.swatch, .pattern-swatch').forEach(function (s) { s.classList.remove('active'); });
    document.querySelector('.swatch[title="White"]').classList.add('active');
    goToPage('landing');
  });

  /* Back buttons */
  $all('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-back');
      if (target === 'camera') state.photos = [];
      goToPage(target);
    });
  });

}());
