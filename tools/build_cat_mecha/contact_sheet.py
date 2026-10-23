"""Assemble existing same-camera DCC renders; no generative image processing."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path('E:/dev-cache/catRobot-mecha-fidelity-20261022')
OUT = ROOT / 'Walkthroughes/designs/20261022_mecha_fidelity/dcc_six_views.png'
FONT = Path('C:/Windows/Fonts/msyh.ttc')

def compose():
    canvas = Image.new('RGB', (1280, 1248), '#151c24')
    draw = ImageDraw.Draw(canvas)
    title = ImageFont.truetype(str(FONT), 26)
    label = ImageFont.truetype(str(FONT), 23)
    small = ImageFont.truetype(str(FONT), 17)
    draw.text((28, 18), '正式模型 · 基础猫体与五阶离线渲染', font=title, fill='#edf2f5')
    tiers = [('bare', '基础猫体'), ('blackiron', '黑铁'), ('bronze', '青铜'),
             ('silver', '白银'), ('gold', '黄金'), ('astral', '星辰')]
    for i, (tier, name) in enumerate(tiers):
        view = Image.open(CACHE / ('preview_' + tier + '.png')).convert('RGB')
        view = view.resize((416, 520), Image.Resampling.LANCZOS)
        x, y = 16 + i % 3 * 416, 64 + i // 3 * 564
        canvas.paste(view, (x, y))
        draw.text((x + 208, y + 527), name, font=label, anchor='mt', fill='#edf2f5')
    draw.text((28, 1203), 'Blender 4.5.14 / CPU Cycles · 离线造型证据，正式动作、持械与性能由 Godot 验证',
              font=small, fill='#a9b8c5')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT)
    canvas.save(CACHE / 'dcc_six_views.png')
    print(OUT)

if __name__ == '__main__':
    compose()
