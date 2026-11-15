import numpy as np, cv2, sys
from PIL import Image
n_=sys.argv[1]
im=np.array(Image.open(f'bron_{n_}.png').convert('RGB')).astype(np.int16); H,W=im.shape[:2]
mx=im.max(2); mn=im.min(2)
wit=((mn>185)&((mx-mn)<45)).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(wit)
ring=(lab==1+np.argmax(st[1:,cv2.CC_STAT_AREA])).astype(np.uint8)
ring=cv2.morphologyEx(ring,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
# buiten = alles wat via de beeldrand bereikbaar is zonder door de ring te gaan
vrij=(ring==0).astype(np.uint8); n2,lab2=cv2.connectedComponents(vrij)
randl=set(np.unique(np.r_[lab2[0],lab2[-1],lab2[:,0],lab2[:,-1]]))-{0}
buiten=np.isin(lab2,list(randl))
lijf=((~buiten)&(ring==0)).astype(np.uint8)
n3,lab3,st3,_=cv2.connectedComponentsWithStats(lijf)
lijf=(lab3==1+np.argmax(st3[1:,cv2.CC_STAT_AREA])).astype(np.uint8)
# lichte glimplekken op de helm horen bij het lijf: bovenkant dichtmaken
ys,xs=np.where(lijf); top=ys.min(); k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(61,61))
band=lijf[:top+260].copy(); band=cv2.morphologyEx(band,cv2.MORPH_CLOSE,k)
puur=((mn>222)&((mx-mn)<22))[:top+260]; band[puur]=0
band=cv2.morphologyEx(band,cv2.MORPH_OPEN,np.ones((7,7),np.uint8)); lijf[:top+260]=band
lijf=cv2.erode(lijf,np.ones((3,3),np.uint8),iterations=2)
a=cv2.GaussianBlur(lijf.astype(np.float32),(5,5),0)
out=np.dstack([im.astype(np.uint8),(a*255).astype(np.uint8)])
Image.fromarray(out).save(f'/home/claude/step-forward/art/soldaten/soldaat_{n_}.png',optimize=True)
v=np.full((H,W,3),(60,120,60),np.uint8); al=a[...,None]; v=(im*al+v*(1-al)).astype(np.uint8)
Image.fromarray(v).resize((W//3,H//3)).save(f'vrij_{n_}.jpg',quality=88)
ys,xs=np.where(lijf); print('bbox',xs.min(),ys.min(),xs.max(),ys.max())
