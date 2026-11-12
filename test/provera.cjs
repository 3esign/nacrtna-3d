// Provera index.html: (1) pravilo prenosenja = prava 3D projekcija, oba lanca; (2) podaci zadataka; (3) vidljivost
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const blk = n => html.split('//' + n + '-BEGIN')[1].split('//' + n + '-END')[0];
const api = new Function(blk('MATH') + blk('TASKS') + '; return {frames,coords,norm,distPL,add,sub,mul,dot,solid,inS,edgeRuns,ZAD,setupTask};')();
const { frames, coords, norm, distPL, add, sub, mul, dot, solid, inS, edgeRuns, ZAD, setupTask } = api;
const HP = Math.PI / 2, rnd = (a, b) => a + Math.random() * (b - a);
let fail = 0; const bad = m => { fail++; console.log('  PADA: ' + m); };

// 1) matematika
let max = { ortho3: 0, ortho4: 0, d1: 0, d2: 0, flatY: 0, side: 0 }, N = 4000;
for (let i = 0; i < N; i++) {
  const base = i % 2 ? 1 : 2;
  const S = { base, A: [rnd(6, 8), base === 1 ? rnd(-4, -1) : rnd(1, 4)], th: rnd(-1.5, 3), B: [rnd(-1, 1), rnd(6, 8)], ps: rnd(-1.5, 1.5) };
  const P = [rnd(0.5, 5), rnd(0.5, 5), rnd(0.5, 5)]; norm(S, [P]); const k = coords(S, P);
  if (k.s < 0 || k.w < 0) max.side++;
  const F = frames(S, 0, 0, 0);
  const v3 = sub(P, F.pi3(k.t, k.h));           // upravan na π3, duzine s, u smeru M3 (ka posmatracu)
  max.ortho3 = Math.max(max.ortho3, Math.abs(dot(v3, F.D)), Math.abs(dot(v3, F.H)), Math.abs(dot(v3, F.M3) - k.s));
  const v4 = sub(P, F.pi4(k.r, k.s));           // upravan na π4, duzine w, u smeru -N4
  max.ortho4 = Math.max(max.ortho4, Math.abs(dot(v4, F.E)), Math.abs(dot(v4, F.K)), Math.abs(dot(v4, F.N4) + k.w));
  const G = frames(S, HP, HP, HP);
  const q1 = G.pi1(k.x, -k.y), q2 = G.pi2(k.x, k.z), q3 = G.pi3(k.t, k.h), q4 = G.pi4(k.r, k.s), qk = base === 1 ? q1 : q2, qd = base === 1 ? q2 : q1;
  const a3 = G.pi3(0, 0), b3 = G.pi3(1, 0), a4 = G.pi4(0, 0), b4 = G.pi4(1, 0);
  max.d1 = Math.max(max.d1, Math.abs(distPL(qd, [0, 0, 0], [1, 0, 0]) - distPL(q3, a3, b3)), Math.abs(distPL(q3, a3, b3) - (base === 1 ? P[2] : P[1])));
  max.d2 = Math.max(max.d2, Math.abs(distPL(qk, a3, b3) - distPL(q4, a4, b4)), Math.abs(distPL(q4, a4, b4) - k.s));
  max.flatY = Math.max(max.flatY, ...[q1, q2, q3, q4].map(q => Math.abs(q[1])));
  const side = (p, a, b) => (p[0] - a[0]) * (b[2] - a[2]) - (p[2] - a[2]) * (b[0] - a[0]);
  if (side(qk, a3, b3) * side(q3, a3, b3) > 0) max.side++;   // nova projekcija je preko ose
  if (side(q3, a4, b4) * side(q4, a4, b4) > 0) max.side++;
}
console.log('1) ' + N + ' slucajnih polozaja (oba lanca), najvece odstupanje:', JSON.stringify(max));
if (!(max.ortho3 < 1e-9 && max.ortho4 < 1e-9 && max.d1 < 1e-9 && max.d2 < 1e-9 && max.flatY < 1e-9 && max.side === 0)) bad('matematika');

