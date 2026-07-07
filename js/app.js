(function () {
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */
  var LAYOUTS = {
    '1x3': { count: 3, cols: 1, label: '1 × 3' },
    '1x4': { count: 4, cols: 1, label: '1 × 4' },
    '2x3': { count: 6, cols: 2, label: '2 × 3' }
  };

  var FILTERS = {
    none:  { cssFilter: 'none', overlay: 'transparent', blend: 'normal', opacity: 0 },
    warm:  { cssFilter: 'brightness(1.1) saturate(1.35) sepia(0.18) contrast(1.03)', overlay: '#ff9d52', blend: 'soft-light', opacity: 0.22 },
    cold:  { cssFilter: 'brightness(1.05) contrast(1.15) saturate(0.85)', overlay: '#4fa6ff', blend: 'soft-light', opacity: 0.28 },
    fiji:  { cssFilter: 'saturate(1.45) contrast(1.05) brightness(1.12) sepia(0.08)', overlay: '#ff6fa5', blend: 'soft-light', opacity: 0.18 },
    canon: { cssFilter: 'brightness(1.16) contrast(0.92) saturate(1.08)', overlay: '#ffe8c2', blend: 'soft-light', opacity: 0.3 }
  };

  var SOLID_COLORS = [
    { id: 'white',  label: 'White',         value: '#ffffff' },
    { id: 'pink',   label: 'Pink',          value: '#ffc4d6' },
    { id: 'sky',    label: 'Sky Blue',      value: '#bfe3ff' },
    { id: 'purple', label: 'Purple',        value: '#d9c6ff' },
    { id: 'butter', label: 'Butter Yellow', value: '#fff1b8' }
  ];

  var STRIPE_PATTERNS = [
    { id: 'sky-pink',    label: 'Sky Blue + Pink',      css: 'repeating-linear-gradient(45deg,#bfe3ff 0px,#bfe3ff 16px,#ffc4d6 16px,#ffc4d6 32px)' },
    { id: 'butter-pink', label: 'Butter Yellow + Pink', css: 'repeating-linear-gradient(45deg,#fff1b8 0px,#fff1b8 16px,#ffc4d6 16px,#ffc4d6 32px)' },
    { id: 'blue-white',  label: 'Blue + White',         css: 'repeating-linear-gradient(45deg,#bfe3ff 0px,#bfe3ff 16px,#ffffff 16px,#ffffff 32px)' }
  ];

  var DOT_PATTERNS = [
    { id: 'dot-pink',   label: 'Pink Dots',   css: 'radial-gradient(circle, #ff8fb1 30%, transparent 32%) 0 0/22px 22px, #fff5f8' },
    { id: 'dot-blue',   label: 'Sky Dots',    css: 'radial-gradient(circle, #5fb6ff 30%, transparent 32%) 0 0/22px 22px, #eef8ff' },
    { id: 'dot-purple', label: 'Purple Dots', css: 'radial-gradient(circle, #b48bff 30%, transparent 32%) 0 0/22px 22px, #f6f0ff' },
    { id: 'dot-gold',   label: 'Gold Dots',   css: 'radial-gradient(circle, #f3c969 30%, transparent 32%) 0 0/22px 22px, #fffaf0' }
  ];

  var STICKER_CATEGORIES = [
    { name: 'Hearts',                     items: ['💖', '💕', '❤️', '💗', '💘'] },
    { name: 'Stars',                      items: ['⭐', '🌟', '💫', '✨'] },
    { name: 'Sparkles',                   items: ['✨', '🎇', '🎆', '🌠'] },
    { name: 'Clouds',                     items: ['☁️', '⛅', '🌥️'] },
    { name: 'Flowers',                    items: ['🌸', '🌺', '🌷', '🌼', '🌻'] },
    { name: 'Bows',                       items: ['🎀', '🪢'] },
    { name: 'Butterflies',                items: ['🦋'] },
    { name: 'Smiley Faces',               items: ['😊', '😄', '🥰', '😎', '🤩', '😋'] },
    { name: 'Trending — Football Fever',  items: ['⚽', '🏆', '🥅', '🎉', '🏅', '🔥', '📣', '🧤'] }
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

  $all('.filter-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $all('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
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
    var p = videoEl.play();
    if (p && p.catch) p.catch(function () {});
    applyFilterToPreview(state.filter);
    hideCameraStatus();
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
    var vw = videoEl.videoWidth || 640;
    var vh = videoEl.videoHeight || 480;
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
    ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, outW, outH);
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

    function nextShot() {
      if (i >= total) { finishSequence(); return; }
      shotIndicator.textContent = 'Shot ' + (i + 1) + ' of ' + total;
      cameraSub.textContent = 'Hold that pose…';
      runCountdown().then(function () {
        flashAndShutter();
        state.photos.push(cropAndCapture());
        addThumb(state.photos[state.photos.length - 1]);
        i++;
        setTimeout(nextShot, 120);
      });
    }

    function finishSequence() {
      cameraSub.textContent = 'All done! Building your strip…';
      btnCapture.textContent = '📸 Say Datshi!';
      $all('.filter-chip').forEach(function (c) { c.disabled = false; });
      state.capturing = false;
      setTimeout(function () { goToPage('customize'); }, 500);
    }

    nextShot();
  }

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
    stripCanvas.classList.remove('layout-2x3');
    if (state.layout === '2x3') stripCanvas.classList.add('layout-2x3');
    photoSlots.innerHTML = state.photos.map(function (src, i) {
      return '<div class="photo-slot"><img src="' + src + '" alt="Photo ' + (i + 1) + '"/></div>';
    }).join('');
  }

  function applyFrame() {
    stripCanvas.style.background = state.frame.type === 'solid' ? state.frame.value : state.frame.css;
  }

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

    document.getElementById('stripe-swatches').appendChild(document.createDocumentFragment());
    STRIPE_PATTERNS.forEach(function (p) {
      document.getElementById('stripe-swatches').appendChild(makePatternSwatch(p));
    });
    DOT_PATTERNS.forEach(function (p) {
      document.getElementById('dot-swatches').appendChild(makePatternSwatch(p));
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
        state.frame = { type: 'pattern', css: p.css };
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
      cat.items.forEach(function (emoji) {
        var b = document.createElement('button');
        b.className = 'sticker-btn';
        b.textContent = emoji;
        b.type = 'button';
        b.addEventListener('click', function () { addSticker(emoji); });
        grid.appendChild(b);
      });
      section.appendChild(h);
      section.appendChild(grid);
      wrap.appendChild(section);
    });
  }());

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
        width: stripCanvas.offsetWidth,
        height: stripCanvas.offsetHeight,
        windowWidth: stripCanvas.offsetWidth,
        windowHeight: stripCanvas.offsetHeight,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false
      })
        .then(function (canvas) {
          paintEmojisOnCanvas(canvas, 3);
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

  function paintEmojisOnCanvas(canvas, scale) {
    if (!state.stickers.length) return;
    var ctx = canvas.getContext('2d');
    var W = stripCanvas.offsetWidth;
    var H = stripCanvas.offsetHeight;
    var r = 12 * scale; // matches .strip-canvas border-radius

    // Clip to the strip's own rounded bounds so stickers dragged near an
    // edge or scaled up can never bleed outside the frame in the export.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(W * scale, 0, W * scale, H * scale, r);
    ctx.arcTo(W * scale, H * scale, 0, H * scale, r);
    ctx.arcTo(0, H * scale, 0, 0, r);
    ctx.arcTo(0, 0, W * scale, 0, r);
    ctx.closePath();
    ctx.clip();

    state.stickers.forEach(function (st) {
      var x = (st.xPct / 100) * W * scale;
      var y = (st.yPct / 100) * H * scale;
      var fontSize = Math.round(35 * scale * st.scale);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((st.rotation * Math.PI) / 180);
      ctx.font = fontSize + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.emoji, 0, 0);
      ctx.restore();
    });

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
    var cols = state.layout === '2x3' ? 2 : 1;
    imgs.forEach(function (img, i) {
      var col   = i % cols;
      var row   = Math.floor(i / cols);
      var cellW = (w - pad * 2 - gap * (cols - 1)) / cols;
      var cellH = cellW * 0.75;
      ctx.drawImage(img, pad + col * (cellW + gap), 50 * scale + row * (cellH + gap), cellW, cellH);
    });
    return c.toDataURL('image/png');
  }

  document.getElementById('btn-download').addEventListener('click', function () {
    if (!state.exportDataURL) return;
    var a = document.createElement('a');
    a.href = state.exportDataURL;
    a.download = 'oro-photobooth-strip.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
