import { Pinecone } from "@pinecone-database/pinecone";

export interface VectorEntry {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export class VectorStore {
  private pinecone: Pinecone;
  private indexName: string;
  private dimension: number;

  constructor(
    indexName: string = "stellar-debugger",
    dimension: number = 1536,
  ) {
    this.pinecone = new Pinecone();
    this.indexName = indexName;
    this.dimension = dimension;
  }

  private async getIndex() {
    const index = this.pinecone.index(this.indexName);
    // Optionally: create index if not exists (requires admin API key)
    return index;
  }

  async addVector(
    id: string,
    vector: number[],
    metadata: Record<string, any> = {},
  ) {
    const index = await this.getIndex();
    await index.upsert({
      records: [
        {
          id,
          values: vector,
          metadata,
        },
      ],
    });
  }

  async query(vector: number[], topK: number = 5): Promise<VectorEntry[]> {
    const index = await this.getIndex();
    const results = await index.query({
      topK,
      vector,
      includeMetadata: true,
    });
    return (results.matches || []).map((match: any) => ({
      id: match.id,
      vector: match.values,
      metadata: match.metadata || {},
      score: match.score,
    }));
  }

  async get(id: string): Promise<VectorEntry | undefined> {
    const index = await this.getIndex();
    const results = await index.fetch({ ids: [id] });
    const item = results.records?.[id];
    if (!item) return undefined;
    return {
      id,
      vector: item.values,
      metadata: item.metadata || {},
    };
  }

  async delete(id: string): Promise<void> {
    const index = await this.getIndex();
    await index.deleteMany({ ids: [id] });
  }
}
