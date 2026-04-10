import { createStore, Store, Vector } from "vectra";

export class VectorStore {
  private store: Store;

  constructor(path: string = ".vectorstore") {
    this.store = createStore({
      path,
      dimensions: 1536, // default for OpenAI embeddings, make configurable
    });
  }

  async addVector(
    id: string,
    vector: number[],
    metadata: Record<string, any> = {},
  ) {
    await this.store.add({ id, values: vector, metadata });
  }

  async query(vector: number[], topK: number = 5): Promise<Vector[]> {
    return this.store.query({ values: vector, topK });
  }

  async get(id: string): Promise<Vector | undefined> {
    return this.store.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.store.delete(id);
  }
}
