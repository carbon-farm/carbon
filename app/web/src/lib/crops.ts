import type { Crop, CropCategory } from '../api/configuration';

// Crops are filed under groups (main groups, and sub-groups inside them). The groups come from the
// server (Administrator → Taxonomy → Crop groups); these helpers turn the flat lists into what the
// pickers show.

export const categoryName = (c: { nameEn: string; nameTe: string }) => `${c.nameEn} / ${c.nameTe}`;

// Crops that are in no group (yet) are listed last, under this.
export const OTHER_GROUP = { nameEn: 'Other crops', nameTe: 'ఇతర పంటలు' };

// "Tomato / టమోటా", or just "Tomato" for a crop that has no Telugu name yet.
export const cropLabel = (c: { name: string; nameTe?: string | null }) => (c.nameTe?.trim() ? `${c.name} / ${c.nameTe.trim()}` : c.name);

const inOrder = (a: CropCategory, b: CropCategory) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn);

// The groups a crop can be filed under: switched on, and with no sub-groups of their own.
export function leafGroups(categories: CropCategory[]): CropCategory[] {
  const parents = new Set(categories.filter((c) => c.parentKey).map((c) => c.parentKey));
  return categories.filter((c) => c.isActive && !parents.has(c.key)).sort(inOrder);
}

// "Vegetables / కూరగాయలు › Fruiting vegetables / కాయ కూరగాయలు" for a sub-group, just the name for a main group.
export function groupPath(key: string, categories: CropCategory[]): string {
  const g = categories.find((c) => c.key === key);
  if (!g) return key;
  const parent = g.parentKey ? categories.find((c) => c.key === g.parentKey) : undefined;
  return parent ? `${categoryName(parent)} › ${categoryName(g)}` : categoryName(g);
}

// Does a typed search match the crop's English name, Telugu name or the name of a group it is in
// (or the main group that group sits inside)?
export function matchesCrop(c: Crop, query: string, categories: CropCategory[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const names = c.categories.flatMap((k) => {
    const g = categories.find((x) => x.key === k);
    const parent = g?.parentKey ? categories.find((x) => x.key === g.parentKey) : undefined;
    return [g?.nameEn, g?.nameTe, parent?.nameEn, parent?.nameTe];
  });
  return [c.name, c.nameTe ?? '', ...names].some((v) => !!v && v.toLowerCase().includes(q));
}

export interface GroupNode {
  key: string;
  // the group's own name
  title: string;
  // the whole path, for a flat list
  label: string;
  // crops filed directly in this group
  crops: Crop[];
  children: GroupNode[];
}

// How many different crops sit in a group, counting those in its sub-groups (optionally only some).
export function countCrops(node: GroupNode, keep: (c: Crop) => boolean = () => true): number {
  return new Set([...node.crops, ...node.children.flatMap((c) => c.crops)].filter(keep).map((c) => c.id)).size;
}

// The groups as a tree, in the Administrator's order, each with its crops A–Z; empty groups are
// left out, and crops in no active group go last under "Other crops".
export function buildGroups(crops: Crop[], categories: CropCategory[]): GroupNode[] {
  const active = categories.filter((c) => c.isActive).sort(inOrder);
  const sorted = [...crops].sort((a, b) => a.name.localeCompare(b.name));
  const cropsIn = (key: string) => sorted.filter((c) => c.categories.includes(key));
  const nodes: GroupNode[] = active
    .filter((c) => !c.parentKey)
    .map((top) => ({
      key: top.key,
      title: categoryName(top),
      label: categoryName(top),
      crops: cropsIn(top.key),
      children: active
        .filter((c) => c.parentKey === top.key)
        .map((child) => ({ key: child.key, title: categoryName(child), label: `${categoryName(top)} › ${categoryName(child)}`, crops: cropsIn(child.key), children: [] })),
    }))
    .map((n) => ({ ...n, children: n.children.filter((c) => c.crops.length > 0) }))
    .filter((n) => n.crops.length > 0 || n.children.length > 0);

  const known = new Set(active.map((c) => c.key));
  const unfiled = sorted.filter((c) => !c.categories.some((k) => known.has(k)));
  if (unfiled.length > 0) {
    const title = categoryName(OTHER_GROUP);
    nodes.push({ key: 'other', title, label: title, crops: unfiled, children: [] });
  }
  return nodes;
}

// The same tree as one flat list of (label, crops), for a <select> with option groups.
export function flatGroups(nodes: GroupNode[]): { key: string; label: string; crops: Crop[] }[] {
  return nodes.flatMap((n) => [
    ...(n.crops.length > 0 ? [{ key: n.key, label: n.label, crops: n.crops }] : []),
    ...n.children.map((c) => ({ key: c.key, label: c.label, crops: c.crops })),
  ]);
}
