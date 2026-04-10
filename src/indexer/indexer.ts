import { ASTParser } from "./astParser";
import { DependencyGraph } from "./dependencyGraph";
import { EmbeddingService } from "./embeddingService";
import { VectorStore } from "./vectorStore";
import { SymbolRegistry } from "./symbolRegistry";
import * as fs from "fs";
import * as path from "path";

export class Indexer {
  private astParser = new ASTParser();
  private depGraph = new DependencyGraph();
  private embeddingService: EmbeddingService;
  private vectorStore = new VectorStore();
  private symbolRegistry = new SymbolRegistry();

  constructor(apiKey: string) {
    this.embeddingService = new EmbeddingService(apiKey);
  }

  async indexWorkspace(workspacePath: string) {
    const files = this.getAllTSFiles(workspacePath);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const symbols = this.astParser.parseFile(file, content);
      for (const symbol of symbols) {
        this.symbolRegistry.add(symbol);
        // Optionally: parse dependencies and update depGraph
        const embedding = await this.embeddingService.embed(
          symbol.signature || symbol.name,
        );
        await this.vectorStore.addVector(symbol.name, embedding, { file });
      }
    }
  }

  private getAllTSFiles(dir: string): string[] {
    let results: string[] = [];
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(this.getAllTSFiles(full));
      } else if (full.endsWith(".ts")) {
        results.push(full);
      }
    }
    return results;
  }
}