// 2) zadaci
const OFF = []; for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) for (const c of [-1, 0, 1]) if (a || b || c) OFF.push([a * .03, b * .03, c * .03]);
const onSurf = (B, p) => { let i = 0, o = 0; for (const d of OFF) solid(B, add(p, d)) ? i++ : o++; return i > 0 && o > 0; };
for (const [name, z] of Object.entries(ZAD)) {
  const ids = Object.keys(z.V).map(Number), P = ids.map(i => z.V[i]);
  let e0 = fail;
  for (const i of ids) if (!onSurf(z.body, z.V[i])) bad(`${name}: teme ${i} nije na povrsini tela`);
  for (const [a, b] of z.E) {
    if (!z.V[a] || !z.V[b]) { bad(`${name}: ivica ${a}-${b} nema teme`); continue; }
    for (const f of [.2, .5, .8]) { const p = add(mul(z.V[a], 1 - f), mul(z.V[b], f)); if (!onSurf(z.body, p)) bad(`${name}: ivica ${a}-${b} nije na povrsini (${f})`); if (inS(z.body, p, .0137)) bad(`${name}: ivica ${a}-${b} je u telu`); }
  }
  // poklapanja procitana sa lista
  for (const pl of [1, 2]) for (const g of (z.coin[pl] || [])) {
    const q = g.split(',').map(Number).map(i => pl === 1 ? [z.V[i][0], z.V[i][1]] : [z.V[i][0], z.V[i][2]]);
    if (q.some(v => Math.hypot(v[0] - q[0][0], v[1] - q[0][1]) > 1e-6)) bad(`${name}: na listu se poklapaju ${g}${pl === 1 ? "'" : '"'}, u modelu ne`);
  }
  // ose ne seku predmet; ugao ose 3x4 u crtezu jednak zadatom
  const S = setupTask(z, P), C = P.map(p => coords(S, p)), G = frames(S, HP, HP, HP);
  const smin = Math.min(...C.map(k => k.s)), wmin = Math.min(...C.map(k => k.w)), hmin = Math.min(...C.map(k => k.h));
  if (smin <= 0 || wmin <= 0) bad(`${name}: osa sece predmet (s ${smin.toFixed(2)}, w ${wmin.toFixed(2)})`);
  const a4 = G.pi4(0, 0), b4 = G.pi4(1, 0), ang4 = Math.atan2(b4[2] - a4[2], b4[0] - a4[0]) * 180 / Math.PI;
  const dA = ((ang4 - z.ax4.ang) % 180 + 180) % 180; if (Math.min(dA, 180 - dA) > 1e-6) bad(`${name}: ugao ose 3x4 ${ang4.toFixed(1)} umesto ${z.ax4.ang}`);
  if (Math.abs(distPL([z.ax4.pt[0], 0, z.ax4.pt[1]], a4, b4) - S.shift4) > 1e-6) bad(`${name}: osa 3x4 nije na zadatom mestu`);
  if (S.shift4) console.log(`   ${name}: osa 3x4 pomerena paralelno za ${S.shift4.toFixed(2)} da ne sece trecu projekciju`);
  const a3 = G.pi3(0, 0), b3 = G.pi3(1, 0); if (distPL([z.ax3.pt[0], 0, z.ax3.pt[1]], a3, b3) > 1e-6) bad(`${name}: osa ${z.base}x3 ne prolazi kroz zadatu tacku`);
  // 3) vidljivost
  const F = frames(S, 0, 0, 0), R = 20, views = { 1: [0, 0, 1], 2: [0, 1, 0], 3: F.M3, 4: mul(F.N4, -1) }, vis = {};
  const ix = {}; ids.forEach(i => ix[i] = 1);
  for (const v in views) {
    let hid = 0, part = 0, visb = 0;
    for (const [a, b] of z.E) { const r = edgeRuns(z.body, z.V[a], z.V[b], views[v], R); r.length > 1 ? part++ : r[0][2] ? hid++ : visb++; }
    vis[v] = `${visb} vidljivih/${hid} zaklonjenih/${part} delimicno`;
    if (visb < 3) bad(`${name}: projekcija ${v} skoro bez vidljivih ivica`);
  }
  console.log(`2) ${name} "${z.ime}": ${ids.length} temena, ${z.E.length} ivica, lanac ${z.base}-3-4, s>=${smin.toFixed(2)}, w>=${wmin.toFixed(2)}, ${fail === e0 ? 'u redu' : 'GRESKE'}`);
  console.log('   vidljivost  ' + Object.entries(vis).map(([v, t]) => `π${v}: ${t}`).join(' · '));
}
// kontrolni primer vidljivosti: Z1 gledano odozgo — donja ivica 1-2 (na dnu) mora biti zaklonjena? ne: kontura. Otvor 7-17 (dno otvora) je zaklonjen odozgo.
{ const z = ZAD.z1, r = edgeRuns(z.body, z.V[7], z.V[17], [0, 0, 1], 20), r2 = edgeRuns(z.body, z.V[3], z.V[13], [0, 0, 1], 20);
  if (!(r.length === 1 && r[0][2] === true)) bad('kontrola: ivica otvora 7-17 treba da je zaklonjena odozgo');
  if (!(r2.length === 1 && r2[0][2] === false)) bad('kontrola: sleme 3-13 treba da je vidljivo odozgo'); }
console.log(fail ? `PADA (${fail})` : 'PROLAZI'); process.exit(fail ? 1 : 0);
