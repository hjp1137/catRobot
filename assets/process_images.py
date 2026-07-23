import os
from PIL import Image

def get_background_color(img):
    # 取四个角的像素颜色来决定背景色
    w, h = img.size
    corners = [
        img.getpixel((0, 0)),
        img.getpixel((w - 1, 0)),
        img.getpixel((0, h - 1)),
        img.getpixel((w - 1, h - 1))
    ]
    # 取最常见的颜色
    bg = max(set(corners), key=corners.count)
    return bg[:3]

def remove_background(img, bg_color, threshold=40):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    br, bg, bb = bg_color
    for item in datas:
        r, g, b, a = item
        # 计算与背景色的欧氏距离
        dist = ((r - br)**2 + (g - bg)**2 + (b - bb)**2)**0.5
        if dist < threshold:
            # 距离很近，设为完全透明
            new_data.append((r, g, b, 0))
        elif dist < threshold * 1.5:
            # 边缘过渡
            ratio = (dist - threshold) / (threshold * 0.5)
            new_data.append((r, g, b, int(255 * ratio)))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    return img

def process_image(src_path, dest_path, target_size, need_alpha=True):
    img = Image.open(src_path)
    # 先做透明处理，以防缩放插值引入背景混色
    if need_alpha:
        bg_color = get_background_color(img)
        img = remove_background(img, bg_color)
    
    # 缩放
    img = img.resize(target_size, Image.Resampling.LANCZOS)
    
    # 压缩保存
    if not need_alpha:
        # 背景图转为P模式（自适应调色板，256色）以极大降低文件体积
        img = img.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
    
    img.save(dest_path, "PNG", optimize=True)
    print(f"Processed: {src_path} -> {dest_path}, size={target_size}, bytes={os.path.getsize(dest_path)}")

def main():
    assets_dir = "assets"
    # 定义每张图的目标尺寸与是否需要透明通道
    configs = {
        "main_bg.png": ((800, 1200), False),
        "player_mecha.png": ((128, 128), True),
        "enemy_rat.png": ((64, 64), True),
        "coin.png": ((64, 64), True),
        "part.png": ((64, 64), True),
        "stone.png": ((64, 64), True),
        "equip_icon.png": ((64, 64), True),
        "rune_icon.png": ((64, 64), True),
        "skill_cannon.png": ((64, 64), True),
        "skill_shield.png": ((64, 64), True),
        "factory_bg.png": ((800, 1200), False),
        "enemy_fire_beetle.png": ((64, 64), True),
        "enemy_blaze_hound.png": ((64, 64), True),
        "enemy_magma_golem.png": ((64, 64), True),
        "status_burn.png": ((64, 64), True),
        "chapter3_icon.png": ((64, 64), True),
        "enemy_furnace_guard.png": ((64, 64), True),
        "skill_roar.png": ((64, 64), True),
        "skill_fissure.png": ((64, 64), True),
        "sewer_bg.png": ((800, 1200), False),
        "enemy_beetle.png": ((64, 64), True),
        "enemy_toxic.png": ((64, 64), True),
        "enemy_elite_toxic.png": ((64, 64), True),
        "enemy_pollution_queen.png": ((64, 64), True),
        "enemy_elite_mouse.png": ((64, 64), True),
        "enemy_rat_king.png": ((64, 64), True),
        "equip_rusty_claw.png": ((64, 64), True),
        "equip_neon_blaster.png": ((64, 64), True),
        "equip_starcore_cannon.png": ((64, 64), True),
        "equip_patched_armor.png": ((64, 64), True),
        "equip_alloy_armor.png": ((64, 64), True),
        "equip_sewer_guard.png": ((64, 64), True),
        "equip_small_core.png": ((64, 64), True),
        "equip_neon_core.png": ((64, 64), True),
        "equip_starcore_fragment.png": ((64, 64), True),
        "rune_cannon_rune.png": ((64, 64), True),
        "rune_shield_rune.png": ((64, 64), True),
        "rune_poison_guard.png": ((64, 64), True),
        "status_poison.png": ((64, 64), True),
        "ui_tutorial_arrow.png": ((64, 64), True),
        "ui_tutorial_move.png": ((64, 64), True),
        "ui_tutorial_skill.png": ((64, 64), True),
        "ui_tutorial_equip.png": ((64, 64), True),
    }
    
    for filename, (size, need_alpha) in configs.items():
        src = os.path.join(assets_dir, filename)
        # 先保存到临时，完成后覆写
        temp_dest = os.path.join(assets_dir, "_" + filename)
        process_image(src, temp_dest, size, need_alpha)
        # 覆盖原图
        os.replace(temp_dest, src)

if __name__ == "__main__":
    main()
