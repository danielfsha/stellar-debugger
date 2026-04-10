import { SymbolInfo } from '../types';

export class SymbolRegistry {
  private symbols: SymbolInfo[] = [];

  add(symbol: SymbolInfo) {
    this.symbols.push(symbol);
  }

  findByName(name: string): SymbolInfo | undefined {
    return this.symbols.find(s => s.name === name);
  }

  getAll(): SymbolInfo[] {
    return this.symbols;
  }
}
