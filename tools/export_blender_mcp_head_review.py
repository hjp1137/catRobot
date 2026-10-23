"""Copy the final 12 PNGs and build a self-contained local cat-head review page."""
import argparse
import ast
import json
import shutil
import struct
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('E:/dev-cache/catRobot-blender-mcp-20261023')
VIEWS = {'front': '正面', 'three_quarter': '45°', 'profile': '侧面'}
MODES = {'comparison': '识别色', 'clay_comparison': '全材质灰模'}


def record(path):
    stat = path.stat()
    return {'path': path.as_posix(), 'url': path.as_uri(), 'bytes': stat.st_size,
            'modified': datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()}


def png_size(path):
    with path.open('rb') as stream:
        header = stream.read(24)
    if len(header) != 24 or header[:8] != b'\x89PNG\r\n\x1a\n' or header[12:16] != b'IHDR':
        raise ValueError(f'不是有效 PNG 文件头：{path}')
    return list(struct.unpack('>II', header[16:24]))


def camera_source():
    path = ROOT / 'tools/blender_mcp_head/review_head.py'
    tree = ast.parse(path.read_text(encoding='utf-8-sig'))
    view_node = next(node for node in tree.body if isinstance(node, ast.Assign)
                     and any(isinstance(t, ast.Name) and t.id == 'VIEWS' for t in node.targets))
    views = ast.literal_eval(view_node.value)
    return {'lens_mm': 90, 'renderer': record(path),
            'positions': {name: views[name] for name in VIEWS},
            'target': [0, -0.012, 0.073],
            'evidence': '渲染参数来自 review_head.py；图像尺寸校验不证明镜头参数。'}


def collect(source, blend):
    if not blend.is_file():
        raise FileNotFoundError(f'最终样件源不存在：{blend}')
    images = []
    for mode in MODES:
        for view, label in VIEWS.items():
            for version in ('before', 'after'):
                relative = f'{mode}/{version}_{view}.png'
                path = source / relative
                if not path.is_file():
                    raise FileNotFoundError(f'最终对照图尚未齐全：{path}')
                dimensions = png_size(path)
                if dimensions != [900, 900]:
                    raise ValueError(f'对照图应为 900×900：{path}，实际 {dimensions}')
                images.append({'mode': mode, 'view': view, 'label': label,
                               'version': version, 'file': relative,
                               'dimensions': dimensions, 'source': record(path)})
    return {'scope': '仅猫头样件，本地 MCP 技术验证与美术确认分开记录。',
            'source': record(blend), 'source_directory': source.as_posix(),
            'camera': camera_source(), 'images': images,
            'acceptance': {'mcp': '本地调用已验证', 'art': '待用户确认',
                           'game': '本页为独立 DCC 样件'}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--blend', type=Path)
    parser.add_argument('--output', type=Path, default=ROOT / 'Walkthroughes/screenshots/20261023_blender_mcp_head')
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--template', type=Path, default=ROOT / 'tools/blender_mcp_head/review_page.html')
    args = parser.parse_args()
    source = args.source.resolve()
    blend = (args.blend or source / 'cat_head_study.blend').resolve()
    data = collect(source, blend)
    template = args.template.read_text(encoding='utf-8')
    payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
    page = template.replace('__REVIEW_DATA__', payload)
    output = args.output.resolve()
    if not args.check_only:
        for image in data['images']:
            destination = output / image['file']
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / image['file'], destination)
        (output / 'review_data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        (output / 'review.html').write_text(page, encoding='utf-8')
    print(json.dumps({'checked_images': len(data['images']), 'resolution': [900, 900],
                      'wrote_files': not args.check_only, 'page': str(output / 'review.html')}, ensure_ascii=False))


if __name__ == '__main__':
    main()
