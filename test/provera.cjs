// Provera index.html: (1) pravilo prenosenja = prava 3D projekcija, oba lanca; (2) podaci zadataka; (3) egzaktna vidljivost i pravila blize/dalje
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const blk = n => html.split('//' + n + '-BEGIN')[1].split('//' + n + '-END')[0];
const api = new Function(blk('MATH') + blk('TASKS') + '; return {frames,coords,norm,distPL,add,sub,mul,dot,mkHull,solid,inS,isContourEdge,edgeRuns,viewMeta,edgeRule,ZAD,setupTask};')();
const { frames, coords, norm, distPL, add, sub, mul, dot, mkHull, solid, inS, isContourEdge, edgeRuns, edgeRule, ZAD, setupTask } = api;
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
  const v3 = sub(P, F.pi3(k.t, k.h));
  max.ortho3 = Math.max(max.ortho3, Math.abs(dot(v3, F.D)), Math.abs(dot(v3, F.H)), Math.abs(dot(v3, F.M3) - k.s));
  const v4 = sub(P, F.pi4(k.r, k.s));
  max.ortho4 = Math.max(max.ortho4, Math.abs(dot(v4, F.E)), Math.abs(dot(v4, F.K)), Math.abs(dot(v4, F.N4) + k.w));
  const G = frames(S, HP, HP, HP);
  const q1 = G.pi1(k.x, -k.y), q2 = G.pi2(k.x, k.z), q3 = G.pi3(k.t, k.h), q4 = G.pi4(k.r, k.s), qk = base === 1 ? q1 : q2, qd = base === 1 ? q2 : q1;
  const a3 = G.pi3(0, 0), b3 = G.pi3(1, 0), a4 = G.pi4(0, 0), b4 = G.pi4(1, 0);
  max.d1 = Math.max(max.d1, Math.abs(distPL(qd, [0, 0, 0], [1, 0, 0]) - distPL(q3, a3, b3)), Math.abs(distPL(q3, a3, b3) - (base === 1 ? P[2] : P[1])));
  max.d2 = Math.max(max.d2, Math.abs(distPL(qk, a3, b3) - distPL(q4, a4, b4)), Math.abs(distPL(q4, a4, b4) - k.s));
  max.flatY = Math.max(max.flatY, ...[q1, q2, q3, q4].map(q => Math.abs(q[1])));
  const side = (p, a, b) => (p[0] - a[0]) * (b[2] - a[2]) - (p[2] - a[2]) * (b[0] - a[0]);
  if (side(qk, a3, b3) * side(q3, a3, b3) > 0) max.side++;
  if (side(q3, a4, b4) * side(q4, a4, b4) > 0) max.side++;
}
console.log('1) ' + N + ' slucajnih polozaja (oba lanca), najvece odstupanje:', JSON.stringify(max));
if (!(max.ortho3 < 1e-9 && max.ortho4 < 1e-9 && max.d1 < 1e-9 && max.d2 < 1e-9 && max.flatY < 1e-9 && max.side === 0)) bad('matematika');

