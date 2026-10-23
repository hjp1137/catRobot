// Local PNG -> high quality MJPEG pipe -> installed Playwright VP8/WebM encoder.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const bundle = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), bundle] }));
const directory = path.resolve(process.argv[2] || 'Walkthroughes/screenshots/20261015_action_upgrade');
const fps = Number(process.argv[3] || 30);
if (!Number.isFinite(fps) || fps < 1 || fps > 60) throw new Error('FPS must be between 1 and 60.');
const frames = fs.readdirSync(directory).filter(name => /^frame_\d+\.png$/.test(name)).sort();
if (frames.length < 2) throw new Error('Capture at least two frame_NNN.png files first.');
const playwrightCache = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
const ffmpeg = process.env.CATROBOT_FFMPEG || fs.readdirSync(playwrightCache)
  .filter(name => /^ffmpeg-\d+$/.test(name)).sort().reverse()
  .map(name => path.join(playwrightCache, name, 'ffmpeg-win64.exe')).find(filename => fs.existsSync(filename));
if (!ffmpeg || !fs.existsSync(ffmpeg)) throw new Error('Set CATROBOT_FFMPEG to an installed Playwright ffmpeg executable.');

async function encode() {
  const filename = path.join(directory, 'action_preview.webm');
  const metadata = await sharp(path.join(directory, frames[0])).metadata();
  const args = ['-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg',
    '-framerate', String(fps), '-i', 'pipe:0', '-an', '-c:v', 'libvpx', '-b:v', '6M',
    '-crf', '12', '-quality', 'good', '-cpu-used', '4', '-pix_fmt', 'yuv420p', '-y', filename];
  const encoder = spawn(ffmpeg, args, { windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] });
  let errors = ''; encoder.stderr.on('data', chunk => { errors += chunk.toString(); });
  const closed = once(encoder, 'close');
  let inputError; encoder.stdin.on('error', error => { inputError = error; });
  const begin = Date.now();
  try {
    for (const frame of frames) {
      if (inputError) throw inputError;
      const jpeg = await sharp(path.join(directory, frame)).flatten({ background: '#09111a' })
        .jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toBuffer();
      if (!encoder.stdin.write(jpeg)) await once(encoder.stdin, 'drain');
    }
    encoder.stdin.end();
    const [code] = await closed;
    if (code !== 0) throw new Error('Local FFmpeg encoding failed: ' + errors.trim());
    if (inputError) throw inputError;
    if (fs.statSync(filename).size < 1000) throw new Error('Encoder did not produce meaningful video frames.');
  } catch (error) {
    encoder.kill(); throw error;
  }
  const html = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Godot 战场实机预览</title><style>body{margin:0;background:#09111a;color:#d6edf3;font:16px sans-serif;text-align:center}video{height:90vh;max-width:100%;margin:1vh auto}p{margin:.2em}</style>' +
    '<video src="action_preview.webm" controls autoplay loop muted playsinline></video><p>Godot 实机 QA 连续帧 · 战场动作、导航与前后层次</p>' +
    '<p>QA 位置与场景状态；固定 ' + fps + ' Hz 模拟采样，不代表自然通关、实时性能或手工体验验收。</p></html>';
  fs.writeFileSync(path.join(directory, 'action_preview.html'), html, 'utf8');
  const evidence = { file: filename, frames: frames.length, requested_fps: fps, duration_seconds: frames.length / fps,
    mime_type: 'video/webm;codecs=vp8', viewport: [metadata.width, metadata.height], encoding_ms: Date.now() - begin,
    bytes: fs.statSync(filename).size, encoder: ffmpeg, intermediate: 'JPEG quality 96, 4:4:4, streamed in memory',
    source: 'Actual Godot viewport PNG sequence, encoded locally; not a live performance recording' };
  fs.writeFileSync(path.join(directory, 'action_preview_encoding.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence));
}
encode().catch(error => { console.error(error.stack); process.exitCode = 1; });
