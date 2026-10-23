// Deterministic continuous joint-motion capture of an independent concept preview.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const bundle = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), bundle] }));
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), bundle] }));
const defaultDirectory = 'Walkthroughes/screenshots/20261018_compact_cat_fourway_preview';
const directions = ['front', 'back', 'left', 'right'];

function findEncoder() {
  if (process.env.CATROBOT_FFMPEG) return process.env.CATROBOT_FFMPEG;
  const cache = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
  const filename = fs.readdirSync(cache).filter(name => /^ffmpeg-\d+$/.test(name)).sort().reverse()
    .map(name => path.join(cache, name, 'ffmpeg-win64.exe')).find(file => fs.existsSync(file));
  if (!filename) throw new Error('Set CATROBOT_FFMPEG to an installed Playwright FFmpeg executable.');
  return filename;
}

async function serve(directory) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json', '.png': 'image/png' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
    const filename = path.resolve(directory, '.' + pathname);
    if (!filename.startsWith(directory + path.sep) || !fs.existsSync(filename) || fs.statSync(filename).isDirectory()) {
      response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(filename).pipe(response);
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  return { server, origin: 'http://127.0.0.1:' + server.address().port };
}

async function encodeWebm(ffmpeg, frames, filename, fps) {
  const args = ['-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg',
    '-framerate', String(fps), '-i', 'pipe:0', '-an', '-c:v', 'libvpx', '-b:v', '6M',
    '-crf', '12', '-quality', 'good', '-cpu-used', '4', '-pix_fmt', 'yuv420p', '-y', filename];
  const encoder = spawn(ffmpeg, args, { windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] });
  let errors = '', inputError; encoder.stderr.on('data', data => { errors += data; });
  encoder.stdin.on('error', error => { inputError = error; });
  const closed = once(encoder, 'close');
  try {
    for (const frame of frames) {
      if (inputError) throw inputError;
      const jpeg = await sharp(frame).flatten({ background: '#e8e1d5' }).jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toBuffer();
      if (!encoder.stdin.write(jpeg)) await once(encoder.stdin, 'drain');
    }
    encoder.stdin.end(); const [code] = await closed;
    if (code !== 0) throw new Error('WebM encode failed: ' + errors.trim());
    if (inputError) throw inputError;
  } catch (error) { encoder.kill(); throw error; }
}

async function encodeGif(frames, filename, fps, crop) {
  const images = crop ? await Promise.all(frames.map(frame => sharp(frame).extract(crop).png().toBuffer())) : frames;
  const delays = images.map((_, index) => 10 * (Math.round((index + 1) * 100 / fps) - Math.round(index * 100 / fps)));
  await sharp(images, { join: { animated: true } }).gif({ loop: 0, delay: delays, effort: 7, colours: 256, dither: 0.2 }).toFile(filename);
  const metadata = await sharp(filename, { animated: true }).metadata();
  if (metadata.pages !== frames.length) throw new Error(filename + ': GIF frame count does not match capture.');
  if (!metadata.delay.every((delay, index) => delay === delays[index])) throw new Error(filename + ': GIF frame timing changed.');
  const decoded = await sharp(filename, { animated: true }).raw().toBuffer({ resolveWithObject: true });
  const frameBytes = decoded.info.width * metadata.pageHeight * decoded.info.channels;
  if (decoded.data.length !== frameBytes * frames.length) throw new Error(filename + ': GIF pixels did not fully decode.');
  for (let index = 1; index < frames.length; index++) {
    if (decoded.data.subarray(index * frameBytes, (index + 1) * frameBytes)
      .equals(decoded.data.subarray((index - 1) * frameBytes, index * frameBytes))) {
      throw new Error(filename + ': GIF contains identical adjacent frames.');
    }
  }
  return { frames: metadata.pages, decoded_frames: metadata.pages, delay_ms: metadata.delay, bytes: fs.statSync(filename).size };
}

