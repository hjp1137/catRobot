"""Copy sixteen full-body renders into a local before/after review page."""
import argparse
import json
import shutil
import struct
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('E:/dev-cache/catRobot-blender-mcp-20261023/full_body')
VIEWS = {'front': '正面', 'three_quarter': '45°', 'profile': '侧面', 'back': '背面'}
MODES = {'comparison': '材质与短毛', 'clay_comparison': '全材质灰模'}


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


def collect(source, blend):
    if not blend.is_file():
        raise FileNotFoundError(f'全身候选源不存在：{blend}')
    images = []
    for mode in MODES:
        for view, label in VIEWS.items():
            for version in ('before', 'after'):
                relative = f'{mode}/{version}_{view}.png'
                path = source / relative
                if not path.is_file():
                    raise FileNotFoundError(f'全身对照图尚未齐全：{path}')
                dimensions = png_size(path)
                if dimensions != [720, 1080]:
                    raise ValueError(f'全身对照图应为 720×1080：{path}，实际 {dimensions}')
                images.append({'mode': mode, 'view': view, 'label': label,
                               'version': version, 'file': relative,
                               'dimensions': dimensions, 'source': record(path)})
    return {'scope': '离线全身候选，尚未进行游戏集成与动作验收。',
            'source': record(blend), 'source_directory': source.as_posix(),
            'images': images, 'render_record': None}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--blend', type=Path)
    parser.add_argument('--output', type=Path,
                        default=ROOT / 'Walkthroughes/screenshots/20261023_cat_full_refined')
    parser.add_argument('--template', type=Path, default=ROOT / 'tools/blender_mcp_body/review.html')
    parser.add_argument('--render-record', type=Path, help='可选的独立渲染参数 JSON 记录')
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    source = args.source.resolve()
    blend = (args.blend or source / 'cat_full_refined.blend').resolve()
    data = collect(source, blend)
    template = args.template.read_text(encoding='utf-8')
    if template.count('__REVIEW_DATA__') != 1:
        raise ValueError('审阅模板必须含且仅含一个 __REVIEW_DATA__ 占位符')
    if args.render_record:
        path = args.render_record.resolve()
        data['render_record'] = {'source': record(path), 'file': 'render_record.json',
                                 'data': json.loads(path.read_text(encoding='utf-8-sig'))}
    payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
    page = template.replace('__REVIEW_DATA__', payload)
    output = args.output.resolve()
    if not args.check_only:
        for entry in data['images']:
            destination = output / entry['file']
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / entry['file'], destination)
        if args.render_record:
            shutil.copy2(args.render_record, output / 'render_record.json')
        (output / 'review_data.json').write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        (output / 'review.html').write_text(page, encoding='utf-8')
    print(json.dumps({'checked_images': len(data['images']), 'resolution': [720, 1080],
                      'wrote_files': not args.check_only, 'page': str(output / 'review.html')},
                     ensure_ascii=False))


if __name__ == '__main__':
    main()
