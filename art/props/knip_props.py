import numpy as np, cv2, sys
from PIL import Image
from rembg import remove, new_session
U='/mnt/user-data/uploads/'; O='/home/claude/step-forward/art/props/'
LIJST=[('307b9e17',['geweer','granaat']),('b96e195f',['mg']),('16278d46',['apache']),('5ff8e780',['huey_groen']),
       ('26dcd397',['huey_grijs']),('5a5e9e7a',['helm','schild']),('e6a8baa0',['truck']),('08bfc6e5',['barrier']),
       ('293f3f32',['zandzakken']),('97a78c8a',['jeep']),('5bc8229e',['jeep_zand']),('6a89109f',['jeep_snorkel']),('6ba85a6e',['swat_truck'])]
sess=new_session('isnet-general-use')
for bron,namen in LIJST:
    if len(sys.argv)>1 and bron not in sys.argv[1:]: continue
    im=Image.open(f'{U}{bron}-image.png').convert('RGB'); W,H=im.size
    out=np.array(remove(im,session=sess,post_process_mask=False)); a=out[...,3]
    a[int(H*0.9):, int(W*0.78):]=0                                    # KlingAI-logo rechtsonder weg
    m=(a>100).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(cv2.dilate(m,np.ones((15,15),np.uint8)))
    groot=sorted(range(1,n),key=lambda i:-st[i,cv2.CC_STAT_AREA])[:len(namen)]
    groot=sorted(groot,key=lambda i:st[i,cv2.CC_STAT_LEFT])           # links → rechts, zoals de namen
    for naam,l in zip(namen,groot):
        deel=(lab==l)&(a>8); al=np.where(deel,a,0).astype(np.uint8)
        ys,xs=np.where(al>40); x0,y0,x1,y1=max(0,xs.min()-6),max(0,ys.min()-6),min(W,xs.max()+7),min(H,ys.max()+7)
        st_=np.dstack([np.array(im),al])[y0:y1,x0:x1]
        Image.fromarray(st_).save(f'{O}{naam}.png',optimize=True)
        print(naam, st_.shape[1], st_.shape[0], 'aandeel', round(float((al>40).sum())/((x1-x0)*(y1-y0)),2))
