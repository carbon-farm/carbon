import type { PrismaService } from '../../prisma/prisma.service';

export interface CategoryNode {
  id: string;
  parentId: string | null;
}

// Department (level 0) -> Category (level 1) -> Sub-category (level 2). Nothing goes deeper.
export const MAX_CATEGORY_LEVEL = 2;

export function levelOf(nodes: CategoryNode[], id: string): number {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  let level = 0;
  let current = byId.get(id);
  const seen = new Set<string>();
  while (current?.parentId && !seen.has(current.id)) {
    seen.add(current.id);
    level += 1;
    current = byId.get(current.parentId);
  }
  return level;
}

// The node itself plus everything beneath it — browsing "Natural Foods" must include the
// products filed under its categories and sub-categories.
export function descendantIds(nodes: CategoryNode[], id: string): string[] {
  const children = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.parentId) children.set(n.parentId, [...(children.get(n.parentId) ?? []), n.id]);
  }
  const out: string[] = [];
  const stack = [id];
  while (stack.length) {
    const next = stack.pop()!;
    if (out.includes(next)) continue;
    out.push(next);
    stack.push(...(children.get(next) ?? []));
  }
  return out;
}

export async function resolveCategoryIds(prisma: PrismaService, categoryId: string): Promise<string[]> {
  const nodes = await prisma.productCategoryMaster.findMany({ select: { id: true, parentId: true } });
  return descendantIds(nodes, categoryId);
}