// 2) zadaci + pravila vidljivosti (kontura, blize/dalje, konkurentne tacke)
const OFF = []; for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) for (const c of [-1, 0, 1]) if (a || b || c) OFF.push([a * .03, b * .03, c * .03]);
const onSurf = (B, p) => { let i = 0, o = 0; for (const d of OFF) solid(B, add(p, d)) ? i++ : o++; return i > 0 && o > 0; };
for (const [name, z] of Object.entries(ZAD)) {
  const ids = Object.keys(z.V).map(Number).sort((a, b) => a - b), P = ids.map(i => z.V[i]);
  const ix = {}; ids.forEach((id, i) => ix[id] = i);
  const edges = z.E.map(([a, b]) => [ix[a], ix[b]]);
  let e0 = fail;
  for (const i of ids) if (!onSurf(z.body, z.V[i])) bad(`${name}: teme ${i} nije na povrsini tela`);
  for (const [a, b] of z.E) {
    if (!z.V[a] || !z.V[b]) { bad(`${name}: ivica ${a}-${b} nema teme`); continue; }
    for (const f of [.2, .5, .8]) { const p = add(mul(z.V[a], 1 - f), mul(z.V[b], f)); if (!onSurf(z.body, p)) bad(`${name}: ivica ${a}-${b} nije na povrsini (${f})`); if (inS(z.body, p, .0137)) bad(`${name}: ivica ${a}-${b} je u telu`); }
  }
  for (const pl of [1, 2]) for (const g of (z.coin[pl] || [])) {
    const q = g.split(',').map(Number).map(i => pl === 1 ? [z.V[i][0], z.V[i][1]] : [z.V[i][0], z.V[i][2]]);
    if (q.some(v => Math.hypot(v[0] - q[0][0], v[1] - q[0][1]) > 1e-6)) bad(`${name}: na listu se poklapaju ${g}${pl === 1 ? "'" : '"'}, u modelu ne`);
  }
  const S = setupTask(z, P), C = P.map(p => coords(S, p)), G = frames(S, HP, HP, HP);
  const smin = Math.min(...C.map(k => k.s)), wmin = Math.min(...C.map(k => k.w));
  if (smin <= 0 || wmin <= 0) bad(`${name}: osa sece predmet (s ${smin.toFixed(2)}, w ${wmin.toFixed(2)})`);
  const a4 = G.pi4(0, 0), b4 = G.pi4(1, 0), ang4 = Math.atan2(b4[2] - a4[2], b4[0] - a4[0]) * 180 / Math.PI;
  const dA = ((ang4 - z.ax4.ang) % 180 + 180) % 180; if (Math.min(dA, 180 - dA) > 1e-6) bad(`${name}: ugao ose 3x4 ${ang4.toFixed(1)} umesto ${z.ax4.ang}`);
  if (Math.abs(distPL([z.ax4.pt[0], 0, z.ax4.pt[1]], a4, b4) - S.shift4) > 1e-6) bad(`${name}: osa 3x4 nije na zadatom mestu`);
  const a3 = G.pi3(0, 0), b3 = G.pi3(1, 0); if (distPL([z.ax3.pt[0], 0, z.ax3.pt[1]], a3, b3) > 1e-6) bad(`${name}: osa ${z.base}x3 ne prolazi kroz zadatu tacku`);

  const F = frames(S, 0, 0, 0), views = { 1: [0, 0, 1], 2: [0, 1, 0], 3: F.M3, 4: mul(F.N4, -1) }, vis = {};
  for (const v of [1, 2, 3, 4]) {
    let hid = 0, part = 0, visb = 0, cont = 0;
    for (let m = 0; m < edges.length; m++) {
      const r = edgeRule(z.body, P, edges, S, v, m);
      if (isContourEdge(z.body, P[edges[m][0]], P[edges[m][1]], views[v]) && r.kind !== 'vis') bad(`${name} π${v}: ivica konture ${z.E[m]} nije puna`);
      if (r.contour) cont++;
      if (r.kind === 'hid' && !(r.dFront > r.dMid + 1e-4)) bad(`${name} π${v}: zaklonjena ivica ${z.E[m]} nema blizeg zaklanjaca`);
      if (r.xing && r.kind === 'vis' && !(r.xing.d1 > r.xing.d2)) bad(`${name} π${v}: pogresan poredak konkurentnih tacaka na ${z.E[m]}`);
      if (r.xing && r.kind === 'hid' && !(r.xing.d2 > r.xing.d1)) bad(`${name} π${v}: pogresan poredak konkurentnih tacaka na ${z.E[m]}`);
      r.kind === 'part' ? part++ : r.kind === 'hid' ? hid++ : visb++;
    }
    vis[v] = `${visb} punih (${cont} kont.)/${hid} isprek./${part} delim.`;
    if (visb < 3) bad(`${name}: projekcija ${v} skoro bez vidljivih ivica`);
  }
  console.log(`2) ${name} "${z.ime}": ${ids.length} temena, ${z.E.length} ivica, lanac ${z.base}-3-4, ${fail === e0 ? 'u redu' : 'GRESKE'}`);
  console.log('   vidljivost  ' + Object.entries(vis).map(([v, t]) => `π${v}: ${t}`).join(' · '));
}

