import * as fs from "fs";
import * as path from "path";

export interface VectorEntry {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export class VectorStore {
  private filePath: string;
  private cache: VectorEntry[] = [];

  constructor(filePath: string = ".vectorstore.json") {
    this.filePath = filePath;
    this.load();
  }

  private load() {
    if (fs.existsSync(this.filePath)) {
      this.cache = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
    } else {
      this.cache = [];
    }
  }

  private save() {
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(this.cache, null, 2),
      "utf-8",
    );
  }

  async addVector(
    id: string,
    vector: number[],
    metadata: Record<string, any> = {},
  ) {
    this.cache = this.cache.filter((e) => e.id !== id);
    this.cache.push({ id, vector, metadata });
    this.save();
  }

  async query(vector: number[], topK: number = 5): Promise<VectorEntry[]> {
    // Simple cosine similarity search
    function cosine(a: number[], b: number[]) {
      const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
      const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
      const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
      return dot / (normA * normB);
    }
    return this.cache
      .map((e) => ({ ...e, score: cosine(vector, e.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async get(id: string): Promise<VectorEntry | undefined> {
    return this.cache.find((e) => e.id === id);
  }

  async delete(id: string): Promise<void> {
    this.cache = this.cache.filter((e) => e.id !== id);
    this.save();
  }
}
