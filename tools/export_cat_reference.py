"""Copy real Tripo screenshots and local Blender renders into a three-column review."""
import argparse
import json
import shutil
from pathlib import Path

from export_cat_full_refined import png_size, record

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('E:/dev-cache/catRobot-blender-mcp-20261023/tripo_rebuild')
VIEWS = {
    'front': ('front', '正面截图'),
    'three_quarter': ('three_quarter', '前侧截图'),
    'profile': ('side', '近侧面截图'),
    'back': ('back_three_quarter', '背部三分之四截图'),
}


def collect(source, reference, blend):
    if not blend.is_file():
        raise FileNotFoundError(f'本地重建源工程不存在：{blend}')
    images = []
    for view, (reference_name, reference_label) in VIEWS.items():
        entries = [
            ('reference', 'reference', reference / f'{reference_name}.png',
             f'reference/{reference_name}.png'),
            ('before', 'comparison', source / f'comparison/before_{view}.png',
             f'comparison/before_{view}.png'),
            ('after', 'comparison', source / f'comparison/after_{view}.png',
             f'comparison/after_{view}.png'),
            ('after', 'clay_comparison', source / f'clay_comparison/after_{view}.png',
             f'clay_comparison/after_{view}.png'),
        ]
        for version, mode, path, relative in entries:
            if not path.is_file():
                raise FileNotFoundError(f'审阅图片尚未齐全：{path}')
            dimensions = png_size(path)
            if min(dimensions) <= 0:
                raise ValueError(f'PNG 尺寸无效：{path}')
            if version != 'reference' and dimensions != [720, 1080]:
                raise ValueError(f'本地渲染应为 720×1080：{path}，实际 {dimensions}')
            images.append({'version': version, 'mode': mode, 'view': view,
                           'reference_label': reference_label, 'file': relative,
                           'dimensions': dimensions, 'source': record(path)})
    return {
        'scope': '本地重建初稿；没有 Tripo 原网格、贴图或绑定；非游戏内验收。',
        'camera_note': '参考截图与本地渲染非同机位，不能作为一比一重合对照。',
        'source': record(blend), 'source_directory': source.as_posix(),
        'reference_directory': reference.as_posix(), 'images': images,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--reference', type=Path, default=SOURCE.parent / 'tripo_reference')
    parser.add_argument('--blend', type=Path)
    parser.add_argument('--output', type=Path,
                        default=ROOT / 'Walkthroughes/screenshots/20261023_cat_tripo_rebuild')
    parser.add_argument('--template', type=Path,
                        default=ROOT / 'tools/blender_mcp_body/review_reference.html')
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    source, reference = args.source.resolve(), args.reference.resolve()
    blend = (args.blend or source / 'cat_reference_rebuild.blend').resolve()
    data = collect(source, reference, blend)
    template = args.template.read_text(encoding='utf-8')
    if template.count('__REVIEW_DATA__') != 1:
        raise ValueError('审阅模板必须含且仅含一个 __REVIEW_DATA__ 占位符')
    page = template.replace('__REVIEW_DATA__', json.dumps(data, ensure_ascii=False).replace('<', '\\u003c'))
    output = args.output.resolve()
    if not args.check_only:
        for entry in data['images']:
            destination = output / entry['file']
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(entry['source']['path'], destination)
        (output / 'review_data.json').write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        (output / 'review.html').write_text(page, encoding='utf-8')
    print(json.dumps({'checked_images': len(data['images']), 'reference_images': 4,
                      'local_renders': 12, 'wrote_files': not args.check_only,
                      'page': str(output / 'review.html')}, ensure_ascii=False))


if __name__ == '__main__':
    main()
