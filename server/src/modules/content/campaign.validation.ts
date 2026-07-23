const NODE_TYPES = new Set(['normal', 'elite', 'boss', 'exploration']);
const PATH_TYPES = new Set(['normal', 'locked', 'completed']);

export function validateCampaignMap(body: any): void {
  const nodes = (body.nodes ?? []).filter((item: any) => item.enabled !== false);
  const paths = (body.connections ?? []).filter((item: any) => item.enabled !== false);
  if (!nodes.length) fail('CAMPAIGN_NODE_REQUIRED');
  const ids = new Set<string>();
  for (const node of nodes) {
    if (!node.id || ids.has(node.id)) fail('CAMPAIGN_NODE_DUPLICATE');
    ids.add(node.id);
    if (!NODE_TYPES.has(node.type)) fail('CAMPAIGN_NODE_TYPE_INVALID');
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y) || node.x < 0 || node.y < 0) fail('CAMPAIGN_NODE_COORDINATE_INVALID');
  }
  const starts = nodes.filter((item: any) => item.isStart);
  const ends = nodes.filter((item: any) => item.isEnd);
  if (starts.length !== 1) fail('CAMPAIGN_START_INVALID');
  if (!ends.length) fail('CAMPAIGN_END_REQUIRED');
  const pairs = new Set<string>();
  for (const path of paths) {
    if (!ids.has(path.fromNodeId) || !ids.has(path.toNodeId)) fail('CAMPAIGN_CONNECTION_NODE_MISSING');
    if (path.fromNodeId === path.toNodeId) fail('CAMPAIGN_CONNECTION_SELF');
    if (!PATH_TYPES.has(path.pathType ?? 'normal')) fail('CAMPAIGN_PATH_TYPE_INVALID');
    const key = `${path.fromNodeId}->${path.toNodeId}`;
    if (pairs.has(key)) fail('CAMPAIGN_CONNECTION_DUPLICATE');
    pairs.add(key);
  }
  const graph = new Map<string, string[]>();
  for (const path of paths) graph.set(path.fromNodeId, [...(graph.get(path.fromNodeId) ?? []), path.toNodeId]);
  const reachable = new Set<string>(); const queue = [starts[0].id];
  while (queue.length) { const id = queue.shift()!; if (reachable.has(id)) continue; reachable.add(id); queue.push(...(graph.get(id) ?? [])); }
  if (!ends.some((item: any) => reachable.has(item.id))) fail('CAMPAIGN_PATH_MISSING');
  if (nodes.some((item: any) => !reachable.has(item.id))) fail('CAMPAIGN_NODE_ISOLATED');
}

function fail(code: string): never { throw new Error(code); }
