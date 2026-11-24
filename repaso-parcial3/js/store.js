/* ===== Repaso Parcial 3 · estado, guardado y código de reanudación ===== */
(function () {
  'use strict';
  const S = {};
  window.Store = S;

  S.teacher = new URLSearchParams(location.search).has('docente');
  const KEY = S.teacher ? 'rp3-docente-v1' : 'rp3-v1';
  const SALT = 'xochi-rp3-huerta';

  S.fresh = (seed) => ({
    v: 1,
    seed: seed == null ? Math.floor(Math.random() * 65536) : seed,
    name: '', group: '', started: false, sound: false,
    s1: { round: 0, resolved: [], missed: [], bank: 0, cur: 0, done: false, ms: 0 },
    s2: { idx: 0, tries: 0, values: null, bank: 0, results: [], done: false, ms: 0, hint: false },
    s3: { round: 0, resolved: [], missed: [], bank: 0, cur: 0, done: false, ms: 0 },
    fl: { idx: 0, qStart: 0, answers: [], bank: 0, done: false, ms: 0 },
    finishedAt: null
  });

  S.load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const st = JSON.parse(raw);
        if (st && st.v === 1) return st;
      }
    } catch (e) { /* almacenamiento no disponible */ }
    return S.fresh();
  };

  S.save = (st) => {
    try { localStorage.setItem(KEY, JSON.stringify(st)); return true; } catch (e) { return false; }
  };

  S.clear = () => { try { localStorage.removeItem(KEY); } catch (e) { /* nada */ } };

  S.pts = (st) => ({
    s1: st.s1.bank + st.s1.cur,
    s2: st.s2.bank,
    s3: st.s3.bank + st.s3.cur,
    fl: st.fl.bank
  });
  S.total = (st) => { const p = S.pts(st); return p.s1 + p.s2 + p.s3 + p.fl; };

  /* ---------- utilidades ---------- */
  S.norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

  S.hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return h >>> 0;
  };

  S.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  S.shuffle = (arr, seed) => {
    const r = S.rng(seed), a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  /* ---------- código de reanudación ----------
     Guarda las rondas/retos TERMINADOS y sus puntos (la ronda en curso se reinicia).
     Va ligado al nombre del estudiante para que no se pueda prestar. */
  const ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 símbolos, sin 0/O/1/I
  const FIELDS = [['ver', 3], ['seed', 16], ['s1r', 2], ['s1b', 5], ['s2i', 3], ['s2b', 5], ['s3r', 2], ['s3b', 5], ['fli', 3], ['flb', 4]];

  function packFields(f) {
    let n = 0n;
    FIELDS.forEach(([k, bits]) => { n = (n << BigInt(bits)) | BigInt(f[k] & ((1 << bits) - 1)); });
    return n;
  }
  function unpackFields(n) {
    const f = {};
    for (let i = FIELDS.length - 1; i >= 0; i--) {
      const [k, bits] = FIELDS[i];
      f[k] = Number(n & BigInt((1 << bits) - 1));
      n >>= BigInt(bits);
    }
    return f;
  }

  S.code = (st) => {
    const f = {
      ver: 1, seed: st.seed,
      s1r: st.s1.done ? 3 : st.s1.round, s1b: st.s1.done ? st.s1.bank + st.s1.cur : st.s1.bank,
      s2i: st.s2.done ? 7 : st.s2.idx, s2b: st.s2.bank,
      s3r: st.s3.done ? 3 : st.s3.round, s3b: st.s3.done ? st.s3.bank + st.s3.cur : st.s3.bank,
      fli: st.fl.done ? 7 : st.fl.answers.length, flb: st.fl.bank
    };
    const body = packFields(f); // 48 bits
    const chk = S.hash(body.toString(36) + '|' + S.norm(st.name) + '|' + SALT) & 0xFFFFF; // 20 bits
    let n = (body << 20n) | BigInt(chk);
    let out = '';
    for (let i = 0; i < 14; i++) { out = ALPHA[Number(n & 31n)] + out; n >>= 5n; }
    return out.slice(0, 4) + '-' + out.slice(4, 8) + '-' + out.slice(8, 12) + '-' + out.slice(12);
  };

  // Devuelve un estado nuevo o un texto de error
  S.restore = (codeStr, name, group) => {
    const clean = (codeStr || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/I/g, '1');
    if (clean.length !== 14) return 'El código debe tener 14 caracteres (por ejemplo ABCD-EFGH-JKLM-NP).';
    let n = 0n;
    for (const ch of clean) {
      const v = ALPHA.indexOf(ch);
      if (v < 0) return 'El código tiene un carácter que no existe: ' + ch;
      n = (n << 5n) | BigInt(v);
    }
    const chk = Number(n & 0xFFFFFn);
    const body = n >> 20n;
    if ((S.hash(body.toString(36) + '|' + S.norm(name) + '|' + SALT) & 0xFFFFF) !== chk) {
      return 'El código no corresponde a ese nombre. Escribe tu nombre exactamente igual que la primera vez.';
    }
    const f = unpackFields(body);
    if (f.ver !== 1) return 'Ese código es de otra versión de la actividad.';
    const D = window.DATA;
    const st = S.fresh(f.seed);
    st.name = name.trim(); st.group = group.trim(); st.started = true;
    if (f.s1r >= 3) { st.s1.done = true; st.s1.round = D.s1.rounds.length - 1; st.s1.bank = f.s1b; } else { st.s1.round = f.s1r; st.s1.bank = f.s1b; }
    if (f.s2i >= 7) { st.s2.done = true; st.s2.idx = D.s2.challenges.length; } else { st.s2.idx = f.s2i; }
    st.s2.bank = f.s2b; st.s2.results = Array(st.s2.idx).fill(null);
    if (f.s3r >= 3) { st.s3.done = true; st.s3.round = D.s3.rounds.length - 1; st.s3.bank = f.s3b; } else { st.s3.round = f.s3r; st.s3.bank = f.s3b; }
    const nq = f.fli >= 7 ? D.fl.questions.length : f.fli;
    st.fl.answers = Array(nq).fill(null).map(() => ({ restored: true }));
    st.fl.idx = nq; st.fl.bank = f.flb; st.fl.done = f.fli >= 7;
    if (st.fl.done) st.finishedAt = stamp(new Date());
    return st;
  };

  /* ---------- código de verificación de la evidencia ---------- */
  function stamp(d) {
    const p = (x) => String(x).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  S.stamp = stamp;

  S.verify = (name, group, p, when) => {
    const str = [S.norm(name), S.norm(group), p.s1, p.s2, p.s3, p.fl, (when || '').trim(), SALT].join('|');
    let h = S.hash(str), out = '';
    for (let i = 0; i < 7; i++) { out += ALPHA[h & 31]; h = Math.floor(h / 32) || S.hash(out + str); }
    return out;
  };
})();
