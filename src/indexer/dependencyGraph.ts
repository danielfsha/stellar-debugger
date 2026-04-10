import { SymbolInfo } from '../types';

export class DependencyGraph {
  private graph: Map<string, Set<string>> = new Map();

  addDependency(from: string, to: string) {
    if (!this.graph.has(from)) this.graph.set(from, new Set());
    this.graph.get(from)!.add(to);
  }

  getDependencies(symbol: string): string[] {
    return Array.from(this.graph.get(symbol) || []);
  }

  getAll(): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    for (const [k, v] of this.graph.entries()) out[k] = Array.from(v);
    return out;
  }
}
