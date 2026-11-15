# Soldaat in stukken: grof (hoofd/romp/armen/benen) → fijn (elleboog/pols/knie/enkel, borst/buik) → bekken → naden → gezicht
import json, numpy as np, cv2, os, sys
from PIL import Image
from scipy.ndimage import binary_dilation
D='/home/claude/step-forward/art/soldaten/'
S = {
 1: dict(cuts={'hoofd':[(700,368),(760,396),(830,402),(900,396),(960,368)],
               'armL':[(600,455),(560,600),(515,760),(500,830)], 'armR':[(1060,455),(1100,600),(1145,760),(1160,830)],
               'benen':[(330,1340),(1100,1320)], 'tussen':[(800,1300),(800,1800)]},
         seeds={'hoofd':(830,150),'romp':(830,700),'armL':(300,1150),'armR':(1355,1150),'beenL':(520,2350),'beenR':(1150,2350)},
         fijn=dict(ellL=(300,814,540,886), polsL=(200,1168,380,1222), ellR=(1120,886,1360,814), polsR=(1280,1222,1460,1168),
                   buik=(450,860,1200,860), knieL=(450,1800,760,1800), knieR=(900,1790,1210,1790), enkelL=(380,2170,660,2170), enkelR=(1000,2170,1290,2170)),
         taille=1085, heup=1215,
         gezicht=dict(oogL=[770,235], oogR=[890,235], neus=[830,282], mond=[830,330], kin=[830,372], breed=[720,940]), bril=True, helm=265),
 5: dict(cuts={'hoofd':[(720,450),(770,478),(830,485),(890,478),(940,450)],
               'armL':[(660,515),(625,650),(612,780),(600,880)], 'armR':[(1000,515),(1035,650),(1048,780),(1060,880)],
               'benen':[(470,1405),(1190,1395)], 'tussen':[(810,1380),(810,1800)]},
         seeds={'hoofd':(830,250),'romp':(830,750),'armL':(200,1080),'armR':(1460,1080),'beenL':(520,2150),'beenR':(1140,2150)},
         fijn=dict(ellL=(323,812,531,968), polsL=(191,992,319,1088), ellR=(1129,968,1337,812), polsR=(1341,1088,1469,992),
                   buik=(560,860,1100,860), knieL=(480,1700,800,1700), knieR=(860,1690,1230,1690), enkelL=(380,2000,660,2000), enkelR=(1000,2000,1290,2000)),
         taille=1075, heup=1250,
         gezicht=dict(oogL=[785,325], oogR=[875,325], neus=[830,365], mond=[830,412], kin=[830,455], breed=[735,925]), bril=True, helm=None),
}
KLEUR = {'hoofd':(255,80,80),'romp':(80,160,255),'armL':(255,210,0),'armR':(255,140,0),'beenL':(170,90,255),'beenR':(0,220,200)}
def verleng(p, d=30):
    p=[np.array(q,float) for q in p]; a=p[0]-p[1]; p[0]=p[0]+a/np.linalg.norm(a)*d; b=p[-1]-p[-2]; p[-1]=p[-1]+b/np.linalg.norm(b)*d
    return [tuple(map(int,q)) for q in p]
