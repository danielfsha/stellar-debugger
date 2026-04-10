import { VectorStore } from "../indexer/vectorStore";

export class ContextRetriever {
  constructor(private vectorStore: VectorStore) {}

  async retrieveSimilar(code: string, embedding: number[], topK = 5) {
    return this.vectorStore.query(embedding, topK);
  }
}
