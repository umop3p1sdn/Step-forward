import numpy as np, cv2, json, sys
from PIL import Image
Z='/home/claude/step-forward/art/zombies/'
DREMPEL=float(sys.argv[1]); nrs=[int(a) for a in sys.argv[2:]]
for n in nrs:
    rgba=np.array(Image.open(f'{Z}zombie_{n}.png').convert('RGBA')); rgb=rgba[...,:3].copy(); A=rgba[...,3]
    j=json.load(open(f'{Z}z{n}.json')); h=j['delen']['hoofd']
    x0,y0,x1,y1=max(0,h['x']-40),max(0,h['y']-20),h['x']+h['w']+40,h['y']+h['h']+330
    sub=rgb[y0:y1,x0:x1].copy(); voor=sub.copy(); al=A[y0:y1,x0:x1]>40
    lab=cv2.cvtColor(sub,cv2.COLOR_RGB2LAB); L,a,b=[lab[...,i] for i in range(3)]
    ai=a.astype(int); bi=b.astype(int)
    m=(((ai>DREMPEL)|((ai>136)&(ai-bi>4)&(L<120)))&al).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((2,2),np.uint8)); m=cv2.dilate(m,np.ones((9,9),np.uint8))
    # ogen beschermen: daar alleen ontrooden, de vorm blijft
    G=j['gezicht']; fw=G['breed'][1]-G['breed'][0]; oog=np.zeros(m.shape,np.uint8)
    for k in ('oogL','oogR'):
        cx,cy=G[k][0]+h['x']-x0, G[k][1]+h['y']-y0
        cv2.ellipse(oog,(int(cx),int(cy)),(int(fw*0.16),int(fw*0.09)),0,0,360,1,-1)
    m[(oog==1)&(a.astype(int)<162)]=0          # in het oog alleen echte bloeddruppels weg
    m[~al]=0; mm=m*255
    # kleur (a,b) uit de omgeving halen, helderheid: lage frequentie uit de omgeving + een deel van het detail
    a2=cv2.inpaint(a,mm,9,cv2.INPAINT_TELEA); b2=cv2.inpaint(b,mm,9,cv2.INPAINT_TELEA)
    Lf=L.astype(np.float32); blur=cv2.GaussianBlur(Lf,(0,0),6); Lb=cv2.inpaint(np.clip(blur,0,255).astype(np.uint8),mm,15,cv2.INPAINT_TELEA).astype(np.float32)
    detail=Lf-blur; detail=np.where(detail<0,detail*0.12,detail*0.35); L2=np.clip(Lb+detail,0,255)
    z=cv2.GaussianBlur(m.astype(np.float32),(7,7),0)
    Ln=Lf*(1-z)+L2*z; an=a*(1-z)+a2*z; bn=b*(1-z)+b2*z
    uit=cv2.cvtColor(np.dstack([Ln,an,bn]).astype(np.uint8),cv2.COLOR_LAB2RGB)
    lu=cv2.cvtColor(uit,cv2.COLOR_RGB2LAB).astype(np.float32); ozacht=cv2.GaussianBlur(oog.astype(np.float32),(15,15),0)
    rood=np.clip((lu[...,1]-138)/12,0,1)*ozacht
    lu[...,1]=lu[...,1]*(1-rood)+133*rood; lu[...,2]=lu[...,2]*(1-rood*0.5)+136*rood*0.5
    uit=cv2.cvtColor(np.clip(lu,0,255).astype(np.uint8),cv2.COLOR_LAB2RGB)
    uit[~al]=voor[~al]
    rgb[y0:y1,x0:x1]=uit
    Image.fromarray(np.dstack([rgb,A])).save(f'schoon_{n}.png')
    v=Image.fromarray(np.concatenate([voor,uit],1)); v.thumbnail((900,900)); v.save(f'schoon_{n}_vb.jpg',quality=88)
    print(n,'masker px',int(m.sum()))