// 3) kontrola Piramide (konveksan poliedar preko mkHull) i Z3 sa fotografije punog lista
{
  const P = [[1.8, 1, .8], [3.8, 1, .8], [3.8, 3, .8], [1.8, 3, .8], [2.8, 2, 3.2]];
  const E = [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]];
  const B = mkHull(P, [[0,3,2,1],[0,1,4],[1,2,4],[2,3,4],[3,0,4]]);
  const S = norm({ base: 1, A: [7, -2.5], th: 75 * Math.PI / 180, B: [0, 6.8], ps: -10 * Math.PI / 180 }, P);
  const r3 = E.map((_, m) => edgeRule(B, P, E, S, 3, m));
  if (!r3.some(r => r.kind === 'hid') || !r3.some(r => r.contour)) bad('piramida: u π3 mora imati i konturu i zaklonjenu ivicu');
}
{
  const z = ZAD.z1, r = edgeRuns(z.body, z.V[7], z.V[17], [0, 0, 1]), r2 = edgeRuns(z.body, z.V[3], z.V[13], [0, 0, 1]);
  if (!(r.length === 1 && r[0][2] === true)) bad('kontrola Z1: ivica otvora 7-17 treba da je zaklonjena odozgo');
  if (!(r2.length === 1 && r2[0][2] === false)) bad('kontrola Z1: sleme 3-13 treba da je vidljivo odozgo');
}
{
  const z = ZAD.z3, ids = Object.keys(z.V).map(Number).sort((a, b) => a - b), P = ids.map(i => z.V[i]);
  const ix = {}; ids.forEach((id, i) => ix[id] = i); const edges = z.E.map(([a, b]) => [ix[a], ix[b]]);
  const S = setupTask(z, P);
  const kindOf = (pl, a, b) => {
    const m = z.E.findIndex(([u, v]) => (u === a && v === b) || (u === b && v === a));
    return edgeRule(z.body, P, edges, S, pl, m).kind;
  };
  // Na listu Z3: u π3 prednje teme 14 daje pune ivice, a zadnje teme 4 i stepenik 3-8 isprekidane
  for (const [a, b] of [[14,1],[14,9],[14,13],[5,13],[1,2],[9,10]]) if (kindOf(3, a, b) !== 'vis') bad(`Z3 π3: ${a}-${b} mora biti puna`);
  for (const [a, b] of [[4,5],[3,4],[4,12],[3,8],[2,3],[6,8],[6,7],[7,8],[7,10],[8,11]]) if (kindOf(3, a, b) !== 'hid') bad(`Z3 π3: ${a}-${b} mora biti isprekidana`);
  // U π4: 14-9, 9-10, 5-13, 4-12 su pune; 1-2, 2-6, 6-9, 3-8 su isprekidane; 2-3 i 7-8 su delimicno vidljive kroz izrez
  for (const [a, b] of [[14,9],[9,10],[5,13],[4,12],[7,10]]) if (kindOf(4, a, b) !== 'vis') bad(`Z3 π4: ${a}-${b} mora biti puna`);
  for (const [a, b] of [[1,2],[2,6],[6,9],[3,8],[8,11],[6,7],[6,8],[3,4]]) if (kindOf(4, a, b) !== 'hid') bad(`Z3 π4: ${a}-${b} mora biti isprekidana`);
  for (const [a, b] of [[2,3],[7,8]]) if (kindOf(4, a, b) !== 'part') bad(`Z3 π4: ${a}-${b} mora biti delimicno vidljiva`);
}
console.log(fail ? `PADA (${fail})` : 'PROLAZI'); process.exit(fail ? 1 : 0);
