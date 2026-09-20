import type { ProductCategory } from '../api/marketplace';

// "Groundnut Oil / వేరుశెనగ నూనె" — English first, then Telugu when there is one.
export function categoryName(c: Pick<ProductCategory, 'name' | 'nameTe'>): string {
  return c.nameTe ? `${c.name} / ${c.nameTe}` : c.name;
}

export interface CategoryTreeNode extends ProductCategory {
  children: CategoryTreeNode[];
}

// The API sends a flat list; this turns it into the Department -> Category -> Sub-category tree.
export function buildCategoryTree(rows: ProductCategory[]): CategoryTreeNode[] {
  const byId = new Map<string, CategoryTreeNode>(rows.map((r) => [r.id, { ...r, children: [] }]));
  const roots: CategoryTreeNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

// Every node in depth-first order, each with a "Department › Category › Sub-category" path,
// for pickers that show the whole tree in one dropdown.
export function flattenWithPaths(rows: ProductCategory[]): { node: ProductCategory; path: string }[] {
  const out: { node: ProductCategory; path: string }[] = [];
  const walk = (nodes: CategoryTreeNode[], prefix: string) => {
    for (const n of nodes) {
      const path = prefix ? `${prefix} › ${categoryName(n)}` : categoryName(n);
      out.push({ node: n, path });
      walk(n.children, path);
    }
  };
  walk(buildCategoryTree(rows), '');
  return out;
}
