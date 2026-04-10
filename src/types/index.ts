// Shared types for the indexer and other modules will be defined here.

export interface SymbolInfo {
  name: string;
  kind: "function" | "class" | "method" | "variable";
  file: string;
  location: { line: number; character: number };
  signature?: string;
  dependencies?: string[];
}
