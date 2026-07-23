import fs from 'node:fs';

export interface ImageMetadata {
  width: number;
  height: number;
  hasAlpha: boolean;
  mimeType: 'image/png' | 'image/jpeg';
}

export function readImageMetadata(filePath: string): ImageMetadata | undefined {
  const buffer = fs.readFileSync(filePath);
  return pngMetadata(buffer) ?? jpegMetadata(buffer);
}

function pngMetadata(buffer: Buffer): ImageMetadata | undefined {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature) ||
    buffer.toString('ascii', 12, 16) !== 'IHDR') return undefined;
  const width = buffer.readUInt32BE(16); const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  if (!width || !height || ![0, 2, 3, 4, 6].includes(colorType)) return undefined;
  let offset = 8; let hasTransparencyChunk = false;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    if (offset + 12 + length > buffer.length) return undefined;
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'tRNS') hasTransparencyChunk = true;
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  return { width, height, hasAlpha: colorType === 4 || colorType === 6 || hasTransparencyChunk, mimeType: 'image/png' };
}

function jpegMetadata(buffer: Buffer): ImageMetadata | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return undefined;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset++; continue; }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buffer.length) return undefined;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      const height = buffer.readUInt16BE(offset + 5); const width = buffer.readUInt16BE(offset + 7);
      return width && height ? { width, height, hasAlpha: false, mimeType: 'image/jpeg' } : undefined;
    }
    offset += 2 + length;
  }
  return undefined;
}