async function verifyWebm(ffmpeg, filename, originals, directory) {
  fs.mkdirSync(directory, { recursive: true });
  const decoder = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', filename, '-vsync', '0',
    '-f', 'image2', '-c:v', 'png', '-y', path.join(directory, 'decoded_%03d.png')], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let errors = ''; decoder.stderr.on('data', data => { errors += data; });
  const [code] = await once(decoder, 'close');
  if (code !== 0) throw new Error('WebM decode failed: ' + errors.trim());
  const files = fs.readdirSync(directory).filter(file => /^decoded_\d+\.png$/.test(file)).sort();
  if (files.length !== originals.length) throw new Error('Decoded WebM frame count ' + files.length + ' does not match ' + originals.length);
  const reference = await sharp(originals[0]).metadata();
  let previous, distinct = 0, errorTotal = 0, maximumError = 0;
  for (let index = 0; index < files.length; index++) {
    const decoded = path.join(directory, files[index]), metadata = await sharp(decoded).metadata();
    if (metadata.width !== reference.width || metadata.height !== reference.height) throw new Error('Decoded frame size changed: ' + files[index]);
    const pixels = await sharp(decoded).resize(96, 96, { fit: 'fill' }).removeAlpha().raw().toBuffer();
    const original = await sharp(originals[index]).resize(96, 96, { fit: 'fill' }).removeAlpha().raw().toBuffer();
    let deviation = 0;
    for (let offset = 0; offset < pixels.length; offset++) deviation += Math.abs(pixels[offset] - original[offset]);
    deviation /= pixels.length; errorTotal += deviation; maximumError = Math.max(maximumError, deviation);
    if (!previous || !pixels.equals(previous)) distinct++;
    previous = pixels;
  }
  if (distinct !== files.length) throw new Error('Decoded WebM contains identical adjacent frames.');
  return { decoded_frames: files.length, verified_dimensions: [reference.width, reference.height],
    distinct_adjacent_frames: distinct, mean_channel_error: errorTotal / files.length,
    maximum_frame_channel_error: maximumError, bytes: fs.statSync(filename).size };
}

async function capture(page, gait, count, directory) {
  const stage = page.locator('#stage'), frames = [];
  fs.mkdirSync(directory, { recursive: true });
  for (let index = 0; index < count; index++) {
    await page.evaluate(async state => { await window.preview.setState(state); }, { gait, phase: index / count, playing: false });
    const file = path.join(directory, 'frame_' + String(index).padStart(3, '0') + '.png');
    const buffer = await stage.screenshot({ path: file, animations: 'disabled' });
    frames.push(buffer);
  }
  const crops = await page.evaluate(() => {
    const stage = document.querySelector('#stage').getBoundingClientRect(), result = {};
    for (const canvas of document.querySelectorAll('canvas[data-direction]')) {
      const rect = canvas.getBoundingClientRect();
      result[canvas.dataset.direction] = { left: Math.round(rect.left - stage.left), top: Math.round(rect.top - stage.top),
        width: Math.round(rect.width), height: Math.round(rect.height) };
    }
    return result;
  });
  for (const direction of directions) if (!crops[direction]) throw new Error('Missing canvas direction: ' + direction);
  return { frames, crops };
}

async function writeKeyframes(directory, report) {
  const layers = [];
  for (const [row, gait] of ['walk', 'run'].entries()) {
    const count = report.clips[gait].captured_frames;
    for (let col = 0; col < 4; col++) {
      const index = Math.floor(col * count / 4), phase = Math.round(index * 100 / count);
      const file = path.join(directory, 'frames', gait, 'frame_' + String(index).padStart(3, '0') + '.png');
      const image = await sharp(file).extract(report.clips[gait].canvas_regions.left)
        .resize(320, 260, { fit: 'fill' }).png().toBuffer();
      layers.push({ input: image, left: col * 320, top: row * 294 + 32 });
      const caption = '<svg width="320" height="32"><rect width="320" height="32" fill="#e8e1d5"/>' +
        '<text x="12" y="23" font-family="sans-serif" font-size="16" fill="#292d2a">' +
        (gait === 'walk' ? 'Walk' : 'Run') + ' · phase ' + phase + '% · frame ' + index + '</text></svg>';
      layers.push({ input: Buffer.from(caption), left: col * 320, top: row * 294 });
    }
  }
  await sharp({ create: { width: 1280, height: 588, channels: 3, background: '#e8e1d5' } })
    .composite(layers).jpeg({ quality: 91 }).toFile(path.join(directory, 'final_motion_keyframes.jpg'));
}

