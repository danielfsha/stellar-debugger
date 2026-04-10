import { LocalIndex, IndexItem, QueryResult } from "vectra";

export class VectorStore {
  private index: LocalIndex;

  constructor(path: string = ".vectorstore") {
    this.index = new LocalIndex(path);
  }

  async addVector(
    id: string,
    vector: number[],
    metadata: Record<string, any> = {},
  ) {
    await this.index.upsertItem({ id, vector, metadata });
  }

  async query(vector: number[], topK: number = 5): Promise<QueryResult[]> {
    // vectra requires a query string, but we can pass an empty string for pure vector search
    return this.index.queryItems(vector, "", topK);
  }

  async get(id: string): Promise<IndexItem | undefined> {
    return this.index.getItem(id);
  }

  async delete(id: string): Promise<void> {
    await this.index.deleteItem(id);
  }
}
