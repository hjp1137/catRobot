import os
from PIL import Image, ImageDraw

def create_factory_bg():
    # 熔火工厂背景：暗红岩浆渐变，800x1200
    img = Image.new("RGB", (800, 1200), (30, 10, 10))
    draw = ImageDraw.Draw(img)
    # 画一些岩浆条纹
    for i in range(1200):
        # 渐变红色
        r = int(30 + 50 * (1 - (i / 1200)))
        for x in range(800):
            # 加上一些岩浆波纹
            g = int(10 + 20 * (x % 100 == 0))
            img.putpixel((x, i), (r, g, 10))
    img.save("assets/factory_bg.png", "PNG")
    print("Created factory_bg.png")

def create_sewer_bg():
    # 霓虹下水道背景：深蓝紫渐变，800x1200
    img = Image.new("RGB", (800, 1200), (10, 8, 32))
    draw = ImageDraw.Draw(img)
    # 画一些霓虹线条
    for i in range(1200):
        r = int(10 + 20 * (1 - (i / 1200)))
        g = int(8 + 10 * (i / 1200))
        for x in range(800):
            b = int(32 + 40 * (x % 200 == 0))
            img.putpixel((x, i), (r, g, b))
    img.save("assets/sewer_bg.png", "PNG")
    print("Created sewer_bg.png")

def create_transparent_icon(filename, color, shape_type):
    # 64x64 RGBA 图标
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # 在中心画图形以保证四周有透明像素，且有真实的不透明像素
    if shape_type == "circle":
        draw.ellipse([8, 8, 56, 56], fill=color)
    elif shape_type == "rect":
        draw.rectangle([12, 12, 52, 52], fill=color)
    elif shape_type == "triangle":
        draw.polygon([(32, 8), (8, 56), (56, 56)], fill=color)
    elif shape_type == "star":
        # 简单五角星或者十字星代替
        draw.polygon([(32, 4), (40, 24), (60, 24), (44, 38), (50, 58), (32, 46), (14, 58), (20, 38), (4, 24), (24, 24)], fill=color)
    
    img.save(f"assets/{filename}", "PNG")
    print(f"Created {filename}")

def main():
    if not os.path.exists("assets"):
        os.makedirs("assets")
        
    create_factory_bg()
    create_sewer_bg()
    
    # 三种火焰敌人：熔岩甲虫 (橙色 circle)、烈焰行者 (鲜红 triangle)、熔岩巨怪 (暗红 rect)
    create_transparent_icon("enemy_fire_beetle.png", (255, 102, 0, 255), "circle")
    create_transparent_icon("enemy_blaze_hound.png", (255, 51, 51, 255), "triangle")
    create_transparent_icon("enemy_magma_golem.png", (153, 0, 0, 255), "rect")
    
    # 燃烧状态图标：黄色 star
    create_transparent_icon("status_burn.png", (255, 204, 0, 255), "star")
    
    # 第三章关卡图标：深红 triangle
    create_transparent_icon("chapter3_icon.png", (100, 10, 10, 255), "triangle")
    
    # 第三章 Boss 熔炉守卫：橘红色 star
    create_transparent_icon("enemy_furnace_guard.png", (255, 51, 0, 255), "star")
    
    # 咆哮与裂隙技能专属素材：红橙色 star 与黄橙色 rect
    create_transparent_icon("skill_roar.png", (255, 69, 0, 255), "star")
    create_transparent_icon("skill_fissure.png", (255, 140, 0, 255), "rect")

    # 新增：第二章敌人与强化第一章敌人
    create_transparent_icon("enemy_beetle.png", (90, 107, 58, 255), "circle")
    create_transparent_icon("enemy_toxic.png", (58, 138, 74, 255), "triangle")
    create_transparent_icon("enemy_elite_toxic.png", (42, 90, 58, 255), "star")
    create_transparent_icon("enemy_pollution_queen.png", (90, 42, 106, 255), "star")
    create_transparent_icon("enemy_elite_mouse.png", (61, 71, 96, 255), "triangle")
    create_transparent_icon("enemy_rat_king.png", (74, 32, 48, 255), "star")
    
    # 新增：普通/优秀/史诗非熔岩装备与非避火符文
    create_transparent_icon("equip_rusty_claw.png", (154, 160, 166, 255), "rect")
    create_transparent_icon("equip_neon_blaster.png", (79, 209, 224, 255), "rect")
    create_transparent_icon("equip_starcore_cannon.png", (192, 96, 224, 255), "rect")
    create_transparent_icon("equip_patched_armor.png", (154, 160, 166, 255), "rect")
    create_transparent_icon("equip_alloy_armor.png", (79, 209, 224, 255), "rect")
    create_transparent_icon("equip_sewer_guard.png", (192, 96, 224, 255), "rect")
    create_transparent_icon("equip_small_core.png", (154, 160, 166, 255), "rect")
    create_transparent_icon("equip_neon_core.png", (79, 209, 224, 255), "rect")
    create_transparent_icon("equip_starcore_fragment.png", (192, 96, 224, 255), "rect")
    
    create_transparent_icon("rune_cannon_rune.png", (154, 160, 166, 255), "circle")
    create_transparent_icon("rune_shield_rune.png", (154, 160, 166, 255), "circle")
    create_transparent_icon("rune_poison_guard.png", (79, 209, 224, 255), "circle")
    
    # 新增状态：毒液状态
    create_transparent_icon("status_poison.png", (95, 224, 104, 255), "star")

    # 任务17：新增三类引导素材
    create_transparent_icon("ui_tutorial_move.png", (0, 180, 180, 255), "rect")
    create_transparent_icon("ui_tutorial_skill.png", (255, 120, 0, 255), "circle")
    create_transparent_icon("ui_tutorial_equip.png", (224, 32, 224, 255), "star")

if __name__ == "__main__":
    main()