async function main(directory = defaultDirectory, fps = 30) {
  directory = path.resolve(directory); fps = Number(fps);
  if (![24, 30].includes(fps)) throw new Error('FPS must be 24 or 30 for exact walk/run cycle sampling.');
  if (!fs.existsSync(path.join(directory, 'preview.html'))) throw new Error('Missing independent preview.html in ' + directory);
  const ffmpeg = findEncoder(), local = await serve(directory), errors = [], report = {
    source: 'Independent compact cat concept joint animation preview; not a game capture',
    fps, walk_cycle_seconds: 1, run_cycle_seconds: 2 / 3, encoder: ffmpeg, clips: {}, browser_errors: errors
  };
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: chromium.executablePath() });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(local.origin + '/preview.html?paused=1', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.preview && typeof window.preview.setState === 'function');
    await page.evaluate(async () => { await window.preview.ready; });
    for (const gait of ['walk', 'run']) {
      const count = gait === 'walk' ? fps : fps * 2 / 3;
      const { frames, crops } = await capture(page, gait, count, path.join(directory, 'frames', gait));
      const webm = gait + '_fourway.webm', gif = gait + '_fourway.gif';
      await encodeWebm(ffmpeg, frames, path.join(directory, webm), fps);
      const verification = await verifyWebm(ffmpeg, path.join(directory, webm), frames, path.join(directory, 'decoded', gait));
      const gifVerification = await encodeGif(frames, path.join(directory, gif), fps);
      const singles = {};
      for (const direction of directions) {
        const filename = gait + '_' + direction + '.gif';
        singles[direction] = { file: filename, ...await encodeGif(frames, path.join(directory, filename), fps, crops[direction]) };
      }
      report.clips[gait] = { webm, gif, captured_frames: count, duration_seconds: count / fps,
        verification, gif_verification: gifVerification, individual_gifs: singles, canvas_regions: crops };
      console.log(JSON.stringify({ gait, captured_frames: count, decoded_frames: verification.decoded_frames, webm, gif }));
    }
    if (errors.length) throw new Error('Independent preview browser errors: ' + errors.join('; '));
    await writeKeyframes(directory, report);
    fs.writeFileSync(path.join(directory, 'encoding_verification.json'), JSON.stringify(report, null, 2));
    const html = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>紧凑灰狸猫 · 四向走跑动态预览</title><style>body{max-width:1440px;margin:30px auto;padding:0 20px;background:#e8e1d5;color:#292d2a;font:16px sans-serif}video{width:100%;border-radius:14px}a{color:#315f50}</style>' +
      '<h1>紧凑灰狸猫 · 四向走跑动态预览</h1><p>独立概念动作预览 · 同一套关节连续投影 · 未接入游戏</p>' +
      '<h2>行走 · 1秒完整左右周期</h2><video controls autoplay loop muted playsinline src="walk_fourway.webm"></video>' +
      '<h2>奔跑 · 2/3秒完整左右周期</h2><video controls autoplay loop muted playsinline src="run_fourway.webm"></video>' +
      '<p><a href="preview.html">交互预览</a> · <a href="walk_fourway.gif">行走GIF</a> · <a href="run_fourway.gif">奔跑GIF</a></p>' +
      '<p>四方向：前、后、左、右。固定' + fps + 'fps采样；视频逐帧解码验证。此处用于确认角色体型与动作，不代表实机性能或自然游玩验收。</p></html>';
    fs.writeFileSync(path.join(directory, 'animation_preview.html'), html);
    console.log(JSON.stringify({ output: directory, fps, browser_errors: errors.length, result: 'PASS' }));
    return report;
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => local.server.close(resolve));
  }
}
module.exports = { main, encodeWebm, encodeGif, verifyWebm, findEncoder, writeKeyframes };
if (require.main === module) main(process.argv[2], process.argv[3]).catch(error => {
  console.error(error.stack); process.exitCode = 1;
});
