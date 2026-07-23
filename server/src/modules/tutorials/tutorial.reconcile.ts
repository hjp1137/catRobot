import { BadRequestException, ConflictException } from '@nestjs/common';

export async function reconcileTutorialRows(delegate: any, flowId: string, incoming: any[], createRow: Function,
  updateRow: Function, kind: 'step' | 'transition' | 'rule') {
  const current = await delegate.findMany({ where: { flow_id: flowId }, orderBy: { id: 'asc' } });
  current.sort((a: any, b: any) => String(a.id).localeCompare(String(b.id)));
  const wanted = new Set(incoming.map(item => item.id));
  const desiredRows = incoming.map((item, index) => updateRow(item, index));
  const working = current.filter((row: any) => !row.deleted_at || wanted.has(row.id) ||
    deletedConflicts(kind, row, desiredRows));
  const movedVersions = new Map<string, number>();
  const tempOrders = allocateTempOrders(current, incoming, working.length);
  const tempKeys = allocateTempKeys(kind, current, desiredRows, working.length);
  for (const [index, row] of working.entries()) {
    const changed = await delegate.updateMany({ where: { id: row.id, flow_id: flowId, row_version: row.row_version },
      data: { ...temporaryUnique(kind, tempOrders[index], tempKeys[index]), row_version: { increment: 1 } } });
    if (changed.count !== 1) throw conflict(row.row_version);
    movedVersions.set(row.id, row.row_version + 1);
  }
  for (const [index, item] of incoming.entries()) {
    const row = current.find((value: any) => value.id === item.id);
    if (!row) { await delegate.create({ data: createRow(item, index) }); continue; }
    if (!row.deleted_at && item.rowVersion !== row.row_version) throw conflict(item.rowVersion, row.row_version);
    const data = updateRow(item, index); delete data.id; delete data.flow_id; delete data.row_version;
    const changed = await delegate.updateMany({ where: { id: item.id, flow_id: flowId, row_version: movedVersions.get(item.id) },
      data: { ...data, deleted_at: null, row_version: { increment: 1 } } });
    if (changed.count !== 1) throw conflict(item.rowVersion);
  }
  for (const row of current) {
    if (wanted.has(row.id) || row.deleted_at) continue;
    const changed = await delegate.updateMany({ where: { id: row.id, flow_id: flowId, row_version: movedVersions.get(row.id) },
      data: { enabled: false, deleted_at: new Date(), row_version: { increment: 1 } } });
    if (changed.count !== 1) throw conflict(row.row_version);
  }
}

function temporaryUnique(kind: 'step' | 'transition' | 'rule', sort_order: number, key?: string) {
  if (kind === 'transition') return { sort_order, from_step_id: key };
  if (kind === 'rule') return { sort_order, feature_id: key };
  return { sort_order };
}
function allocateTempOrders(current: any[], incoming: any[], count: number) {
  const blocked = new Set<number>([...current.map(row => row.sort_order).filter(Number.isInteger),
    ...incoming.map(item => item.order).filter(Number.isInteger)]);
  const result: number[] = []; let candidate = -2_147_483_648;
  while (result.length < count) {
    if (!blocked.has(candidate)) { result.push(candidate); blocked.add(candidate); }
    candidate += 1;
    if (candidate > 2_147_483_647) throw new BadRequestException({ code: 'TUTORIAL_TEMP_ORDER_CAPACITY_EXCEEDED' });
  }
  return result;
}
function allocateTempKeys(kind: 'step' | 'transition' | 'rule', current: any[], desired: any[], count: number) {
  if (kind === 'step') return Array.from({ length: count }, () => undefined);
  const field = kind === 'transition' ? 'from_step_id' : 'feature_id';
  const blocked = new Set<string>([...current.map(row => row[field]).filter(Boolean), ...desired.map(row => row?.[field]).filter(Boolean)]);
  return Array.from({ length: count }, (_unused, index) => {
    let suffix = index;
    let value = kind === 'transition' ? `__tutorial_tmp_from_${suffix}` : `feature.__tutorial_tmp__.${suffix}`;
    while (blocked.has(value)) {
      suffix += current.length + 1;
      value = kind === 'transition' ? `__tutorial_tmp_from_${suffix}` : `feature.__tutorial_tmp__.${suffix}`;
    }
    blocked.add(value); return value;
  });
}
function deletedConflicts(kind: 'step' | 'transition' | 'rule', row: any, desired: any[]) {
  if (kind === 'step') return desired.some(item => item.sort_order === row.sort_order);
  if (kind === 'transition') return desired.some(item => item.from_step_id === row.from_step_id &&
    item.to_step_id === row.to_step_id && item.condition_type === row.condition_type);
  return desired.some(item => item.feature_id === row.feature_id && item.unlock_trigger === row.unlock_trigger);
}
function conflict(local: number, remote?: number) {
  return new ConflictException({ code: 'CONTENT_CONFLICT', localRowVersion: local, remoteRowVersion: remote });
}
