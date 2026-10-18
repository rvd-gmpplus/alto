"""tools/rays.py (ronde 2): wat ligt er achter een beeldpunt van meet.py? Schiet een straal door de opgegeven beeldpunten (DPR 2, 2000 x 1476) van een camera
en meldt de eerste treffers (knoop, afstand, punt, normaal), met het glas verborgen zoals in de id-pass.
Gebruik: python3 -I tools/rays.py --cam lamphoek --px 1590,650 [--px 1600,660 ...] [--n 5] [--root WERKBOOM] [--sw]   (--root: standaard de repowortel boven tools/, anders $MEET_ROOT; zonder tools/harness.py exitcode 2)
         python3 -I tools/rays.py --cam lamphoek --box 1569,575,1616,713 --stap 8        raster binnen een omkadering (uit meet.json: gevlagd[].box)
"""
import sys, os, json, argparse, tempfile, platform
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ap = argparse.ArgumentParser()
_PAR = os.path.dirname(HERE)   # tools/rays.py staat in <repowortel>/tools/
ap.add_argument('--root', default=_PAR if os.path.exists(os.path.join(_PAR, 'tools', 'harness.py')) else os.environ.get('MEET_ROOT'))
ap.add_argument('--cam', required=True); ap.add_argument('--px', action='append', default=[]); ap.add_argument('--box'); ap.add_argument('--stap', type=int, default=8)
ap.add_argument('--n', type=int, default=4); ap.add_argument('--ring', type=int, default=0, help='schiet ook acht buurstralen op deze afstand (beeldpunten): toont wat de opening begrenst'); ap.add_argument('--sw', action='store_true')
a = ap.parse_args()
if not a.root or not os.path.isfile(os.path.join(a.root, 'tools', 'harness.py')):
    print(f"FOUT: tools/harness.py ontbreekt in de wortel {a.root!r}; geef --root WERKBOOM of zet $MEET_ROOT (standaard: de repowortel boven tools/rays.py)", file=sys.stderr); sys.exit(2)
sys.argv = [sys.argv[0], '--root', a.root]   # meet.py leest zijn eigen argumenten bij het importeren
import importlib.util
spec = importlib.util.spec_from_file_location('meet', os.path.join(HERE, 'meet.py')); meet = importlib.util.module_from_spec(spec); spec.loader.exec_module(meet)
harness = meet.harness
RAY_JS = r"""([pts, n]) => {
  const L = window.__model; L.batching(false); L.ROOT.obj.updateMatrixWorld(true);
  const ms = L.MESHES.filter(m => { const mt = m.userData.base || m.material; return m.visible && !(mt.transparent && mt.opacity < 0.5); });
  const rc = new THREE.Raycaster(); const W = renderer.getDrawingBufferSize(new THREE.Vector2()), out = [];
  camera.updateMatrixWorld(true);
  for (const [x, y] of pts) {
    rc.setFromCamera(new THREE.Vector2((x + 0.5) / W.x * 2 - 1, 1 - (y + 0.5) / W.y * 2), camera);
    const hits = rc.intersectObjects(ms, false).slice(0, n).map(h => { const p = []; let q = h.object.userData.node; while (q && q.parent) { p.unshift(q.name); q = q.parent; }
      return { knoop: p.slice(-3).join('/'), d: +h.distance.toFixed(4), punt: h.point.toArray().map(v => +v.toFixed(4)), n: h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld).toArray().map(v => +v.toFixed(2)) : null }; });
    out.push({ px: [x, y], hits });
  }
  return out; }"""
def main():
    gpu = (not a.sw) and platform.system() == 'Darwin'
    if gpu: harness.ARGS = ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']
    cams = meet.cam_lijst(); cams.update({k: v for k, v in meet.cam_lijst_achter().items() if k not in cams}); c = cams[a.cam]   # ook de wielkastcamera's achter van meet.py --achter (de rondgang is in beide modi gelijk)
    pts = [tuple(int(v) for v in p.split(',')) for p in a.px]
    if a.ring:
        base = list(pts); R = a.ring
        pts = [q for (x, y) in base for q in [(x, y)] + [(x + dx * R, y + dy * R) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy]]
    if a.box:
        x0, y0, x1, y1 = (int(v) for v in a.box.split(','))
        pts += [(x, y) for y in range(y0, y1 + 1, a.stap) for x in range(x0, x1 + 1, a.stap)]
    d = harness.build_test(tempfile.mkdtemp(prefix='rays-alto-'))
    with harness.session(d) as s:
        pg = s.page(meet.VW, meet.VH, scale=meet.DPR)
        pg.evaluate("window.__model.finishAll()"); pg.evaluate("window.__model.batching(false)"); pg.wait_for_timeout(500)
        if c.get('assembled'):
            asm = pg.evaluate(meet.ASSEMBLED_JS)
            import numpy as np
            dv = np.array(asm['p']) - np.array(asm['t']); dv /= np.linalg.norm(dv); tz = np.array([0.45, 0.62, 1.55]); pz = tz + dv * 2.1
            c['p'], c['t'] = pz.tolist(), tz.tolist()
            if a.cam.endswith('-r'): c['p'], c['t'] = meet.spiegel(c['p']), meet.spiegel(c['t'])
        pg.evaluate(meet.SETCAM, [c['p'], c['t'], c.get('oy', 0)]); pg.wait_for_timeout(300)
        for r in pg.evaluate(RAY_JS, [pts, a.n]):
            print(r['px'], ' | '.join(f"{h['knoop']} d={h['d']} p={h['punt']}" for h in r['hits']))
if __name__ == '__main__':
    main()