rng = np.random.default_rng(7)
def ruis(n):
    k = rng.standard_normal(max(4, n//40+2)); x = np.linspace(0, len(k)-1, n); return np.interp(x, np.arange(len(k)), k)/1.5
def zijde(X, Y, lijn, ref, RAFEL=9):
    x1,y1,x2,y2 = lijn; dx,dy = x2-x1, y2-y1; ln = np.hypot(dx,dy)
    t = ((X-x1)*dx + (Y-y1)*dy)/ln; d = ((X-x1)*dy - (Y-y1)*dx)/ln
    r = ruis(4000); ti = np.clip((t+1000).astype(int), 0, 3999); d = d + r[ti]*RAFEL
    dr = ((ref[0]-x1)*dy - (ref[1]-y1)*dx)/ln
    return (d > 0) == (dr > 0)
for n, c in S.items():
    if len(sys.argv) > 1 and str(n) not in sys.argv[1:]: continue
    im = np.array(Image.open(f'{D}soldaat_{n}.png')); H,W = im.shape[:2]
    a = im[...,3]; vol = (a > 20).astype(np.uint8); knip = vol.copy()
    for pl in c['cuts'].values(): cv2.polylines(knip, [np.array(verleng(pl),np.int32)], False, 0, 4)
    nl, lab = cv2.connectedComponents(knip, connectivity=4)
    namen = list(KLEUR); idx = np.full(nl, namen.index('romp'), np.int32); gezien = {}
    for d,(x,y) in c['seeds'].items():
        l = lab[y,x]
        if l == 0: print('ZAAD OP LEEG', d); continue
        if l in gezien: print('ZELFDE STUK', d, gezien[l]); continue
        gezien[l] = d; idx[l] = namen.index(d)
    kaart = idx[lab]
    lijn = (vol==1) & (knip==0)
    ys,xs = np.where(lijn)
    for y,x in zip(ys,xs):
        win = kaart[max(0,y-4):y+5, max(0,x-4):x+5]; wl = lab[max(0,y-4):y+5, max(0,x-4):x+5]; k = win[wl>0]
        kaart[y,x] = np.bincount(k).argmax() if len(k) else namen.index('romp')
    grof = {}
    for k,d in enumerate(namen):
        m = (kaart==k) & (vol==1); sc = {'hoofd':'hoofd','armL':'armL','armR':'armR','beenL':'benen','beenR':'benen'}.get(d); piv = None
        if sc:
            lm = np.zeros(a.shape, np.uint8); cv2.polylines(lm, [np.array(verleng(c['cuts'][sc]),np.int32)], False, 1, 14)
            gy,gx = np.where((lm==1) & m); piv = [int(gx.mean()), int(gy.mean())] if len(gx) else None
        grof[d] = (m, piv); print('grof', d, int(m.sum()), piv)
    # ---- fijn ----
    Y,X = np.mgrid[0:H,0:W]; L = c['fijn']; nieuw = {}
    for s in 'LR':
        arm, sch = grof['arm'+s]; boven = arm & zijde(X,Y,L['ell'+s],sch); rest = arm & ~boven; onder = rest & zijde(X,Y,L['pols'+s],sch)
        nieuw['bovenarm'+s] = boven; nieuw['onderarm'+s] = onder; nieuw['hand'+s] = rest & ~onder
        been, sch = grof['been'+s]; boven = been & zijde(X,Y,L['knie'+s],sch); rest = been & ~boven; onder = rest & zijde(X,Y,L['enkel'+s],sch)
        nieuw['bovenbeen'+s] = boven; nieuw['onderbeen'+s] = onder; nieuw['voet'+s] = rest & ~onder
    romp = grof['romp'][0]; hals = grof['hoofd'][1]
    borst = romp & zijde(X,Y,L['buik'],hals); onderlijf = romp & ~borst
    # ---- bekken: rafelige taille ----
    rl = np.interp(np.arange(W), np.linspace(0,W,max(4,W//40)), rng.normal(0,1,max(4,W//40)))*6
    bek = onderlijf & (Y >= (c['taille'] + rl)[None,:].astype(int))
    nieuw['borst'] = borst; nieuw['buik'] = onderlijf & ~bek; nieuw['bekken'] = bek; nieuw['hoofd'] = grof['hoofd'][0]
    cx = int((grof['beenL'][1][0] + grof['beenR'][1][0])/2)
    ouder = {'bekken':None, 'buik':'bekken', 'borst':'buik', 'hoofd':'borst'}
    for s in 'LR': ouder.update({'bovenarm'+s:'borst','onderarm'+s:'bovenarm'+s,'hand'+s:'onderarm'+s,'bovenbeen'+s:'bekken','onderbeen'+s:'bovenbeen'+s,'voet'+s:'onderbeen'+s})
    def grens(a_, b_):
        g = binary_dilation(nieuw[a_], iterations=4) & nieuw[b_]; yy,xx = np.where(g); return [int(xx.mean()), int(yy.mean())] if len(xx) else None
    uit = {'bron': f'soldaat_{n}.png', 'maat':[W,H], 'delen':{}}
    for f in os.listdir(D):
        if f.startswith(f's{n}_'): os.remove(D+f)
    volgorde = ['bekken','buik','borst','hoofd'] + [k for k in nieuw if k not in ('bekken','buik','borst','hoofd')]
    for naam in volgorde:
        m = nieuw[naam]
        if not m.any(): print('LEEG', naam); continue
        ys,xs = np.where(m); y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
        st = im[y0:y1,x0:x1].copy(); st[...,3] = np.where(m[y0:y1,x0:x1], st[...,3], 0)
        Image.fromarray(st).save(f'{D}s{n}_{naam}.png', optimize=True)
        o = ouder[naam]
        if naam == 'hoofd': piv = hals
        elif naam == 'bekken': piv = [cx, c['heup']]
        elif naam == 'buik': piv = [cx, c['taille']]
        elif naam.startswith('bovenarm'): piv = grof['arm'+naam[-1]][1]
        elif naam.startswith('bovenbeen'): piv = [grof['been'+naam[-1]][1][0], c['heup']]
        else: piv = grens(naam, o)
        uit['delen'][naam] = {'x':int(x0),'y':int(y0),'w':int(x1-x0),'h':int(y1-y0),'ouder':o,'scharnier':piv}
        print(naam, int(m.sum()), 'ouder', o, 'scharnier', piv)
    # ---- naden (opvulling achter de gewrichten) ----
    al = (im[...,3]>40).astype(np.uint8); dt = cv2.distanceTransform(al, cv2.DIST_L2, 5); naden = {}
    for d,info in uit['delen'].items():
        if not info['ouder'] or not info['scharnier']: continue
        px,py = info['scharnier']; px=min(W-1,max(0,px)); py=min(H-1,max(0,py))
        r = float(dt[py,px]); r = max(14, min(110, r*1.25))
        x0,y0,x1,y1 = int(px-r),int(py-r),int(px+r)+1,int(py+r)+1; x0c,y0c,x1c,y1c = max(0,x0),max(0,y0),min(W,x1),min(H,y1)
        st = np.zeros((y1-y0,x1-x0,4),np.uint8); st[y0c-y0:y1c-y0, x0c-x0:x1c-x0] = im[y0c:y1c,x0c:x1c]
        yy,xx = np.mgrid[0:y1-y0,0:x1-x0]; d2 = np.hypot(xx-(px-x0),yy-(py-y0))/r
        st[...,3] = (st[...,3]*np.clip((1-d2)*4,0,1)).astype(np.uint8)
        Image.fromarray(st).save(f'{D}s{n}_naad_{d}.png', optimize=True)
        naden[d] = {'x':x0,'y':y0,'w':x1-x0,'h':y1-y0,'ouder':info['ouder']}
    uit['naden'] = naden
    # ---- gezicht (in hoofd-coördinaten) ----
    h = uit['delen']['hoofd']; G = c['gezicht']
    uit['gezicht'] = {k:([v[0]-h['x'], v[1]-h['y']] if k != 'breed' else [v[0]-h['x'], v[1]-h['x']]) for k,v in G.items()}
    uit['bril'] = c.get('bril', False); uit['helm'] = c['helm'] - h['y'] if c.get('helm') else None; uit['vest'] = c.get('vest', n == 1)
    json.dump(uit, open(f'{D}s{n}.json','w'), indent=1)
    # ---- controleplaatje ----
    vb = np.zeros((H,W,3),np.uint8); vb[:] = (40,40,40); kl = {}
    for i,(naam,m) in enumerate(nieuw.items()):
        col = np.array([(i*67)%255, (i*131+80)%255, (i*29+160)%255]); vb[m] = (im[...,:3][m]*0.5 + col*0.5).astype(np.uint8)
    for d,info in uit['delen'].items():
        if info['scharnier']: cv2.circle(vb, tuple(info['scharnier']), 12, (255,255,255), 3)
    Image.fromarray(vb).resize((W*900//H, 900)).save(f'delen_s{n}.jpg', quality=85)
