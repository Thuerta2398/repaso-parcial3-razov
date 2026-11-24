/* ===== Repaso Parcial 3 · aplicación ===== */
(function () {
  'use strict';
  const D = window.DATA, S = window.Store, T = S.teacher;
  const $ = (id) => document.getElementById(id);
  const app = $('app');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f2 = D.f2;

  let st = S.load();
  const ui = { feedback: null, roundDone: null, s2win: null, s2sel: null, flFeedback: null, warned: {} };
  const STAGES = ['s1', 's2', 's3', 'fl'];
  const CFG = { s1: D.s1, s2: D.s2, s3: D.s3, fl: D.fl };

  if (T) { $('teacherBanner').hidden = false; document.body.classList.add('is-teacher'); }

  /* ---------- utilidades ---------- */
  function save() { if (!S.save(st)) toast('⚠️ Este navegador no permite guardar. Anota tu código de reanudación.'); renderTop(); }

  let toastT = null;
  function toast(msg, ms) {
    const el = $('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms || 2600);
  }

  let actx = null;
  function beep(ok) {
    if (!st.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = ok ? [660, 880] : [220, 180];
      notes.forEach((fr, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = ok ? 'sine' : 'square'; o.frequency.value = fr;
        const t0 = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(ok ? 0.18 : 0.07, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + 0.18);
      });
    } catch (e) { /* sin audio */ }
  }
  function buzz(ms) { if (st.sound && navigator.userActivation && navigator.userActivation.hasBeenActive && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* nada */ } } }

  const mmss = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  function unlocked(k) {
    if (T) return true;
    if (k === 's1') return true;
    if (k === 's2') return st.s1.done;
    if (k === 's3') return st.s2.done;
    if (k === 'fl') return st.s3.done;
    if (k === 'evidence') return st.fl.done;
    return false;
  }

  /* ---------- navegación ---------- */
  let view = 'home';
  function go(v) {
    if (v !== 'home' && v !== 'map' && !st.started) v = 'home';
    if (STAGES.includes(v) && !unlocked(v)) v = 'map';
    if (v === 'evidence' && !unlocked('evidence')) v = 'map';
    view = v; st.view = v;
    ui.feedback = null;
    S.save(st);
    render();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function render() {
    renderTop();
    if (view === 'home') return renderHome();
    if (view === 'map') return renderMap();
    if (view === 's1' || view === 's3') return renderDeck(view);
    if (view === 's2') return renderS2();
    if (view === 'fl') return renderFlash();
    if (view === 'evidence') return renderEvidence();
  }

  function renderTop() {
    const pts = $('ptsPill'), tp = $('timePill');
    $('soundBtn').textContent = st.sound ? '🔊' : '🔇';
    $('soundBtn').setAttribute('aria-label', st.sound ? 'Apagar sonido' : 'Activar sonido');
    pts.hidden = !st.started;
    pts.textContent = '⭐ ' + S.total(st) + ' pts';
    const cfg = CFG[view];
    if (cfg && cfg.minutes && !T) {
      const ms = st[view].ms, over = ms > cfg.minutes * 60000;
      tp.hidden = false; tp.classList.toggle('over', over);
      tp.textContent = '⏱ ' + mmss(ms) + ' / ' + cfg.minutes + ':00';
    } else tp.hidden = true;
  }

  // Reloj suave: suma tiempo solo con la estación abierta y la pantalla visible
  let lastTick = Date.now();
  setInterval(() => {
    const now = Date.now(), dt = Math.min(now - lastTick, 5000);
    lastTick = now;
    if (document.hidden || !st.started) return;
    if (STAGES.includes(view) && !st[view].done) {
      st[view].ms += dt;
      const cfg = CFG[view];
      if (cfg.minutes && !T && st[view].ms > cfg.minutes * 60000 && !ui.warned[view]) {
        ui.warned[view] = true;
        toast('⏱ Ya pasaron ' + cfg.minutes + ' min en esta estación. ¡Intenta cerrarla pronto!', 4000);
      }
      if (view === 'fl') flashTick();
      S.save(st); renderTop();
    }
  }, 1000);
  document.addEventListener('visibilitychange', () => { lastTick = Date.now(); S.save(st); });
  window.addEventListener('pagehide', () => S.save(st));

  /* ---------- inicio ---------- */
  function renderHome() {
    const verify = T ? `
      <section class="card">
        <h2>🔐 Verificar una evidencia</h2>
        <p class="muted small">Copia los datos tal como aparecen en la evidencia del alumno.</p>
        <div class="grid2">
          <label>Nombre<input id="vName"></label><label>Grupo<input id="vGroup"></label>
          <label>Estación 1<input id="vS1" inputmode="numeric"></label><label>Estación 2<input id="vS2" inputmode="numeric"></label>
          <label>Estación 3<input id="vS3" inputmode="numeric"></label><label>Relámpago<input id="vFl" inputmode="numeric"></label>
          <label>Terminó (AAAA-MM-DD HH:MM)<input id="vWhen" placeholder="2026-11-24 10:35"></label><label>Código<input id="vCode" autocapitalize="characters"></label>
        </div>
        <button class="btn" data-act="verify">Verificar</button>
        <p id="vOut" class="verify-out" aria-live="polite"></p>
      </section>` : '';

    const hero = `
      <section class="hero">
        <div class="hero-emoji">🎯🃏🔎⚡</div>
        <h1>Repaso Parcial 3</h1>
        <p class="lead">Media, mediana, moda, varianza, desviación estándar y coeficiente de variación, sin hacer cuentas.</p>
        <ul class="chips"><li>🃏 ¿Quién es quién?</li><li>🎯 Mueve la Media</li><li>🔎 Detective de los Datos</li><li>⚡ Ronda relámpago</li></ul>
        <p class="muted small">⏱ 25 minutos · 📱 Celular o tablet (puedes girar la pantalla) · 💾 Tu avance se guarda solo</p>
        <p class="author">Elaborado por: Dr. T. Huerta</p>
      </section>`;

    if (st.started) {
      app.innerHTML = hero + `
        <section class="card center">
          <p>Hola, <strong>${esc(st.name)}</strong> (${esc(st.group)}). Tu avance está guardado.</p>
          <button class="btn big" data-act="map">Continuar ▶</button>
          <p class="small"><button class="link" data-act="newStudent">¿No eres ${esc(st.name.split(' ')[0])}? Empezar como otro estudiante</button></p>
        </section>` + verify;
      return;
    }

    app.innerHTML = hero + `
      <section class="card">
        <h2>¿Quién juega?</h2>
        <label>Nombre completo<input id="inName" autocomplete="name" placeholder="Nombre y apellidos" maxlength="60"></label>
        <label>Grupo<input id="inGroup" placeholder="Ej. 500 A" maxlength="15"></label>
        <button class="btn big" data-act="start">¡Comenzar! ▶</button>
        <details class="resume">
          <summary>¿Empezaste en otro celular? Usa tu código</summary>
          <p class="small muted">Escribe arriba tu nombre <strong>exactamente igual</strong> que la primera vez y tu grupo, y aquí tu código.</p>
          <label>Código de reanudación<input id="inCode" placeholder="ABCD-EFGH-JKLM-NP" autocapitalize="characters" autocomplete="off"></label>
          <button class="btn ghost" data-act="restore">Recuperar mi avance</button>
        </details>
      </section>` + verify;
  }

  function readNameGroup() {
    const name = $('inName').value.trim().replace(/\s+/g, ' '), group = $('inGroup').value.trim().toUpperCase();
    if (name.split(' ').length < 2) { toast('Escribe tu nombre completo (nombre y apellido).'); $('inName').focus(); return null; }
    if (!group) { toast('Escribe tu grupo.'); $('inGroup').focus(); return null; }
    return { name, group };
  }

  /* ---------- mapa ---------- */
  function renderMap() {
    const p = S.pts(st);
    const items = STAGES.map((k, i) => {
      const c = CFG[k], s = st[k], open = unlocked(k);
      const status = s.done ? '<span class="tag ok">✔ Completa</span>' : open ? (startedStage(k) ? '<span class="tag now">En curso</span>' : '<span class="tag">Pendiente</span>') : '<span class="tag lock">🔒 Bloqueada</span>';
      const mins = k === 'fl' ? '2 min' : c.minutes + ' min';
      return `
        <li class="stage ${open ? '' : 'locked'} ${s.done ? 'done' : ''}">
          <div class="stage-emoji">${c.emoji}</div>
          <div class="stage-body">
            <div class="stage-title">${k === 'fl' ? '' : 'Estación ' + (i + 1) + ' · '}${esc(c.title)}</div>
            <div class="stage-meta">${status} <span class="muted">⏱ ${mins} · ⭐ ${p[k]}/${D.maxPts[k]}</span></div>
          </div>
          ${open ? `<button class="btn ${s.done ? 'ghost' : ''}" data-act="go" data-v="${k}">${s.done ? (T ? 'Ver' : 'Repasar') : startedStage(k) ? 'Seguir' : 'Entrar'}</button>` : ''}
        </li>`;
    }).join('');
    const evid = unlocked('evidence') ? `<button class="btn big success" data-act="go" data-v="evidence">🏆 Ver mi evidencia</button>` : `<p class="muted small center">Completa las 4 partes para generar tu evidencia.</p>`;
    app.innerHTML = `
      <section class="card">
        <h2>Tu ruta</h2>
        <ol class="stages">${items}</ol>
        ${evid}
      </section>
      ${codeBox()}`;
  }
  function startedStage(k) {
    const s = st[k];
    if (k === 's2') return s.idx > 0 || s.values != null;
    if (k === 'fl') return s.answers.length > 0 || s.qStart > 0;
    return s.round > 0 || s.resolved.length > 0 || s.missed.length > 0;
  }
  function codeBox() {
    if (T) return '';
    return `
      <section class="card codebox">
        <div>
          <div class="small muted">💾 Tu código de reanudación</div>
          <div class="code">${S.code(st)}</div>
        </div>
        <p class="small muted">Tu avance se guarda solo en este celular. Si cambias de dispositivo, con tu nombre y este código continúas. Tómale captura: cambia conforme avanzas.</p>
      </section>`;
  }

  /* ---------- estaciones de tarjetas (1 y 3) ---------- */
  function deckOrder(k) {
    const c = CFG[k], s = st[k], r = c.rounds[s.round];
    const salt = k === 's1' ? 101 : 303;
    return {
      round: r,
      cards: S.shuffle(r.cards, st.seed * 7 + salt + s.round * 13),
      zones: k === 's3' ? S.shuffle(r.zones, st.seed * 3 + 17 + s.round) : r.zones
    };
  }

  function histogram(bars) {
    const max = 10, w = 200, base = 104;
    const rects = bars.map((b, i) => {
      const hh = b / max * 92;
      return `<rect x="${4 + i * 19.2}" y="${base - hh}" width="17" height="${hh}" rx="2"></rect>`;
    }).join('');
    return `<svg class="hist" viewBox="0 0 ${w} 110" role="img" aria-hidden="true">${rects}<line x1="0" y1="${base + 0.5}" x2="${w}" y2="${base + 0.5}"></line></svg>`;
  }

  function renderDeck(k) {
    const c = CFG[k], s = st[k];
    const stationNo = k === 's1' ? 1 : 3;

    if (s.done && !ui.roundDone) {
      app.innerHTML = `<section class="card center"><div class="big-emoji">${c.emoji}</div><h2>${esc(c.title)}: completa ✔</h2>
        <p>Obtuviste <strong>${S.pts(st)[k]} de ${D.maxPts[k]}</strong> puntos.</p>
        <button class="btn big" data-act="map">Volver a la ruta</button></section>`;
      return;
    }
    if (ui.roundDone) {
      const rd = ui.roundDone;
      app.innerHTML = `<section class="card center pop">
        <div class="big-emoji">${rd.last ? '🏁' : '✨'}</div>
        <h2>${esc(rd.title)}: ¡lista!</h2>
        <p>Acertaste <strong>${rd.first} de ${rd.n}</strong> al primer intento (+${rd.pts} puntos).</p>
        ${rd.last ? `<p>Terminaste la estación ${stationNo} con <strong>${S.pts(st)[k]} de ${D.maxPts[k]}</strong> puntos.</p>` : ''}
        <button class="btn big" data-act="${rd.last ? 'map' : 'nextRound'}">${rd.last ? 'Volver a la ruta ▶' : 'Siguiente ronda ▶'}</button></section>`;
      return;
    }

    const { round, cards, zones } = deckOrder(k);
    const card = cards.find((x) => !s.resolved.includes(x.id));
    const n = cards.length, done = s.resolved.length;
    const fb = ui.feedback;
    const zoneHtml = zones.map((z, i) => {
      const count = round.cards.filter((x) => x.zone === z.id && s.resolved.includes(x.id)).length;
      const inner = k === 's1'
        ? `<span class="z-label">${esc(z.label)}</span><span class="z-sub">${esc(z.sub)}</span>`
        : `<span class="z-letter">${'ABCD'[i]}</span>${histogram(z.bars)}`;
      const ans = T && card && card.zone === z.id ? ' teacher-ans' : '';
      return `<button class="zone ${k}-zone${ans}" data-act="place" data-zone="${z.id}" aria-label="${k === 's1' ? esc(z.label) : 'Gráfica ' + 'ABCD'[i]}">
        ${inner}<span class="z-count" aria-label="${count} colocadas">${count ? '✔ ' + count : ''}</span></button>`;
    }).join('');

    app.innerHTML = `
      <section class="station ${k}">
        <div class="st-head">
          <div>
            <div class="eyebrow">${c.emoji} Estación ${stationNo} · ${esc(c.title)}</div>
            <h2>${esc(round.title)}</h2>
          </div>
          <div class="progress" aria-label="Progreso"><div style="width:${done / n * 100}%"></div><span>${done}/${n}</span></div>
        </div>
        <div class="deck-wrap">
          <div class="deck">
            ${s.round === 0 && done === 0 && !fb ? `<p class="small muted intro">${esc(c.intro)}</p>` : ''}
            <div class="playcard ${fb && fb.type === 'bad' ? 'shake' : ''}" id="playcard" data-id="${card.id}" tabindex="0" aria-label="Tarjeta: ${esc(card.text)}">
              <span class="pc-hint">${k === 's1' ? '¿Qué medida es?' : '¿Qué gráfica es?'}</span>
              <span class="pc-text">${esc(card.text)}</span>
              <span class="pc-drag" aria-hidden="true">✋ arrastra o toca abajo</span>
            </div>
            <div class="feedback ${fb ? fb.type : ''}" aria-live="polite">${fb ? fb.html : ''}</div>
          </div>
          <div class="zones ${k}-zones">${zoneHtml}</div>
        </div>
      </section>`;
    bindCardDrag(k);
  }

  function place(k, zoneId) {
    const c = CFG[k], s = st[k];
    const { round, cards } = deckOrder(k);
    const card = cards.find((x) => !s.resolved.includes(x.id));
    if (!card) return;
    if (card.zone === zoneId) {
      s.resolved.push(card.id);
      const first = !s.missed.includes(card.id);
      if (first) s.cur += c.ptsPerCard;
      beep(true); buzz(20);
      ui.feedback = { type: 'ok', html: first ? `✔ ¡Correcto! +${c.ptsPerCard}` : '✔ Ahora sí. (Sin puntos: no fue al primer intento)' };
      if (s.resolved.length === round.cards.length) {
        const first2 = round.cards.length - s.missed.length;
        const last = s.round === c.rounds.length - 1;
        ui.roundDone = { title: round.title, first: first2, n: round.cards.length, pts: s.cur, last };
        s.bank += s.cur; s.cur = 0; s.resolved = []; s.missed = [];
        if (last) s.done = true; else s.round += 1;
        ui.feedback = null;
      }
    } else {
      if (!s.missed.includes(card.id)) s.missed.push(card.id);
      beep(false); buzz([40, 40, 40]);
      ui.feedback = { type: 'bad', html: `✘ No es esa. <strong>Pista:</strong> ${esc(card.why)}` };
    }
    save();
    renderDeck(k);
  }

  // Arrastrar la tarjeta hacia una zona (con dedo o mouse)
  function bindCardDrag(k) {
    const el = $('playcard');
    if (!el) return;
    let sx = 0, sy = 0, drag = false, pid = null, over = null;
    const zoneAt = (x, y) => {
      el.style.visibility = 'hidden';
      const t = document.elementFromPoint(x, y);
      el.style.visibility = '';
      return t ? t.closest('.zone') : null;
    };
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      sx = e.clientX; sy = e.clientY; drag = false; pid = e.pointerId;
      el.setPointerCapture(pid);
    });
    el.addEventListener('pointermove', (e) => {
      if (pid !== e.pointerId) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!drag && Math.hypot(dx, dy) > 8) { drag = true; el.classList.add('dragging'); }
      if (drag) {
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-8, Math.min(8, dx / 20))}deg)`;
        const z = zoneAt(e.clientX, e.clientY);
        if (z !== over) { if (over) over.classList.remove('over'); over = z; if (z) z.classList.add('over'); }
      }
    });
    const end = (e) => {
      if (pid !== e.pointerId) return;
      pid = null;
      if (over) over.classList.remove('over');
      el.classList.remove('dragging');
      if (drag) {
        const z = zoneAt(e.clientX, e.clientY);
        el.style.transform = '';
        if (z) place(k, z.dataset.zone);
      } else {
        el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge');
        toast(k === 's1' ? 'Ahora toca la medida correcta 👇' : 'Ahora toca la gráfica correcta 👇', 1600);
      }
      drag = false; over = null;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', (e) => { el.style.transform = ''; end(e); });
    el.addEventListener('keydown', (e) => {
      const n = parseInt(e.key, 10);
      const zs = app.querySelectorAll('.zone');
      if (n >= 1 && n <= zs.length) place(k, zs[n - 1].dataset.zone);
    });
  }

  /* ---------- estación 2: Mueve la Media ---------- */
  function stats(vals) {
    const n = vals.length, a = vals.slice().sort((x, y) => x - y);
    const mean = a.reduce((s, v) => s + v, 0) / n;
    const median = n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
    const freq = {};
    a.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
    const maxf = Math.max(...Object.values(freq));
    const modes = maxf > 1 ? Object.keys(freq).filter((v) => freq[v] === maxf).map(Number) : [];
    const sd = Math.sqrt(a.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    return { mean, median, modes, sd };
  }

  const X0 = 24, DX = 31.2, AXIS = 140;
  const xOf = (v) => X0 + v * DX;
  const valAt = (x) => Math.max(0, Math.min(10, Math.round((x - X0) / DX)));

  function dotsSvg(vals, sel) {
    const s = stats(vals);
    const seen = {};
    let ticks = '';
    for (let v = 0; v <= 10; v++) ticks += `<line class="tick" x1="${xOf(v)}" y1="${AXIS - 4}" x2="${xOf(v)}" y2="${AXIS + 4}"></line><text class="tlabel" x="${xOf(v)}" y="${AXIS + 20}">${v}</text>`;
    const dots = vals.map((v, i) => {
      const k = seen[v] = (seen[v] || 0) + 1;
      const cy = AXIS - 13 - (k - 1) * 20;
      return `<g class="dot ${sel === i ? 'sel' : ''}" data-dot="${i}"><circle class="hit" cx="${xOf(v)}" cy="${cy}" r="15"></circle><circle class="d" cx="${xOf(v)}" cy="${cy}" r="10"></circle></g>`;
    }).join('');
    const mx = xOf(s.mean), md = xOf(s.median);
    return `
      <rect class="bg" x="0" y="8" width="360" height="192"></rect>
      <line class="axis" x1="${X0 - 10}" y1="${AXIS}" x2="${xOf(10) + 10}" y2="${AXIS}"></line>${ticks}
      <g class="mk mean"><path d="M${mx} ${AXIS + 28} l-8 12 h16 z"></path><text x="${mx}" y="${AXIS + 54}">x̄</text></g>
      <g class="mk median"><path d="M${md} ${AXIS + 28} l8 8 l-8 8 l-8 -8 z" transform="translate(0 0)"></path></g>
      ${dots}`;
  }

  function s2Stats(vals) {
    const s = stats(vals);
    return `
      <div class="stat mean"><span>Media x̄</span><strong>${f2(s.mean)}</strong></div>
      <div class="stat median"><span>Mediana</span><strong>${f2(s.median)}</strong></div>
      <div class="stat mode"><span>Moda</span><strong>${s.modes.length ? s.modes.join(' y ') : 'no hay'}</strong></div>
      <div class="stat sd"><span>Desv. est. σ</span><strong>${f2(s.sd)}</strong></div>`;
  }

  function renderS2() {
    const c = D.s2, s = st.s2;
    if (ui.s2win) {
      const w = ui.s2win, last = s.done;
      app.innerHTML = `<section class="card center pop">
        <div class="big-emoji">${w.pts ? '🎯' : '⏭️'}</div>
        <h2>${w.pts ? '¡Reto cumplido! +' + w.pts : 'Reto saltado'}</h2>
        <p class="insight">💡 ${esc(w.win)}</p>
        ${last ? `<p>Terminaste la estación 2 con <strong>${s.bank} de ${D.maxPts.s2}</strong> puntos.</p>` : ''}
        <button class="btn big" data-act="${last ? 'map' : 's2next'}">${last ? 'Volver a la ruta ▶' : 'Siguiente reto ▶'}</button></section>`;
      return;
    }
    if (s.done) {
      app.innerHTML = `<section class="card center"><div class="big-emoji">🎯</div><h2>Mueve la Media: completa ✔</h2>
        <p>Obtuviste <strong>${s.bank} de ${D.maxPts.s2}</strong> puntos.</p><button class="btn big" data-act="map">Volver a la ruta</button></section>`;
      return;
    }
    const ch = c.challenges[s.idx];
    if (!s.values) { s.values = ch.start.slice(); S.save(st); }
    const fb = ui.feedback;
    const worth = s.tries === 0 ? 3 : s.tries === 1 ? 2 : 1;
    app.innerHTML = `
      <section class="station s2">
        <div class="st-head">
          <div>
            <div class="eyebrow">🎯 Estación 2 · Mueve la Media · Reto ${s.idx + 1} de ${c.challenges.length}</div>
            <h2>${esc(ch.title)}</h2>
          </div>
          <div class="progress"><div style="width:${s.idx / c.challenges.length * 100}%"></div><span>${s.idx}/${c.challenges.length}</span></div>
        </div>
        <div class="s2-grid">
          <div class="s2-left">
            <div class="goal"><span class="small muted">${esc(ch.context)}</span><br><strong>🎯 ${esc(ch.goal)}</strong> <span class="worth">vale ${worth} ⭐</span></div>
            <svg id="dots" class="dots" viewBox="0 8 360 192" role="application" aria-label="Recta numérica con puntos movibles">${dotsSvg(s.values, ui.s2sel)}</svg>
            <div class="legend small"><span class="lg mean">▲ media</span><span class="lg median">◆ mediana</span><span class="muted">${s.idx === 0 && s.tries === 0 ? 'Toca un punto y luego toca a dónde llevarlo, o arrástralo.' : ''}</span></div>
          </div>
          <div class="s2-right">
            <div class="stats" id="s2stats">${s2Stats(s.values)}</div>
            <div class="actions">
              <button class="btn big" data-act="s2check">Comprobar</button>
              <button class="btn ghost" data-act="s2reset">↺ Reiniciar puntos</button>
              <button class="btn ghost" data-act="s2hint">💡 Pista</button>
              ${s.tries >= 3 ? '<button class="btn ghost" data-act="s2skip">Saltar reto (0 ⭐)</button>' : ''}
              ${T ? '<button class="btn ghost teacher-only" data-act="s2sol">👩‍🏫 Ver una solución</button>' : ''}
            </div>
            ${s.hint ? `<div class="hintbox">💡 ${esc(ch.hint)}</div>` : ''}
            <div class="feedback ${fb ? fb.type : ''}" aria-live="polite">${fb ? fb.html : ''}</div>
          </div>
        </div>
      </section>`;
    bindDots();
  }

  function s2Live() {
    const svg = $('dots');
    if (!svg) return;
    svg.innerHTML = dotsSvg(st.s2.values, ui.s2sel);
    $('s2stats').innerHTML = s2Stats(st.s2.values);
  }

  function bindDots() {
    const svg = $('dots');
    let drag = null;
    const toSvg = (e) => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };
    svg.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('[data-dot]');
      const p = toSvg(e);
      if (g) {
        drag = { i: +g.dataset.dot, sx: e.clientX, moved: false, id: e.pointerId };
        svg.setPointerCapture(e.pointerId);
        e.preventDefault();
      } else if (ui.s2sel != null) {
        st.s2.values[ui.s2sel] = valAt(p.x);
        ui.s2sel = null; S.save(st); s2Live();
      }
    });
    svg.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      if (!drag.moved && Math.abs(e.clientX - drag.sx) > 5) drag.moved = true;
      if (drag.moved) {
        const v = valAt(toSvg(e).x);
        if (v !== st.s2.values[drag.i]) { st.s2.values[drag.i] = v; ui.s2sel = drag.i; s2Live(); }
      }
    });
    const end = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      if (!drag.moved) ui.s2sel = ui.s2sel === drag.i ? null : drag.i;
      else ui.s2sel = null;
      drag = null; S.save(st); s2Live();
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
  }

  document.addEventListener('keydown', (e) => {
    if (view !== 's2' || ui.s2sel == null || !$('dots')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const i = ui.s2sel, v = st.s2.values[i] + (e.key === 'ArrowRight' ? 1 : -1);
      st.s2.values[i] = Math.max(0, Math.min(10, v)); S.save(st); s2Live(); e.preventDefault();
    } else if (e.key === 'Escape') { ui.s2sel = null; s2Live(); }
  });

  function s2check() {
    const s = st.s2, ch = D.s2.challenges[s.idx];
    const r = ch.check(stats(s.values));
    if (r === true) {
      const pts = s.tries === 0 ? 3 : s.tries === 1 ? 2 : 1;
      finishChallenge(pts, ch);
      beep(true); buzz(30);
    } else {
      s.tries += 1;
      beep(false); buzz([40, 40, 40]);
      ui.feedback = { type: 'bad', html: '✘ ' + esc(r) + (s.tries >= 2 && !s.hint ? ' <br><span class="small">¿Quieres una 💡 pista?</span>' : '') };
      save(); renderS2();
    }
  }
  function finishChallenge(pts, ch) {
    const s = st.s2;
    s.results.push(pts); s.bank += pts;
    s.idx += 1; s.tries = 0; s.values = null; s.hint = false;
    if (s.idx >= D.s2.challenges.length) s.done = true;
    ui.s2win = { pts, win: ch.win }; ui.s2sel = null; ui.feedback = null;
    save(); renderS2();
  }

  /* ---------- ronda relámpago ---------- */
  function flOrder() { return S.shuffle(D.fl.questions, st.seed * 11 + 5); }
  function flOptions(q, qi) {
    return S.shuffle(q.options.map((t, i) => ({ t, ok: i === q.answer })), st.seed * 19 + qi * 7 + 3);
  }
  function flRemaining() {
    const f = st.fl;
    if (!f.qStart) return D.fl.seconds;
    return Math.max(0, D.fl.seconds - (Date.now() - f.qStart) / 1000);
  }

  function renderFlash() {
    const f = st.fl, qs = flOrder(), n = qs.length;
    if (ui.flFeedback) {
      const fb = ui.flFeedback, last = f.done;
      app.innerHTML = `<section class="card center pop flash-fb ${fb.ok ? 'ok' : 'bad'}">
        <div class="big-emoji">${fb.ok ? '⚡🎉' : fb.timeout ? '⌛' : '😬'}</div>
        <h2>${fb.ok ? '¡Correcto! +' + D.fl.pts : fb.timeout ? '¡Se acabó el tiempo!' : 'Nop'}</h2>
        <p>Respuesta: <strong>${esc(fb.answer)}</strong></p>
        <p class="insight">${esc(fb.why)}</p>
        <button class="btn big" data-act="${last ? 'evidence' : 'flnext'}">${last ? '🏆 Ver mi evidencia' : 'Siguiente ⚡'}</button></section>`;
      return;
    }
    if (f.done) {
      app.innerHTML = `<section class="card center"><div class="big-emoji">⚡</div><h2>Ronda relámpago: completa ✔</h2>
        <p>Obtuviste <strong>${f.bank} de ${D.maxPts.fl}</strong> puntos.</p>
        <button class="btn big success" data-act="go" data-v="evidence">🏆 Ver mi evidencia</button></section>`;
      return;
    }
    const qi = f.answers.length, q = qs[qi];
    if (!f.qStart && !T) {
      app.innerHTML = `<section class="card center">
        <div class="big-emoji">⚡</div><h2>Ronda relámpago</h2>
        <p>${qi === 0 ? esc(D.fl.intro) : 'Vas en la pregunta ' + (qi + 1) + ' de ' + n + '. El reloj arranca al tocar el botón.'}</p>
        <button class="btn big" data-act="flstart">${qi === 0 ? '¡Empezar!' : 'Continuar'} ⚡</button></section>`;
      return;
    }
    const opts = flOptions(q, qi);
    const rem = flRemaining();
    app.innerHTML = `
      <section class="station fl">
        <div class="st-head">
          <div><div class="eyebrow">⚡ Ronda relámpago · Pregunta ${qi + 1} de ${n}</div><span class="qtag">${esc(q.tag)}</span></div>
          ${T ? '' : `<div class="clock" id="flClock">${Math.ceil(rem)}</div>`}
        </div>
        ${T ? '' : `<div class="timebar"><div id="flBar" style="width:${rem / D.fl.seconds * 100}%"></div></div>`}
        <p class="question">${esc(q.text)}</p>
        <div class="options">${opts.map((o, i) => `<button class="opt ${T && o.ok ? 'teacher-ans' : ''}" data-act="flanswer" data-i="${i}"><span class="opt-l">${'ABCD'[i]}</span>${esc(o.t)}</button>`).join('')}</div>
      </section>`;
  }

  function flashTick() {
    const f = st.fl;
    if (T || f.done || !f.qStart || ui.flFeedback) return;
    const rem = flRemaining();
    const clock = $('flClock'), bar = $('flBar');
    if (clock) { clock.textContent = Math.ceil(rem); clock.classList.toggle('hurry', rem <= 10); }
    if (bar) bar.style.width = (rem / D.fl.seconds * 100) + '%';
    if (rem <= 0) flAnswer(-1);
  }

  function flAnswer(i) {
    const f = st.fl, qs = flOrder(), qi = f.answers.length, q = qs[qi];
    if (!q) return;
    const opts = flOptions(q, qi);
    const timeout = i < 0 || (!T && flRemaining() <= 0);
    const ok = !timeout && opts[i] && opts[i].ok;
    const pts = ok ? D.fl.pts : 0;
    f.answers.push({ id: q.id, ok, pts, timeout });
    f.bank += pts; f.qStart = 0;
    if (f.answers.length >= qs.length) { f.done = true; st.finishedAt = st.finishedAt || S.stamp(new Date()); }
    ui.flFeedback = { ok, timeout, answer: q.options[q.answer], why: q.why };
    beep(ok); buzz(ok ? 30 : [40, 40, 40]);
    save(); renderFlash();
  }

  // Si recargan a media pregunta, el reloj sigue: al volver se revisa
  function flashResumeCheck() {
    if (st.fl.qStart && !st.fl.done && flRemaining() <= 0) { view = 'fl'; flAnswer(-1); }
  }

  /* ---------- evidencia ---------- */
  function evidenceData() {
    const p = S.pts(st), total = S.total(st);
    const when = st.finishedAt || S.stamp(new Date());
    return { p, total, grade: D.grade(total), when, code: S.verify(st.name, st.group, p, when), complete: st.fl.done && st.s1.done && st.s2.done && st.s3.done };
  }

  function renderEvidence() {
    const e = evidenceData();
    const row = (k, label) => `<tr><td>${CFG[k].emoji} ${label}</td><td class="num">${e.p[k]} / ${D.maxPts[k]}</td></tr>`;
    app.innerHTML = `
      <section class="card evidence" id="evidenceCard">
        <div class="ev-head"><div class="big-emoji">🏆</div><div><h2>Evidencia · Repaso Parcial 3</h2><div class="small muted">Razonamiento Matemático V · Preparatoria</div></div></div>
        <div class="ev-who"><div><span class="small muted">Estudiante</span><strong>${esc(st.name)}</strong></div><div><span class="small muted">Grupo</span><strong>${esc(st.group)}</strong></div><div><span class="small muted">Terminó</span><strong>${esc(e.when)}</strong></div></div>
        <table class="ev-table">
          ${row('s1', 'Estación 1 · ¿Quién es quién?')}
          ${row('s2', 'Estación 2 · Mueve la Media')}
          ${row('s3', 'Estación 3 · Detective de los Datos')}
          ${row('fl', 'Ronda relámpago')}
          <tr class="tot"><td>Total</td><td class="num">${e.total} / ${D.maxTotal}</td></tr>
        </table>
        <div class="ev-grade"><div><span class="small muted">Calificación</span><strong class="${e.grade >= 6 ? 'ok' : 'bad'}">${e.grade}</strong></div>
          <div><span class="small muted">Código de verificación</span><strong class="code">${e.code}</strong></div></div>
        ${e.complete ? '' : '<p class="bad-text small">⚠️ Faltan partes por completar.</p>'}
        <p class="author">Elaborado por: Dr. T. Huerta</p>
      </section>
      <section class="card center">
        <button class="btn big success" data-act="png">⬇️ Descargar evidencia (imagen)</button>
        <p class="small muted">Si no se descarga, toma captura de pantalla de la tarjeta de arriba. Súbela a la actividad de Blackboard.</p>
        <button class="btn ghost" data-act="map">Volver a la ruta</button>
      </section>`;
  }

  function evidencePng() {
    const e = evidenceData();
    const W = 1200, H = 900, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const font = (s, b) => `${b ? '700' : '400'} ${s}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    const rr = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
    c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#2F6FEB'; c.fillRect(0, 0, W, 130);
    c.fillStyle = '#FFFFFF'; c.font = font(46, true); c.fillText('Repaso Parcial 3 · Evidencia', 50, 76);
    c.font = font(22); c.fillText('Tendencia central y dispersión · Razonamiento Matemático V', 50, 112);
    const lab = (t, x, y) => { c.fillStyle = '#5A6077'; c.font = font(20); c.fillText(t, x, y); };
    const val = (t, x, y, s, mw) => { c.fillStyle = '#1C2033'; c.font = font(s || 32, true); c.fillText(t, x, y, mw); };
    lab('Estudiante', 50, 185); val(st.name, 50, 225, 34, 640);
    lab('Grupo', 730, 185); val(st.group, 730, 225, 30, 160);
    lab('Terminó', 920, 185); val(e.when, 920, 225, 24, 240);
    const rows = [['Estación 1 · ¿Quién es quién?', 's1'], ['Estación 2 · Mueve la Media', 's2'], ['Estación 3 · Detective de los Datos', 's3'], ['Ronda relámpago', 'fl']];
    let y = 280;
    c.fillStyle = '#EEF1F8'; rr(50, y, 680, 54, 10); c.fill();
    lab('Parte', 70, y + 35); lab('Puntos', 590, y + 35);
    rows.forEach(([t, k], i) => {
      const yy = y + 54 + i * 64;
      c.strokeStyle = '#DDE2EE'; c.lineWidth = 2; c.beginPath(); c.moveTo(50, yy + 64); c.lineTo(730, yy + 64); c.stroke();
      val(t, 70, yy + 42, 24); val(e.p[k] + ' / ' + D.maxPts[k], 590, yy + 42, 26);
    });
    const ty = y + 54 + 4 * 64;
    val('Total', 70, ty + 48, 28); val(e.total + ' / ' + D.maxTotal, 590, ty + 48, 30);
    // Calificación
    c.fillStyle = '#E3ECFF'; rr(780, 280, 370, 380, 18); c.fill();
    c.textAlign = 'center';
    c.fillStyle = '#2F6FEB'; c.font = font(26, true); c.fillText('Calificación', 965, 330);
    c.fillStyle = e.grade >= 6 ? '#18915A' : '#D33B3B'; c.font = font(150, true); c.fillText(String(e.grade), 965, 490);
    c.fillStyle = '#5A6077'; c.font = font(20); c.fillText('Código de verificación', 965, 570);
    c.fillStyle = '#1C2033'; c.font = font(36, true); c.fillText(e.code, 965, 615);
    c.textAlign = 'left';
    if (!e.complete) { c.fillStyle = '#D33B3B'; c.font = font(22, true); c.fillText('Faltan partes por completar', 50, ty + 100); }
    c.fillStyle = '#DDE2EE'; c.fillRect(50, H - 130, W - 100, 2);
    c.fillStyle = '#1C2033'; c.font = font(24, true); c.fillText('Elaborado por: Dr. T. Huerta', 50, H - 80);
    c.fillStyle = '#5A6077'; c.font = font(20); c.fillText('Razonamiento Matemático V · Parcial 3 · Preparatoria', 50, H - 46);
    const slug = (st.name || 'estudiante').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '_');
    cv.toBlob((blob) => {
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'Evidencia_RepasoP3_' + slug + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
  }

  /* ---------- menú ---------- */
  function openModal(html) { $('modalBody').innerHTML = html; $('modal').hidden = false; }
  function closeModal() { $('modal').hidden = true; }
  $('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('modal').hidden) closeModal(); });

  function openMenu() {
    const code = st.started && !T ? `<div class="codebox inmodal"><div class="small muted">💾 Código de reanudación</div><div class="code">${S.code(st)}</div>
      <p class="small muted">Con tu nombre y este código continúas en otro dispositivo.</p></div>` : '';
    openModal(`
      <h2 id="modalTitle">Menú</h2>
      ${code}
      <div class="menu-list">
        ${st.started ? '<button class="btn ghost" data-act="map">🗺️ Ver mi ruta</button>' : ''}
        <button class="btn ghost" data-act="howto">❓ Cómo se juega</button>
        ${st.started ? '<button class="btn ghost danger" data-act="newStudent">👤 Nuevo estudiante en este dispositivo</button>' : ''}
      </div>
      <button class="btn" data-act="close">Cerrar</button>
      <p class="author small">Elaborado por: Dr. T. Huerta</p>`);
  }

  function howto() {
    openModal(`
      <h2 id="modalTitle">Cómo se juega</h2>
      <ul class="howto">
        <li>🃏 <strong>Estación 1:</strong> manda cada tarjeta a su medida. 1 ⭐ si aciertas al primer intento.</li>
        <li>🎯 <strong>Estación 2:</strong> mueve los puntos hasta cumplir el reto. 3, 2 o 1 ⭐ según tus intentos.</li>
        <li>🔎 <strong>Estación 3:</strong> une cada etiqueta con su gráfica. 2 ⭐ al primer intento.</li>
        <li>⚡ <strong>Relámpago:</strong> 4 preguntas de 30 s. 2 ⭐ cada una.</li>
        <li>Si te equivocas, verás una pista y puedes volver a intentar (ya sin puntos).</li>
        <li>💾 Todo se guarda solo. Si se cierra la página, vuelve a abrirla y sigues donde ibas.</li>
      </ul>
      <button class="btn" data-act="close">Entendido</button>`);
  }

  /* ---------- acciones ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    switch (act) {
      case 'home': closeModal(); go('home'); break;
      case 'map': closeModal(); ui.roundDone = null; ui.s2win = null; ui.flFeedback = null; go('map'); break;
      case 'go': ui.roundDone = null; ui.s2win = null; ui.flFeedback = null; go(b.dataset.v); break;
      case 'evidence': ui.flFeedback = null; go('evidence'); break;
      case 'sound': st.sound = !st.sound; save(); if (st.sound) beep(true); break;
      case 'menu': openMenu(); break;
      case 'close': closeModal(); break;
      case 'howto': howto(); break;
      case 'start': {
        const ng = readNameGroup(); if (!ng) return;
        st = S.fresh(); st.name = ng.name; st.group = ng.group; st.started = true;
        save(); go('map'); howto(); break;
      }
      case 'restore': {
        const ng = readNameGroup(); if (!ng) return;
        const r = S.restore($('inCode').value, ng.name, ng.group);
        if (typeof r === 'string') { toast('⚠️ ' + r, 4500); return; }
        st = r; save(); toast('✅ ¡Avance recuperado!'); go('map'); break;
      }
      case 'newStudent': {
        const msg = T ? '¿Borrar el avance del modo docente?' : `Se borrará de este dispositivo el avance de ${st.name}.\n\nAntes, anota su código: ${S.code(st)}\n\n¿Continuar?`;
        if (confirm(msg)) { closeModal(); S.clear(); st = S.fresh(); ui.roundDone = ui.s2win = ui.flFeedback = null; go('home'); }
        break;
      }
      case 'place': place(view, b.dataset.zone); break;
      case 'nextRound': ui.roundDone = null; ui.feedback = null; renderDeck(view); break;
      case 's2check': s2check(); break;
      case 's2reset': st.s2.values = D.s2.challenges[st.s2.idx].start.slice(); ui.s2sel = null; ui.feedback = null; save(); renderS2(); break;
      case 's2hint': st.s2.hint = true; save(); renderS2(); break;
      case 's2skip': finishChallenge(0, D.s2.challenges[st.s2.idx]); break;
      case 's2sol': st.s2.values = D.s2.challenges[st.s2.idx].solution.slice(); save(); renderS2(); break;
      case 's2next': ui.s2win = null; renderS2(); break;
      case 'flstart': st.fl.qStart = Date.now(); save(); renderFlash(); break;
      case 'flanswer': flAnswer(+b.dataset.i); break;
      case 'flnext': ui.flFeedback = null; st.fl.qStart = Date.now(); save(); renderFlash(); break;
      case 'png': evidencePng(); break;
      case 'verify': {
        const p = { s1: +$('vS1').value || 0, s2: +$('vS2').value || 0, s3: +$('vS3').value || 0, fl: +$('vFl').value || 0 };
        const code = S.verify($('vName').value, $('vGroup').value, p, $('vWhen').value);
        const ok = code === $('vCode').value.trim().toUpperCase();
        $('vOut').innerHTML = ok ? '✅ La evidencia es auténtica.' : '❌ No coincide. Revisa que copiaste todo igual; si es así, la evidencia fue alterada.';
        $('vOut').className = 'verify-out ' + (ok ? 'ok' : 'bad');
        break;
      }
    }
  });

  /* ---------- arranque ---------- */
  flashResumeCheck();
  const startView = st.started ? (st.view && st.view !== 'home' ? st.view : 'map') : 'home';
  go(startView === 'fl' && ui.flFeedback ? 'fl' : startView);
})();
