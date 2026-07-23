<template>
  <div ref="canvas" class="stage-scene" :class="{ grid: showGrid, drawing: drawMode }" :style="canvasStyle" data-testid="stage-scene" @pointerdown.capture="beginCollisionDraw">
    <div v-if="drawMode" class="draw-hint">拖拽框选阻挡区域</div>
    <div class="safe-area" :style="areaStyle" aria-label="战斗安全区域"></div>
    <button
      v-for="layer in enabledLayers" :key="layer.id" type="button" class="scene-layer"
      :class="{ collision: layer.type === 'collision', selected: selected === `layer:${layer.id}`, blocked: blocked(layer.artKey) }"
      :style="layerStyle(layer)" :aria-label="layer.type === 'collision' ? `${layer.name} ${layer.width}×${layer.height}` : layer.name"
      @pointerdown="beginCollisionTransform($event, layer, 'move')" @click="$emit('select', `layer:${layer.id}`)"
    >
      <span v-if="layer.type === 'collision'" class="collision-area">{{ layer.name }}<b>角色 / 敌人 / 常规弹道阻挡</b></span>
      <template v-if="layer.type === 'collision' && selected === `layer:${layer.id}` && !drawMode">
        <span class="collision-move-hint">拖动框内移动</span>
        <span v-for="handle in collisionHandles" :key="handle" class="collision-handle" :class="handle" @pointerdown.stop="beginCollisionTransform($event, layer, handle)"></span>
      </template>
      <img v-else-if="artUrls[layer.artKey]" :src="artUrls[layer.artKey]" :alt="layer.name" @error="$emit('art-error', layer.artKey)" />
      <span v-else class="asset-error">{{ layer.artKey }}<b>Missing / Invalid</b></span>
    </button>
    <div v-if="draftRect" class="draw-preview" :style="rectStyle(draftRect)"></div>
    <button
      v-for="point in orchestration.spawnPoints" :key="point.id" type="button" class="scene-point"
      :class="[point.type, { selected: selected === `spawn:${point.id}` }]" :style="pointStyle(point)"
      @pointerdown="beginDrag($event, point)" @click="$emit('select', `spawn:${point.id}`)"
    >
      <img v-if="artUrls[spriteFor(point)]" :src="artUrls[spriteFor(point)]" :alt="point.name" />
      <span class="point-marker"></span><small>{{ point.name }}</small>
    </button>
    <div class="axis x">{{ canvasWidth }}</div><div class="axis y">{{ canvasHeight }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { logicalPoint, logicalRectFromPoints, transformLogicalRect, type CollisionTransform } from './StageEditorSession';

const props = defineProps<{
  orchestration: any; selected: string; artUrls: Record<string, string>; artStatuses: Record<string, string>;
  heroArtKey?: string; enemyArtKeys: Record<string, string>; showGrid: boolean; gridSize: number; editable: boolean; drawMode: boolean;
}>();
const emit = defineEmits<{ select: [key: string]; 'point-move': [payload: { id: string; x: number; y: number }]; 'collision-draw': [payload: { id: string; x: number; y: number; width: number; height: number }]; 'collision-transform': [payload: { id: string; x: number; y: number; width: number; height: number }]; 'draw-complete': []; 'art-error': [artKey: string] }>();
const canvas = ref<HTMLElement>();
const drawStart = ref<{ x: number; y: number }>();
const drawEnd = ref<{ x: number; y: number }>();
const transformPreview = ref<{ id: string; rect: { x: number; y: number; width: number; height: number } }>();
const collisionHandles: CollisionTransform[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const enabledLayers = computed(() => [...(props.orchestration.layers ?? [])].filter((x: any) => x.enabled !== false).sort((a: any, b: any) => a.order - b.order));
const canvasWidth = computed(() => props.orchestration.layout?.canvasWidth ?? 750);
const canvasHeight = computed(() => props.orchestration.layout?.canvasHeight ?? 1334);
const canvasStyle = computed(() => ({ aspectRatio: `${canvasWidth.value} / ${canvasHeight.value}` }));
const selectedCollision = computed(() => enabledLayers.value.find((layer: any) => `layer:${layer.id}` === props.selected && layer.type === 'collision'));
const draftRect = computed(() => drawStart.value && drawEnd.value ? logicalRectFromPoints(drawStart.value, drawEnd.value, canvasWidth.value, canvasHeight.value, props.gridSize) : undefined);
const areaStyle = computed(() => {
  const area = props.orchestration.layout?.battleArea ?? { x: 0, y: 0, width: 750, height: 1334 };
  return { left: pct(area.x, canvasWidth.value), top: pct(area.y, canvasHeight.value), width: pct(area.width, canvasWidth.value), height: pct(area.height, canvasHeight.value) };
});

function beginDrag(event: PointerEvent, point: any) {
  if (!canvas.value || props.selected.startsWith('layer:')) return;
  emit('select', `spawn:${point.id}`);
  const move = (next: PointerEvent) => {
    const rect = canvas.value!.getBoundingClientRect();
    const logical = logicalPoint({ x: next.clientX, y: next.clientY }, rect, props.orchestration.layout.canvasWidth, props.orchestration.layout.canvasHeight, props.gridSize);
    emit('point-move', { id: point.id, ...logical });
  };
  const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop, { once: true });
  event.preventDefault();
}

function beginCollisionDraw(event: PointerEvent) {
  if (!props.drawMode || !props.editable || !canvas.value || !selectedCollision.value || event.button !== 0) return;
  event.preventDefault(); event.stopPropagation();
  drawStart.value = logicalAt(event); drawEnd.value = drawStart.value;
  const move = (next: PointerEvent) => { drawEnd.value = logicalAt(next); };
  const stop = () => {
    const rect = draftRect.value;
    if (rect && rect.width > 0 && rect.height > 0) emit('collision-draw', { id: selectedCollision.value.id, ...rect });
    drawStart.value = undefined; drawEnd.value = undefined;
    window.removeEventListener('pointermove', move); emit('draw-complete');
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop, { once: true });
}

function beginCollisionTransform(event: PointerEvent, layer: any, transform: CollisionTransform) {
  if (props.drawMode || !props.editable || !canvas.value || layer.type !== 'collision' || props.selected !== `layer:${layer.id}` || event.button !== 0) return;
  event.preventDefault();
  const first = logicalAt(event); const original = { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
  const move = (next: PointerEvent) => {
    transformPreview.value = { id: layer.id, rect: transformLogicalRect(original, first, logicalAt(next), canvasWidth.value, canvasHeight.value, transform) };
  };
  const stop = () => {
    const preview = transformPreview.value;
    if (preview && preview.id === layer.id) emit('collision-transform', { id: layer.id, ...preview.rect });
    transformPreview.value = undefined;
    window.removeEventListener('pointermove', move);
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop, { once: true });
}

function spriteFor(point: any) { return point.type === 'hero' ? props.heroArtKey ?? '' : props.enemyArtKeys[point.id] ?? Object.values(props.enemyArtKeys)[0] ?? ''; }
function blocked(artKey: string) { return ['missing', 'invalid'].includes(props.artStatuses[artKey]); }
function logicalAt(event: PointerEvent) { return logicalPoint({ x: event.clientX, y: event.clientY }, canvas.value!.getBoundingClientRect(), canvasWidth.value, canvasHeight.value, props.gridSize); }
function pointStyle(point: any) { return { left: pct(point.x, canvasWidth.value), top: pct(point.y, canvasHeight.value) }; }
function rectStyle(rect: { x: number; y: number; width: number; height: number }) { return { left: pct(rect.x, canvasWidth.value), top: pct(rect.y, canvasHeight.value), width: pct(rect.width, canvasWidth.value), height: pct(rect.height, canvasHeight.value) }; }
function layerStyle(layer: any) {
  const preview = transformPreview.value;
  const visible = preview && preview.id === layer.id ? { ...layer, ...preview.rect } : layer;
  return { left: pct(visible.x, canvasWidth.value), top: pct(visible.y, canvasHeight.value), width: pct(visible.width ?? canvasWidth.value, canvasWidth.value), height: pct(visible.height ?? canvasHeight.value, canvasHeight.value), opacity: visible.type === 'collision' ? 1 : visible.opacity, zIndex: visible.type === 'collision' ? 50 + visible.order : visible.order, transform: `scale(${visible.scale ?? 1})` };
}
function pct(value: number, total: number) { return `${value / Math.max(1, total) * 100}%`; }
</script>

<style scoped>
.stage-scene { position: relative; width: min(100%, 620px); overflow: hidden; background: #071019; border: 1px solid #32485c; box-shadow: 0 18px 55px #02070ca8; }
.stage-scene.drawing { cursor: crosshair; box-shadow: 0 0 0 2px #ffbc4d99,0 18px 55px #02070ca8; }
.draw-hint { position:absolute; z-index:90; top:8px; left:8px; padding:5px 8px; color:#171109; background:#ffcf5a; border-radius:3px; font:700 11px "Microsoft YaHei",sans-serif; pointer-events:none; }
.stage-scene.grid { background-image: linear-gradient(#2c56694d 1px, transparent 1px), linear-gradient(90deg, #2c56694d 1px, transparent 1px); background-size: 5.333% 3%; }
.safe-area { position: absolute; z-index: 40; pointer-events: none; border: 1px dashed #64d8cb88; box-shadow: inset 0 0 24px #55d6c21a; }
.scene-layer { position: absolute; padding: 0; overflow: hidden; background: transparent; border: 1px solid transparent; transform-origin: top left; }
.scene-layer img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.scene-layer.selected { border-color: #ffb84d; box-shadow: inset 0 0 0 2px #ffb84d66; }
.scene-layer.collision { overflow:visible; cursor:pointer; border:2px dashed #ffcf5acc; background:#ffb84d18; }
.scene-layer.collision.selected { border:3px solid #ffcf5a; box-shadow:0 0 0 2px #051019,0 0 22px #ffb84d99,inset 0 0 28px #ffb84d44; }
.scene-layer.collision.selected::after { position:absolute; top:-24px; left:-3px; padding:3px 6px; color:#16100a; background:#ffcf5a; border-radius:3px; content:attr(aria-label); font:700 10px "Microsoft YaHei",sans-serif; white-space:nowrap; }
.collision-move-hint { position:absolute; right:0; bottom:-22px; padding:2px 5px; color:#fff3b0; background:#071019e8; border-radius:2px; font:10px "Microsoft YaHei",sans-serif; white-space:nowrap; pointer-events:none; }
.collision-handle { position:absolute; z-index:2; width:12px; height:12px; box-sizing:border-box; background:#fff3b0; border:2px solid #725016; border-radius:2px; touch-action:none; }
.collision-handle.n { top:-7px; left:50%; margin-left:-6px; cursor:ns-resize; }.collision-handle.ne { top:-7px; right:-7px; cursor:nesw-resize; }.collision-handle.e { top:50%; right:-7px; margin-top:-6px; cursor:ew-resize; }.collision-handle.se { right:-7px; bottom:-7px; cursor:nwse-resize; }.collision-handle.s { bottom:-7px; left:50%; margin-left:-6px; cursor:ns-resize; }.collision-handle.sw { bottom:-7px; left:-7px; cursor:nesw-resize; }.collision-handle.w { top:50%; left:-7px; margin-top:-6px; cursor:ew-resize; }.collision-handle.nw { top:-7px; left:-7px; cursor:nwse-resize; }
.scene-layer.blocked { border-color: #ff5d68; }
.asset-error { display: grid; height: 100%; place-content: center; color: #ff8b91; background: repeating-linear-gradient(135deg, #2a1117, #2a1117 10px, #3b1820 10px, #3b1820 20px); }
.asset-error b { display: block; margin-top: 4px; font-size: 11px; }
.collision-area { display:grid; width:100%; height:100%; place-content:center; color:#ffcf5a; font:11px "Microsoft YaHei",sans-serif; text-align:center; pointer-events:none; }
.collision-area b { display:block; margin-top:5px; font-size:9px; font-weight:400; }
.draw-preview { position:absolute; z-index:75; box-sizing:border-box; border:2px solid #fff3b0; background:#ffcf5a30; box-shadow:0 0 18px #ffb84d99; pointer-events:none; }
.scene-point { position: absolute; z-index: 60; width: 76px; height: 76px; padding: 0; transform: translate(-50%, -50%); background: #071019cc; border: 1px solid #46e0ce; border-radius: 50%; cursor: grab; touch-action: none; }
.scene-point.enemy { border-color: #ff7d58; }
.scene-point.selected { outline: 3px solid #ffcf5a; outline-offset: 3px; }
.scene-point img { width: 62px; height: 62px; object-fit: contain; pointer-events: none; filter: drop-shadow(0 8px 8px #000b); }
.point-marker { position: absolute; left: 50%; bottom: -8px; width: 10px; height: 10px; transform: translateX(-50%) rotate(45deg); background: currentColor; }
.scene-point small { position: absolute; top: calc(100% + 12px); left: 50%; width: max-content; max-width: 120px; padding: 2px 6px; color: #eaf7f5; background: #06111de8; border-radius: 3px; transform: translateX(-50%); }
.axis { position: absolute; z-index: 80; padding: 2px 5px; font: 10px monospace; color: #6d93a6; background: #071019cc; }
.axis.x { right: 0; bottom: 0; }.axis.y { top: 0; right: 0; }
</style>
