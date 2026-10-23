"""Reference/candidate comparison at equal visible character height."""
from pathlib import Path
import sys
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[2]
CACHE=Path('E:/dev-cache/catRobot-mecha-fidelity-20261022')
FONT='C:/Windows/Fonts/msyh.ttc'


def compose():
    label='正式模型·离线渲染' if '--final' in sys.argv else '候选'
    stage=next((arg for arg in sys.argv[1:] if not arg.startswith('--')),'candidate')
    reference=Image.open(ROOT/'Walkthroughes/designs/20261022_mecha_evolution/five_tiers_concept.png').convert('RGB')
    panes=[('参考 · 黄金',reference.crop((1206,40,1565,678))),
           (label+' · 黄金',Image.open(CACHE/'preview_gold.png').convert('RGB').crop((119,45,540,779))),
           ('参考 · 星辰',reference.crop((1608,31,1965,681))),
           (label+' · 星辰',Image.open(CACHE/'preview_astral.png').convert('RGB').crop((119,45,540,779)))]
    canvas=Image.new('RGB',(1280,688),'#171b20')
    draw=ImageDraw.Draw(canvas)
    font=ImageFont.truetype(FONT,23)
    small=ImageFont.truetype(FONT,16)
    for index,(label,view) in enumerate(panes):
        width=round(view.width*560/view.height)
        view=view.resize((width,560),Image.Resampling.LANCZOS)
        x=index*320+(320-width)//2
        canvas.paste(view,(x,65))
        draw.text((index*320+160,20),label,font=font,fill='#edf0f2',anchor='mt')
    draw.line((640,8,640,636),fill='#687079',width=1)
    draw.text((24,651),'参考透视/灯光未知 · 同人物像素高排版 · Blender CPU 离线渲染，游戏画面另行验证',
              font=small,fill='#b6c0ca')
    output=CACHE/('reference_gold_astral_'+stage+'.png')
    canvas.save(output)
    print(output)


if __name__=='__main__': compose()
