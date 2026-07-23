from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "assets" / "art-packs" / "training_ground_v1"


def save(img, rel, level=6):
    out = PACK / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG", compress_level=level)
    print(f"wrote {out.relative_to(ROOT)}")


def noise(d):
    for x in range(4, 64, 7):
        for y in range(4, 64, 9):
            if (x * 3 + y * 5) % 4 == 0:
                d.point((x, y), fill=(230, 247, 255, 75))


def player(rel, mode):
    img = Image.open(ROOT / "assets" / "player_mecha.png").convert("RGBA").resize((128, 128))
    d = ImageDraw.Draw(img, "RGBA")
    if mode == "move":
        d.line([(18, 92), (2, 104)], fill=(79, 209, 224, 180), width=6)
        d.line([(30, 98), (8, 120)], fill=(255, 179, 71, 150), width=5)
    if mode == "attack":
        d.arc([12, 10, 116, 116], 315, 40, fill=(255, 220, 88, 210), width=6)
        d.ellipse([94, 54, 114, 74], fill=(255, 179, 71, 210))
    save(img, rel)


def enemy(rel, kind):
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([9, 43, 55, 57], fill=(0, 0, 0, 85))
    if kind == "mouse":
        d.ellipse([13, 20, 49, 48], fill=(74, 92, 116, 255), outline=(79, 209, 224, 210), width=2)
        d.polygon([(47, 29), (61, 34), (47, 39)], fill=(38, 48, 71, 255))
        d.line([(15, 35), (4, 42)], fill=(255, 179, 71, 210), width=3)
    elif kind == "bug":
        d.ellipse([10, 18, 54, 48], fill=(42, 82, 70, 255), outline=(95, 224, 104, 220), width=2)
        for x in (24, 32, 40): d.line([(x, 20), (x - 3, 47)], fill=(15, 36, 42, 230), width=2)
        d.line([(13, 37), (4, 46), (13, 31), (4, 24), (51, 37), (60, 46), (51, 31), (60, 24)], fill=(79, 209, 224, 180), width=2)
    elif kind == "eye":
        d.ellipse([12, 12, 52, 52], fill=(43, 58, 86, 255), outline=(160, 96, 224, 230), width=3)
        d.ellipse([23, 22, 43, 42], fill=(79, 209, 224, 255)); d.ellipse([29, 28, 37, 36], fill=(230, 247, 255, 255))
        d.line([(32, 12), (32, 3), (32, 52), (32, 61)], fill=(255, 179, 71, 180), width=2)
    else:
        d.rounded_rectangle([8, 14, 56, 52], radius=8, fill=(55, 63, 84, 255), outline=(255, 179, 71, 255), width=3)
        d.polygon([(20, 14), (32, 4), (44, 14)], fill=(255, 179, 71, 255))
        d.rectangle([16, 26, 48, 37], fill=(24, 32, 52, 255)); d.ellipse([22, 28, 28, 34], fill=(255, 64, 64, 255)); d.ellipse([36, 28, 42, 34], fill=(255, 64, 64, 255))
    d.rectangle([18, 49, 46, 52], fill=(255, 179, 71, 160)); noise(d); save(img, rel, 0)


def floor():
    img = Image.new("RGBA", (800, 1200), (7, 18, 29, 255)); d = ImageDraw.Draw(img, "RGBA")
    for y in range(0, 1200, 40): d.rectangle([0, y, 800, y + 39], fill=(6, 32 + (y % 160) // 5, 45 + (y % 160) // 5, 255))
    for x in range(0, 801, 80): d.line([(x, 0), (x, 1200)], fill=(79, 209, 224, 42), width=2)
    for y in range(0, 1201, 80): d.line([(0, y), (800, y)], fill=(79, 209, 224, 36), width=2)
    for i, y in enumerate(range(120, 1120, 220)):
        d.rounded_rectangle([70 + i % 2 * 40, y, 730 - i % 2 * 50, y + 120], radius=18, outline=(255, 179, 71, 80), width=4)
    d.text((260, 80), "TRAINING GROUND", fill=(230, 247, 255, 56))
    save(img, "maps/map_training_ground_tile_floor_01.png")


def overlay(rel, kind):
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(img, "RGBA")
    if kind == "line":
        d.line([(0, 32), (64, 32)], fill=(79, 209, 224, 210), width=5); d.line([(0, 40), (64, 40)], fill=(255, 179, 71, 130), width=2)
    elif kind == "boundary":
        d.rounded_rectangle([4, 4, 60, 60], radius=6, outline=(255, 179, 71, 230), width=5); d.rectangle([10, 10, 54, 54], outline=(79, 209, 224, 120), width=2)
    else:
        d.polygon([(32, 4), (57, 32), (32, 60), (7, 32)], fill=(79, 209, 224, 170), outline=(230, 247, 255, 210)); d.text((24, 25), "A", fill=(7, 18, 29, 255))
    noise(d); save(img, rel, 0)


def skill(rel, color, label):
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([8, 8, 56, 56], radius=12, fill=(10, 24, 38, 230), outline=color, width=3)
    d.ellipse([19, 17, 45, 43], outline=color, width=5); d.text((25, 24), label, fill=(230, 247, 255, 255)); noise(d); save(img, rel, 0)


def main():
    for mode in ("idle", "move", "attack"): player(f"players/player_mecha_cat_{mode}_01.png", mode)
    for rel, kind in [
        ("enemies/enemy_scrap_mouse_idle_01.png", "mouse"),
        ("enemies/enemy_scrap_bug_idle_01.png", "bug"),
        ("enemies/enemy_drone_eye_idle_01.png", "eye"),
        ("enemies/enemy_scrap_guard_elite_01.png", "guard"),
    ]: enemy(rel, kind)
    floor(); overlay("maps/map_training_ground_tile_line_01.png", "line"); overlay("maps/map_training_ground_boundary_01.png", "boundary"); overlay("maps/map_training_ground_zone_mark_01.png", "zone")
    skill("ui/ui_skill_shield_01.png", (79, 209, 224, 255), "S"); skill("ui/ui_skill_cannon_01.png", (255, 179, 71, 255), "C")


if __name__ == "__main__":
    main()
